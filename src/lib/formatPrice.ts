/**
 * Formata um valor numérico ou string para o padrão monetário brasileiro.
 */
export function formatPrice(raw: string | null | undefined): string {
  if (!raw) return "";

  const cleaned = raw.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return raw;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized: string;

  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    normalized = cleaned.replace(",", ".");
  } else {
    normalized = cleaned;
  }

  const number = parseFloat(normalized);
  if (isNaN(number)) return raw;

  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
