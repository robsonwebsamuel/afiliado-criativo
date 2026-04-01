import { toPng } from "html-to-image";

interface DownloadOptions {
  elementId?: string;
  filename?: string;
  productName?: string;
  price?: string | null;
}

export async function downloadArt({
  elementId = "template-preview",
  filename,
  productName,
}: DownloadOptions = {}): Promise<void> {
  const node = document.getElementById(elementId);

  if (!node) {
    throw new Error(
      `Elemento com id="${elementId}" não encontrado. Certifique-se que o template está visível na tela.`
    );
  }

  // Wait for all images to load
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );

  const safeName = productName
    ? productName.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, "").trim().replace(/\s+/g, "-").toLowerCase()
    : "arte";
  const timestamp = new Date().toISOString().slice(0, 10);
  const finalFilename = filename ?? `${safeName}-${timestamp}.png`;

  const { offsetWidth: previewW, offsetHeight: previewH } = node;
  const scaleX = 1080 / previewW;
  const scaleY = 1920 / previewH;
  const scale = Math.min(scaleX, scaleY);

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: scale,
      width: previewW,
      height: previewH,
      style: {
        borderRadius: "0",
        boxShadow: "none",
      },
      filter: (domNode) => {
        if (domNode instanceof HTMLElement) {
          return !domNode.hasAttribute("data-no-export");
        }
        return true;
      },
    });

    const link = document.createElement("a");
    link.download = finalFilename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao gerar o download da arte:", error);
    throw new Error(
      "Não foi possível gerar o download. Verifique se o template está visível e tente novamente."
    );
  }
}
