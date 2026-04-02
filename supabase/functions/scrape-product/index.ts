import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) return new Response(JSON.stringify({ error: "Missing url" }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    };

    const res = await fetch(url, { headers: fetchHeaders, redirect: "follow" });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) throw new Error("Falha ao parsear HTML");

    // ─── HELPERS ────────────────────────────────────────────────

    function getMeta(names: string[]): string | null {
      for (const name of names) {
        const el = doc!.querySelector(name);
        const val =
          el?.getAttribute("content") ||
          el?.getAttribute("value") ||
          el?.textContent?.trim();
        if (val && val.length > 1) return val.trim();
      }
      return null;
    }

    function getFirstMatch(selectors: string[]): string | null {
      for (const sel of selectors) {
        try {
          const el = doc!.querySelector(sel);
          const val = el?.textContent?.trim() || el?.getAttribute("content");
          if (val && val.length > 1) return val.trim();
        } catch {}
      }
      return null;
    }

    function getFirstImageMatch(selectors: string[]): string | null {
      for (const sel of selectors) {
        try {
          const el = doc!.querySelector(sel);
          const src =
            el?.getAttribute("src") ||
            el?.getAttribute("data-src") ||
            el?.getAttribute("data-lazy-src") ||
            el?.getAttribute("data-original");
          if (src && (src.startsWith("http") || src.startsWith("//"))) {
            return src.startsWith("//") ? `https:${src}` : src;
          }
        } catch {}
      }
      return null;
    }

    function extractPrice(raw: string | null): string | null {
      if (!raw) return null;
      const cleaned = raw.replace(/[^\d.,]/g, "").trim();
      if (!cleaned) return null;
      // Normaliza para float
      let normalized = cleaned;
      if (cleaned.includes(",") && cleaned.includes(".")) {
        normalized = cleaned.replace(/\./g, "").replace(",", ".");
      } else if (cleaned.includes(",") && !cleaned.includes(".")) {
        normalized = cleaned.replace(",", ".");
      }
      const num = parseFloat(normalized);
      if (isNaN(num) || num <= 0) return null;
      return num.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // ─── NOME DO PRODUTO ────────────────────────────────────────

    const name =
      getMeta([
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        'meta[itemprop="name"]',
        'meta[name="title"]',
      ]) ||
      getFirstMatch([
        // Amazon
        "#productTitle",
        "#title",
        // Shopee
        "._44qnta",
        ".product-briefing .name",
        "[class*='product-name']",
        "[class*='productName']",
        // Mercado Livre
        ".ui-pdp-title",
        "h1.ui-pdp-title",
        // Hotmart
        ".hotmart-product-title",
        "[data-testid='product-name']",
        // Kiwify / Monetizze
        ".product-title",
        ".checkout-product-name",
        // Genérico
        "h1",
        '[class*="title"]',
        '[class*="produto"]',
        '[itemprop="name"]',
      ]) ||
      "Produto sem nome";

    // ─── PREÇO DO PRODUTO ────────────────────────────────────────

    const rawPrice =
      getMeta([
        'meta[property="product:price:amount"]',
        'meta[name="twitter:data1"]',
        'meta[itemprop="price"]',
        'meta[property="og:price:amount"]',
      ]) ||
      getFirstMatch([
        // Amazon
        ".a-price-whole",
        "#priceblock_ourprice",
        "#priceblock_dealprice",
        ".a-offscreen",
        '[data-a-color="price"] .a-offscreen',
        // Shopee
        "._3n5NQx",
        "._1MSEZF",
        "[class*='price-current']",
        "[class*='finalPrice']",
        "[class*='sale-price']",
        // Mercado Livre
        ".andes-money-amount__fraction",
        ".ui-pdp-price__second-line .andes-money-amount",
        ".price-tag-fraction",
        // Hotmart
        ".price-tag",
        "[class*='price']",
        // Kiwify / Monetizze
        ".checkout-price",
        "[class*='checkout-amount']",
        // Genérico
        '[itemprop="price"]',
        '[class*="preco"]',
        '[class*="price"]',
        '[class*="valor"]',
        '[id*="price"]',
        '[id*="preco"]',
      ]);

    const price = extractPrice(rawPrice);

    // ─── IMAGEM DO PRODUTO ────────────────────────────────────────

    const image =
      getMeta([
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[name="twitter:image:src"]',
        'meta[itemprop="image"]',
        'meta[property="og:image:secure_url"]',
      ]) ||
      getFirstImageMatch([
        // Amazon
        "#landingImage",
        "#imgBlkFront",
        "#main-image",
        ".a-dynamic-image",
        // Shopee
        "._3koKs3 img",
        "[class*='product-image'] img",
        // Mercado Livre
        ".ui-pdp-gallery__figure img",
        ".item-gallery__figure img",
        // Hotmart / Kiwify
        ".product-cover img",
        ".product-image img",
        "[class*='cover'] img",
        // Genérico
        '[itemprop="image"]',
        "article img",
        "main img",
        ".product img",
        "img[class*='product']",
        "img[class*='main']",
        "img[class*='principal']",
      ]);

    // ─── DESCRIÇÃO (bônus) ────────────────────────────────────────

    const description =
      getMeta([
        'meta[property="og:description"]',
        'meta[name="description"]',
        'meta[name="twitter:description"]',
      ]) ||
      getFirstMatch([
        '[itemprop="description"]',
        ".product-description",
        "#product-description",
        "[class*='description']",
      ]);

    // ─── RESPOSTA ─────────────────────────────────────────────────

    const result = {
      name: name.substring(0, 200),
      price,
      image,
      description: description?.substring(0, 400) ?? null,
      url,
      source: new URL(url).hostname,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message ?? "Erro desconhecido", url }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
