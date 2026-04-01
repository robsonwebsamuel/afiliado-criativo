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
    .replace(/\u200B/g, "").replace(/\u200C/g, "").replace(/\u200D/g, "").replace(/\uFEFF/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  const blacklist = [
    "uedata", "pixel", "beacon", "tracking", "analytics",
    "1x1", "spacer", "blank", "transparent", "sprite", "badge",
    "fls-na.amazon", "fls-eu.amazon",
    "images-na.ssl-images-amazon.com/images/G/01/x-locale",
    "data:image", "svg+xml",
    // ML non-product images
    "mercadolibre.com/org-img", "mercadolivre.com/org-img",
    "meli-incubator", "frontend-assets",
    "/nav-header", "/favicon",
    // ML handshake/logo
    "/logo", "mercadopago", "logo-mercadolibre",
  ];
  // Extra check: reject very small images from mlstatic that are logos
  if (url.includes("mlstatic") && (url.includes("/resources/") || url.includes("/org-img/"))) return false;
  return !blacklist.some(b => url.toLowerCase().includes(b));
}

function isJunkTitle(t: string): boolean {
  if (!t || t.length < 3) return true;
  return /captcha|robot|verifica|prefer[eê]ncia|cookie|access denied|not found|404|403|error|challenge|security check/i.test(t);
}

// ── JSON-LD extraction ──
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
      const num = parseFloat(String(price).replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isNaN(num) && num > 0.5) return `R$ ${num.toFixed(2).replace(".", ",")}`;
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

// ── Price extraction from HTML ──
function extractPriceFromHtml(html: string): string {
  // Common price patterns in Brazilian e-commerce
  const patterns = [
    // Meta tag with price
    /itemprop="price"\s+content="([\d.,]+)"/,
    /property="product:price:amount"\s+content="([\d.,]+)"/,
    /data-price="([\d.,]+)"/,
    // Visible price with R$
    /R\$\s*([\d]{1,3}(?:\.?\d{3})*[,.]?\d{0,2})/,
    // JSON price patterns
    /"price"\s*:\s*"?(\d[\d.,]*)(?:"|,)/,
    /"sale_?[Pp]rice"\s*:\s*"?(\d[\d.,]*)(?:"|,)/,
    /"offer_?[Pp]rice"\s*:\s*"?(\d[\d.,]*)(?:"|,)/,
    /"amount"\s*:\s*"?(\d[\d.,]*)(?:"|,)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let raw = match[1].trim();
      // Parse the number: could be 1299.90, 1.299,90 or 129990
      let num: number;
      if (raw.includes(",") && raw.includes(".")) {
        // 1.299,90 format (BR)
        num = parseFloat(raw.replace(/\./g, "").replace(",", "."));
      } else if (raw.includes(",")) {
        // Could be 29,90 or 1299,90
        num = parseFloat(raw.replace(",", "."));
      } else {
        num = parseFloat(raw);
      }
      if (!isNaN(num) && num > 0.5 && num < 1_000_000) {
        return `R$ ${num.toFixed(2).replace(".", ",")}`;
      }
    }
  }
  return "";
}

