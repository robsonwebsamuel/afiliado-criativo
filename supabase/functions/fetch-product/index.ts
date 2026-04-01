import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/").replace(/&nbsp;/g, " ")
    .replace(/&(Negative|ZeroWidth)\w*Space;/g, "")
    .replace(/&(thin|en|em)sp;/g, " ")
    .replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
    .replace(/&#x[0-9a-fA-F]+;/g, (m) => String.fromCharCode(parseInt(m.slice(3, -1), 16)))
    .replace(/&[a-zA-Z]+;/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  const blacklist = [
    "uedata", "pixel", "beacon", "tracking", "analytics",
    "1x1", "spacer", "blank", "transparent", "logo", "icon",
    "sprite", "badge", "fls-na.amazon", "fls-eu.amazon",
    "images-na.ssl-images-amazon.com/images/G/01/x-locale",
  ];
  return !blacklist.some(b => url.toLowerCase().includes(b));
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
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) return item;
        if (item["@graph"]) {
          for (const g of item["@graph"]) {
            if (g["@type"] === "Product" || g["@type"]?.includes?.("Product")) return g;
          }
        }
      }
    }
  } catch { /* */ }
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
      if (!isNaN(num)) return `R$ ${num.toFixed(2).replace(".", ",")}`;
    }
  } catch { /* */ }
  return "";
}

function extractImagesFromJsonLd(jsonLd: Record<string, any>): string[] {
  try {
    const img = jsonLd.image;
    if (typeof img === "string") return [img];
    if (Array.isArray(img)) return img.map((i: any) => typeof i === "string" ? i : i?.url || i?.contentUrl || "").filter(Boolean);
    if (img?.url) return [img.url];
    if (img?.contentUrl) return [img.contentUrl];
  } catch { /* */ }
  return [];
}

function findProductImages(doc: any, html: string): string[] {
  const images: string[] = [];
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

// ── Mercado Livre specific extraction ──
function isMercadoLivre(url: string): boolean {
  return /mercadoli[vb]re\.com|mlstatic\.com|mercadolibre\.com/i.test(url);
}

function extractMeliFromInitialState(html: string): { title?: string; price?: string; image?: string } {
  const result: { title?: string; price?: string; image?: string } = {};

  // Try __PRELOADED_STATE__ or window.__PRELOADED_STATE__
  const statePatterns = [
    /window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});\s*(?:<\/script>|window\.)/,
    /"initialState"\s*:\s*({[\s\S]*?})\s*[,;}\]]/,
  ];

  for (const pattern of statePatterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        const state = JSON.parse(match[1]);
        // Navigate common ML state structures
        const comp = state?.initialState?.components;
        if (comp) {
          // Title from header
          const header = comp?.header;
          if (header?.title) result.title = header.title;
          // Price
          const price = comp?.price;
          if (price?.price?.value) {
            result.price = `R$ ${parseFloat(price.price.value).toFixed(2).replace(".", ",")}`;
          }
        }
      } catch { /* */ }
    }
  }

  // Extract title from specific ML patterns in HTML
  if (!result.title) {
    const titlePatterns = [
      /"title"\s*:\s*"([^"]{10,200})"/,
      /class="ui-pdp-title"[^>]*>([^<]+)/,
      /data-testid="pdp-title"[^>]*>([^<]+)/,
    ];
    for (const p of titlePatterns) {
      const m = html.match(p);
      if (m && m[1] && !m[1].includes("{") && !m[1].includes("function")) {
        result.title = m[1];
        break;
      }
    }
  }

  // Extract price from ML-specific patterns
  if (!result.price) {
    const pricePatterns = [
      /"price"\s*:\s*([\d.]+)/,
      /"amount"\s*:\s*([\d.]+)/,
      /class="andes-money-amount__fraction"[^>]*>([\d.]+)/,
      /itemprop="price"\s+content="([\d.]+)"/,
    ];
    for (const p of pricePatterns) {
      const m = html.match(p);
      if (m && m[1]) {
        const num = parseFloat(m[1]);
        if (!isNaN(num) && num > 1) {
          result.price = `R$ ${num.toFixed(2).replace(".", ",")}`;
          break;
        }
      }
    }
  }

  // Extract image from ML CDN patterns
  if (!result.image) {
    const imgPatterns = [
      /"(https?:\/\/http2\.mlstatic\.com\/D_[^"]+)"/,
      /"thumbnail"\s*:\s*"(https?:\/\/[^"]+mlstatic[^"]+)"/,
      /"src"\s*:\s*"(https?:\/\/[^"]+mlstatic\.com[^"]+\.(?:jpg|jpeg|webp|png)[^"]*)"/,
      /content="(https?:\/\/[^"]+mlstatic\.com[^"]+\.(?:jpg|jpeg|webp|png)[^"]*)"/,
    ];
    for (const p of imgPatterns) {
      const m = html.match(p);
      if (m && m[1]) {
        result.image = m[1].replace(/-[OIFR]\.jpg/, "-O.jpg");
        break;
      }
    }
  }

  return result;
}

// ── Extract product name from URL slug ──
function extractTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    // ML URLs: /product-name-here/p/MLB123 or /product-name-here_MLB123
    const segments = pathname.split("/").filter(Boolean);
    // Find the segment before "/p/" or the first long segment
    const pIndex = segments.indexOf("p");
    const slugSegment = pIndex > 0 ? segments[pIndex - 1] : segments[0] || "";
    if (slugSegment && slugSegment.length > 3) {
      return slugSegment
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }
  } catch { /* */ }
  return "";
}

