import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Brand */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold gradient-primary-text">
            AfiliadoCriativo
          </h1>
          <p className="text-muted-foreground text-sm">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/esqueci-senha"
                className="text-xs text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
