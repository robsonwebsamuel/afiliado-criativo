const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const USER_AGENTS = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
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

    const result = await extractProduct(url);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("scrape-product error:", e);
    return new Response(
      JSON.stringify({ error: e.message ?? "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ─── Router ──────────────────────────────────────────────────────────────────
async function extractProduct(url: string) {
  let processedUrl = url;
  
  // Handle Shopee short links
  if (url.includes("shope.ee/")) {
    try {
      const res = await fetch(url, { redirect: "follow", method: "HEAD" });
      processedUrl = res.url;
    } catch { /* ignore */ }
  }

  const hostname = new URL(processedUrl).hostname.toLowerCase();
  try {
    if (hostname.includes("shopee.com.br")) return await scrapeShopee(processedUrl);
    if (hostname.includes("amazon.com.br")) return await scrapeAmazon(processedUrl);
    if (hostname.includes("mercadolivre") || hostname.includes("mercadopago") || hostname.includes("produto.mercadolivre"))
      return await scrapeMercadoLivre(processedUrl);
    if (hostname.includes("magazineluiza.com.br") || hostname.includes("magalu.com"))
      return await scrapeMagalu(processedUrl);
    if (hostname.includes("hotmart.com")) return await scrapeGeneric(processedUrl, "hotmart");
    if (hostname.includes("kiwify.com.br")) return await scrapeGeneric(processedUrl, "kiwify");
    return await scrapeGeneric(processedUrl, hostname);
  } catch (e: any) {
    console.error(`Scrape error for ${hostname}:`, e.message);
    return await scrapeGeneric(processedUrl, hostname);
  }
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
    html.match(/R\$\s*([\d.,]+)/)?.[1];
  if (!raw) return null;
  const n = parseFloat(raw.replace(/\./g, "").replace(",", "."));
  if (isNaN(n) || n <= 0) return null;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": randomUA(),
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
  });
  return await res.text();
}

// ─── SHOPEE ──────────────────────────────────────────────────────────────────
async function scrapeShopee(url: string) {
  let shopId: string | null = null;
  let itemId: string | null = null;

  // Pattern: i.SHOPID.ITEMID
  const matchI = url.match(/i\.(\d+)\.(\d+)/);
  if (matchI) { shopId = matchI[1]; itemId = matchI[2]; }

  // Pattern: /product/SHOPID/ITEMID
  const matchP = url.match(/\/product\/(\d+)\/(\d+)/);
  if (matchP && !shopId) { shopId = matchP[1]; itemId = matchP[2]; }

  const urlObj = new URL(url);
  if (!shopId) shopId = urlObj.searchParams.get("shopid");
  if (!itemId) itemId = urlObj.searchParams.get("itemid");

  if (!shopId || !itemId) throw new Error("Shopee: shopId/itemId não encontrados");

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
  if (!item) throw new Error("Shopee API sem dados");

  return {
    name: item.name ?? "Nome do produto",
    price: item.price ? (item.price / 100000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null,
    image: item.image ? `https://down-br.img.susercontent.com/file/${item.image}` : null,
    description: item.description?.substring(0, 400) ?? null,
    url,
    source: "shopee",
  };
}

// ─── MAGAZINE LUIZA ──────────────────────────────────────────────────────────
async function scrapeMagalu(url: string) {
  const html = await fetchHtml(url);
  const jsonLd = extractJsonLd(html);
  const jProduct = findProductInJsonLd(jsonLd);

  const name =
    jProduct?.name ||
    metaContent(html, "og:title") ||
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.trim() ||
    extractTitle(html);

  const price = 
    (jProduct ? extractPriceFromJsonLd(jProduct) : null) ||
    (() => {
      const m = html.match(/data-testid="price-value"[^>]*>R\$\s*([\d.,]+)/i);
      return m ? m[1] : extractPrice(html);
    })();

  const image = 
    (typeof jProduct?.image === "string" ? jProduct.image : Array.isArray(jProduct?.image) ? jProduct.image[0] : null) ||
    metaContent(html, "og:image") ||
    html.match(/<img[^>]*data-testid="image-selected"[^>]*src="([^"]+)"/i)?.[1];

  return {
    name: decodeHtmlEntities(name || "Nome do produto").replace(/\s*-\s*Magazine Luiza.*/i, "").trim().substring(0, 200),
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

  // Try JSON-LD first
  const jsonLd = extractJsonLd(html);
  const jProduct = findProductInJsonLd(jsonLd);

  const name =
    jProduct?.name ||
    html.match(/<span id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/)?.[1]?.trim() ||
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
    name: name?.substring(0, 200) ?? "Nome do produto",
    price: price ?? null,
    image: (typeof image === "string" ? image : Array.isArray(image) ? image[0] : null) ?? null,
    description: metaContent(html, "description")?.substring(0, 400) ?? null,
    url,
    source: "amazon",
  };
}

// ─── MERCADO LIVRE ───────────────────────────────────────────────────────────
async function scrapeMercadoLivre(url: string) {
  // Try API first
  const mlbMatch =
    url.match(/\/p\/(MLB\d+)/i)?.[1] ||
    url.match(/MLB-?(\d+)/i)?.[0]?.replace("-", "");
  const mlbId = mlbMatch?.toUpperCase();

  if (mlbId) {
    try {
      const apiRes = await fetch(`https://api.mercadolibre.com/items/${mlbId.toUpperCase()}`, {
        headers: { Accept: "application/json" },
      });
      if (apiRes.ok) {
        const item = await apiRes.json();
        return {
          name: item.title ?? "Nome do produto",
          price: item.price ? item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : null,
          image: item.thumbnail?.replace("I.jpg", "O.jpg") ?? null,
          description: null,
          url,
          source: "mercadolivre",
        };
      }
    } catch { /* fallback to HTML */ }
  }

  // Fallback: HTML scraping
  const html = await fetchHtml(url);
  const jsonLd = extractJsonLd(html);
  const jProduct = findProductInJsonLd(jsonLd);

  let name = jProduct?.name || metaContent(html, "og:title") || extractTitle(html);
  // Clean ML title suffixes
  if (name) {
    name = name
      .replace(/\s*\|\s*MercadoLivre.*$/i, "")
      .replace(/\s*-\s*Mercado Livre.*$/i, "")
      .trim();
  }

  // Fallback: extract name from URL slug if title is generic
  const genericNames = ["nome do produto", "mercado livre", "mercadolivre", ""];
  if (!name || genericNames.includes(name.toLowerCase().trim())) {
    const slugMatch = url.match(/mercadolivre\.com\.br\/([a-z0-9][a-z0-9\-]+[a-z0-9])/i);
    if (slugMatch) {
      name = decodeURIComponent(slugMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .substring(0, 200);
    }
  }

  const price = (jProduct ? extractPriceFromJsonLd(jProduct) : null) || extractPrice(html);
  const image = (typeof jProduct?.image === "string" ? jProduct.image : Array.isArray(jProduct?.image) ? jProduct.image[0] : null) ||
    metaContent(html, "og:image");

  return {
    name: name?.substring(0, 200) ?? "Nome do produto",
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
    return { name: "Nome do produto", price: null, image: null, description: null, url, source };
  }
}