// ── Mercado Livre API ──
async function fetchMeliApi(url: string): Promise<{ title?: string; price?: string; image?: string }> {
  const idMatch = url.match(/ML[AB]-?\d+/i);
  if (!idMatch) {
    console.log("ML API: no item ID found in URL");
    return {};
  }

  const itemId = idMatch[0].replace("-", "").toUpperCase();
  console.log("ML API: fetching item", itemId);
  try {
    const res = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
    });
    console.log("ML API response status:", res.status);
    if (!res.ok) return {};
    const data = await res.json();
    const result: { title?: string; price?: string; image?: string } = {};
    if (data.title) result.title = data.title;
    if (data.price) result.price = `R$ ${parseFloat(data.price).toFixed(2).replace(".", ",")}`;
    if (data.pictures?.[0]?.secure_url) {
      result.image = data.pictures[0].secure_url;
    } else if (data.secure_thumbnail) {
      result.image = data.secure_thumbnail.replace(/-[OIFR]\.jpg/, "-O.jpg");
    } else if (data.thumbnail) {
      result.image = data.thumbnail.replace(/-[OIFR]\.jpg/, "-O.jpg").replace("http://", "https://");
    }
    return result;
  } catch (e) {
    console.error("ML API fetch error:", e);
    return {};
  }
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
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
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
      });
      const text = await res.text();
      finalUrl = res.url || url;
      if (text.length > html.length) html = text;
      if (html.length > 5000) break;
    } catch { continue; }
  }

  return { html, finalUrl };
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

    // ── Mercado Livre: use public API first ──
    if (isMercadoLivre(url)) {
      console.log("Mercado Livre detected, trying API...");
      const apiData = await fetchMeliApi(url);

      if (apiData.title && apiData.price) {
        console.log("ML API success:", { title: apiData.title?.substring(0, 60), price: apiData.price, hasImage: !!apiData.image });
        return new Response(
          JSON.stringify({
            title: decodeHtmlEntities(apiData.title),
            image: apiData.image || "",
            description: "",
            price: apiData.price,
            url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fallback: scrape HTML + extract from ML-specific patterns + URL slug
      console.log("ML API incomplete, trying HTML scrape + URL slug...");
      const { html, finalUrl } = await fetchHtml(url);
      const meliData = extractMeliFromInitialState(html);
      const doc = new DOMParser().parseFromString(html, "text/html");
      const jsonLd = extractJsonLd(html);
      const urlTitle = extractTitleFromUrl(url);

      const getMeta = (name: string) =>
        doc?.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
        doc?.querySelector(`meta[name='${name}']`)?.getAttribute("content") || "";

      // Filter out cookie/verification page titles
      const isJunkTitle = (t: string) => /prefer[eê]ncia|cookie|verifica/i.test(t);

      let rawTitle = meliData.title || apiData.title || jsonLd?.name || getMeta("og:title") ||
        doc?.querySelector("h1")?.textContent?.trim() || "";
      
      if (!rawTitle || isJunkTitle(rawTitle)) {
        rawTitle = urlTitle || "Produto";
      }

      const title = decodeHtmlEntities(rawTitle)
        .replace(/\s*\|.*$/, "").replace(/\s*-\s*(Mercado|MercadoL).*$/i, "").trim() || "Produto";

      const price = meliData.price || apiData.price || (jsonLd ? extractPriceFromJsonLd(jsonLd) : "") ||
        (html.match(/R\$\s*[\d]+[.,][\d]{2}/)?.[0] || "");

      const image = meliData.image || apiData.image ||
        (jsonLd ? extractImagesFromJsonLd(jsonLd).filter(isValidImageUrl)[0] : "") ||
        (getMeta("og:image") && isValidImageUrl(getMeta("og:image")) ? getMeta("og:image") : "") || "";

      console.log("ML final:", { title: title.substring(0, 60), price, hasImage: !!image, source: urlTitle ? "url-slug" : "scrape" });
      return new Response(
        JSON.stringify({ title, image, description: getMeta("og:description") || "", price, url: finalUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Generic scraping for other sites ──
    const { html, finalUrl } = await fetchHtml(url);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const jsonLd = extractJsonLd(html);

    const getMeta = (name: string) =>
      doc?.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
      doc?.querySelector(`meta[name='${name}']`)?.getAttribute("content") || "";

    let title = jsonLd?.name || getMeta("og:title") || getMeta("twitter:title") ||
      doc?.querySelector("title")?.textContent?.trim() || doc?.querySelector("h1")?.textContent?.trim() || "";
    title = decodeHtmlEntities(title);
    title = title.replace(/\s*\|.*$/, "").replace(/\s*-\s*(Amazon|Shopee|Mercado|Magazine).*$/i, "").trim() || "Produto";

    let image = "";
    const jsonLdImages = jsonLd ? extractImagesFromJsonLd(jsonLd) : [];
    const ogImage = getMeta("og:image");
    const twitterImage = getMeta("twitter:image");
    const candidates = [
      ...jsonLdImages.filter(isValidImageUrl),
      ...(ogImage && isValidImageUrl(ogImage) ? [ogImage] : []),
      ...(twitterImage && isValidImageUrl(twitterImage) ? [twitterImage] : []),
      ...findProductImages(doc, html),
    ];
    image = candidates[0] || "";

    const description = jsonLd?.description || getMeta("og:description") || getMeta("description") || "";

    let price = jsonLd ? extractPriceFromJsonLd(jsonLd) : "";
    if (!price) {
      const pricePatterns = [/R\$\s*[\d]+[.,][\d]{2}/, /R\$\s*[\d.,]+/];
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) { price = match[0].trim(); break; }
      }
    }

    console.log("Scraped:", { title: title.substring(0, 60), hasImage: !!image, price, hasJsonLd: !!jsonLd });

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