// ── Image extraction from DOM ──
function findProductImages(doc: any, html: string): string[] {
  const images: string[] = [];
  
  // Priority: og:image, twitter:image
  const ogImage = doc?.querySelector("meta[property='og:image']")?.getAttribute("content") || "";
  if (ogImage && isValidImageUrl(ogImage)) images.push(ogImage.startsWith("//") ? `https:${ogImage}` : ogImage);
  
  const twitterImage = doc?.querySelector("meta[name='twitter:image']")?.getAttribute("content") || "";
  if (twitterImage && isValidImageUrl(twitterImage)) images.push(twitterImage.startsWith("//") ? `https:${twitterImage}` : twitterImage);

  // img tags with product-related attributes
  const imgTags = doc?.querySelectorAll("img") || [];
  for (const img of imgTags) {
    const src = (img as any).getAttribute("data-src") ||
                (img as any).getAttribute("data-zoom-image") ||
                (img as any).getAttribute("data-large-image") ||
                (img as any).getAttribute("data-a-dynamic-image") ||
                (img as any).getAttribute("src") || "";
    if (src && isValidImageUrl(src)) {
      let fullUrl = src.startsWith("//") ? `https:${src}` : src;
      if (fullUrl.startsWith("http")) {
        // Prefer larger images
        const w = parseInt((img as any).getAttribute("width") || "0");
        const h = parseInt((img as any).getAttribute("height") || "0");
        if (w > 100 || h > 100 || fullUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
          images.push(fullUrl);
        }
      }
    }
  }

  // JSON patterns for image URLs in scripts
  const imgPatterns = [
    /"(?:hiRes|large|original|zoom)"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
    /"imageUrl"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
    /"image(?:_url)?"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
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

// ── Title cleaning ──
function cleanTitle(raw: string): string {
  let title = decodeHtmlEntities(raw);
  // Remove common suffixes like "| Amazon", "- Shopee", etc
  title = title
    .replace(/\s*[|–—-]\s*(Amazon|Shopee|Mercado Livre|MercadoLivre|Magazine Luiza|Magalu|Americanas|Casas Bahia|Submarino|AliExpress|Shein|Kabum|Ponto Frio|Extra|Carrefour).*$/i, "")
    .replace(/\s*[|–—-]\s*\w+\.\w{2,3}(\.\w{2})?$/i, "") // Remove "- site.com.br"
    .trim();
  return title || "Produto";
}

// ── Mercado Livre specifics ──
function isMercadoLivre(url: string): boolean {
  return /mercadoli[vb]re\.com|mlstatic\.com|mercadolibre\.com/i.test(url);
}

async function fetchMeliApi(url: string): Promise<{ title?: string; price?: string; image?: string }> {
  // Try extracting ML item ID from various URL formats
  const patterns = [
    /\/(ML[AB]-?\d+)/i,
    /ML[AB]-?\d+/i,
  ];
  
  let itemId = "";
  for (const p of patterns) {
    const m = url.match(p);
    if (m) {
      itemId = (m[1] || m[0]).replace("-", "").toUpperCase();
      break;
    }
  }

  // For catalog URLs like /p/MLB27391145, the ID is a catalog_product_id
  const catalogMatch = url.match(/\/p\/(ML[AB]\d+)/i);
  const catalogId = catalogMatch ? catalogMatch[1].toUpperCase() : "";

  // Try catalog search first (for /p/ URLs)
  if (catalogId) {
    console.log("ML API: trying catalog search for", catalogId);
    try {
      const searchRes = await fetch(
        `https://api.mercadolibre.com/sites/MLB/search?catalog_product_id=${catalogId}&limit=1`,
        { headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" } }
      );
      console.log("ML catalog search status:", searchRes.status);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        console.log("ML catalog search results count:", searchData.results?.length);
        const firstResult = searchData.results?.[0];
        if (firstResult) {
          const result: { title?: string; price?: string; image?: string } = {};
          result.title = firstResult.title;
          if (firstResult.price) {
            result.price = `R$ ${parseFloat(firstResult.price).toFixed(2).replace(".", ",")}`;
          }
          if (firstResult.thumbnail) {
            result.image = firstResult.thumbnail
              .replace(/-[A-Z]\.jpg/, "-O.jpg")
              .replace("http://", "https://");
          }
          console.log("ML catalog search result:", { title: result.title?.substring(0, 50), price: result.price, hasImage: !!result.image });
          if (result.title && result.price) return result;
        }
      } else {
        const errText = await searchRes.text();
        console.log("ML catalog search error:", errText.substring(0, 200));
      }
    } catch (e) {
      console.log("ML catalog search failed:", e);
    }
  }

  // Try search by product name from URL slug
  const urlTitle = extractTitleFromUrl(url);
  if (urlTitle && urlTitle.length > 5) {
    console.log("ML API: trying search by name:", urlTitle);
    try {
      const searchRes = await fetch(
        `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(urlTitle)}&limit=1`,
        { headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" } }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const firstResult = searchData.results?.[0];
        if (firstResult) {
          const result: { title?: string; price?: string; image?: string } = {};
          result.title = firstResult.title;
          if (firstResult.price) {
            result.price = `R$ ${parseFloat(firstResult.price).toFixed(2).replace(".", ",")}`;
          }
          if (firstResult.thumbnail) {
            result.image = firstResult.thumbnail
              .replace(/-[A-Z]\.jpg/, "-O.jpg")
              .replace("http://", "https://");
          }
          console.log("ML name search result:", { title: result.title?.substring(0, 50), price: result.price, hasImage: !!result.image });
          if (result.title && result.price && result.image) return result;
        }
      }
    } catch (e) {
      console.log("ML name search failed:", e);
    }
  }
  
  // Fallback: direct item API
  if (itemId) {
    console.log("ML API: fetching item", itemId);
    try {
      const res = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
      });
      console.log("ML API response status:", res.status);
      if (!res.ok) {
        const text = await res.text();
        console.log("ML API error body:", text.substring(0, 200));
        return {};
      }
      const data = await res.json();
      const result: { title?: string; price?: string; image?: string } = {};
      if (data.title) result.title = data.title;
      if (data.price) result.price = `R$ ${parseFloat(data.price).toFixed(2).replace(".", ",")}`;
      
      if (data.pictures?.length > 0) {
        const pic = data.pictures[0];
        result.image = pic.secure_url || pic.url || "";
        if (result.image) result.image = result.image.replace(/-[A-Z]\.jpg/, "-O.jpg");
      } else if (data.secure_thumbnail) {
        result.image = data.secure_thumbnail.replace(/-[A-Z]\.jpg/, "-O.jpg");
      } else if (data.thumbnail) {
        result.image = data.thumbnail.replace(/-[A-Z]\.jpg/, "-O.jpg").replace("http://", "https://");
      }
      
      console.log("ML API result:", { title: result.title?.substring(0, 50), price: result.price, hasImage: !!result.image });
      return result;
    } catch (e) {
      console.error("ML API fetch error:", e);
    }
  }

  return {};
}

function extractMeliFromHtml(html: string): { title?: string; price?: string; image?: string } {
  const result: { title?: string; price?: string; image?: string } = {};

  // Title patterns
  const titlePatterns = [
    /class="ui-pdp-title"[^>]*>([^<]+)/,
    /data-testid="pdp-title"[^>]*>([^<]+)/,
    /"title"\s*:\s*"([^"]{10,200})"/,
  ];
  for (const p of titlePatterns) {
    const m = html.match(p);
    if (m && m[1] && !m[1].includes("{") && !isJunkTitle(m[1])) {
      result.title = m[1].trim();
      break;
    }
  }

  // Price patterns
  const pricePatterns = [
    /itemprop="price"\s+content="([\d.]+)"/,
    /class="andes-money-amount__fraction"[^>]*>([\d.]+)/,
    /"price"\s*:\s*([\d.]+)/,
    /"amount"\s*:\s*([\d.]+)/,
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

  // Image from ML CDN
  const imgPatterns = [
    /"(https?:\/\/http2\.mlstatic\.com\/D_[^"]+)"/,
    /content="(https?:\/\/[^"]+mlstatic\.com[^"]+\.(?:jpg|jpeg|webp|png)[^"]*)"/,
    /"src"\s*:\s*"(https?:\/\/[^"]+mlstatic[^"]+\.(?:jpg|jpeg|webp|png)[^"]*)"/,
  ];
  for (const p of imgPatterns) {
    const m = html.match(p);
    if (m && m[1]) {
      result.image = m[1].replace(/-[A-Z]\.jpg/, "-O.jpg");
      break;
    }
  }

  return result;
}

