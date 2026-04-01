import { useDownloadArt } from "@/hooks/useDownloadArt";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface DownloadArtButtonProps {
  productName?: string;
  price?: string | null;
  elementId?: string;
  className?: string;
}

export function DownloadArtButton({
  productName,
  price,
  elementId = "template-preview",
  className,
}: DownloadArtButtonProps) {
  const { download, downloading, error, success } = useDownloadArt({
    elementId,
    productName,
    price,
  });

  return (
    <div className={className}>
      <Button
        size="lg"
        className="w-full"
        onClick={download}
        disabled={downloading}
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando arte...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Download concluído!
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Baixar Arte (1080×1920)
          </>
        )}
      </Button>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-2">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      <p className="text-[10px] text-muted-foreground text-center mt-1">
        PNG em alta resolução · Formato Story 9:16
      </p>
    </div>
  );
}
