import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { currentUser, planDetails } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Check, Crown, Upload, User, Mail, CreditCard, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AccountPage = () => {
  const { toast } = useToast();
  const [annual, setAnnual] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  const currentPlan = planDetails.find(p => p.type === currentUser.plan)!;

  const handleSaveProfile = () => {
    toast({ title: "Perfil atualizado com sucesso!" });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Conta e Assinatura</h1>
          <p className="text-sm text-muted-foreground">Gerencie seu perfil e plano</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile section */}
          <div className="space-y-5">
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-4">
              <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Dados do Perfil
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-elevated flex items-center justify-center text-2xl font-display font-bold text-foreground">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium capitalize mt-1 inline-block">
                    {currentUser.plan}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Logo upload (Standard/Pro) */}
              {currentUser.plan !== 'free' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Seu Logo</label>
                  <button className="w-full h-20 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Upload do Logo (PNG/SVG)</span>
                  </button>
                </div>
              )}

              <Button className="w-full" onClick={handleSaveProfile}>Salvar Perfil</Button>
            </div>
          </div>

          {/* Subscription section */}
          <div className="space-y-5">
            {/* Current plan */}
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Assinatura Atual
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-display font-bold text-foreground capitalize flex items-center gap-2">
                    Plano {currentPlan.name}
                    {currentUser.plan === 'pro' && <Crown className="w-4 h-4 text-accent" />}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {annual ? currentPlan.annualPrice : currentPlan.monthlyPrice} {currentPlan.period}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 font-medium">Ativo</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Próxima renovação: 19/04/2026</span>
              </div>
            </div>

            {/* Plan toggle */}
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">Mudar Plano</h2>
                {/* Mensal / Anual toggle */}
                <div className="flex items-center gap-2 bg-elevated rounded-lg p-1">
                  <button
                    onClick={() => setAnnual(false)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setAnnual(true)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    Anual
                    <span className="ml-1 text-xs text-green-400">-50%</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {planDetails.map((plan) => (
                  <div
                    key={plan.type}
                    className={`rounded-lg border p-4 transition-all ${
                      currentUser.plan === plan.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 bg-elevated/30 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          {plan.name}
                          {plan.type === 'pro' && <Crown className="w-3 h-3 text-accent" />}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {annual ? plan.annualPrice : plan.monthlyPrice}
                          {plan.type !== 'free' ? plan.period : ''}
                          {annual && plan.type !== 'free' && ' (cobrado anualmente)'}
                        </p>
                      </div>
                      {currentUser.plan === plan.type ? (
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Atual
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant={plan.type === 'pro' ? 'default' : 'outline'}
                          className="text-xs h-8"
                          onClick={() => toast({ title: `Redirecionando para o plano ${plan.name}...` })}
                        >
                          {plan.type === 'free' ? 'Fazer Downgrade' : 'Fazer Upgrade'}
                        </Button>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary shrink-0" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment history */}
            <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground">Histórico de Pagamentos</h2>
              <div className="space-y-2">
                {[
                  { date: '19/03/2026', plan: 'Standard Mensal', value: 'R$ 59,00', status: 'Pago' },
                  { date: '19/02/2026', plan: 'Standard Mensal', value: 'R$ 59,00', status: 'Pago' },
                  { date: '19/01/2026', plan: 'Standard Mensal', value: 'R$ 59,00', status: 'Pago' },
                ].map((payment, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-foreground">{payment.plan}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{payment.value}</p>
                      <span className="text-xs text-green-400">{payment.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AccountPage;
