import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scissors, Copy, Check, Crown } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ShortenLink = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [shortened, setShortened] = useState('');
  const [history, setHistory] = useState<{ original: string; short: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  if (currentUser.plan !== 'pro') {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <Crown className="w-10 h-10 text-accent" />
          <h2 className="text-xl font-display font-bold text-foreground">Recurso exclusivo Pro</h2>
          <p className="text-sm text-muted-foreground">O encurtador de links está disponível apenas no plano Pro.</p>
          <Button variant="pro" onClick={() => navigate('/planos')}>
            Fazer Upgrade
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleShorten = () => {
    if (!link.trim()) return;
    const short = `https://afc.io/${Math.random().toString(36).substr(2, 6)}`;
    setShortened(short);
    setHistory(prev => [{ original: link, short }, ...prev]);
    setLink('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Encurtar Link</h1>
          <p className="text-sm text-muted-foreground">Encurte seus links de afiliado.</p>
        </div>

        <div className="rounded-xl bg-surface border border-border/50 p-6 space-y-4">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Cole o link longo aqui..."
            className="w-full h-12 bg-background border border-border rounded-lg px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <Button onClick={handleShorten} className="w-full">
            <Scissors className="w-4 h-4" />
            Encurtar
          </Button>
        </div>

        {shortened && (
          <div className="rounded-xl bg-surface border border-border/50 p-5 flex items-center justify-between animate-fade-in">
            <span className="text-sm font-medium text-primary">{shortened}</span>
            <Button variant="outline" size="sm" onClick={() => handleCopy(shortened)}>
              {copied === shortened ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === shortened ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Histórico</h3>
            {history.map((h, i) => (
              <div key={i} className="rounded-xl bg-surface border border-border/50 p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-xs text-muted-foreground truncate">{h.original}</p>
                  <p className="text-sm text-primary font-medium">{h.short}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(h.short)}>
                  {copied === h.short ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            ))}
          </div>
        )}

        {history.length === 0 && !shortened && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum link encurtado ainda.
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ShortenLink;
