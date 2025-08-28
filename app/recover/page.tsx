"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

const RequestSchema = z.object({
  email: z.string().email('Email inválido'),
});

const ResetSchema = z
  .object({
    token: z.string().min(8, 'Token inválido'),
    password: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirm: z.string().min(6, 'Mínimo de 6 caracteres'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'As senhas não coincidem',
    path: ['confirm'],
  });

type RequestValues = z.infer<typeof RequestSchema>;
type ResetValues = z.infer<typeof ResetSchema>;

export default function RecoverPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();

  const [tab, setTab] = useState<'request' | 'reset'>('request');
  const [error, setError] = useState('');

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(RequestSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { token: '', password: '', confirm: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    const t = search.get('token');
    if (t) {
      setTab('reset');
      resetForm.setValue('token', t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSubmitting = requestForm.formState.isSubmitting || resetForm.formState.isSubmitting;

  async function submitRequest(values: RequestValues) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha ao solicitar recuperação');
      toast({ title: 'Verifique seu email', description: 'Enviamos um link de recuperação, se o email existir.' });
      setTab('reset');
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado');
    }
  }

  async function submitReset(values: ResetValues) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: values.token, password: values.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha ao redefinir senha');
      toast({ title: 'Senha atualizada!', description: 'Agora você já pode entrar com a nova senha.' });
      router.push('/auth');
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado');
    }
  }

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background px-4">
      <Card className="w-full max-w-xl shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Recuperar senha</CardTitle>
          <CardDescription>Solicite o link de recuperação ou redefina com seu token</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'request' | 'reset')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request" className="gap-2"><Mail className="h-4 w-4" /> Solicitar</TabsTrigger>
              <TabsTrigger value="reset" className="gap-2"><ShieldCheck className="h-4 w-4" /> Redefinir</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="pt-6">
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(submitRequest)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
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

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Enviar link'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="reset" className="pt-6">
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(submitReset)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <FormControl>
                          <Input placeholder="Cole o token recebido" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Redefinir senha'}
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
          Precisa de ajuda? Contate o suporte.
        </CardFooter>
      </Card>
    </div>
  );
}