// ── URL slug title extraction ──
function extractTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const pIndex = segments.indexOf("p");
    const slugSegment = pIndex > 0 ? segments[pIndex - 1] : segments.find(s => s.length > 10 && !s.match(/^[A-Z]{3}\d+$/)) || "";
    if (slugSegment && slugSegment.length > 5) {
      return slugSegment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }
  } catch { /* */ }
  return "";
}

// ── HTML fetcher with multiple strategies ──
async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  const strategies = [
    {
      ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      extra: {},
    },
    {
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      extra: { "Referer": "https://www.google.com/" },
    },
    {
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
      extra: {},
    },
  ];

  let bestHtml = "";
  let finalUrl = url;

  for (const strategy of strategies) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": strategy.ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "identity",
          "Cache-Control": "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          ...strategy.extra,
        },
        redirect: "follow",
      });
      const text = await res.text();
      finalUrl = res.url || url;
      
      // Check if we got a captcha/block page
      if (isJunkTitle(text.substring(0, 500)) && bestHtml.length > text.length) {
        continue;
      }
      
      if (text.length > bestHtml.length) bestHtml = text;
      if (bestHtml.length > 10000) break; // Good enough
    } catch (e) {
      console.log("Fetch strategy failed:", e);
      continue;
    }
  }

  return { html: bestHtml, finalUrl };
}

