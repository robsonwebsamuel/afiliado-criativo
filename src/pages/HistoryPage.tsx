import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { artHistory } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutGrid, BookImage } from "lucide-react";
import { useNavigate } from "react-router-dom";

type FilterType = 'todos' | 'feed' | 'stories';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('todos');

  const filtered = artHistory.filter(art =>
    filter === 'todos' ? true : art.format === filter
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-foreground">Histórico</h1>
            <p className="text-sm text-muted-foreground">Todas as suas artes criadas</p>
          </div>
          <Button onClick={() => navigate('/criar')}>
            <BookImage className="w-4 h-4" />
            Nova Arte
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['todos', 'feed', 'stories'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'feed' ? 'Feed' : 'Stories'}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} artes</span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma arte encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((art) => (
              <div
                key={art.id}
                className="rounded-xl bg-surface border border-border/50 overflow-hidden hover:border-border transition-all duration-200 group"
              >
                {/* Thumbnail */}
                <div
                  className={`${art.format === 'stories' ? 'aspect-[9/16] max-h-48' : 'aspect-square'} bg-gradient-to-br relative`}
                  style={{ background: `linear-gradient(135deg, ${art.colors[0]}, ${art.colors[1]})` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-1 px-4">
                      <p className="text-white text-xs font-semibold opacity-90 leading-tight line-clamp-2">
                        {art.productName}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${art.format === 'feed' ? 'bg-blue-500/80 text-white' : 'bg-purple-500/80 text-white'}`}>
                      {art.format.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{art.productName}</p>
                    <p className="text-xs text-muted-foreground">{art.templateName} · {art.createdAt}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/criar')}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Recriar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
