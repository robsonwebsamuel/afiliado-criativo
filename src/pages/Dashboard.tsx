import { AppLayout } from "@/components/AppLayout";
import { planLimits, planDetails, artHistory } from "@/lib/mock-data";
import { Sparkles, Image, LayoutGrid, History, ArrowRight, Crown, TrendingUp, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  const plan = (profile?.plan || 'free') as keyof typeof planLimits;
  const displayName = profile?.display_name || user?.email || 'Usuário';
  const limit = planLimits[plan];
  const recentArts = artHistory.slice(0, 5);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Olá, {(user?.user_metadata?.full_name || user?.user_metadata?.display_name || displayName).split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Seu Post Pronto em Segundos
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Image className="w-5 h-5 text-primary" />}
            label="Total de Artes Criadas"
            value="—"
          />
          <StatCard
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            label="Artes Disponíveis Hoje"
            value={limit.daily === Infinity ? '∞' : String(limit.daily)}
            sub={limit.daily === Infinity ? 'Ilimitadas' : `por dia no plano ${plan}`}
          />
          {/* Plano atual */}
          <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Plano Atual</span>
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-display font-bold text-foreground tabular-nums capitalize">
                {plan}
              </span>
              {plan === 'pro' && <Crown className="w-4 h-4 text-accent mb-1" />}
            </div>
            {plan !== 'pro' && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/conta')}
              >
                <TrendingUp className="w-3 h-3" />
                Fazer Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* CTA Criar Arte */}
        <div className="rounded-xl bg-surface border border-border/50 p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Criar Nova Arte</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Cole o link do produto, escolha um template e gere sua arte em segundos.
          </p>
          <Button size="lg" onClick={() => navigate('/criar')} className="mt-2">
            <MousePointerClick className="w-4 h-4" />
            Começar Agora
          </Button>
        </div>

        {/* Últimos produtos + atalhos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Últimos 5 Produtos Divulgados
            </h3>
            <div className="space-y-2">
              {recentArts.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border/50"
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${art.colors[0]}, ${art.colors[1]})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{art.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {art.templateName} · {art.format.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{art.createdAt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Atalhos</h3>
            <div className="space-y-2">
              {[
                { label: 'Templates', desc: 'Explore os templates disponíveis', url: '/templates', icon: LayoutGrid },
                { label: 'Histórico', desc: 'Veja suas artes criadas', url: '/historico', icon: History },
                { label: 'Relatórios', desc: 'Acompanhe suas métricas', url: '/relatorios', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.url}
                  onClick={() => navigate(item.url)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface border border-border/50 hover:bg-elevated transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function StatCard({ icon, label, value, progress, badge, sub }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress?: number;
  badge?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-display font-bold text-foreground tabular-nums">{value}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-warning/10 text-warning font-medium mb-1">
            {badge}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {progress !== undefined && (
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
