export type PlanType = 'free' | 'standard' | 'pro';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  role: UserRole;
  trialStartDate?: string;
  artsCreatedToday: number;
  totalArtsCreated: number;
  avatar?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Template {
  id: string;
  name: string;
  format: ('feed' | 'stories')[];
  categories: string[];
  minPlan: PlanType;
  preview: string; // gradient placeholder
  active: boolean;
}

export interface ArtHistory {
  id: string;
  productName: string;
  format: 'feed' | 'stories';
  templateName: string;
  createdAt: string;
  colors: string[];
  link?: string;
}

export interface ExtractedProduct {
  title: string;
  description: string;
  price: string;
  image: string;
  link: string;
}

export interface Store {
  id: string;
  name: string;
  platform: string;
  affiliateLink: string;
  active: boolean;
  logo: string;
}

export const currentUser: User = {
  id: 'usuario_02',
  name: 'Bruno Lima',
  email: 'bruno@email.com',
  plan: 'standard',
  role: 'user',
  artsCreatedToday: 7,
  totalArtsCreated: 42,
};

export const planLimits: Record<PlanType, {
  daily: number;
  templates: number;
  formats: string[];
  hasLogo: boolean;
  hasColorPicker: boolean;
  hasSite: boolean;
  linkShortener: boolean;
  captionLimit: number | null;
}> = {
  free: {
    daily: 3,
    templates: 3,
    formats: ['feed'],
    hasLogo: false,
    hasColorPicker: false,
    hasSite: false,
    linkShortener: false,
    captionLimit: 3,
  },
  standard: {
    daily: 10,
    templates: 10,
    formats: ['feed', 'stories'],
    hasLogo: true,
    hasColorPicker: false,
    hasSite: false,
    linkShortener: true,
    captionLimit: null,
  },
  pro: {
    daily: Infinity,
    templates: 99,
    formats: ['feed', 'stories'],
    hasLogo: true,
    hasColorPicker: true,
    hasSite: true,
    linkShortener: true,
    captionLimit: null,
  },
};

export const templates: Template[] = [
  { id: 't1', name: 'Destaque Moderno', format: ['feed'], categories: ['geral'], minPlan: 'free', preview: 'from-cyan-500 to-blue-600', active: true },
  { id: 't2', name: 'Promoção Bold', format: ['feed'], categories: ['eletrônicos'], minPlan: 'free', preview: 'from-orange-500 to-red-600', active: true },
  { id: 't3', name: 'Elegância Dark', format: ['feed', 'stories'], categories: ['moda', 'beleza'], minPlan: 'free', preview: 'from-gray-700 to-gray-900', active: true },
  { id: 't4', name: 'Energia Vibrante', format: ['feed', 'stories'], categories: ['saúde', 'cursos'], minPlan: 'standard', preview: 'from-pink-400 to-rose-600', active: true },
  { id: 't5', name: 'Minimalista Clean', format: ['feed', 'stories'], categories: ['geral', 'casa'], minPlan: 'standard', preview: 'from-violet-500 to-purple-700', active: true },
  { id: 't6', name: 'Neon Impact', format: ['feed', 'stories'], categories: ['eletrônicos', 'geral'], minPlan: 'standard', preview: 'from-pink-500 to-rose-600', active: true },
  { id: 't7', name: 'Sunset Glow', format: ['feed', 'stories'], categories: ['moda', 'beleza'], minPlan: 'standard', preview: 'from-amber-400 to-orange-600', active: true },
  { id: 't8', name: 'Tech Pulse', format: ['feed'], categories: ['eletrônicos', 'cursos'], minPlan: 'standard', preview: 'from-indigo-500 to-blue-700', active: true },
  { id: 't9', name: 'Fresh Start', format: ['feed', 'stories'], categories: ['saúde', 'casa'], minPlan: 'standard', preview: 'from-teal-400 to-cyan-600', active: true },
  { id: 't10', name: 'Royal Premium', format: ['feed', 'stories'], categories: ['geral', 'moda'], minPlan: 'pro', preview: 'from-purple-600 to-indigo-800', active: true },
];

export const artHistory: ArtHistory[] = [
  { id: 'a1', productName: 'Curso de Marketing Digital', format: 'feed', templateName: 'Destaque Moderno', createdAt: '2026-03-15', colors: ['#06b6d4', '#2563eb'], link: 'https://bit.ly/xyz1' },
  { id: 'a2', productName: 'Fone Bluetooth XPro', format: 'stories', templateName: 'Energia Vibrante', createdAt: '2026-03-16', colors: ['#4ade80', '#059669'], link: 'https://bit.ly/xyz2' },
  { id: 'a3', productName: 'Livro Hábitos Atômicos', format: 'feed', templateName: 'Minimalista Clean', createdAt: '2026-03-17', colors: ['#8b5cf6', '#7c3aed'], link: 'https://bit.ly/xyz3' },
  { id: 'a4', productName: 'Kit Skincare Premium', format: 'feed', templateName: 'Elegância Dark', createdAt: '2026-03-17', colors: ['#374151', '#111827'], link: 'https://bit.ly/xyz4' },
  { id: 'a5', productName: 'Smartwatch FitPro', format: 'stories', templateName: 'Tech Pulse', createdAt: '2026-03-18', colors: ['#6366f1', '#1d4ed8'], link: 'https://bit.ly/xyz5' },
  { id: 'a6', productName: 'Tênis Running Pro', format: 'feed', templateName: 'Neon Impact', createdAt: '2026-03-18', colors: ['#ec4899', '#e11d48'], link: 'https://bit.ly/xyz6' },
  { id: 'a7', productName: 'Perfume Luxe Gold', format: 'stories', templateName: 'Sunset Glow', createdAt: '2026-03-19', colors: ['#f59e0b', '#ea580c'], link: 'https://bit.ly/xyz7' },
];

