import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Sparkles, Copy, RefreshCw, Check, Loader2, ArrowLeft, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";
import { useProductScraper } from "@/hooks/useProductScraper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { templates } from "@/lib/mock-data";
import { formatPrice } from "@/lib/formatPrice";
import { DownloadArtButton } from "@/components/DownloadArtButton";

type Step = 'link' | 'template' | 'caption' | 'download';

const CAPTION_STYLES = [
  { value: "vendas", label: "🔥 Foco em vendas" },
  { value: "curiosidade", label: "🤔 Desperta curiosidade" },
  { value: "urgencia", label: "⚡ Urgência / escassez" },
  { value: "beneficios", label: "✅ Lista de benefícios" },
  { value: "storytelling", label: "📖 Storytelling" },
];

const CreateArt = () => {
  const { product, loading: scraping, error: scrapeError, warning, fetchProduct, setProduct } = useProductScraper();
  const [link, setLink] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('link');
  const [format, setFormat] = useState<'feed' | 'stories'>('feed');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0]?.id || null);
  const [captionStyle, setCaptionStyle] = useState("vendas");
  const [caption, setCaption] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastScrapedLink, setLastScrapedLink] = useState('');

  const [cta, setCta] = useState('Acesse agora e aproveite!');

  const stepOrder: Step[] = ['link', 'template', 'caption', 'download'];
  const stepIndex = stepOrder.indexOf(currentStep);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];


  async function handleFetchProduct(urlToFetch?: string) {
    const targetUrl = urlToFetch || link.trim();
    if (!targetUrl) {
      if (!urlToFetch) toast.error("Cole o link do produto primeiro.");
      return;
    }
    
    // Avoid double scraping the same link
    if (targetUrl === lastScrapedLink && product) return;

    const data = await fetchProduct(targetUrl);
    if (data) {
      setLastScrapedLink(targetUrl);
      setCurrentStep('template');
    }
  }

  // Auto-fetch on paste
  useEffect(() => {
    const isProductUrl = (url: string) => {
      const trimmed = url.trim();
      if (trimmed.length < 15) return false;
      return /amazon\.com|shopee\.com|mercadoli[vb]re\.com|magazineluiza\.com|magalu\.com/i.test(trimmed);
    };

    if (link && isProductUrl(link) && link !== lastScrapedLink && !scraping) {
      const timer = setTimeout(() => {
        handleFetchProduct(link);
      }, 700); // 700ms debounce
      return () => clearTimeout(timer);
    }
  }, [link, lastScrapedLink, scraping]);

  async function handleGenerateCaption() {
    if (!product) return;
    setGeneratingCaption(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          title: product.name,
          price: product.price,
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Panel */}
          <div className="space-y-6 min-w-0">
            <div className="rounded-xl bg-surface border border-border/50 p-6 min-h-[400px] flex flex-col overflow-hidden">

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
                    <Button className="w-full" size="lg" onClick={() => handleFetchProduct()} disabled={scraping}>
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

                  {/* Alerta de campos faltando */}
                  {warning && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm animate-fade-in shadow-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  )}

                  {/* Product info summary - Removed old card as we have the editable form now */}

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {templates.filter(t => t.format.includes(format)).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`rounded-xl border-2 transition-all cursor-pointer overflow-hidden relative group ${
                          selectedTemplateId === t.id ? 'border-primary' : 'border-transparent hover:border-border'
                        }`}
                        style={{ aspectRatio: '9/16' }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${t.preview}`} />
                        {/* Top badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="text-[6px] uppercase tracking-widest font-bold text-white/80 bg-black/20 px-1.5 py-0.5 rounded">Oferta</span>
                        </div>
                        {/* Center: product image */}
                        <div className="absolute left-[6%] right-[6%] top-[18%] bottom-[30%] bg-white rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                          {product?.image ? (
                            <img 
                              src={product.image} 
                              alt="" 
                              className="w-full h-full object-contain rounded" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-[8px] text-muted-foreground">Sem imagem</div>
                          )}
                        </div>
                        {/* Bottom: title + price */}
                        <div className="absolute left-[6%] right-[6%] bottom-[6%] flex flex-col items-center gap-0.5 z-10">
                          <p className="text-[6px] font-bold text-white text-center leading-tight line-clamp-2 w-full drop-shadow">{product?.name || '---'}</p>
                          <span className="text-[8px] font-black text-white bg-black/30 px-1.5 py-0.5 rounded drop-shadow">{product?.price || '---'}</span>
                        </div>
                        <div className="absolute bottom-0.5 left-1 z-10">
                          <span className="text-[7px] font-bold text-white/60">{t.name}</span>
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
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome do Produto</label>
                        <Input 
                          placeholder="Nome do produto"
                          value={product?.name ?? ""} 
                          onChange={e => setProduct(prev => prev ? { ...prev, name: e.target.value } : prev)} 
                        />
                      </div>
                      {/* Preço */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preço</label>
                        <Input 
                          placeholder="Ex: 199,90"
                          value={product?.price ?? ""} 
                          onChange={e => setProduct(prev => prev ? { ...prev, price: e.target.value } : prev)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[128px_1fr] gap-4">
                      {/* Imagem Preview & URL */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Imagem</label>
                        <div className="aspect-square w-full bg-elevated rounded-lg border border-border/50 flex items-center justify-center overflow-hidden">
                          {product?.image ? (
                            <img 
                              src={product.image} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-[10px] text-muted-foreground">Sem imagem</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 flex flex-col justify-end">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL da Imagem</label>
                        <Input 
                          placeholder="Cole a URL da imagem manualmente"
                          value={product?.image ?? ""} 
                          onChange={e => setProduct(prev => prev ? { ...prev, image: e.target.value } : prev)} 
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Caso a imagem não carregue, tente copiar o endereço de outra imagem do produto.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => fetchProduct(link)} disabled={scraping}>
                        {scraping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Tentar novamente
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setProduct({ name: "", image: null, price: null, description: null, url: link })}
                      >
                        Preencher manualmente
                      </Button>
                    </div>
                    <div className="flex justify-between border-t border-border/30 pt-4">
                      <Button variant="ghost" onClick={handleBack}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                      <Button onClick={handleNext}>Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </div>
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

                  <div className="flex flex-col gap-4 w-full max-w-sm">
                    <DownloadArtButton
                      productName={product?.name ?? ""}
                      price={product?.price ?? ""}
                      elementId="template-preview"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Button size="lg" variant="outline" className="w-full" onClick={copyCaption}>
                        <Copy className="w-4 h-4 mr-2" /> Legenda
                      </Button>
                      <Button size="lg" variant="outline" className="w-full" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" /> WhatsApp
                      </Button>
                    </div>
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

            <div
              id="template-preview"
              style={{ aspectRatio: '9/16' }}
              className="w-full rounded-2xl border border-border/50 overflow-hidden shadow-2xl relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedTemplate?.preview || 'from-primary to-accent'}`} />
              {/* Topo – 20% */}
              <div className="absolute top-0 left-0 right-0 h-[20%] flex items-center justify-center z-10">
                <span className="bg-white/20 text-white text-sm font-bold px-4 py-1 rounded-full tracking-widest uppercase">
                  Oferta Especial
                </span>
              </div>
              {/* Centro – 50% imagem */}
              <div className="absolute left-[5%] right-[5%] top-[20%] h-[50%] bg-white rounded-xl flex items-center justify-center p-4 shadow-lg">
                {product?.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    crossOrigin="anonymous" 
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded-lg drop-shadow-2xl" 
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm text-center px-4">
                    Cole o link de um produto para ver a imagem aqui
                  </div>
                )}
              </div>
              {/* Rodapé – 30% */}
              <div className="absolute left-[5%] right-[5%] bottom-0 h-[30%] flex flex-col items-center justify-center gap-3 z-10">
                <h3 className="text-base font-montserrat font-normal text-white text-center leading-tight line-clamp-3 drop-shadow-lg px-2">
                  {product?.name || 'Seu Produto'}
                </h3>
                <div className="bg-white rounded-full px-6 py-2 shadow-lg">
                  <span className="text-2xl font-montserrat font-bold text-gray-900">R$ {formatPrice(product?.price ?? "") || '--,--'}</span>
                </div>
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
