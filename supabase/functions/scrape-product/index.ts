Deno.serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
    });
  }

  try {
    const { url } = await req.json();
    if (!url) return new Response("Missing url", { status: 400 });

    const result = await extractProduct(url);
    
    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message ?? "Erro desconhecido" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        } 
      }
    );
  }
});

async function extractProduct(url: string) {
  const hostname = new URL(url).hostname.toLowerCase();

  try {
    if (hostname.includes("shopee.com.br"))   return await scrapeShopee(url);
    if (hostname.includes("amazon.com.br"))   return await scrapeAmazon(url);
    if (hostname.includes("mercadolivre") ||
        hostname.includes("mercadopago"))     return await scrapeMercadoLivre(url);
    if (hostname.includes("hotmart.com"))     return await scrapeHotmart(url);
    if (hostname.includes("kiwify.com.br"))   return await scrapeKiwify(url);
    if (hostname.includes("monetizze.com.br"))return await scrapeMetaTags(url);

    // Fallback genérico para outros sites
    return await scrapeMetaTags(url);
  } catch (e: any) {
    console.error(`Error scraping ${hostname}:`, e.message);
    // On error, still try the fallback instead of failing completely
    return await scrapeMetaTags(url);
  }
}

// ─── SHOPEE ──────────────────────────────────────────────────────────────────
async function scrapeShopee(url: string) {
  let shopId: string | null = null;
  let itemId: string | null = null;

  const matchI = url.match(/i\.(\d+)\.(\d+)/);
  if (matchI) {
    shopId = matchI[1];
    itemId = matchI[2];
  }

  const urlObj = new URL(url);
  if (!shopId) shopId = urlObj.searchParams.get("shopid");
  if (!itemId) itemId = urlObj.searchParams.get("itemid");

  if (!shopId || !itemId) throw new Error("Não foi possível extrair shopId/itemId da URL da Shopee");

  const apiUrl = `https://shopee.com.br/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://shopee.com.br/",
      "Accept": "application/json",
    },
  });

  const json = await res.json();
  const item = json?.data;

  if (!item) throw new Error("API Shopee não retornou dados do produto");

  const name = item.name ?? "Nome do produto";
  const price = item.price
    ? (item.price / 100000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;
  const image = item.image
    ? `https://down-br.img.susercontent.com/file/${item.image}`
    : null;
  const description = item.description?.substring(0, 400) ?? null;

  return { name, price, image, description, url, source: "shopee" };
}

// ─── AMAZON ──────────────────────────────────────────────────────────────────
async function scrapeAmazon(url: string) {
  const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ||
               url.match(/\/gp\/product\/([A-Z0-9]{10})/)?.[1];

  const cleanUrl = asin ? `https://www.amazon.com.br/dp/${asin}` : url;

  const res = await fetch(cleanUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9",
      "Accept": "text/html,application/xhtml+xml",
      "Cache-Control": "no-cache",
    },
  });

  const html = await res.text();

  const name =
    html.match(/<span id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/)?.[1]?.trim() ||
    html.match(/<meta name="title" content="([^"]+)"/)?.[1] ||
    html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(/\s*:\s*Amazon\.com\.br.*/, "")?.trim() ||
    null;

  const priceMatch = 
    html.match(/"priceAmount":"?([\d.]+)"?/)?.[1] ||
    html.match(/class="a-price-whole">([^<]+)<\/span>/)?.[1]?.replace(/\D/g, "") ||
    html.match(/"price":"R\$\s*([\d.,]+)"/)?.[1];

  const image =
    html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/)?.[1] ||
    html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ||
    html.match(/id="landingImage"[^>]*src="([^"]+)"/)?.[1] ||
    html.match(/"hiRes":"(https:\/\/[^"]+)"/)?.[1] ||
    null;

  const description =
    html.match(/<meta name="description" content="([^"]+)"/)?.[1] ||
    null;

  const formattedPrice = priceMatch
    ? parseFloat(priceMatch.replace(",", ".")).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  return {
    name: name?.substring(0, 200) ?? "Nome do produto",
    price: formattedPrice,
    image,
    description: description?.substring(0, 400) ?? null,
    url,
    source: "amazon",
  };
}

