import { AdminLayout } from "@/components/AdminLayout";
import { mockAdminUsers, artHistory, planDetails } from "@/lib/mock-data";
import { Users, Image, TrendingUp, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const growthData = [
  { month: 'Jan', usuarios: 12 },
  { month: 'Fev', usuarios: 24 },
  { month: 'Mar', usuarios: 41 },
];

const AdminDashboard = () => {
  const totalUsers = mockAdminUsers.length;
  const proUsers = mockAdminUsers.filter(u => u.plan === 'pro').length;
  const standardUsers = mockAdminUsers.filter(u => u.plan === 'standard').length;
  const receitaEstimada = (proUsers * 79) + (standardUsers * 59);

  const recentSubscriptions = [
    { name: 'Ana Costa', plan: 'Pro', value: 'R$ 79,00', date: '19/03/2026' },
    { name: 'Bruno Lima', plan: 'Standard', value: 'R$ 59,00', date: '18/03/2026' },
    { name: 'Carlos Melo', plan: 'Free', value: '—', date: '17/03/2026' },
    { name: 'Diana Faria', plan: 'Pro', value: 'R$ 79,00', date: '15/03/2026' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-sm text-muted-foreground">Visão geral da plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Usuários', value: totalUsers, icon: Users, color: 'text-blue-400' },
            { label: 'Artes Hoje', value: artHistory.length, icon: Image, color: 'text-primary' },
            { label: 'Usuários Pro', value: proUsers, icon: TrendingUp, color: 'text-accent' },
            { label: 'Receita Estimada', value: `R$ ${receitaEstimada.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-surface border border-border/50 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl bg-surface border border-border/50 p-6 space-y-4">
          <h2 className="text-sm font-medium text-foreground">Crescimento de Usuários</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Bar dataKey="usuarios" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent subscriptions */}
        <div className="rounded-xl bg-surface border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="text-sm font-medium text-foreground">Últimas Assinaturas</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Usuário</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Plano</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Valor</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentSubscriptions.map((sub, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-elevated/50 transition-colors">
                  <td className="px-5 py-3 text-foreground font-medium">{sub.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${
                      sub.plan === 'Pro' ? 'bg-purple-500/10 text-purple-400' :
                      sub.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>{sub.plan}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{sub.value}</td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{sub.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
