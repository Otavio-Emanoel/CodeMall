"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

type OrderItem = { productId: number; sellerId: number; name?: string; price: number; quantity: number };
type Order = { id: string; buyerId: number; items: OrderItem[]; total: number; status: 'em_andamento'|'entregue'|'cancelado'; createdAt: string };

function formatCurrency(v: any) {
  const n = Number(v || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const text = await res.text();
        let data: any = null;
        try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
        if (!res.ok) throw new Error(data?.error || 'Falha ao carregar pedido');
        if (mounted) setOrder(data as Order);
      } catch (e: any) {
        setError(e?.message || 'Erro inesperado');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (orderId) load();
    return () => { mounted = false };
  }, [orderId]);

  const safeItems = useMemo<OrderItem[]>(() => order?.items && Array.isArray(order.items) ? order.items : [], [order]);
  const safeTotal = useMemo<number>(() => Number(order?.total || 0), [order]);

  function statusBadge(status: Order['status']) {
    if (status === 'em_andamento') return <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">Em andamento</Badge>;
    if (status === 'entregue') return <Badge className="bg-green-100 text-green-800" variant="secondary">Entregue</Badge>;
    return <Badge className="bg-red-100 text-red-800" variant="secondary">Cancelado</Badge>;
  }

  return (
    <div className="min-h-[70vh] w-full px-6 py-8">
      <div className="mb-4">
        <Button variant="ghost" className="flex items-center gap-2 px-2" onClick={() => router.push('/orders')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Pedido #{orderId}</CardTitle>
          <CardDescription>Detalhes do pedido, status e itens</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando...</p>}
          {!loading && error && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && !order && <p>Pedido não encontrado.</p>}
          {!loading && !error && order && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-sage-700" />
                <span>Status:</span>
                {statusBadge(order.status)}
                <span className="ml-auto text-sm text-sage-600">Criado em {new Date(order.createdAt).toLocaleString()}</span>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Itens</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Qtde</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeItems.map((it, idx) => {
                      const price = Number(it?.price || 0);
                      const qty = Number(it?.quantity || 0);
                      const subtotal = price * qty;
                      return (
                        <TableRow key={idx}>
                          <TableCell>#{it?.productId}</TableCell>
                          <TableCell>#{it?.sellerId}</TableCell>
                          <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                          <TableCell className="text-right">{qty}</TableCell>
                          <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="text-right mt-4 font-bold">Total: {formatCurrency(safeTotal)}</div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/orders')}>Voltar</Button>
                <Button
                  variant="outline"
                  disabled={order.status === 'cancelado'}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar entrega
                </Button>
                <Button
                  variant="destructive"
                  disabled={order.status === 'cancelado'}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancelar pedido
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
