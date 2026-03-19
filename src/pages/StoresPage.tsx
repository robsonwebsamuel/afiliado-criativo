import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { mockStores } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Store, Check, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StoresPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState(mockStores.map(s => ({ ...s })));

  const toggleStore = (id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleLinkChange = (id: string, value: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, affiliateLink: value } : s));
  };

  const handleSave = () => {
    toast({ title: "Configurações salvas!", description: "Suas lojas foram atualizadas." });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Configurar Lojas</h1>
          <p className="text-sm text-muted-foreground">
            Adicione seus links de afiliado para cada marketplace
          </p>
        </div>

        {/* Lojas */}
        <div className="space-y-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className={`rounded-xl border p-5 transition-all duration-200 ${
                store.active
                  ? 'bg-surface border-primary/30'
                  : 'bg-surface border-border/50 opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center text-2xl shrink-0">
                  {store.logo}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{store.name}</h3>
                      <p className="text-xs text-muted-foreground">Marketplace de afiliados</p>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleStore(store.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        store.active ? 'bg-primary' : 'bg-elevated'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                          store.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {store.active && (
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Link de afiliado base</label>
                      <input
                        type="url"
                        value={store.affiliateLink}
                        onChange={(e) => handleLinkChange(store.id, e.target.value)}
                        placeholder={`https://${store.platform}.com/afiliado/seu-id`}
                        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </div>

        {/* Info */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Como funciona?</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ao configurar suas lojas, ao colar um link de produto dessas plataformas o sistema automaticamente reconhece 
            a origem e adiciona seu link de afiliado correto na arte gerada. Isso garante que suas comissões sejam 
            rastreadas corretamente.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default StoresPage;
