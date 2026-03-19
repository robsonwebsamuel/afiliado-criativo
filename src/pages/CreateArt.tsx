import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockExtractedProduct, templates, captionVariants, currentUser, planLimits } from "@/lib/mock-data";
import { Link2, Sparkles, Copy, RefreshCw, Download, Check, Loader2, Pencil, ArrowLeft, ArrowRight, Scissors, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ToneType = 'seria' | 'profissional' | 'descontrada' | 'engracada';
type Step = 'link' | 'template' | 'caption' | 'shorten' | 'download';

const CreateArt = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('link');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'feed' | 'stories'>('feed');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0].id);
  const [tone, setTone] = useState<ToneType>('profissional');
  const [caption, setCaption] = useState('');
  const [editingCaption, setEditingCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Sub-steps form data
  const [titulo, setTitulo] = useState(mockExtractedProduct.title);
  const [descricao, setDescricao] = useState(mockExtractedProduct.description);
  const [valor, setValor] = useState(mockExtractedProduct.price);
  const [cta, setCta] = useState('Acesse agora e aproveite!');
  const [rodape, setRodape] = useState('Link na bio • Compartilhe!');
  const [shortLink, setShortLink] = useState('');

  const limit = planLimits[currentUser.plan];
  const stepOrder: Step[] = ['link', 'template', 'caption', 'shorten', 'download'];
  const stepIndex = stepOrder.indexOf(currentStep);

  const handleNext = () => {
    if (currentStep === 'link' && !link.trim()) {
      toast({ title: "Link inválido", description: "Cole um link do produto.", variant: "destructive" });
      return;
    }
    if (currentStep === 'link') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep('template');
      }, 1000);
      return;
    }
    if (currentStep === 'template' && !selectedTemplateId) {
      toast({ title: "Escolha um template", variant: "destructive" });
      return;
    }
    if (currentStep === 'template') {
      setCaption(captionVariants[tone]);
      setCurrentStep('caption');
      return;
    }
    if (currentStep === 'caption') {
      setCurrentStep('shorten');
      return;
    }
    if (currentStep === 'shorten') {
      setCurrentStep('download');
      return;
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(stepOrder[stepIndex - 1]);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleShorten = () => {
    setLoading(true);
    setTimeout(() => {
      setShortLink('https://bit.ly/afil-3xJkL');
      setLoading(false);
      toast({ title: "Link encurtado!" });
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Stepper */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-foreground">Criar Nova Arte</h1>
            <p className="text-sm text-muted-foreground">Siga as etapas para gerar seu post pronto</p>
          </div>

          {/* Stepper Visual */}
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
                  {s === 'link' ? 'Link' : s === 'template' ? 'Template' : s === 'caption' ? 'Legenda' : s === 'shorten' ? 'Encurtar' : 'Fim'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Panel Content */}
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
                    <p className="text-sm text-muted-foreground">Cole o link da Shopee, Amazon, ML ou outros marketplaces.</p>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-12 bg-background border border-border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <Button className="w-full" size="lg" onClick={handleNext} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
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
                      <button onClick={() => setFormat('feed')} className={`px-3 py-1 text-xs rounded-md transition-all ${format === 'feed' ? 'bg-primary text-white' : 'text-muted-foreground'}`}>Feed</button>
                      <button onClick={() => setFormat('stories')} className={`px-3 py-1 text-xs rounded-md transition-all ${format === 'stories' ? 'bg-primary text-white' : 'text-muted-foreground'}`}>Stories</button>
                    </div>
                  </div>
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
                        {/* White product area - 80% */}
                        <div className="absolute inset-[6%] top-[10%] bottom-[10%] bg-white rounded-lg flex flex-col items-center justify-center p-2 gap-1" style={{ height: '80%' }}>
                          <img src={mockExtractedProduct.image} alt="" className="w-full flex-1 object-cover rounded" />
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
                  <div className="pt-4 flex justify-between">
                    <Button variant="ghost" onClick={handleBack}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                    <Button onClick={handleNext}>Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {/* Step: Caption */}
              {currentStep === 'caption' && (
                <div className="space-y-5 animate-fade-in flex-1">
                  <h2 className="text-lg font-display font-bold text-foreground">Personalize a Legenda</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">Título</label>
                      <input value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full h-9 bg-background border border-border rounded-lg px-3 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">Preço</label>
                      <input value={valor} onChange={e => setValor(e.target.value)} className="w-full h-9 bg-background border border-border rounded-lg px-3 text-sm" />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs text-muted-foreground uppercase">Tom da IA</label>
                      <div className="flex gap-2">
                        {['Séria', 'Profissional', 'Descontraída', 'Engraçada'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setTone(t.toLowerCase() as ToneType)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                              tone === t.toLowerCase() ? 'bg-primary border-primary text-white' : 'bg-elevated border-transparent text-muted-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">CTA (Botão)</label>
                      <input value={cta} onChange={e => setCta(e.target.value)} className="w-full h-9 bg-background border border-border rounded-lg px-3 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">Rodapé</label>
                      <input value={rodape} onChange={e => setRodape(e.target.value)} className="w-full h-9 bg-background border border-border rounded-lg px-3 text-sm" />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between">
                    <Button variant="ghost" onClick={handleBack}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
                    <Button onClick={handleNext}>Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {/* Step: Shorten */}
              {currentStep === 'shorten' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Scissors className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-2 max-w-sm">
                    <h2 className="text-xl font-display font-bold text-foreground">Encurtar Link</h2>
                    <p className="text-sm text-muted-foreground">O link original será substituído por um reduzido na legenda.</p>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <div className="p-3 bg-elevated rounded-lg border border-border/50 text-xs text-muted-foreground truncate font-mono">
                      {link}
                    </div>
                    {shortLink ? (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 text-sm text-primary font-bold font-mono flex items-center justify-between">
                        {shortLink}
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <Button className="w-full" variant="outline" size="lg" onClick={handleShorten} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Encurtar Agora
                      </Button>
                    )}
                    <Button className="w-full" size="lg" onClick={handleNext}>Continuar</Button>
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
                    <Button size="lg" className="w-full" onClick={() => toast({ title: "Arte baixada!" })}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => {
                        navigator.clipboard.writeText(caption);
                        toast({ title: "Legenda copiada!" });
                      }}>
                      <Copy className="w-4 h-4 mr-2" /> Legenda
                    </Button>
                    <Button size="lg" variant="outline" className="w-full col-span-2" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('link')}>
                    <RefreshCw className="w-3 h-3 mr-2" /> Criar Outra
                  </Button>
                </div>
              )}

            </div>
          </div>

          {/* Right Panel Preview (Visual) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pré-visualização</h3>
            
            {/* Template Preview */}
            <div className={`rounded-2xl border border-border/50 overflow-hidden shadow-2xl relative ${format === 'stories' ? 'aspect-[9/16]' : 'aspect-square'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedTemplate.preview}`} />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white opacity-70">Oferta Especial</span>
                <h3 className="text-xl font-display font-black text-white leading-tight uppercase tracking-tighter shadow-sm">{titulo}</h3>
                <div className="bg-white/95 text-black px-4 py-2 rounded-xl">
                  <span className="text-2xl font-black font-mono">{valor}</span>
                </div>
                <div className="mt-4 px-6 py-2 border-2 border-white/50 rounded-full">
                  <span className="text-xs font-bold text-white uppercase">{cta}</span>
                </div>
              </div>
              {/* Logo placeholder if not pro/standard */}
              {currentUser.plan !== 'free' && (
                <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white">LOGO</div>
              )}
            </div>

            {/* Caption Preview */}
            {currentStep !== 'link' && currentStep !== 'template' && (
              <div className="rounded-xl bg-surface border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Legenda</span>
                  <span className="text-[10px] font-bold text-primary uppercase">{tone}</span>
                </div>
                <div className="text-[11px] text-foreground leading-relaxed whitespace-pre-line font-medium opacity-90">
                  {caption || 'Aguardando geração...'}
                </div>
                {rodape && <div className="text-[10px] text-muted-foreground border-t border-border/30 pt-2">{rodape}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateArt;