export const mockExtractedProduct: ExtractedProduct = {
  title: 'Curso Completo de Marketing Digital 2026',
  description: 'Domine as principais estratégias de marketing digital e transforme sua carreira.',
  price: 'R$ 197,90',
  image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
  link: 'https://hotmart.com/produto/curso-marketing-digital',
};

export const captionVariants: Record<string, string> = {
  seria: '📢 Atenção: esta é a ferramenta definitiva para quem leva resultados a sério.\n\nCurso Completo de Marketing Digital 2026.\n\n💰 Por apenas R$ 197,90\n\n👉 Acesse agora: https://bit.ly/afil-xyz',
  profissional: '🚀 Transforme sua rotina com essa ferramenta incrível.\n\nCurso Completo de Marketing Digital 2026 — domine as estratégias que geram resultado.\n\n💰 Acesso completo por apenas R$ 197,90\n\n🔗 Garanta o seu agora: https://bit.ly/afil-xyz',
  descontrada: '🔥 Bora dar um UP na sua vida digital?\n\nEsse curso é o empurrão que faltava pra você bombar no marketing!\n\n💸 Tudo isso por R$ 197,90 — sim, é real!\n\n😎 Clica no link: https://bit.ly/afil-xyz',
  engracada: '😂 Seus amigos vão perguntar: "como você ficou tão bom?"\n\nA resposta? Esse curso aqui, ó 👇\n\n💰 R$ 197,90 e sua vida muda (ok, pelo menos seu currículo)\n\n🤣 Bora: https://bit.ly/afil-xyz',
};

export const planDetails = [
  {
    name: 'Free',
    type: 'free' as PlanType,
    monthlyPrice: 'Grátis',
    annualPrice: 'Grátis',
    period: '7 dias de teste',
    features: [
      '3 artes por dia',
      '3 templates (Feed apenas)',
      'Legendas com IA (4 tons)',
      'Link na legenda',
      'Suporte via FAQ',
    ],
  },
  {
    name: 'Standard',
    type: 'standard' as PlanType,
    monthlyPrice: 'R$ 59,00',
    annualPrice: 'R$ 29,00',
    period: '/mês',
    highlight: false,
    features: [
      '10 artes por dia',
      '10 templates (Feed e Stories)',
      'Upload do seu Logo',
      'Legendas ilimitadas com IA',
      'Link encurtado na legenda',
      'Suporte via ticket e e-mail',
    ],
  },
  {
    name: 'Pro',
    type: 'pro' as PlanType,
    monthlyPrice: 'R$ 79,00',
    annualPrice: 'R$ 49,00',
    period: '/mês',
    highlight: true,
    features: [
      'Artes ilimitadas',
      'Todos os templates (Feed e Stories)',
      'Upload do seu Logo',
      'Configuração de cores da arte',
      'Legendas ilimitadas com IA',
      'Link encurtado na legenda',
      'Site com Produtos (vitrine pública)',
      'Suporte prioritário via chat',
    ],
  },
];

export const mockStores: Store[] = [
  { id: 's1', name: 'Shopee', platform: 'shopee', affiliateLink: '', active: false, logo: '🛍️' },
  { id: 's2', name: 'Mercado Livre', platform: 'mercadolivre', affiliateLink: '', active: false, logo: '🛒' },
  { id: 's3', name: 'Amazon', platform: 'amazon', affiliateLink: '', active: false, logo: '📦' },
  { id: 's4', name: 'Hotmart', platform: 'hotmart', affiliateLink: '', active: true, logo: '🔥' },
  { id: 's5', name: 'Monetizze', platform: 'monetizze', affiliateLink: '', active: false, logo: '💰' },
  { id: 's6', name: 'Eduzz', platform: 'eduzz', affiliateLink: '', active: false, logo: '⚡' },
];

export const reportData = [
  { date: '03/01', artes: 2 },
  { date: '03/02', artes: 0 },
  { date: '03/03', artes: 3 },
  { date: '03/04', artes: 1 },
  { date: '03/05', artes: 5 },
  { date: '03/06', artes: 4 },
  { date: '03/07', artes: 2 },
  { date: '03/08', artes: 0 },
  { date: '03/09', artes: 3 },
  { date: '03/10', artes: 6 },
  { date: '03/11', artes: 4 },
  { date: '03/12', artes: 2 },
  { date: '03/13', artes: 7 },
  { date: '03/14', artes: 3 },
  { date: '03/15', artes: 5 },
  { date: '03/16', artes: 4 },
  { date: '03/17', artes: 8 },
  { date: '03/18', artes: 6 },
  { date: '03/19', artes: 7 },
];

export const mockAdminUsers: User[] = [
  { id: 'u1', name: 'Bruno Lima', email: 'bruno@email.com', plan: 'standard', role: 'user', artsCreatedToday: 7, totalArtsCreated: 42 },
  { id: 'u2', name: 'Ana Costa', email: 'ana@email.com', plan: 'pro', role: 'user', artsCreatedToday: 15, totalArtsCreated: 230 },
  { id: 'u3', name: 'Carlos Melo', email: 'carlos@email.com', plan: 'free', role: 'user', artsCreatedToday: 1, totalArtsCreated: 8 },
  { id: 'u4', name: 'Admin Sistema', email: 'admin@afiliado.com', plan: 'pro', role: 'admin', artsCreatedToday: 0, totalArtsCreated: 0 },
];
