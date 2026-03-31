import { AppLayout } from "@/components/AppLayout";
import { planDetails } from "@/lib/mock-data";
import { Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PlansPage = () => {
  const { toast } = useToast();
  const [annual, setAnnual] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-display font-bold text-foreground">Escolha seu Plano</h1>
          <p className="text-muted-foreground text-sm">Crie artes profissionais e divulgue mais produtos</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-surface border border-border/50 rounded-xl p-1.5 mt-4">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Anual
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${annual ? 'bg-white/20 text-white' : 'bg-green-500/10 text-green-400'}`}>
                -50%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planDetails.map((plan) => {
            const isPro = plan.type === 'pro';
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.type}
                className={`rounded-2xl border p-6 space-y-6 relative transition-all duration-200 ${
                  isPro
                    ? 'bg-primary/5 border-primary/40 shadow-lg shadow-primary/10 scale-[1.02]'
                    : 'bg-surface border-border/50'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Mais Popular
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-display font-bold text-foreground">{plan.name}</h2>
                    {isPro && <Crown className="w-4 h-4 text-accent" />}
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-display font-extrabold text-foreground tabular-nums">
                      {price}
                    </span>
                    {plan.type !== 'free' && (
                      <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                    )}
                  </div>
                  {annual && plan.type !== 'free' && (
                    <p className="text-xs text-green-400">cobrado anualmente</p>
                  )}
                  {plan.type === 'free' && (
                    <p className="text-xs text-muted-foreground">{plan.period}</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPro ? 'bg-primary/20' : 'bg-elevated'}`}>
                        <Check className={`w-2.5 h-2.5 ${isPro ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={isPro ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => {
                    const checkoutUrls: Record<string, string> = {
                      standard: 'https://pay.kiwify.com.br/Q3C9tgH',
                      pro: 'https://pay.kiwify.com.br/NuyBAgP',
                    };
                    if (plan.type === 'free') {
                      toast({ title: 'Plano Grátis ativado', description: 'Você já está no plano gratuito!' });
                    } else {
                      window.open(checkoutUrls[plan.type], '_blank');
                    }
                  }}
                >
                  {plan.type === 'free' ? (
                    <><Zap className="w-4 h-4" /> Começar Grátis</>
                  ) : (
                    <><Crown className="w-4 h-4" /> Assinar {plan.name}</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="text-center text-sm text-muted-foreground">
          ✅ Cancele quando quiser · Sem taxa de cancelamento · Suporte incluso
        </div>
      </div>
    </AppLayout>
  );
};

export default PlansPage;
