import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { captionVariants, mockExtractedProduct, templates, currentUser } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Copy, Check, Save, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ToneType = 'seria' | 'profissional' | 'descontrada' | 'engracada';

const tones: { key: ToneType; label: string; emoji: string }[] = [
  { key: 'seria', label: 'Séria', emoji: '📢' },
  { key: 'profissional', label: 'Profissional', emoji: '🚀' },
  { key: 'descontrada', label: 'Descontraída', emoji: '🔥' },
  { key: 'engracada', label: 'Engraçada', emoji: '😂' },
];

const CaptionPage = () => {
  const { toast } = useToast();
  const [tone, setTone] = useState<ToneType>('profissional');
  const [titulo, setTitulo] = useState(mockExtractedProduct.title);
  const [descricao, setDescricao] = useState(mockExtractedProduct.description);
  const [valor, setValor] = useState(mockExtractedProduct.price);
  const [cta, setCta] = useState('Acesse agora e aproveite!');
  const [rodape, setRodape] = useState('Link na bio • Compartilhe com amigos!');
  const [caption, setCaption] = useState(captionVariants['profissional']);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  const handleGenerate = () => {
    setCaption(captionVariants[tone]);
    toast({ title: "Legenda gerada!", description: `Tom: ${tones.find(t => t.key === tone)?.label}` });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast({ title: "Legenda copiada!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveModel = () => {
    toast({ title: "Modelo salvo com sucesso!" });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Gerar Legenda</h1>
          <p className="text-sm text-muted-foreground">Configure sua legenda e veja o resultado em tempo real</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: Form */}
          <div className="space-y-5">
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-4">
              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Título</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Breve Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Valor + CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">Valor</label>
                  <input
                    type="text"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">CTA</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Tom */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Tom</label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTone(t.key)}
                      className={`h-10 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        tone === t.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-elevated text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rodapé */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Texto do Rodapé</label>
                <input
                  type="text"
                  value={rodape}
                  onChange={(e) => setRodape(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4" />
                Gerar Legenda
              </Button>
              <Button variant="outline" onClick={handleSaveModel}>
                <Save className="w-4 h-4" />
                Salvar Modelo
              </Button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            {/* Arte preview */}
            <div className={`aspect-square rounded-xl bg-gradient-to-br ${selectedTemplate.preview} relative flex flex-col items-center justify-center p-6 text-center overflow-hidden`}>
              <div className="absolute inset-0 bg-background/20" />
              <div className="relative z-10 space-y-3 max-w-xs">
                <span className="text-xs font-medium uppercase tracking-widest text-foreground/70">Oferta Especial</span>
                <h2 className="text-lg font-display font-bold text-foreground leading-tight">{titulo}</h2>
                <p className="text-2xl font-display font-extrabold text-foreground">{valor}</p>
                <div className="inline-block bg-foreground/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-xs font-medium text-foreground">{cta} →</span>
                </div>
              </div>
            </div>

            {/* Caption preview */}
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Legenda Gerada</h3>
                <span className="text-xs text-muted-foreground capitalize">
                  {tones.find(t => t.key === tone)?.emoji} {tones.find(t => t.key === tone)?.label}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{caption}</p>
              <div className="pt-1 border-t border-border/30">
                <p className="text-xs text-muted-foreground">{rodape}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado!' : 'Copiar Legenda'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CaptionPage;
