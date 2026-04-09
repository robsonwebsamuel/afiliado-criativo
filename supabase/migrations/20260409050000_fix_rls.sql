-- Remover políticas permissivas existentes
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Garantir que RLS está ativo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê o próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Política: usuário só atualiza o próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Política: inserção apenas do próprio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- E também aplicar políticas na tabela short_links para segurança (se necessário)
DROP POLICY IF EXISTS "Short links viewable by everyone" ON short_links;
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own short links"
ON short_links FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own short links"
ON short_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own short links"
ON short_links FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own short links"
ON short_links FOR DELETE
USING (auth.uid() = user_id);
