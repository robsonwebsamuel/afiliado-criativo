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
      // We will no longer indiscriminately throw on data.error if we have a valid name extracted via fallback

      const extractedName = data?.name && data.name !== "Nome do produto" && data.name !== "Produto sem nome" ? data.name : null;

      const isCompleteFailure = !extractedName;
      const isPartialSuccess = extractedName && (!data?.price || !data?.image);

      if (isCompleteFailure && data?.error) {
         throw new Error(data.error);
      }

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
        name: extractedName || "Nome do produto",
        image: data?.image || null,
        description: data?.description || null,
        price: data?.price || null,
        url: data?.url || url,
        shortUrl,
      };

      setProduct(productData);

      if (isCompleteFailure) {
        throw new Error("Falha completa no scraping");
      } else if (isPartialSuccess) {
        const missing: string[] = [];
        if (!productData.price) missing.push("preço");
        if (!productData.image) missing.push("imagem");
        
        setWarning(
          `Não foi possível buscar automaticamente: ${missing.join(", ")}. Por favor, preencha manualmente.`
        );
        // Avoid throwing error, it's a partial success
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
        name: "Nome do produto",
        image: null,
        description: null,
        price: null,
        url: url,
      };
      setProduct(fallbackData);
      return fallbackData; // Let the CreateArt component handle it
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, error, warning, fetchProduct, setProduct };
}
