const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_AGENTS = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function ok(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("scrape-product called with:", url);
    const result = await extractProduct(url);
    console.log("scrape-product result:", JSON.stringify({ name: result.name, price: result.price, hasImage: !!result.image, source: result.source }));

    return ok(result);
  } catch (e: any) {
    console.error("scrape-product error:", e);
    // Graceful degradation - never return 500
    return ok({
      name: "Nome do produto",
      price: null,
      image: null,
      description: null,
      url: "",
      source: "error",
      fallback: true,
      error: e.message ?? "Erro desconhecido",
    });
  }
});

// ─── Router ──────────────────────────────────────────────────────────────────
async function extractProduct(url: string) {
  let processedUrl = url;

  // Handle short links
  const isShortLink =
    url.includes("shope.ee/") ||
    url.includes("mercadolivre.com/sec/") ||
    url.includes("ml.com.br/");

  if (isShortLink) {
    try {
      const res = await fetch(url, { redirect: "follow", method: "HEAD" });
      processedUrl = res.url;
    } catch { /* ignore */ }
  }

  const hostname = new URL(processedUrl).hostname.toLowerCase();
  try {
    if (hostname.includes("shopee.com.br")) return await scrapeShopee(processedUrl);
    if (hostname.includes("amazon.com.br") || hostname.includes("amazon.com")) return await scrapeAmazon(processedUrl);
    if (hostname.includes("mercadolivre") || hostname.includes("mercadopago") || hostname.includes("produto.mercadolivre"))
      return await scrapeMercadoLivre(processedUrl);
    if (hostname.includes("magazineluiza.com.br") || hostname.includes("magalu.com"))
      return await scrapeMagalu(processedUrl);
    if (hostname.includes("hotmart.com")) return await scrapeGeneric(processedUrl, "hotmart");
    if (hostname.includes("kiwify.com.br")) return await scrapeGeneric(processedUrl, "kiwify");
    return await scrapeGeneric(processedUrl, hostname);
  } catch (e: any) {
    console.error(`Scrape error for ${hostname}:`, e.message);
    // Try generic as last resort
    try {
      return await scrapeGeneric(processedUrl, hostname);
    } catch {
      // Extract what we can from URL
      return extractFromUrl(processedUrl, hostname);
    }
  }
}

// ─── Extract from URL slug ──────────────────────────────────────────────────
function extractFromUrl(url: string, source: string) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/").filter(Boolean);
  // Find the longest slug-like segment
  let bestSlug = "";
  for (const part of pathParts) {
    if (part.length > bestSlug.length && /[a-zA-Z]/.test(part)) {
      bestSlug = part;
    }
  }
  const name = bestSlug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  return {
    name: name || "Nome do produto",
    price: null,
    image: null,
    description: null,
    url,
    source,
    fallback: true,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[A-Za-z]+;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const regex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) results.push(...parsed);
      else results.push(parsed);
    } catch { /* ignore */ }
  }
  return results;
}

function findProductInJsonLd(items: any[]): any | null {
  for (const item of items) {
    if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) return item;
    if (item["@graph"]) {
      const found = findProductInJsonLd(item["@graph"]);
      if (found) return found;
    }
  }
  return null;
}

function extractPriceFromJsonLd(product: any): string | null {
  const offers = product.offers;
  if (!offers) return null;
  const price = offers.price ?? offers.lowPrice ?? (Array.isArray(offers) ? offers[0]?.price : null);
  if (!price) return null;
  return Number(price).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1] ? decodeHtmlEntities(m[1].trim()) : null;
}

