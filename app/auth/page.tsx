"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

const RegisterSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  role: z.enum(['buyer', 'seller']),
});

type LoginValues = z.infer<typeof LoginSchema>;
type RegisterValues = z.infer<typeof RegisterSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [showPwdLogin, setShowPwdLogin] = useState(false);
  const [showPwdRegister, setShowPwdRegister] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '', role: 'buyer' },
    mode: 'onBlur',
  });

  const isSubmitting = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;

  async function submitLogin(values: LoginValues) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao entrar');
      if (data.token) localStorage.setItem('token', data.token);
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      router.push('/');
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado');
    }
  }

  async function submitRegister(values: RegisterValues) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao cadastrar');
      if (data.token) localStorage.setItem('token', data.token);
      toast({ title: 'Conta criada!', description: 'Cadastro realizado com sucesso.' });
      router.push('/');
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado');
    }
  }

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background px-4">
      <Card className="w-full max-w-xl shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">CodeMall</CardTitle>
          <CardDescription>Acesse sua conta ou crie uma nova para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-4 w-4" /> Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="gap-2">
                <UserPlus className="h-4 w-4" /> Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="pt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(submitLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="voce@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="relative">
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type={showPwdLogin ? 'text' : 'password'} placeholder="Sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdLogin(v => !v)}
                      className="absolute right-2 top-9 text-muted-foreground hover:text-foreground"
                      aria-label={showPwdLogin ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPwdLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <a href="/recover" className="text-primary hover:underline">Esqueci minha senha</a>
                    <button type="button" className="text-muted-foreground hover:underline" onClick={() => setTab('register')}>Criar conta</button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Entrar'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="pt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(submitRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="voce@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="relative">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type={showPwdRegister ? 'text' : 'password'} placeholder="Sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdRegister(v => !v)}
                      className="absolute right-2 top-9 text-muted-foreground hover:text-foreground"
                      aria-label={showPwdRegister ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPwdRegister ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de conta</FormLabel>
                        <FormControl>
                          <RadioGroup className="grid grid-cols-2 gap-2" value={field.value} onValueChange={field.onChange}>
                            <div className="flex items-center gap-2 rounded-md border p-3">
                              <RadioGroupItem id="role-buyer" value="buyer" />
                              <Label htmlFor="role-buyer">Comprador</Label>
                            </div>
                            <div className="flex items-center gap-2 rounded-md border p-3">
                              <RadioGroupItem id="role-seller" value="seller" />
                              <Label htmlFor="role-seller">Vendedor</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Criar conta'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Ao continuar você concorda com nossos Termos e Política de Privacidade.
        </CardFooter>
      </Card>
    </div>
  );
}
