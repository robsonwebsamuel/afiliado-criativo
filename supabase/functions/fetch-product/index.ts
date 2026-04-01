import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&NegativeMediumSpace;/g, "")
    .replace(/&NegativeThickSpace;/g, "")
    .replace(/&NegativeThinSpace;/g, "")
    .replace(/&NegativeVeryThinSpace;/g, "")
    .replace(/&ZeroWidthSpace;/g, "")
    .replace(/&thinsp;/g, " ")
    .replace(/&ensp;/g, " ")
    .replace(/&emsp;/g, " ")
    .replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
    .replace(/&#x[0-9a-fA-F]+;/g, (m) => String.fromCharCode(parseInt(m.slice(3, -1), 16)))
    .replace(/&[a-zA-Z]+;/g, "") // Remove any remaining named entities
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  // Filter out tracking pixels, 1x1 images, analytics URLs
  const blacklist = [
    "uedata", "pixel", "beacon", "tracking", "analytics",
    "1x1", "spacer", "blank", "transparent", "logo", "icon",
    "sprite", "badge", "fls-na.amazon", "fls-eu.amazon",
    "images-na.ssl-images-amazon.com/images/G/01/x-locale",
  ];
  const lower = url.toLowerCase();
  return !blacklist.some(b => lower.includes(b));
}

function extractJsonLd(html: string): Record<string, any> | null {
  try {
    const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!matches) return null;
    for (const match of matches) {
      const json = match.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim();
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
          return item;
        }
        // Check @graph
        if (item["@graph"]) {
          for (const g of item["@graph"]) {
            if (g["@type"] === "Product" || g["@type"]?.includes?.("Product")) {
              return g;
            }
          }
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
      const num = parseFloat(String(price).replace(",", "."));
      if (!isNaN(num)) {
        return `R$ ${num.toFixed(2).replace(".", ",")}`;
      }
    }
  } catch { /* */ }
  return "";
}

function extractImagesFromJsonLd(jsonLd: Record<string, any>): string[] {
  try {
    const img = jsonLd.image;
    if (typeof img === "string") return [img];
    if (Array.isArray(img)) {
      return img.map((i: any) => typeof i === "string" ? i : i?.url || i?.contentUrl || "").filter(Boolean);
    }
    if (img?.url) return [img.url];
    if (img?.contentUrl) return [img.contentUrl];
  } catch { /* */ }
  return [];
}

function findProductImages(doc: any, html: string): string[] {
  const images: string[] = [];
  
  // Try data-src and src attributes from img tags
  const imgTags = doc?.querySelectorAll("img") || [];
  for (const img of imgTags) {
    const src = (img as any).getAttribute("data-src") || 
                (img as any).getAttribute("data-zoom-image") ||
                (img as any).getAttribute("data-large-image") ||
                (img as any).getAttribute("src") || "";
    if (src && isValidImageUrl(src)) {
      const fullUrl = src.startsWith("//") ? `https:${src}` : src;
      if (fullUrl.startsWith("http") && (
        fullUrl.includes(".jpg") || fullUrl.includes(".jpeg") || 
        fullUrl.includes(".png") || fullUrl.includes(".webp") ||
        fullUrl.includes("images") || fullUrl.includes("img") ||
        fullUrl.includes("produto") || fullUrl.includes("product")
      )) {
        images.push(fullUrl);
      }
    }
  }

  // Try to find images in data attributes or JSON embedded in page
  const imgPatterns = [
    /"original"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
    /"zoom(?:Image|Url)?"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
    /"(?:large|big|full)(?:Image|Url)?"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
    /"imageUrl"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
  ];
  for (const pattern of imgPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (isValidImageUrl(match[1])) {
        images.push(match[1].replace(/\\u002F/g, "/").replace(/\\/g, ""));
      }
    }
  }

  return [...new Set(images)];
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

    const userAgents = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
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
          },
          redirect: "follow",
        });
        const text = await res.text();
        finalUrl = res.url || url;
        // Keep the longest response (more content = better)
        if (text.length > html.length) {
          html = text;
        }
        if (html.length > 5000) break;
      } catch {
        continue;
      }
    }

    const doc = new DOMParser().parseFromString(html, "text/html");
    const jsonLd = extractJsonLd(html);

    const getMeta = (name: string) =>
      doc?.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
      doc?.querySelector(`meta[name='${name}']`)?.getAttribute("content") ||
      "";

    // Title
    let title =
      jsonLd?.name ||
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      doc?.querySelector("title")?.textContent?.trim() ||
      doc?.querySelector("h1")?.textContent?.trim() ||
      "";
    // Clean up title
    title = title.replace(/\s*\|.*$/, "").replace(/\s*-\s*(Amazon|Shopee|Mercado|Magazine).*$/i, "").trim() || "Produto";

    // Image - prioritize JSON-LD, then meta, then page scanning
    let image = "";
    const jsonLdImages = jsonLd ? extractImagesFromJsonLd(jsonLd) : [];
    const validJsonLdImages = jsonLdImages.filter(isValidImageUrl);
    
    const ogImage = getMeta("og:image");
    const twitterImage = getMeta("twitter:image");
    
    const candidates = [
      ...validJsonLdImages,
      ...(ogImage && isValidImageUrl(ogImage) ? [ogImage] : []),
      ...(twitterImage && isValidImageUrl(twitterImage) ? [twitterImage] : []),
      ...findProductImages(doc, html),
    ];
    
    image = candidates[0] || "";

    // Description
    const description =
      jsonLd?.description ||
      getMeta("og:description") ||
      getMeta("description") ||
      "";

    // Price
    let price = jsonLd ? extractPriceFromJsonLd(jsonLd) : "";
    if (!price) {
      const pricePatterns = [
        /R\$\s*[\d]+[.,][\d]{2}/,
        /R\$\s*[\d.,]+/,
      ];
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          price = match[0].trim();
          break;
        }
      }
    }

    console.log("Scraped:", { title: title.substring(0, 60), hasImage: !!image, price, hasJsonLd: !!jsonLd, candidates: candidates.length });

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
