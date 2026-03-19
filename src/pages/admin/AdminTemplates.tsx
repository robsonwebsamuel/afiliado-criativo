import { AdminLayout } from "@/components/AdminLayout";
import { templates } from "@/lib/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminTemplates = () => {
  const { toast } = useToast();
  const [tmplList, setTmplList] = useState([...templates]);

  const handleDelete = (id: string) => {
    setTmplList(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template removido." });
  };

  const toggleActive = (id: string) => {
    setTmplList(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Gerenciar Templates</h1>
            <p className="text-sm text-muted-foreground">{tmplList.length} templates cadastrados</p>
          </div>
          <Button onClick={() => toast({ title: "Formulário de novo template" })}>
            <Plus className="w-4 h-4" />
            Novo Template
          </Button>
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tmplList.map((t) => (
            <div key={t.id} className={`rounded-xl bg-surface border border-border/50 overflow-hidden transition-all ${!t.active ? 'opacity-50' : ''}`}>
              {/* Preview */}
              <div className={`aspect-video bg-gradient-to-br ${t.preview} relative`}>
                <div className="absolute inset-0 bg-background/20 flex items-end p-2">
                  <span className="text-xs font-medium text-white bg-black/40 px-2 py-0.5 rounded">
                    {t.name}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1.5">
                    {t.format.map(f => (
                      <span key={f} className={`px-1.5 py-0.5 rounded font-medium ${f === 'feed' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded font-medium capitalize ${
                    t.minPlan === 'free' ? 'bg-green-500/10 text-green-400' :
                    t.minPlan === 'standard' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>{t.minPlan}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t.categories.join(', ')}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => toggleActive(t.id)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toast({ title: `Editar ${t.name}` })}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTemplates;
