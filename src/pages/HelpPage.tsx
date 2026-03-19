import { AppLayout } from "@/components/AppLayout";
import { ChevronDown, ChevronUp, HelpCircle, Mail } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "Como colar o link do produto?",
    a: "Na página 'Criar Nova Arte', cole o link completo do produto (Shopee, Mercado Livre, Amazon, Hotmart etc.) no campo indicado e clique em 'Extrair Dados'. O sistema vai buscar automaticamente as informações do produto."
  },
  {
    q: "Quais marketplaces são suportados?",
    a: "Atualmente suportamos Shopee, Mercado Livre, Amazon, Hotmart, Monetizze e Eduzz. Você pode configurar seus links de afiliado em 'Configurar Lojas'."
  },
  {
    q: "Como funciona o encurtamento de link?",
    a: "Disponível nos planos Standard e Pro. Após gerar a arte, o sistema cria automaticamente um link encurtado e rastreável que será adicionado à legenda."
  },
  {
    q: "Como fazer upload do meu logo?",
    a: "Disponível nos planos Standard e Pro. Acesse 'Conta e Assinatura' e faça o upload do seu logo em formato PNG ou SVG. O logo será adicionado automaticamente em todas as artes geradas."
  },
  {
    q: "Como personalizar as cores da arte?",
    a: "Exclusivo do Plano Pro. Na página 'Templates', a seção 'Customizar Cores' permite escolher a cor primária e secundária de todas as artes geradas."
  },
  {
    q: "O que é o Site com Produtos?",
    a: "Exclusivo do Plano Pro. Você terá uma vitrine pública com URL personalizada onde todos os seus produtos afiliados ficam listados. Basta compartilhar o link!"
  },
  {
    q: "Quantas artes posso criar por dia?",
    a: "Plano Free: 3 artes/dia. Plano Standard: 10 artes/dia. Plano Pro: ilimitadas. O contador reseta todos os dias à meia-noite."
  },
  {
    q: "Como cancelar minha assinatura?",
    a: "Acesse 'Conta e Assinatura' e clique em 'Fazer Downgrade'. Você continuará com acesso ao plano pago até o fim do período pago."
  },
  {
    q: "Como entrar em contato com o suporte?",
    a: "Plano Free: FAQ e suporte via ticket. Plano Standard: ticket e e-mail. Plano Pro: suporte prioritário via chat. Envie sua mensagem para suporte@afiliado.app"
  },
  {
    q: "Posso usar as artes no WhatsApp e Instagram?",
    a: "Sim! As artes são geradas em formato PNG de alta resolução. Formato Feed (1080×1080) e Stories (1080×1920), prontos para postar em qualquer rede."
  },
];

const HelpPage = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Central de Ajuda</h1>
          <p className="text-sm text-muted-foreground">Encontre respostas para as dúvidas mais comuns</p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface border border-border/50 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-elevated/50 transition-colors"
              >
                <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                {open === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center space-y-3">
          <Mail className="w-6 h-6 text-primary mx-auto" />
          <h2 className="text-sm font-semibold text-foreground">Não encontrou o que procurava?</h2>
          <p className="text-xs text-muted-foreground">Entre em contato com nosso suporte</p>
          <a
            href="mailto:suporte@afiliado.app"
            className="inline-block text-sm text-primary hover:underline font-medium"
          >
            suporte@afiliado.app
          </a>
        </div>
      </div>
    </AppLayout>
  );
};

export default HelpPage;
