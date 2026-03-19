import { AdminLayout } from "@/components/AdminLayout";
import { planDetails } from "@/lib/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState(planDetails.map(p => ({ ...p, active: true })));

  const update = (type: string, field: string, value: string | boolean) => {
    setPlans(prev => prev.map(p => p.type === type ? { ...p, [field]: value } : p));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Configurar Planos</h1>
          <p className="text-sm text-muted-foreground">Edite limites e preços de cada plano</p>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.type} className="rounded-xl bg-surface border border-border/50 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-foreground">{plan.name}</h2>
                <button
                  onClick={() => update(plan.type, 'active', !plan.active)}
                  className={`flex items-center gap-2 text-xs font-medium transition-colors ${plan.active ? 'text-green-400' : 'text-muted-foreground'}`}
                >
                  {plan.active
                    ? <ToggleRight className="w-5 h-5" />
                    : <ToggleLeft className="w-5 h-5" />
                  }
                  {plan.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Preço Mensal</label>
                  <input
                    type="text"
                    value={plan.monthlyPrice}
                    onChange={(e) => update(plan.type, 'monthlyPrice', e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Preço Anual</label>
                  <input
                    type="text"
                    value={plan.annualPrice}
                    onChange={(e) => update(plan.type, 'annualPrice', e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-muted-foreground">Recursos incluídos</label>
                  <div className="space-y-1">
                    {plan.features.map((feat, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        {feat}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => toast({ title: `Plano ${plan.name} salvo com sucesso!` })}
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPlans;