// ── Amazon specific helpers ──
function isAmazon(url: string): boolean {
  return /amazon\.com/i.test(url);
}

function extractAmazonData(html: string, doc: any): { title?: string; price?: string; image?: string } {
  const result: { title?: string; price?: string; image?: string } = {};

  // Title
  const titleEl = doc?.getElementById("productTitle") || doc?.getElementById("title");
  if (titleEl) result.title = titleEl.textContent?.trim();

  // Price - Amazon has multiple price locations
  const pricePatterns = [
    /class="a-price-whole"[^>]*>([\d.]+)/,
    /id="priceblock_ourprice"[^>]*>[^R]*R\$\s*([\d.,]+)/,
    /id="priceblock_dealprice"[^>]*>[^R]*R\$\s*([\d.,]+)/,
    /"priceAmount"\s*:\s*"?([\d.,]+)/,
  ];
  for (const p of pricePatterns) {
    const m = html.match(p);
    if (m && m[1]) {
      let raw = m[1].replace(/\./g, "").replace(",", ".");
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0.5) {
        result.price = `R$ ${num.toFixed(2).replace(".", ",")}`;
        break;
      }
    }
  }

  // Image - Amazon data-a-dynamic-image contains JSON with image URLs
  const dynamicMatch = html.match(/data-a-dynamic-image="({[^"]+})"/);
  if (dynamicMatch) {
    try {
      const decoded = dynamicMatch[1].replace(/&quot;/g, '"');
      const imgObj = JSON.parse(decoded);
      const urls = Object.keys(imgObj);
      // Pick the largest
      let bestUrl = "";
      let bestSize = 0;
      for (const u of urls) {
        const dims = imgObj[u];
        const size = (dims[0] || 0) * (dims[1] || 0);
        if (size > bestSize && isValidImageUrl(u)) {
          bestSize = size;
          bestUrl = u;
        }
      }
      if (bestUrl) result.image = bestUrl;
    } catch { /* */ }
  }

  // Fallback image from landingImage
  if (!result.image) {
    const imgMatch = html.match(/id="landingImage"[^>]*src="([^"]+)"/);
    if (imgMatch && isValidImageUrl(imgMatch[1])) result.image = imgMatch[1];
  }

  return result;
}

// ── Shopee specific ──
function isShopee(url: string): boolean {
  return /shopee\.com/i.test(url);
}

