import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { captionVariants } from "@/lib/mock-data";
import { Copy, RefreshCw, Check, Pencil, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ToneType = 'seria' | 'profissional' | 'descontrada' | 'engracada';

const CaptionPage = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [tone, setTone] = useState<ToneType>('profissional');
  const [caption, setCaption] = useState('');
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!title.trim()) {
      toast({ title: "Preencha o título do produto.", variant: "destructive" });
      return;
    }
    setCaption(captionVariants[tone].replace('Curso Completo de Marketing Digital 2026', title || 'Produto').replace('R$ 197,90', price || 'consulte'));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast({ title: "Legenda copiada!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Gerar Legenda</h1>
          <p className="text-sm text-muted-foreground">Crie legendas de alto impacto para seus produtos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-4">
              <InputField label="Título do Produto" value={title} onChange={setTitle} placeholder="Ex: Curso de Marketing Digital" />
              <InputField label="Descrição (opcional)" value={description} onChange={setDescription} placeholder="Breve descrição..." />
              <InputField label="Valor" value={price} onChange={setPrice} placeholder="R$ 97,00" />
            </div>

            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Tom</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['seria', 'profissional', 'descontrada', 'engracada'] as ToneType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`h-9 rounded-lg text-xs font-medium transition-all duration-200 ${
                      tone === t ? 'bg-primary text-primary-foreground' : 'bg-elevated text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t === 'seria' ? '📢 Séria' : t === 'profissional' ? '🚀 Profissional' : t === 'descontrada' ? '🔥 Descontraída' : '😂 Engraçada'}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full" size="lg">
              <Sparkles className="w-4 h-4" />
              Gerar Legenda
            </Button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            {caption ? (
              <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-4 animate-fade-in">
                <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Legenda Gerada</h3>
                {editing ? (
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={8}
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    onBlur={() => setEditing(false)}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{caption}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCw className="w-3 h-3" />
                    Regenerar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-surface border border-border/50 h-64 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Sua legenda aparecerá aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  );
}

export default CaptionPage;
