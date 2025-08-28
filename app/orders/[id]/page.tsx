"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

type OrderItem = { productId: number; sellerId: number; name?: string; price: number; quantity: number };
type Order = { id: string; buyerId: number; items: OrderItem[]; total: number; status: 'em_andamento'|'entregue'|'cancelado'; createdAt: string };

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
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Falha ao carregar pedido');
        if (mounted) setOrder(data);
      } catch (e: any) {
        setError(e?.message || 'Erro inesperado');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (orderId) load();
    return () => { mounted = false };
  }, [orderId]);

  function statusBadge(status: Order['status']) {
    if (status === 'em_andamento') return <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">Em andamento</Badge>;
    if (status === 'entregue') return <Badge className="bg-green-100 text-green-800" variant="secondary">Entregue</Badge>;
    return <Badge className="bg-red-100 text-red-800" variant="secondary">Cancelado</Badge>;
  }

  return (
    <div className="min-h-[70vh] w-full px-6 py-8">
      <Card className="max-w-4xl mx-auto border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Pedido #{orderId}</CardTitle>
          <CardDescription>Detalhes do pedido, status e itens</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : order ? (
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
                    {order.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>#{it.productId}</TableCell>
                        <TableCell>#{it.sellerId}</TableCell>
                        <TableCell className="text-right">R$ {it.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{it.quantity}</TableCell>
                        <TableCell className="text-right">R$ {(it.price * it.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="text-right mt-4 font-bold">Total: R$ {order.total.toFixed(2)}</div>
              </div>

              {/* Ações rápidas simuladas */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/orders')}>Voltar</Button>
                <Button variant="outline"><Truck className="h-4 w-4 mr-2" /> Rastrear envio</Button>
                <Button variant="outline"><CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar entrega</Button>
                <Button variant="destructive"><XCircle className="h-4 w-4 mr-2" /> Cancelar pedido</Button>
              </div>
            </div>
          ) : (
            <p>Pedido não encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