function extractShopeeData(html: string): { title?: string; price?: string; image?: string } {
  const result: { title?: string; price?: string; image?: string } = {};
  
  // Shopee embeds product data in script tags
  const nameMatch = html.match(/"name"\s*:\s*"([^"]{5,200})"/);
  if (nameMatch && !isJunkTitle(nameMatch[1])) result.title = nameMatch[1];
  
  const priceMatch = html.match(/"price"\s*:\s*(\d+)/);
  if (priceMatch) {
    // Shopee prices are in cents (multiply by 100000)
    let num = parseInt(priceMatch[1]);
    if (num > 100000) num = num / 100000; // Shopee uses this format
    if (num > 0.5 && num < 1_000_000) {
      result.price = `R$ ${num.toFixed(2).replace(".", ",")}`;
    }
  }
  
  const imgMatch = html.match(/"image"\s*:\s*"(https?:\/\/[^"]+)"/);
  if (imgMatch && isValidImageUrl(imgMatch[1])) result.image = imgMatch[1];
  
  return result;
}

// ── Main handler ──
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching product from:", url);

    // ── Mercado Livre: API first ──
    if (isMercadoLivre(url)) {
      console.log("Mercado Livre detected");
      const apiData = await fetchMeliApi(url);

      if (apiData.title && apiData.price && apiData.image) {
        return new Response(
          JSON.stringify({
            title: cleanTitle(apiData.title),
            image: apiData.image,
            description: "",
            price: apiData.price,
            url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fallback to HTML scrape
      const { html, finalUrl } = await fetchHtml(url);
      const meliHtml = extractMeliFromHtml(html);
      const doc = new DOMParser().parseFromString(html, "text/html");
      const jsonLd = extractJsonLd(html);
      const urlTitle = extractTitleFromUrl(url);

      const title = cleanTitle(
        apiData.title || meliHtml.title || jsonLd?.name ||
        doc?.querySelector("meta[property='og:title']")?.getAttribute("content") ||
        doc?.querySelector("h1")?.textContent?.trim() ||
        urlTitle || "Produto"
      );

      const price = apiData.price || meliHtml.price ||
        (jsonLd ? extractPriceFromJsonLd(jsonLd) : "") ||
        extractPriceFromHtml(html);

      const image = apiData.image || meliHtml.image ||
        (jsonLd ? extractImagesFromJsonLd(jsonLd).filter(isValidImageUrl)[0] : "") ||
        findProductImages(doc, html)[0] || "";

      console.log("ML result:", { title: title.substring(0, 50), price, hasImage: !!image });
      return new Response(
        JSON.stringify({ title, image, description: "", price, url: finalUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Generic scraping ──
    const { html, finalUrl } = await fetchHtml(url);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const jsonLd = extractJsonLd(html);

    const getMeta = (name: string) =>
      doc?.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
      doc?.querySelector(`meta[name='${name}']`)?.getAttribute("content") || "";

    // ── Site-specific extraction ──
    let siteData: { title?: string; price?: string; image?: string } = {};
    if (isAmazon(url)) {
      siteData = extractAmazonData(html, doc);
    } else if (isShopee(url)) {
      siteData = extractShopeeData(html);
    }

    // ── Title ──
    let rawTitle = siteData.title || jsonLd?.name || getMeta("og:title") || getMeta("twitter:title") ||
      doc?.querySelector("h1")?.textContent?.trim() ||
      doc?.querySelector("title")?.textContent?.trim() || "";
    
    if (isJunkTitle(rawTitle)) {
      rawTitle = extractTitleFromUrl(url) || "Produto";
    }
    const title = cleanTitle(rawTitle);

    // ── Image ──
    const jsonLdImages = jsonLd ? extractImagesFromJsonLd(jsonLd).filter(isValidImageUrl) : [];
    const allImages = [
      ...(siteData.image ? [siteData.image] : []),
      ...jsonLdImages,
      ...findProductImages(doc, html),
    ];
    const image = allImages[0] || "";

    // ── Price ──
    let price = siteData.price || (jsonLd ? extractPriceFromJsonLd(jsonLd) : "");
    if (!price) price = extractPriceFromHtml(html);

    // ── Description ──
    const description = jsonLd?.description || getMeta("og:description") || getMeta("description") || "";

    console.log("Scraped:", { title: title.substring(0, 60), hasImage: !!image, price, hasJsonLd: !!jsonLd, site: new URL(url).hostname });

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
