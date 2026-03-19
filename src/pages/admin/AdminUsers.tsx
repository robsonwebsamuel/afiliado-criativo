import { AdminLayout } from "@/components/AdminLayout";
import { mockAdminUsers } from "@/lib/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Crown, Trash2, Edit2, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([...mockAdminUsers]);

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast({ title: "Usuário removido." });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-sm text-muted-foreground">{users.length} usuários cadastrados</p>
          </div>
          <Button onClick={() => toast({ title: "Formulário de novo usuário" })}>
            <UserPlus className="w-4 h-4" />
            Adicionar Usuário
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-surface border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Usuário</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Plano</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Role</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Artes Criadas</th>
                  <th className="text-right px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-elevated/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize inline-flex items-center gap-1 ${
                        user.plan === 'pro' ? 'bg-purple-500/10 text-purple-400' :
                        user.plan === 'standard' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {user.plan === 'pro' && <Crown className="w-3 h-3" />}
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                        user.role === 'admin' ? 'bg-green-500/10 text-green-400' : 'bg-elevated text-muted-foreground'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground tabular-nums">
                      {user.totalArtsCreated}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toast({ title: `Editar ${user.name}` })}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toast({ title: `Bloquear ${user.name}` })}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
