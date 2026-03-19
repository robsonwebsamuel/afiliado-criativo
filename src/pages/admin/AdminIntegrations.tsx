import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Brain, Scissors, ShoppingBag, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const integrations = [
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o mini)',
    description: 'IA para geração de legendas',
    icon: Brain,
    color: 'text-green-400',
    fields: [{ label: 'API Key', placeholder: 'sk-...' }],
  },
  {
    id: 'gemini',
    name: 'Google Gemini Flash',
    description: 'IA alternativa para legendas (mais econômica)',
    icon: Brain,
    color: 'text-blue-400',
    fields: [{ label: 'API Key', placeholder: 'AIza...' }],
  },
  {
    id: 'bitly',
    name: 'Bitly (Encurtador)',
    description: 'Encurtamento de links para assinantes Standard e Pro',
    icon: Scissors,
    color: 'text-orange-400',
    fields: [{ label: 'API Key', placeholder: 'Bearer ...' }],
  },
  {
    id: 'shopee',
    name: 'Shopee Open Platform',
    description: 'Extração de dados de produtos da Shopee',
    icon: ShoppingBag,
    color: 'text-orange-500',
    fields: [
      { label: 'App ID', placeholder: 'App ID da Shopee' },
      { label: 'Secret Key', placeholder: 'Secret Key' },
    ],
  },
  {
    id: 'mercadolivre',
    name: 'Mercado Livre API',
    description: 'Extração de dados de produtos do ML',
    icon: ShoppingBag,
    color: 'text-yellow-400',
    fields: [
      { label: 'Client ID', placeholder: 'Client ID' },
      { label: 'Client Secret', placeholder: 'Client Secret' },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon Product Advertising API',
    description: 'Extração de dados de produtos da Amazon',
    icon: ShoppingBag,
    color: 'text-cyan-400',
    fields: [
      { label: 'Access Key', placeholder: 'Access Key' },
      { label: 'Secret Key', placeholder: 'Secret Key' },
      { label: 'Associate Tag', placeholder: 'seu-tag-22' },
    ],
  },
];

const AdminIntegrations = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    openai: true,
    gemini: false,
    bitly: true,
    shopee: false,
    mercadolivre: false,
    amazon: false,
  });

  const setVal = (intId: string, field: string, value: string) => {
    setValues(prev => ({ ...prev, [intId]: { ...(prev[intId] || {}), [field]: value } }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Configurar Integrações</h1>
          <p className="text-sm text-muted-foreground">APIs e serviços externos conectados à plataforma</p>
        </div>

        <div className="space-y-4">
          {integrations.map((intg) => (
            <div key={intg.id} className={`rounded-xl bg-surface border transition-all ${enabled[intg.id] ? 'border-primary/20' : 'border-border/50'} p-5 space-y-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center">
                    <intg.icon className={`w-5 h-5 ${intg.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{intg.name}</h3>
                    <p className="text-xs text-muted-foreground">{intg.description}</p>
                  </div>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => setEnabled(prev => ({ ...prev, [intg.id]: !prev[intg.id] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 ${
                    enabled[intg.id] ? 'bg-primary' : 'bg-elevated'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    enabled[intg.id] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {enabled[intg.id] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {intg.fields.map((field) => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">{field.label}</label>
                      <input
                        type="password"
                        placeholder={field.placeholder}
                        value={values[intg.id]?.[field.label] || ''}
                        onChange={(e) => setVal(intg.id, field.label, e.target.value)}
                        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}

              {enabled[intg.id] && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => toast({ title: `${intg.name} salvo com sucesso!` })}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIntegrations;
