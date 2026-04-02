import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductData {
  name: string;
  image: string | null;
  description: string | null;
  price: string | null;
  url: string;
  shortUrl?: string;
}

export function useProductScraper() {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function fetchProduct(url: string) {
    if (!url) return;
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "scrape-product",
        { body: { url } }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      // Shorten link (preserved from previous version)
      let shortUrl = url;
      try {
        const { data: shortData } = await supabase.functions.invoke("shorten-link", {
          body: { url },
        });
        if (shortData?.shortUrl) {
          shortUrl = shortData.shortUrl;
        }
      } catch {
        console.warn("Could not shorten link, using original");
      }

      const productData: ProductData = {
        name: data.name || "Nome do produto",
        image: data.image || null,
        description: data.description || null,
        price: data.price || null,
        url: data.url || url,
        shortUrl,
      };

      // Valida campos obrigatórios
      const missing: string[] = [];
      if (!productData.name || productData.name === "Produto sem nome") missing.push("nome");
      if (!productData.price) missing.push("preço");
      if (!productData.image) missing.push("imagem");

      setProduct(productData);

      // Avisa o usuário sobre campos que não foram encontrados
      if (missing.length > 0) {
        setWarning(
          `Não foi possível buscar automaticamente: ${missing.join(", ")}. ` +
          `Por favor, preencha manualmente.`
        );
      } else {
        setWarning(null);
        toast.success("Produto carregado com sucesso!");
      }

      return productData;
    } catch (e: any) {
      console.error("Error fetching product:", e);
      setError(
        "Não foi possível buscar os dados do produto. " +
        "Verifique o link ou preencha os dados manualmente."
      );
      toast.error("Não foi possível carregar os dados automaticamente.");
      
      const fallbackData: ProductData = {
        name: "Produto",
        image: null,
        description: null,
        price: null,
        url: url,
      };
      setProduct(fallbackData);
      return fallbackData;
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, error, warning, fetchProduct, setProduct };
}
