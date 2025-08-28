"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Star, Package, ShoppingCart, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

type UserRow = { id: number; name: string; role: 'buyer'|'seller'|'admin'; email?: string };

type ProductRow = {
  id: number;
  name: string;
  type: string;
  category?: string | null;
  price: number;
  seller_id?: number | null;
  created_at: string;
};

type Order = { id: string|number; buyerId: number; sellerIds?: number[]; status: string; total: number; createdAt?: string };

type Review = { id: number; userId: number; targetType: 'product' | 'seller'; targetId: number; rating: number; comment?: string; createdAt: string };

export default function SellerProfilePage() {
  const params = useParams<{ id: string }>();
  const sellerId = Number(params?.id);
  const { toast } = useToast();

  const [tab, setTab] = useState<'products' | 'sales' | 'reviews'>('products');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [seller, setSeller] = useState<UserRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        // Seller info (precisa ser o próprio usuário ou admin)
        // @ts-ignore
        const uRes = await fetch(`${API_URL}/api/users/${sellerId}`, { headers: authHeaders });
        const uData = await uRes.json();
        if (!uRes.ok) throw new Error(uData?.error || 'Falha ao carregar vendedor');
        if (mounted) setSeller(uData);
        
        // Products of seller
        const pRes = await fetch(`${API_URL}/api/products?sellerId=${sellerId}`);
        const pData = await pRes.json();
        if (!pRes.ok) throw new Error(pData?.error || 'Falha ao carregar produtos');
        if (mounted) setProducts(pData?.data || []);
        
        // Sales (orders) of seller
        const sRes = await fetch(`${API_URL}/api/orders/mine/list?userId=${sellerId}&role=seller`, {
            // @ts-ignore
          headers: authHeaders,
        });
        const sData = await sRes.json();
        if (!sRes.ok) throw new Error(sData?.error || 'Falha ao carregar vendas');
        if (mounted) setSales(Array.isArray(sData?.data) ? sData.data : sData);

        // Reviews about seller
        const rRes = await fetch(`${API_URL}/api/reviews?targetType=seller&targetId=${sellerId}`);
        const rData = await rRes.json();
        if (!rRes.ok) throw new Error(rData?.error || 'Falha ao carregar avaliações');
        if (mounted) setReviews(Array.isArray(rData?.data) ? rData.data : rData);
      } catch (e: any) {
        setError(e?.message || 'Erro inesperado');
        toast({ title: 'Erro', description: e?.message || 'Falha ao carregar dados', variant: 'destructive' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (Number.isFinite(sellerId)) load();
    return () => { mounted = false };
  }, [sellerId, toast]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalSales = sales.length;
    const avgRating = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) : 0;
    return { totalProducts, totalSales, avgRating: Math.round(avgRating * 10) / 10 };
  }, [products, sales, reviews]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <main className="flex-1 px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sage-800 flex items-center gap-3">
            <User className="h-8 w-8 text-sage-700" />
            {seller?.name || 'Vendedor'}
          </h1>
          <p className="text-sage-600">Perfil do vendedor • ID #{sellerId}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Produtos</p>
                <p className="text-2xl font-bold text-sage-800">{stats.totalProducts}</p>
              </div>
              <Package className="h-6 w-6 text-sage-700" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Vendas</p>
                <p className="text-2xl font-bold text-sage-800">{stats.totalSales}</p>
              </div>
              <ShoppingCart className="h-6 w-6 text-sage-700" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-sage-600">Avaliação média</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-sage-800">{stats.avgRating}</p>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <Star className="h-6 w-6 text-yellow-500" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-sage-800">Loja de {seller?.name || 'Vendedor'}</CardTitle>
            <CardDescription>Veja os produtos, vendas e avaliações deste vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="sales">Vendas</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="pt-6">
                {loading ? (
                  <p className="text-sage-600">Carregando produtos...</p>
                ) : products.length === 0 ? (
                  <p className="text-sage-600">Nenhum produto encontrado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((p) => (
                      <Card key={p.id} className="border-0 bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="relative h-40 w-full">
                          <Image src={"/placeholder.jpg"} alt={p.name} fill className="object-cover" />
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sage-800 line-clamp-1">{p.name}</h4>
                            {p.category && <Badge variant="secondary">{p.category}</Badge>}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sage-700">{p.type}</span>
                            <span className="font-bold text-sage-900">R$ {Number(p.price).toFixed(2)}</span>
                          </div>
                          <Button className="w-full mt-2" variant="outline">Ver detalhes</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sales" className="pt-6">
                {loading ? (
                  <p className="text-sage-600">Carregando vendas...</p>
                ) : sales.length === 0 ? (
                  <p className="text-sage-600">Nenhuma venda encontrada.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((s) => (
                        <TableRow key={String(s.id)}>
                          <TableCell>#{s.id}</TableCell>
                          <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                          <TableCell>R$ {Number(s.total || 0).toFixed(2)}</TableCell>
                          <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="pt-6">
                {loading ? (
                  <p className="text-sage-600">Carregando avaliações...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sage-600">Ainda não há avaliações para este vendedor.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <Card key={r.id} className="border-0 bg-sage-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.round(r.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-sage-600 text-sm">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          {r.comment && <p className="mt-2 text-sage-800">{r.comment}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
