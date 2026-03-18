import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { ChevronDown, Search, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/mock-data";

const faqs = [
  { category: 'Geral', q: 'Como funciona o AfiliadoCriativo?', a: 'Cole o link do produto afiliado, escolha um template, personalize e baixe sua arte pronta em segundos.' },
  { category: 'Geral', q: 'Preciso saber design?', a: 'Não! Tudo é automatizado. Basta colar o link e personalizar com poucos cliques.' },
  { category: 'Planos', q: 'Qual a diferença entre os planos?', a: 'Free: 1 arte/dia, 2 templates. Standard: 10 artes/dia, 5 templates. Pro: ilimitado, 10 templates + encurtador.' },
  { category: 'Planos', q: 'Posso cancelar a assinatura?', a: 'Sim, a qualquer momento. Seu acesso continua até o fim do período pago.' },
  { category: 'Artes', q: 'Em quais formatos posso baixar?', a: 'PNG e JPG. Os formatos de arte são Feed (1080x1080) e Stories (1080x1920).' },
  { category: 'Artes', q: 'As artes têm marca d\'água?', a: 'Não. Nenhum plano inclui marca d\'água nas artes geradas.' },
];

const HelpPage = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground">Ajuda</h1>
          <p className="text-sm text-muted-foreground">Perguntas frequentes e suporte.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar na ajuda..."
            className="w-full h-11 bg-surface border border-border/50 rounded-lg pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* FAQs */}
        <div className="space-y-2">
          {filtered.map((faq, i) => (
            <div key={i} className="rounded-xl bg-surface border border-border/50 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">{faq.category}</span>
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support */}
        <div className="rounded-xl bg-surface border border-border/50 p-6 space-y-4">
          <h3 className="text-sm font-medium text-foreground">Precisa de mais ajuda?</h3>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline">
              <Mail className="w-4 h-4" />
              Abrir Ticket
            </Button>
            {currentUser.plan === 'pro' && (
              <>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4" />
                  Chat ao Vivo
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4" />
                  WhatsApp
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HelpPage;
