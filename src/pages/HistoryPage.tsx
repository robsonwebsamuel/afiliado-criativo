import { AppLayout } from "@/components/AppLayout";
import { artHistory } from "@/lib/mock-data";
import { Download, Trash2, Sparkles, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
  const [arts, setArts] = useState(artHistory);
  const [formatFilter, setFormatFilter] = useState<'all' | 'feed' | 'stories'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered = arts.filter(a => formatFilter === 'all' || a.format === formatFilter);

  const handleDelete = (id: string) => {
    setArts(prev => prev.filter(a => a.id !== id));
    toast({ title: "Arte excluída do histórico." });
  };

  if (arts.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border/50 flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h2 className="text-lg font-display font-bold text-foreground">Nenhuma arte criada ainda</h2>
          <p className="text-sm text-muted-foreground">Que tal começar agora?</p>
          <Button onClick={() => navigate('/criar')}>
            <Sparkles className="w-4 h-4" />
            Criar Arte
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-foreground">Histórico</h1>
            <p className="text-sm text-muted-foreground">{arts.length} artes criadas</p>
          </div>
          <div className="flex gap-1.5">
            {(['all', 'feed', 'stories'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`px-3 h-8 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  formatFilter === f ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((art, i) => (
            <div
              key={art.id}
              className="group rounded-xl bg-surface border border-border/50 overflow-hidden transition-all duration-200 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="aspect-square relative"
                style={{
                  background: `linear-gradient(135deg, ${art.colors[0]}, ${art.colors[1]})`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-xs uppercase tracking-widest text-foreground/60 mb-2">Oferta</span>
                  <h3 className="text-lg font-display font-bold text-foreground leading-tight">{art.productName}</h3>
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Download iniciado!" })}>
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(art.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-sm font-medium text-foreground truncate">{art.productName}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{art.templateName}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{art.createdAt}</span>
                </div>
                <span className="inline-block text-xs text-muted-foreground uppercase bg-elevated px-2 py-0.5 rounded">
                  {art.format}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
