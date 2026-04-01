import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Sparkles, Copy, RefreshCw, Download, Check, Loader2, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useProductScraper } from "@/hooks/useProductScraper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { templates } from "@/lib/mock-data";

type Step = 'link' | 'template' | 'caption' | 'download';

const CAPTION_STYLES = [
  { value: "vendas", label: "🔥 Foco em vendas" },
  { value: "curiosidade", label: "🤔 Desperta curiosidade" },
  { value: "urgencia", label: "⚡ Urgência / escassez" },
  { value: "beneficios", label: "✅ Lista de benefícios" },
  { value: "storytelling", label: "📖 Storytelling" },
];

const CreateArt = () => {
  const { product, loading: scraping, fetchProduct } = useProductScraper();
  const [link, setLink] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('link');
  const [format, setFormat] = useState<'feed' | 'stories'>('feed');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0]?.id || null);
  const [captionStyle, setCaptionStyle] = useState("vendas");
  const [caption, setCaption] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable fields populated from scraping
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [cta, setCta] = useState('Acesse agora e aproveite!');
  const [manualImageUrl, setManualImageUrl] = useState('');

  const stepOrder: Step[] = ['link', 'template', 'caption', 'download'];
  const stepIndex = stepOrder.indexOf(currentStep);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const displayImage = manualImageUrl || product?.image || '';

  async function handleFetchProduct() {
    if (!link.trim()) {
      toast.error("Cole o link do produto primeiro.");
      return;
    }
    const data = await fetchProduct(link.trim());
    if (data) {
      setTitulo(data.title);
      setValor(data.price);
      setCurrentStep('template');
    }
  }

  async function handleGenerateCaption() {
    if (!product) return;
    setGeneratingCaption(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          title: titulo || product.title,
          price: valor || product.price,
          link: product.shortUrl || product.url,
          style: captionStyle,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCaption(data.caption || "");
      toast.success("Legenda gerada com IA!");
    } catch (e: any) {
      console.error("Caption error:", e);
      toast.error(e?.message || "Erro ao gerar legenda.");
    } finally {
      setGeneratingCaption(false);
    }
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success("Legenda copiada!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleNext() {
    if (currentStep === 'template') {
      setCurrentStep('caption');
    } else if (currentStep === 'caption') {
      setCurrentStep('download');
    }
  }

  function handleBack() {
    if (stepIndex > 0) {
      setCurrentStep(stepOrder[stepIndex - 1]);
    }
  }

  function handleReset() {
    setCurrentStep('link');
    setLink('');
    setCaption('');
    setTitulo('');
    setValor('');
    setCopied(false);
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Stepper */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-foreground">Criar Nova Arte</h1>
            <p className="text-sm text-muted-foreground">Siga as etapas para gerar seu post pronto</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-elevated -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${(stepIndex / (stepOrder.length - 1)) * 100}%` }}
            />
            {stepOrder.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-elevated text-muted-foreground'
                }`}>
                  {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-medium transition-all ${
                  i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {s === 'link' ? 'Link' : s === 'template' ? 'Template' : s === 'caption' ? 'Legenda' : 'Fim'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Panel */}
          <div className="space-y-6">
            <div className="rounded-xl bg-surface border border-border/50 p-6 min-h-[400px] flex flex-col">

              {/* Step: Link */}
              {currentStep === 'link' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Link2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-2 max-w-sm">
                    <h2 className="text-xl font-display font-bold text-foreground">Link do Produto</h2>
                    <p className="text-sm text-muted-foreground">Cole o link da Shopee, Mercado Livre, Magazine Luiza ou outros.</p>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <Input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFetchProduct()}
                      placeholder="https://..."
                      className="h-12"
                    />
                    <Button className="w-full" size="lg" onClick={handleFetchProduct} disabled={scraping}>
                      {scraping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Buscar Produto
                    </Button>
                  </div>
                </div>
              )}

              {/* Step: Template */}
              {currentStep === 'template' && (
                <div className="space-y-6 animate-fade-in flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-display font-bold text-foreground">Escolha o Estilo</h2>
                    <div className="flex gap-1 bg-elevated p-1 rounded-lg">
                      <button onClick={() => setFormat('feed')} className={`px-3 py-1 text-xs rounded-md transition-all ${format === 'feed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Feed</button>
                      <button onClick={() => setFormat('stories')} className={`px-3 py-1 text-xs rounded-md transition-all ${format === 'stories' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Stories</button>
                    </div>
                  </div>

                  {/* Product info summary */}
                  {product && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4 flex gap-4 items-center">
                        {displayImage && (
                          <img src={displayImage} alt={product.title} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                          {product.price && <p className="text-lg font-bold text-primary">{product.price}</p>}
                          {product.shortUrl && (
                            <p className="text-xs text-muted-foreground truncate">🔗 {product.shortUrl}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {templates.filter(t => t.format.includes(format)).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`aspect-square rounded-xl border-2 transition-all cursor-pointer overflow-hidden relative group ${
                          selectedTemplateId === t.id ? 'border-primary' : 'border-transparent hover:border-border'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${t.preview}`} />
                        <div className="absolute inset-[6%] top-[10%] bottom-[10%] bg-white rounded-lg flex flex-col items-center justify-center p-2 gap-1" style={{ height: '80%' }}>
                          {displayImage ? (
                            <img src={displayImage} alt="" className="w-full flex-1 object-cover rounded" />
                          ) : (
                            <div className="w-full flex-1 bg-muted rounded" />
                          )}
                          <p className="text-[7px] font-bold text-gray-800 text-center leading-tight truncate w-full">{titulo}</p>
                          <span className="text-[8px] font-black text-gray-900">{valor}</span>
                        </div>
                        <div className="absolute bottom-1.5 left-2 right-2 z-10">
                          <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded leading-none">{t.name}</span>
                        </div>
                        {selectedTemplateId === t.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Editable fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">Título</label>
                      <Input value={titulo} onChange={e => setTitulo(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">Preço</label>
                      <Input value={valor} onChange={e => setValor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase">URL da Imagem (opcional, caso não carregue)</label>
                    <Input value={manualImageUrl} onChange={e => setManualImageUrl(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="ghost" onClick={handleBack}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                    <Button onClick={handleNext}>Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {/* Step: Caption */}
              {currentStep === 'caption' && (
                <div className="space-y-5 animate-fade-in flex-1">
                  <h2 className="text-lg font-display font-bold text-foreground">Gerar Legenda com IA</h2>

                  <div className="space-y-3">
                    <label className="text-xs text-muted-foreground uppercase">Estilo da legenda</label>
                    <Select value={captionStyle} onValueChange={setCaptionStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAPTION_STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={handleGenerateCaption} disabled={generatingCaption} className="w-full">
                      {generatingCaption ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Gerar legenda com IA</>
                      )}
                    </Button>
                  </div>

                  {caption && (
                    <div className="relative">
                      <Textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={6}
                        className="pr-10"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={copyCaption}
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <Button variant="ghost" onClick={handleBack}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                    <Button onClick={handleNext} disabled={!caption}>Finalizar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {/* Step: Download */}
              {currentStep === 'download' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                      <Check className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">Arte Pronta!</h2>
                      <p className="text-muted-foreground">Sua arte e legenda foram geradas com sucesso.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <Button size="lg" className="w-full" onClick={() => toast.success("Arte baixada!")}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={copyCaption}>
                      <Copy className="w-4 h-4 mr-2" /> Legenda
                    </Button>
                    <Button size="lg" variant="outline" className="w-full col-span-2" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-3 h-3 mr-2" /> Criar Outra
                  </Button>
                </div>
              )}

            </div>
          </div>

          {/* Right Panel Preview */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pré-visualização</h3>

            <div className={`rounded-2xl border border-border/50 overflow-hidden shadow-2xl relative ${format === 'stories' ? 'aspect-[9/16]' : 'aspect-square'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedTemplate?.preview || 'from-primary to-accent'}`} />
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 h-[10%] flex items-center justify-between px-4 z-10">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">Oferta Especial</span>
              </div>
              {/* Product area */}
              <div className="absolute left-[5%] right-[5%] top-[10%] bg-white rounded-xl flex flex-col items-center justify-center p-4 gap-3 shadow-lg" style={{ height: '80%' }}>
                {product?.image ? (
                  <img src={product.image} alt={titulo} className="w-full flex-1 object-cover rounded-lg" />
                ) : (
                  <div className="w-full flex-1 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    Imagem do Produto
                  </div>
                )}
                <h3 className="text-sm font-display font-black text-gray-900 text-center leading-tight">{titulo || 'Nome do Produto'}</h3>
                <div className="bg-gray-100 px-4 py-1.5 rounded-lg">
                  <span className="text-xl font-black font-mono text-gray-900">{valor || 'R$ --,--'}</span>
                </div>
              </div>
              {/* CTA bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[10%] flex items-center justify-center z-10">
                <div className="px-5 py-1.5 border-2 border-white/50 rounded-full">
                  <span className="text-[10px] font-bold text-white uppercase">{cta}</span>
                </div>
              </div>
            </div>

            {/* Caption preview */}
            {caption && (
              <div className="rounded-xl bg-surface border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Legenda</span>
                  <span className="text-[10px] font-bold text-primary uppercase">{captionStyle}</span>
                </div>
                <div className="text-[11px] text-foreground leading-relaxed whitespace-pre-line font-medium opacity-90">
                  {caption}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateArt;