function extractPrice(html: string): string | null {
  const raw =
    metaContent(html, "product:price:amount") ||
    metaContent(html, "og:price:amount") ||
    html.match(/R\$\s*([\d.,]+)/)?.[1];
  if (!raw) return null;
  const n = parseFloat(raw.replace(/\./g, "").replace(",", "."));
  if (isNaN(n) || n <= 0) return null;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": randomUA(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      signal: controller.signal,
    });
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── SHOPEE ──────────────────────────────────────────────────────────────────
async function scrapeShopee(url: string) {
  let shopId: string | null = null;
  let itemId: string | null = null;

  const matchI = url.match(/i\.(\d+)\.(\d+)/);
  if (matchI) { shopId = matchI[1]; itemId = matchI[2]; }

  const matchP = url.match(/\/product\/(\d+)\/(\d+)/);
  if (matchP && !shopId) { shopId = matchP[1]; itemId = matchP[2]; }

  const urlObj = new URL(url);
  if (!shopId) shopId = urlObj.searchParams.get("shopid");
  if (!itemId) itemId = urlObj.searchParams.get("itemid");

  // Fallback to OG tags if no API IDs found
  if (!shopId || !itemId) {
    return await scrapeGeneric(url, "shopee");
  }

  try {
    const apiUrl = `https://shopee.com.br/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": randomUA(),
        "Referer": "https://shopee.com.br/",
        "Accept": "application/json",
        "X-Shopee-Language": "pt-BR",
      },
    });

    const json = await res.json();
    const item = json?.data;
    if (!item) return await scrapeGeneric(url, "shopee");

    return {
      name: item.name ?? "Nome do produto",
      price: item.price ? (item.price / 100000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null,
      image: item.image ? `https://down-br.img.susercontent.com/file/${item.image}` : null,
      description: item.description?.substring(0, 400) ?? null,
      url,
      source: "shopee",
    };
  } catch {
    return await scrapeGeneric(url, "shopee");
  }
}

// ─── MAGAZINE LUIZA ──────────────────────────────────────────────────────────
async function scrapeMagalu(url: string) {
  const html = await fetchHtml(url);
  const jsonLd = extractJsonLd(html);
  const jProduct = findProductInJsonLd(jsonLd);

  const name =
    jProduct?.name ||
    metaContent(html, "og:title") ||
    html.match(/<h1[^>]*class="[^"]*sc-[^"]*"[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.trim() ||
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.trim() ||
    extractTitle(html);

  const price =
    (jProduct ? extractPriceFromJsonLd(jProduct) : null) ||
    (() => {
      const m = html.match(/data-testid="price-value"[^>]*>R\$\s*([\d.,]+)/i);
      if (m) return m[1];
      const m2 = html.match(/class="[^"]*sc-[^"]*"[^>]*>R\$\s*([\d.,]+)/i);
      if (m2) return m2[1];
      return extractPrice(html);
    })();

  const image =
    (typeof jProduct?.image === "string" ? jProduct.image : Array.isArray(jProduct?.image) ? jProduct.image[0] : null) ||
    metaContent(html, "og:image") ||
    html.match(/<img[^>]*data-testid="image-selected"[^>]*src="([^"]+)"/i)?.[1];

  return {
    name: decodeHtmlEntities(name || "Nome do produto").replace(/\s*[-|]\s*Magazine Luiza.*/i, "").replace(/\s*[-|]\s*Magalu.*/i, "").trim().substring(0, 200),
    price,
    image,
    description: metaContent(html, "og:description")?.substring(0, 400) ?? null,
    url,
    source: "magazineluiza",
  };
}

// ─── AMAZON ──────────────────────────────────────────────────────────────────
async function scrapeAmazon(url: string) {
  const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || url.match(/\/gp\/product\/([A-Z0-9]{10})/)?.[1];
  const cleanUrl = asin ? `https://www.amazon.com.br/dp/${asin}` : url;
  const html = await fetchHtml(cleanUrl);

  const jsonLd = extractJsonLd(html);
  const jProduct = findProductInJsonLd(jsonLd);

  const name =
    jProduct?.name ||
    html.match(/<span id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/)?.[1]?.trim() ||
    metaContent(html, "og:title") ||
    metaContent(html, "title") ||
    extractTitle(html)?.replace(/\s*:\s*Amazon\.com\.br.*/, "")?.trim();

  const price =
    (jProduct ? extractPriceFromJsonLd(jProduct) : null) ||
    (() => {
      const m = html.match(/"priceAmount":"?([\d.]+)"?/)?.[1] ||
                html.match(/class="a-price-whole">([^<]+)<\/span>/)?.[1]?.replace(/\D/g, "");
      if (!m) return null;
      return parseFloat(m).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    })();

  const image =
    jProduct?.image ||
    html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/)?.[1] ||
    metaContent(html, "og:image") ||
    html.match(/"hiRes":"(https:\/\/[^"]+)"/)?.[1];

  return {
    name: decodeHtmlEntities(name || "Nome do produto").substring(0, 200),
    price: price ?? null,
    image: (typeof image === "string" ? image : Array.isArray(image) ? image[0] : null) ?? null,
    description: (metaContent(html, "og:description") || metaContent(html, "description"))?.substring(0, 400) ?? null,
    url,
    source: "amazon",
  };
}