// ─── MERCADO LIVRE ────────────────────────────────────────────────────────────
async function scrapeMercadoLivre(url: string) {
  const mlbId = url.match(/MLB-?(\d+)/i)?.[0]?.replace("-", "") ||
                url.match(/\/p\/(MLB\d+)/i)?.[1] ||
                null;

  if (mlbId) {
    const apiUrl = `https://api.mercadolibre.com/items/${mlbId.toUpperCase()}`;
    const res = await fetch(apiUrl, {
      headers: { "Accept": "application/json" },
    });

    if (res.ok) {
      const item = await res.json();
      const name = item.title ?? "Nome do produto";
      const price = item.price
        ? item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : null;
      const image = item.thumbnail?.replace("I.jpg", "O.jpg") ?? null;
      return { name, price, image, description: null, url, source: "mercadolivre" };
    }
  }

  return await scrapeMetaTags(url);
}

// ─── HOTMART ─────────────────────────────────────────────────────────────────
async function scrapeHotmart(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
      "Accept": "text/html",
    },
  });
  const html = await res.text();

  const name =
    html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ||
    html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ||
    null;

  const image =
    html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ||
    null;

  const priceMatch =
    html.match(/R\$\s*([\d.,]+)/)?.[1] ||
    html.match(/"price"\s*:\s*"?([\d.,]+)"?/)?.[1];

  const description =
    html.match(/<meta name="description" content="([^"]+)"/)?.[1] ||
    null;

  const formattedPrice = priceMatch
    ? parseFloat(priceMatch.replace(/\./g, "").replace(",", ".")).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  return {
    name: name?.substring(0, 200) ?? "Nome do produto",
    price: formattedPrice,
    image,
    description: description?.substring(0, 400) ?? null,
    url,
    source: "hotmart",
  };
}

// ─── KIWIFY ───────────────────────────────────────────────────────────────────
async function scrapeKiwify(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
      "Accept": "text/html",
    },
  });
  const html = await res.text();

  const name =
    html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ||
    html.match(/"productName"\s*:\s*"([^"]+)"/)?.[1] ||
    html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ||
    null;

  const image =
    html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ||
    html.match(/"coverImage"\s*:\s*"([^"]+)"/)?.[1] ||
    null;

  const priceMatch =
    html.match(/"price"\s*:\s*([\d.]+)/)?.[1] ||
    html.match(/R\$\s*([\d.,]+)/)?.[1];

  const formattedPrice = priceMatch
    ? parseFloat(priceMatch.replace(/\./g, "").replace(",", ".")).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  return {
    name: name?.substring(0, 200) ?? "Nome do produto",
    price: formattedPrice,
    image,
    description: null,
    url,
    source: "kiwify",
  };
}

// ─── FALLBACK GENÉRICO (meta tags OG) ────────────────────────────────────────
async function scrapeMetaTags(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });
    const html = await res.text();

    const name =
      html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ||
      html.match(/<meta name="title" content="([^"]+)"/)?.[1] ||
      html.match(/<title>([^|–\-<]+)/)?.[1]?.trim() ||
      "Nome do produto";

    const image =
      html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ||
      html.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1] ||
      null;

    const priceRaw =
      html.match(/<meta property="product:price:amount" content="([^"]+)"/)?.[1] ||
      html.match(/R\$\s*([\d.,]+)/)?.[1] ||
      null;

    const price = priceRaw
      ? parseFloat(priceRaw.replace(/\./g, "").replace(",", ".")).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

    const description =
      html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ||
      html.match(/<meta name="description" content="([^"]+)"/)?.[1] ||
      null;

    return {
      name: name.substring(0, 200),
      price,
      image,
      description: description?.substring(0, 400) ?? null,
      url,
      source: new URL(url).hostname,
    };
  } catch (e) {
    return {
      name: "Nome do produto",
      price: null,
      image: null,
      description: null,
      url,
      source: new URL(url).hostname,
    };
  }
}
