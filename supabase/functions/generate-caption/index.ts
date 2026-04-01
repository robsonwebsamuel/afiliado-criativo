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
    const { title, price, link, style } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: "Missing title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stylePrompts: Record<string, string> = {
      vendas: `Crie uma legenda de vendas direta e persuasiva para Instagram para o produto "${title}" ${price ? `que custa ${price}` : ""}. Inclua CTA e o link: ${link}. Máx 300 caracteres. Use emojis relevantes.`,
      curiosidade: `Crie uma legenda que desperta curiosidade sobre o produto "${title}". Não revele tudo, termine com uma pergunta instigante e o link: ${link}. Máx 300 caracteres. Use emojis.`,
      urgencia: `Crie uma legenda com urgência e escassez para o produto "${title}" ${price ? `por ${price}` : ""}. Use gatilhos como "últimas unidades" ou "oferta por tempo limitado" e inclua: ${link}. Máx 300 caracteres.`,
      beneficios: `Liste 3 principais benefícios do produto "${title}" em formato de legenda para Instagram. Inclua emoji em cada item e finalize com o link: ${link}. Máx 300 caracteres.`,
      storytelling: `Crie uma legenda em formato de mini-história pessoal sobre como o produto "${title}" pode transformar a vida do cliente. Termine com o link: ${link}. Máx 300 caracteres. Use emojis.`,
    };

    const prompt = stylePrompts[style] || stylePrompts.vendas;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Você é um copywriter especialista em marketing de afiliados para redes sociais. Crie legendas curtas, envolventes e com alto potencial de conversão. Responda APENAS com a legenda, sem explicações.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro ao gerar legenda" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const caption = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ caption }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-caption error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
