import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockExtractedProduct } from "@/lib/mock-data";
import { Link2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const InsertLink = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(false);

  const handleExtract = () => {
    if (!link.trim()) {
      toast({ title: "Cole um link válido.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setExtracted(true);
      toast({ title: "Dados extraídos com sucesso!" });
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Inserir Link</h1>
          <p className="text-sm text-muted-foreground">Extraia dados de qualquer produto afiliado.</p>
        </div>

        <div className="rounded-xl bg-surface border border-border/50 p-6 space-y-4">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://hotmart.com/produto/..."
              className="w-full h-12 bg-background border border-border rounded-lg pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <Button onClick={handleExtract} className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Buscando informações…</>
            ) : (
              <><Sparkles className="w-4 h-4" />Extrair Informações</>
            )}
          </Button>
        </div>

        {extracted && (
          <div className="rounded-xl bg-surface border border-border/50 p-6 space-y-4 animate-fade-in">
            <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Dados Extraídos</h3>
            <div className="space-y-3">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-sm text-foreground font-medium">Imagem do Produto</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{mockExtractedProduct.title}</p>
                <p className="text-xs text-muted-foreground">{mockExtractedProduct.description}</p>
                <p className="text-lg font-display font-bold text-primary tabular-nums">{mockExtractedProduct.price}</p>
              </div>
            </div>
            <Button onClick={() => navigate('/criar')} className="w-full">
              Usar na Arte
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InsertLink;
