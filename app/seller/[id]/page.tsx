"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Star, Package, ShoppingCart, User, Plus, ArrowLeft } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [authUser, setAuthUser] = useState<UserRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productImages, setProductImages] = useState<Record<number, string>>({});

  // Estado do modal de novo produto
  const [openAdd, setOpenAdd] = useState(false);
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Carrega usuário autenticado (se houver)
  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) return; // silencioso
        if (mounted) setAuthUser(data?.user || null);
      } catch {}
    }
    loadMe();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        // Seller info
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

  // Helper para normalizar URL de imagens da API (ex.: /uploads/xyz)
  function normalizeUrl(u?: string) {
    if (!u) return ''
    if (u.startsWith('http')) return u
    if (u.startsWith('/')) return `${API_URL}${u}`
    return u
  }

  // Carrega a primeira imagem de cada produto
  useEffect(() => {
    let cancelled = false
    async function loadImages() {
      const missing = products.filter(p => !(p.id in productImages))
      if (missing.length === 0) return
      try {
        const results = await Promise.allSettled(
          missing.map(async (p) => {
            const res = await fetch(`${API_URL}/api/products/${p.id}/images`)
            const data = await res.json().catch(() => ({}))
            const list = Array.isArray(data?.data) ? data.data : []
            const first = list[0]
            return [p.id, first ? normalizeUrl(first.url) : ''] as [number, string]
          })
        )
        if (cancelled) return
        const next: Record<number, string> = { ...productImages }
        for (const r of results) {
          if (r.status === 'fulfilled') {
            const [id, url] = r.value
            if (url) next[id] = url
          }
        }
        setProductImages(next)
      } catch {
        // silencioso
      }
    }
    loadImages()
    return () => { cancelled = true }
  }, [products, productImages])

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalSales = sales.length;
    const avgRating = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) : 0;
    return { totalProducts, totalSales, avgRating: Math.round(avgRating * 10) / 10 };
  }, [products, sales, reviews]);

  const isOwnerOrAdmin = !!(authUser && (authUser.role === 'admin' || (authUser.role === 'seller' && Number(authUser.id) === sellerId)));

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    if (!pName.trim() || !pType.trim() || !pPrice.trim()) {
      setCreateError('Nome, Tipo e Preço são obrigatórios');
      return;
    }
    const priceNum = parseFloat(pPrice.replace(',', '.'));
    if (Number.isNaN(priceNum)) {
      setCreateError('Preço inválido');
      return;
    }
    try {
      setCreating(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Usuário não autenticado');
      const body = { name: pName.trim(), type: pType.trim(), category: pCategory.trim() || null, price: priceNum };
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao criar produto');
      const created: ProductRow = data;

      // opcional imagem via URL
      if (pImageUrl.trim()) {
        try {
          const imgRes = await fetch(`${API_URL}/api/products/${created.id}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ filename: pImageUrl.split('/').pop() || 'image', url: pImageUrl.trim() })
          });
          await imgRes.json().catch(() => ({}));
        } catch {}
      }

      setProducts(prev => [created, ...prev]);
      toast({ title: 'Produto criado', description: 'Seu produto foi adicionado com sucesso.' });
      setOpenAdd(false);
      setPName('');
      setPType('');
      setPCategory('');
      setPPrice('');
      setPImageUrl('');
    } catch (e: any) {
      setCreateError(e?.message || 'Erro ao criar produto');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sage-800 flex items-center gap-3">
              <User className="h-8 w-8 text-sage-700" />
              {seller?.name || 'Vendedor'}
            </h1>
            <p className="text-sage-600">Perfil do vendedor • ID #{sellerId}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
            </Button>
            {isOwnerOrAdmin && (
              <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex items-center gap-2"><Plus className="h-4 w-4" /> Novo produto</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Novo Produto</DialogTitle>
                    <DialogDescription>Preencha os dados para adicionar um produto.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="pName">Nome *</Label>
                        <Input id="pName" value={pName} onChange={e => setPName(e.target.value)} placeholder="Ex: Gerenciamento de Estoque" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pType">Tipo *</Label>
                        <Input id="pType" value={pType} onChange={e => setPType(e.target.value)} placeholder="Ex: SaaS" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pCategory">Categoria</Label>
                        <Input id="pCategory" value={pCategory} onChange={e => setPCategory(e.target.value)} placeholder="Ex: Aplicativo Web" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pPrice">Preço (R$) *</Label>
                        <Input id="pPrice" type="number" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="0.00" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="pImageUrl">URL da imagem (opcional)</Label>
                        <Input id="pImageUrl" value={pImageUrl} onChange={e => setPImageUrl(e.target.value)} placeholder="https://..." />
                      </div>
                    </div>
                    {createError && <p className="text-sm text-red-600">{createError}</p>}
                    <DialogFooter className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancelar</Button>
                      <Button type="submit" disabled={creating}>{creating ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
                        <Link href={`/product/${p.id}`} className="block">
                          <div className="relative h-40 w-full">
                            <Image src={productImages[p.id] || "/placeholder.jpg"} alt={p.name} fill className="object-cover" />
                          </div>
                        </Link>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sage-800 line-clamp-1">{p.name}</h4>
                            {p.category && <Badge variant="secondary">{p.category}</Badge>}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sage-700">{p.type}</span>
                            <span className="font-bold text-sage-900">R$ {Number(p.price).toFixed(2)}</span>
                          </div>
                          <Button asChild className="w-full mt-2" variant="outline">
                            <Link href={`/product/${p.id}`}>Ver detalhes</Link>
                          </Button>
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
