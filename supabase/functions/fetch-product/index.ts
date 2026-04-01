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
    if (!url) {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const getMeta = (name: string) =>
      doc?.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
      doc?.querySelector(`meta[name='${name}']`)?.getAttribute("content") ||
      "";

    const title =
      getMeta("og:title") ||
      doc?.querySelector("title")?.textContent ||
      "Produto";

    const image = getMeta("og:image") || getMeta("twitter:image") || "";

    const description = getMeta("og:description") || getMeta("description") || "";

    // Try to extract price patterns (R$ X.XXX,XX or R$ X,XX)
    const priceMatch = html.match(/R\$\s*[\d.,]+/);
    const price = priceMatch ? priceMatch[0].trim() : "";

    return new Response(
      JSON.stringify({ title, image, description, price, url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
