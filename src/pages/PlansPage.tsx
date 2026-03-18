import { AppLayout } from "@/components/AppLayout";
import { planDetails, currentUser } from "@/lib/mock-data";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const periods = [
  { label: 'Mensal', multiplier: 1 },
  { label: 'Trimestral', multiplier: 2.7 },
  { label: 'Semestral', multiplier: 5 },
  { label: 'Anual', multiplier: 9 },
];

const PlansPage = () => {
  const [period, setPeriod] = useState(0);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">Planos e Assinatura</h1>
          <p className="text-sm text-muted-foreground">Escolha o plano ideal para o seu negócio.</p>
        </div>

        {/* Period selector */}
        <div className="flex justify-center gap-1.5">
          {periods.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriod(i)}
              className={`px-4 h-9 rounded-lg text-xs font-medium transition-all duration-200 ${
                period === i ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground hover:text-foreground border border-border/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planDetails.map((plan) => {
            const isActive = currentUser.plan === plan.type;
            const isPro = plan.type === 'pro';
            return (
              <div
                key={plan.type}
                className={`rounded-xl border p-6 space-y-6 transition-all duration-200 ${
                  isPro
                    ? 'bg-gradient-to-b from-accent/5 to-surface border-accent/30'
                    : isActive
                    ? 'bg-surface border-primary/30'
                    : 'bg-surface border-border/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
                    {isPro && <Crown className="w-4 h-4 text-accent" />}
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                        Atual
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-extrabold text-foreground">{plan.price}</span>
                    {plan.period !== '7 dias de teste' && (
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  {plan.type === 'free' && (
                    <p className="text-xs text-muted-foreground">{plan.period}</p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isPro ? 'pro' : isActive ? 'outline' : 'default'}
                  disabled={isActive}
                >
                  {isActive ? 'Plano Atual' : plan.type === 'free' ? 'Começar Grátis' : `Assinar ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default PlansPage;
