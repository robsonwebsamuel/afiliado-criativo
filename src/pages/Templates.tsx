import { AppLayout } from "@/components/AppLayout";
import { templates, currentUser } from "@/lib/mock-data";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const categories = ['Todos', 'geral', 'eletrônicos', 'moda', 'beleza', 'cursos', 'saúde', 'casa'];
const formats = ['Todos', 'feed', 'stories'];

const Templates = () => {
  const [catFilter, setCatFilter] = useState('Todos');
  const [fmtFilter, setFmtFilter] = useState('Todos');
  const navigate = useNavigate();

  const planOrder = { free: 0, standard: 1, pro: 2 };
  const userLevel = planOrder[currentUser.plan];

  const filtered = templates.filter(t => {
    const catMatch = catFilter === 'Todos' || t.categories.includes(catFilter);
    const fmtMatch = fmtFilter === 'Todos' || t.format.includes(fmtFilter as 'feed' | 'stories');
    return catMatch && fmtMatch;
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground">Escolha um template para criar sua arte.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1.5 flex-wrap">
            {formats.map(f => (
              <button
                key={f}
                onClick={() => setFmtFilter(f)}
                className={`px-3 h-8 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  fmtFilter === f ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 h-8 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  catFilter === c ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t, i) => {
            const locked = userLevel < planOrder[t.minPlan];
            return (
              <div
                key={t.id}
                className="group relative rounded-xl overflow-hidden border border-border/50 transition-all duration-200 hover:border-primary/50 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`aspect-square bg-gradient-to-br ${t.preview} relative`}>
                  {locked && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Plano {t.minPlan}
                      </span>
                    </div>
                  )}
                  {!locked && (
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="sm" onClick={() => navigate('/criar')}>
                        Usar Template
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-surface">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {t.format.map(f => (
                      <span key={f} className="text-xs text-muted-foreground uppercase">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Templates;
