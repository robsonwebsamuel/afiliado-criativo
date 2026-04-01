import { useState, useCallback } from "react";
import { downloadArt } from "@/lib/downloadArt";

interface UseDownloadArtOptions {
  elementId?: string;
  productName?: string;
  price?: string | null;
}

export function useDownloadArt({
  elementId = "template-preview",
  productName,
  price,
}: UseDownloadArtOptions = {}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const download = useCallback(async () => {
    setDownloading(true);
    setError(null);
    setSuccess(false);

    try {
      await downloadArt({ elementId, productName, price });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Erro ao baixar a arte.");
    } finally {
      setDownloading(false);
    }
  }, [elementId, productName, price]);

  return { download, downloading, error, success };
}