// ─── MERCADO LIVRE ───────────────────────────────────────────────────────────
async function scrapeMercadoLivre(url: string) {
  // Try API first
  const mlbMatch =
    url.match(/\/p\/(MLB-?\d+)/i)?.[1] ||
    url.match(/(MLB-?\d+)/i)?.[0];
  const mlbId = mlbMatch?.toUpperCase().replace(/-/g, "");

  console.log("ML scrape - mlbId:", mlbId, "from url:", url);

  if (mlbId) {
    try {
      const apiRes = await fetch(`https://api.mercadolibre.com/items/${mlbId}`, {
        headers: { Accept: "application/json" },
      });
      if (apiRes.ok) {
        const item = await apiRes.json();
        return {
          name: item.title ?? "Nome do produto",
          price: item.price ? item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null,
          image: item.thumbnail?.replace("-I.jpg", "-O.jpg") ?? null,
          description: null,
          url,
          source: "mercadolivre",
        };
      }
    } catch { /* fallback to HTML */ }
  }

  // Fallback: HTML scraping
  let html = "";
  try {
    html = await fetchHtml(url);
  } catch {
    return extractFromUrl(url, "mercadolivre");
  }

  const jsonLd = extractJsonLd(html);
  const jProduct = findProductInJsonLd(jsonLd);

  let name = jProduct?.name || metaContent(html, "og:title") || extractTitle(html);
  if (name) {
    name = name
      .replace(/\s*\|\s*Mercado\s*Livre.*$/i, "")
      .replace(/\s*-\s*Mercado\s*Livre.*$/i, "")
      .trim();
  }
  // Fallback: extract from URL slug
  if (!name || name === "Nome do produto" || name === "Mercado Livre" || name.length < 5) {
    const fromUrl = extractFromUrl(url, "mercadolivre");
    if (fromUrl.name !== "Nome do produto") name = fromUrl.name;
  }

  let price = (jProduct ? extractPriceFromJsonLd(jProduct) : null);
  if (!price) {
    const fraction = html.match(/andes-money-amount__fraction">([\d.]+)/)?.[1];
    const cents = html.match(/andes-money-amount__cents">(\d+)/)?.[1] || "00";
    if (fraction) {
      price = `${fraction},${cents}`;
    } else {
      price = extractPrice(html);
    }
  }

  const image = (typeof jProduct?.image === "string" ? jProduct.image : Array.isArray(jProduct?.image) ? jProduct.image[0] : null) ||
    metaContent(html, "og:image");

  return {
    name: decodeHtmlEntities(name || "Nome do produto").substring(0, 200),
    price,
    image,
    description: metaContent(html, "og:description")?.substring(0, 400) ?? null,
    url,
    source: "mercadolivre",
  };
}

// ─── GENERIC (OG + JSON-LD) ─────────────────────────────────────────────────
async function scrapeGeneric(url: string, source: string) {
  try {
    const html = await fetchHtml(url);
    const jsonLd = extractJsonLd(html);
    const jProduct = findProductInJsonLd(jsonLd);

    const name =
      jProduct?.name ||
      metaContent(html, "og:title") ||
      metaContent(html, "title") ||
      extractTitle(html) ||
      "Nome do produto";

    const price =
      (jProduct ? extractPriceFromJsonLd(jProduct) : null) ||
      extractPrice(html);

    const image =
      (typeof jProduct?.image === "string" ? jProduct.image : Array.isArray(jProduct?.image) ? jProduct.image[0] : null) ||
      metaContent(html, "og:image") ||
      metaContent(html, "twitter:image");

    return {
      name: decodeHtmlEntities(name).substring(0, 200),
      price,
      image,
      description: (metaContent(html, "og:description") || metaContent(html, "description"))?.substring(0, 400) ?? null,
      url,
      source,
    };
  } catch {
    return { name: "Nome do produto", price: null, image: null, description: null, url, source, fallback: true };
  }
}
