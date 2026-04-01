import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractJsonLd(html: string): Record<string, any> | null {
  try {
    const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!matches) return null;
    for (const match of matches) {
      const json = match.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim();
      const parsed = JSON.parse(json);
      // Handle arrays of JSON-LD
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
          return item;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function extractPriceFromJsonLd(jsonLd: Record<string, any>): string {
  try {
    const offers = jsonLd.offers;
    if (!offers) return "";
    const offer = Array.isArray(offers) ? offers[0] : offers;
    const price = offer?.price || offer?.lowPrice;
    if (price) {
      const currency = offer?.priceCurrency || "BRL";
      const num = parseFloat(price);
      if (!isNaN(num) && currency === "BRL") {
        return `R$ ${num.toFixed(2).replace(".", ",")}`;
      }
      return `R$ ${price}`;
    }
  } catch {
    // ignore
  }
  return "";
}

function extractImageFromJsonLd(jsonLd: Record<string, any>): string {
  try {
    const img = jsonLd.image;
    if (typeof img === "string") return img;
    if (Array.isArray(img)) return img[0] || "";
    if (img?.url) return img.url;
    if (img?.contentUrl) return img.contentUrl;
  } catch {
    // ignore
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try multiple User-Agent strategies
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    ];

    let html = "";
    let finalUrl = url;

    for (const ua of userAgents) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "identity",
            "Cache-Control": "no-cache",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
          },
          redirect: "follow",
        });
        html = await res.text();
        finalUrl = res.url || url;
        // If we got meaningful content, break
        if (html.length > 1000) break;
      } catch {
        continue;
      }
    }

    const doc = new DOMParser().parseFromString(html, "text/html");

    // 1. Try JSON-LD first (most reliable for e-commerce)
    const jsonLd = extractJsonLd(html);

    const getMeta = (name: string) =>
      doc?.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
      doc?.querySelector(`meta[name='${name}']`)?.getAttribute("content") ||
      "";

    // Title: JSON-LD > og:title > twitter:title > <title> > h1
    const title =
      jsonLd?.name ||
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      doc?.querySelector("title")?.textContent?.trim() ||
      doc?.querySelector("h1")?.textContent?.trim() ||
      "Produto";

    // Image: JSON-LD > og:image > twitter:image > first large img
    let image =
      (jsonLd ? extractImageFromJsonLd(jsonLd) : "") ||
      getMeta("og:image") ||
      getMeta("twitter:image") ||
      "";

    // If no image from meta, try to find product images in HTML
    if (!image) {
      const imgTags = doc?.querySelectorAll("img[src]") || [];
      for (const img of imgTags) {
        const src = (img as any).getAttribute("src") || "";
        const alt = (img as any).getAttribute("alt") || "";
        // Skip tiny images, icons, logos
        if (src && !src.includes("logo") && !src.includes("icon") && !src.includes("sprite") && 
            (src.includes("http") || src.startsWith("//"))) {
          image = src.startsWith("//") ? `https:${src}` : src;
          break;
        }
      }
    }

    // Description
    const description =
      jsonLd?.description ||
      getMeta("og:description") ||
      getMeta("description") ||
      getMeta("twitter:description") ||
      "";

    // Price: JSON-LD > regex patterns
    let price = jsonLd ? extractPriceFromJsonLd(jsonLd) : "";
    if (!price) {
      // Multiple price patterns
      const pricePatterns = [
        /R\$\s*[\d]+[.,][\d]{2}/,
        /R\$\s*[\d.,]+/,
        /"price"\s*:\s*"?([\d.,]+)"?/,
        /"lowPrice"\s*:\s*"?([\d.,]+)"?/,
      ];
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          price = match[0].trim();
          // If captured a JSON value, format it
          if (!price.startsWith("R$")) {
            const num = parseFloat(price.replace(",", "."));
            if (!isNaN(num)) {
              price = `R$ ${num.toFixed(2).replace(".", ",")}`;
            }
          }
          break;
        }
      }
    }

    console.log("Scraped result:", { title: title.substring(0, 50), hasImage: !!image, price, hasJsonLd: !!jsonLd });

    return new Response(
      JSON.stringify({ title, image, description, price, url: finalUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-product error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
