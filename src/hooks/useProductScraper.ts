import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductData {
  title: string;
  image: string;
  description: string;
  price: string;
  url: string;
  shortUrl?: string;
}

export function useProductScraper() {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);

  async function fetchProduct(url: string) {
    if (!url) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-product", {
        body: { url },
      });
      if (error) throw error;

      // Shorten link
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
        title: data.title || "Produto",
        image: data.image || "",
        description: data.description || "",
        price: data.price || "",
        url: data.url || url,
        shortUrl,
      };

      setProduct(productData);
      toast.success("Produto carregado com sucesso!");
      return productData;
    } catch (e) {
      console.error("Error fetching product:", e);
      toast.error("Não foi possível carregar o produto. Verifique o link.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, fetchProduct, setProduct };
}
