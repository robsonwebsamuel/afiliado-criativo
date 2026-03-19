import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { currentUser } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Globe, Copy, Check, Upload, ExternalLink, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SitePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isPro = currentUser.plan === 'pro';
  const [copied, setCopied] = useState(false);
  const [storeName, setStoreName] = useState('Minha Loja de Afiliados');
  const [storeDesc, setStoreDesc] = useState('Os melhores produtos com os melhores preços!');
  const [themeColor, setThemeColor] = useState('#7c3aed');

  const siteUrl = `https://afiliado.app/${currentUser.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isPro) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto mt-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Recurso Exclusivo Pro</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            O Site com Produtos é exclusivo do Plano Pro. Crie sua vitrine pública e compartilhe todos os seus 
            produtos afiliados em um só lugar.
          </p>
          <Button size="lg" onClick={() => navigate('/conta')}>
            Fazer Upgrade para Pro
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Meu Site</h1>
          <p className="text-sm text-muted-foreground">Configure sua vitrine pública de produtos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Config */}
          <div className="space-y-5">
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-4">
              <h2 className="text-sm font-medium text-foreground">Configurações da Loja</h2>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Nome da Loja</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Descrição</label>
                <textarea
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Cor do Tema</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-sm text-muted-foreground font-mono">{themeColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Logo / Banner</label>
                <button className="w-full h-24 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Clique para fazer upload</span>
                </button>
              </div>

              <Button className="w-full">Salvar Configurações</Button>
            </div>

            {/* Site URL */}
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground">Link do seu Site</h2>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-elevated rounded-lg px-3 h-10 flex items-center text-sm text-muted-foreground font-mono truncate">
                  {siteUrl}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Pré-visualização</h2>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              {/* Mock browser bar */}
              <div className="bg-elevated px-4 py-2 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 bg-background rounded px-2 py-0.5 text-xs text-muted-foreground truncate">
                  {siteUrl}
                </div>
              </div>
              {/* Site preview */}
              <div className="bg-background min-h-64 p-6 space-y-4">
                <div
                  className="rounded-lg p-4 text-white text-center"
                  style={{ backgroundColor: themeColor }}
                >
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-sm">{storeName}</p>
                  <p className="text-xs opacity-80 mt-1">{storeDesc}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-lg bg-elevated/50 h-16 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SitePage;
