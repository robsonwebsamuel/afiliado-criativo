export type PlanType = 'free' | 'standard' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  trialStartDate?: string;
  artsCreatedToday: number;
  totalArtsCreated: number;
  avatar?: string;
}

export interface Template {
  id: string;
  name: string;
  format: ('feed' | 'stories')[];
  categories: string[];
  minPlan: PlanType;
  preview: string; // gradient placeholder
}

export interface ArtHistory {
  id: string;
  productName: string;
  format: 'feed' | 'stories';
  templateName: string;
  createdAt: string;
  colors: string[];
}

export interface ExtractedProduct {
  title: string;
  description: string;
  price: string;
  image: string;
  link: string;
}

export const currentUser: User = {
  id: 'usuario_02',
  name: 'Bruno Lima',
  email: 'bruno@email.com',
  plan: 'standard',
  artsCreatedToday: 7,
  totalArtsCreated: 42,
};

export const planLimits: Record<PlanType, { daily: number; templates: number; formats: string[] }> = {
  free: { daily: 1, templates: 2, formats: ['feed'] },
  standard: { daily: 10, templates: 5, formats: ['feed', 'stories'] },
  pro: { daily: Infinity, templates: 10, formats: ['feed', 'stories'] },
};

export const templates: Template[] = [
  { id: 't1', name: 'Destaque Moderno', format: ['feed'], categories: ['geral'], minPlan: 'free', preview: 'from-cyan-500 to-blue-600' },
  { id: 't2', name: 'Promoção Bold', format: ['feed'], categories: ['eletrônicos'], minPlan: 'free', preview: 'from-orange-500 to-red-600' },
  { id: 't3', name: 'Elegância Dark', format: ['feed', 'stories'], categories: ['moda', 'beleza'], minPlan: 'standard', preview: 'from-gray-700 to-gray-900' },
  { id: 't4', name: 'Energia Vibrante', format: ['feed', 'stories'], categories: ['saúde', 'cursos'], minPlan: 'standard', preview: 'from-pink-400 to-rose-600' },
  { id: 't5', name: 'Minimalista Clean', format: ['feed', 'stories'], categories: ['geral', 'casa'], minPlan: 'pro', preview: 'from-violet-500 to-purple-700' },
  { id: 't6', name: 'Neon Impact', format: ['feed', 'stories'], categories: ['eletrônicos', 'geral'], minPlan: 'standard', preview: 'from-pink-500 to-rose-600' },
  { id: 't7', name: 'Sunset Glow', format: ['feed', 'stories'], categories: ['moda', 'beleza'], minPlan: 'pro', preview: 'from-amber-400 to-orange-600' },
  { id: 't8', name: 'Tech Pulse', format: ['feed'], categories: ['eletrônicos', 'cursos'], minPlan: 'standard', preview: 'from-indigo-500 to-blue-700' },
  { id: 't9', name: 'Fresh Start', format: ['feed', 'stories'], categories: ['saúde', 'casa'], minPlan: 'pro', preview: 'from-teal-400 to-cyan-600' },
  { id: 't10', name: 'Royal Premium', format: ['feed', 'stories'], categories: ['geral', 'moda'], minPlan: 'pro', preview: 'from-purple-600 to-indigo-800' },
];

export const artHistory: ArtHistory[] = [
  { id: 'a1', productName: 'Curso de Marketing Digital', format: 'feed', templateName: 'Destaque Moderno', createdAt: '2026-03-15', colors: ['#06b6d4', '#2563eb'] },
  { id: 'a2', productName: 'Fone Bluetooth XPro', format: 'stories', templateName: 'Energia Vibrante', createdAt: '2026-03-16', colors: ['#4ade80', '#059669'] },
  { id: 'a3', productName: 'Livro Hábitos Atômicos', format: 'feed', templateName: 'Minimalista Clean', createdAt: '2026-03-17', colors: ['#8b5cf6', '#7c3aed'] },
  { id: 'a4', productName: 'Kit Skincare Premium', format: 'feed', templateName: 'Elegância Dark', createdAt: '2026-03-17', colors: ['#374151', '#111827'] },
  { id: 'a5', productName: 'Smartwatch FitPro', format: 'stories', templateName: 'Tech Pulse', createdAt: '2026-03-18', colors: ['#6366f1', '#1d4ed8'] },
];

export const mockExtractedProduct: ExtractedProduct = {
  title: 'Curso Completo de Marketing Digital 2026',
  description: 'Domine as principais estratégias de marketing digital e transforme sua carreira.',
  price: 'R$ 197,90',
  image: '',
  link: 'https://hotmart.com/produto/curso-marketing-digital',
};

export const captionVariants: Record<string, string> = {
  seria: '📢 Atenção: esta é a ferramenta definitiva para quem leva resultados a sério.\n\nCurso Completo de Marketing Digital 2026.\n\n💰 Por apenas R$ 197,90\n\n👉 Acesse agora: https://link.afiliado/xyz',
  profissional: '🚀 Transforme sua rotina com essa ferramenta incrível.\n\nCurso Completo de Marketing Digital 2026 — domine as estratégias que geram resultado.\n\n💰 Acesso completo por apenas R$ 197,90\n\n🔗 Garanta o seu agora: https://link.afiliado/xyz',
  descontrada: '🔥 Bora dar um UP na sua vida digital?\n\nEsse curso é o empurrão que faltava pra você bombar no marketing!\n\n💸 Tudo isso por R$ 197,90 — sim, é real!\n\n😎 Clica no link: https://link.afiliado/xyz',
  engracada: '😂 Seus amigos vão perguntar: "como você ficou tão bom?"\n\nA resposta? Esse curso aqui, ó 👇\n\n💰 R$ 197,90 e sua vida muda (ok, pelo menos seu currículo)\n\n🤣 Bora: https://link.afiliado/xyz',
};

export const planDetails = [
  {
    name: 'Free',
    type: 'free' as PlanType,
    price: 'Grátis',
    period: '7 dias de teste',
    features: [
      '1 arte por dia',
      '2 templates disponíveis',
      'Formato Feed apenas',
      'Suporte via ticket',
      'Sem marca d\'água',
    ],
  },
  {
    name: 'Standard',
    type: 'standard' as PlanType,
    price: 'R$ 29,90',
    period: '/mês',
    features: [
      '10 artes por dia',
      '5 templates disponíveis',
      'Formatos Feed e Stories',
      'Suporte via ticket e email',
      'Sem marca d\'água',
    ],
  },
  {
    name: 'Pro',
    type: 'pro' as PlanType,
    price: 'R$ 59,90',
    period: '/mês',
    features: [
      'Artes ilimitadas',
      '10 templates disponíveis',
      'Formatos Feed e Stories',
      'Encurtador de link',
      'Suporte prioritário via chat',
    ],
  },
];
