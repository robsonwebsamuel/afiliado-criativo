import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockExtractedProduct, templates, captionVariants, currentUser, planLimits } from "@/lib/mock-data";
import { Link2, Sparkles, Copy, RefreshCw, Download, Check, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ToneType = 'seria' | 'profissional' | 'descontrada' | 'engracada';

const CreateArt = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<'input' | 'configure' | 'result'>('input');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'feed' | 'stories'>('feed');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneType>('profissional');
  const [caption, setCaption] = useState('');
  const [editingCaption, setEditingCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const limit = planLimits[currentUser.plan];
  const availableTemplates = templates.filter(t => {
    const planOrder = { free: 0, standard: 1, pro: 2 };
    return planOrder[currentUser.plan] >= planOrder[t.minPlan] && t.format.includes(format);
  });
  const lockedTemplates = templates.filter(t => {
    const planOrder = { free: 0, standard: 1, pro: 2 };
    return planOrder[currentUser.plan] < planOrder[t.minPlan] && t.format.includes(format);
  });

  const handleExtract = () => {
    if (!link.trim()) {
      toast({ title: "Link inválido", description: "Cole um link válido do produto.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('configure');
    }, 1500);
  };

  const handleGenerate = () => {
    if (!selectedTemplate) {
      toast({ title: "Selecione um template", description: "Escolha um template para gerar a arte.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setCaption(captionVariants[tone]);
      setGenerating(false);
      setStep('result');
      toast({ title: "Arte criada com sucesso!", description: "Faça o download abaixo." });
    }, 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast({ title: "Legenda copiada para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const tones: ToneType[] = ['seria', 'profissional', 'descontrada', 'engracada'];
      const newTone = tones.filter(t => t !== tone)[Math.floor(Math.random() * 3)];
      setTone(newTone);
      setCaption(captionVariants[newTone]);
      setGenerating(false);
    }, 1000);
  };

  const handleDownload = () => {
    toast({ title: "Download iniciado", description: "Sua arte está sendo baixada em PNG." });
  };

  const tpl = selectedTemplate ? templates.find(t => t.id === selectedTemplate) : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Criar Nova Arte</h1>
          <p className="text-sm text-muted-foreground">Cole o link, escolha o template e gere em segundos.</p>
        </div>

        {/* Step: Input */}
        {step === 'input' && (
          <div className="max-w-xl mx-auto mt-16 space-y-6 animate-fade-in">
            <div className="rounded-xl bg-surface border border-border/50 p-8 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-display font-bold text-foreground">Cole o link do produto</h2>
                <p className="text-sm text-muted-foreground">Hotmart, Monetizze, Eduzz, Amazon, Shopee...</p>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://hotmart.com/produto/..."
                  className="w-full h-12 bg-background border border-border rounded-lg px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <Button onClick={handleExtract} className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando informações do produto…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extrair Dados
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Configure */}
        {(step === 'configure' || step === 'result') && (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 animate-fade-in">
            {/* Left panel: Config */}
            <div className="space-y-5">
              {/* Extracted data */}
              <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-4">
                <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Dados Extraídos</h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{mockExtractedProduct.title}</p>
                  <p className="text-xs text-muted-foreground">{mockExtractedProduct.description}</p>
                  <p className="text-lg font-display font-bold text-primary tabular-nums">{mockExtractedProduct.price}</p>
                </div>
              </div>

              {/* Format */}
              <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
                <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Formato</h3>
                <div className="flex gap-2">
                  {(['feed', 'stories'] as const).map((f) => {
                    const disabled = !limit.formats.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => !disabled && setFormat(f)}
                        disabled={disabled}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          format === f
                            ? 'bg-primary text-primary-foreground'
                            : disabled
                            ? 'bg-elevated text-muted-foreground/50 cursor-not-allowed'
                            : 'bg-elevated text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {f === 'feed' ? 'Feed 1080×1080' : 'Stories 1080×1920'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Templates */}
              <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
                <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Template</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`aspect-square rounded-lg bg-gradient-to-br ${t.preview} flex items-end p-2 transition-all duration-200 border-2 ${
                        selectedTemplate === t.id ? 'border-primary scale-95' : 'border-transparent hover:scale-95'
                      }`}
                    >
                      <span className="text-xs font-medium text-foreground bg-background/80 px-1.5 py-0.5 rounded">
                        {t.name}
                      </span>
                    </button>
                  ))}
                  {lockedTemplates.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className="aspect-square rounded-lg bg-elevated flex items-center justify-center relative overflow-hidden opacity-50"
                      title={`Disponível no plano ${t.minPlan.charAt(0).toUpperCase() + t.minPlan.slice(1)}`}
                    >
                      <span className="text-xs text-muted-foreground">🔒 {t.minPlan}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
                <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Tom da Legenda</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['seria', 'profissional', 'descontrada', 'engracada'] as ToneType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`h-9 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                        tone === t ? 'bg-primary text-primary-foreground' : 'bg-elevated text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t === 'seria' ? '📢 Séria' : t === 'profissional' ? '🚀 Profissional' : t === 'descontrada' ? '🔥 Descontraída' : '😂 Engraçada'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              {step === 'configure' && (
                <Button onClick={handleGenerate} className="w-full" size="lg" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Arte e Legenda
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Right panel: Preview */}
            <div className="space-y-5">
              {generating ? (
                <div className="rounded-xl bg-surface border border-border/50 overflow-hidden">
                  <div className={`${format === 'stories' ? 'aspect-[9/16]' : 'aspect-square'} max-h-[500px] bg-elevated relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
                        <div className="scan-line h-full w-full" />
                      </div>
                      <div className="text-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Gerando sua arte...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : step === 'result' && tpl ? (
                <>
                  {/* Art preview */}
                  <div className="rounded-xl bg-surface border border-border/50 overflow-hidden">
                    <div className={`${format === 'stories' ? 'aspect-[9/16]' : 'aspect-square'} max-h-[500px] bg-gradient-to-br ${tpl.preview} relative flex flex-col items-center justify-center p-8 text-center`}>
                      <div className="absolute inset-0 bg-background/20" />
                      <div className="relative z-10 space-y-4 max-w-sm">
                        <span className="text-xs font-medium uppercase tracking-widest text-foreground/70">Oferta Especial</span>
                        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                          {mockExtractedProduct.title}
                        </h2>
                        <p className="text-3xl font-display font-extrabold text-foreground">
                          {mockExtractedProduct.price}
                        </p>
                        <div className="inline-block bg-foreground/20 backdrop-blur-sm rounded-lg px-4 py-2">
                          <span className="text-sm font-medium text-foreground">Acesse agora →</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Legenda Gerada</h3>
                      <span className="text-xs text-muted-foreground capitalize">Tom: {tone}</span>
                    </div>
                    {editingCaption ? (
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={6}
                        className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        onBlur={() => setEditingCaption(false)}
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{caption}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={handleCopyCaption}>
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingCaption(true)}>
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generating}>
                        <RefreshCw className="w-3 h-3" />
                        Regenerar
                      </Button>
                    </div>
                  </div>

                  {/* Download */}
                  <Button onClick={handleDownload} className="w-full" size="lg">
                    <Download className="w-4 h-4" />
                    Download PNG
                  </Button>
                </>
              ) : (
                <div className="rounded-xl bg-surface border border-border/50 aspect-square flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">O preview da arte aparecerá aqui</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CreateArt;
