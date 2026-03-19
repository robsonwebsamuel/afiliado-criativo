import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { templates, currentUser, planLimits } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Lock, Palette, Upload, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type FormatFilter = 'todos' | 'feed' | 'stories';

const CATEGORIES = ['Todos', 'Geral', 'Eletrônicos', 'Moda', 'Beleza', 'Saúde', 'Cursos', 'Casa'];

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('todos');
  const [catFilter, setCatFilter] = useState('Todos');
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [secondaryColor, setSecondaryColor] = useState('#2563eb');

  const planOrder: Record<string, number> = { free: 0, standard: 1, pro: 2 };
  const userPlanOrder = planOrder[currentUser.plan];
  const limit = planLimits[currentUser.plan];
  const isPro = currentUser.plan === 'pro';

  const filtered = templates.filter(t => {
    const formatOk = formatFilter === 'todos' || t.format.includes(formatFilter as 'feed' | 'stories');
    const catOk = catFilter === 'Todos' || t.categories.some(c => c.toLowerCase() === catFilter.toLowerCase());
    return formatOk && catOk;
  });

  const handleSelectTemplate = (t: typeof templates[0]) => {
    if (planOrder[t.minPlan] > userPlanOrder) {
      toast({
        title: `Template exclusivo do plano ${t.minPlan}`,
        description: 'Faça upgrade para usar este template.',
        variant: 'destructive',
      });
      return;
    }
    navigate('/criar');
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground">Escolha o template perfeito para sua arte</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Format */}
          <div className="flex items-center gap-1 bg-surface border border-border/50 rounded-lg p-1">
            {(['todos', 'feed', 'stories'] as FormatFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  formatFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'todos' ? 'Todos' : f === 'feed' ? 'Feed' : 'Stories'}
              </button>
            ))}
          </div>

          {/* Category dropdown */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-surface border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} templates</span>
        </div>

        {/* Pro customization */}
        {isPro && (
          <div className="rounded-xl bg-surface border border-primary/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">Customizar Cores (Pro)</h2>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium">Exclusivo</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Cor Primária</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="text-xs text-muted-foreground font-mono">{primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Cor Secundária</label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="text-xs text-muted-foreground font-mono">{secondaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Logo</label>
                <button className="h-8 px-3 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-border flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t) => {
            const locked = planOrder[t.minPlan] > userPlanOrder;
            return (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer group ${
                  locked
                    ? 'border-border/30 opacity-60'
                    : 'border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
                }`}
              >
                {/* Preview */}
                <div className={`aspect-square bg-gradient-to-br ${t.preview} relative flex items-center justify-center`}>
                  {locked && (
                    <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-1.5">
                      <Lock className="w-5 h-5 text-foreground/70" />
                      <span className="text-xs text-foreground/70 font-medium capitalize">{t.minPlan}</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                      {t.name}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-surface p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {t.format.map(f => (
                        <span key={f} className={`text-xs px-1.5 py-0.5 rounded font-medium ${f === 'feed' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${
                      t.minPlan === 'free' ? 'bg-green-500/10 text-green-400' :
                      t.minPlan === 'standard' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {t.minPlan}
                    </span>
                  </div>
                  {locked && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-7"
                      onClick={(e) => { e.stopPropagation(); navigate('/conta'); }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Upgrade
                    </Button>
                  )}
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
