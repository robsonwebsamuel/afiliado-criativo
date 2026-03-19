import { AppLayout } from "@/components/AppLayout";
import { reportData, artHistory } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2, Image, TrendingUp, Clock } from "lucide-react";

const ReportsPage = () => {
  const totalArtes = artHistory.length;
  const mediaPorDia = (reportData.reduce((acc, d) => acc + d.artes, 0) / reportData.length).toFixed(1);
  const categorias = ['Cursos', 'Eletrônicos', 'Moda', 'Saúde', 'Casa'];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seu desempenho como afiliado</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Total de Produtos</span>
              <Image className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{totalArtes}</p>
            <p className="text-xs text-muted-foreground">artes criadas no total</p>
          </div>
          <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Média por Dia</span>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{mediaPorDia}</p>
            <p className="text-xs text-muted-foreground">artes/dia nos últimos 30 dias</p>
          </div>
          <div className="rounded-xl bg-surface border border-border/50 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Categoria Mais Usada</span>
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">Cursos</p>
            <p className="text-xs text-muted-foreground">categoria mais divulgada</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="rounded-xl bg-surface border border-border/50 p-6 space-y-4">
          <h2 className="text-sm font-medium text-foreground">Artes Criadas — Últimos 19 dias</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="artes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de histórico */}
        <div className="rounded-xl bg-surface border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Histórico de Produtos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Produto</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Formato</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Template</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground uppercase tracking-widest">Data</th>
                </tr>
              </thead>
              <tbody>
                {artHistory.map((art) => (
                  <tr key={art.id} className="border-b border-border/30 hover:bg-elevated/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-md shrink-0"
                          style={{ background: `linear-gradient(135deg, ${art.colors[0]}, ${art.colors[1]})` }}
                        />
                        <span className="text-foreground font-medium truncate max-w-[180px]">{art.productName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${art.format === 'feed' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {art.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{art.templateName}</td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">{art.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
