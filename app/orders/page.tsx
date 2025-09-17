"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

type OrderStatus = 'em_andamento' | 'entregue' | 'cancelado'
interface OrderItem { productId: number; sellerId: number; name?: string; price: number; quantity: number }
interface Order { id: string; buyerId: number; items: OrderItem[]; total: number; status: OrderStatus; createdAt: string }
interface AuthUser { id: number; role: 'buyer'|'seller'|'admin'; email?: string }

function decodeJwt(token: string): any | null {
  try { const p = token.split('.')[1]; const b = p.replace(/-/g,'+').replace(/_/g,'/'); return JSON.parse(atob(b)); } catch { return null }
}

export default function OrdersPage() {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all'|OrderStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Load auth from token (client only)
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!t) { setAuth(null); return }
    const payload = decodeJwt(t)
    if (payload?.sub && payload?.role) setAuth({ id: Number(payload.sub), role: payload.role })
  }, [])

  const loadOrders = useCallback(async (u: AuthUser) => {
    setLoading(true); setError('')
    try {
      const q = new URLSearchParams({ userId: String(u.id), role: u.role === 'seller' ? 'seller' : 'buyer' })
      const res = await fetch(`${API_URL}/api/orders/mine/list?${q.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao carregar pedidos')
      const list: Order[] = Array.isArray(data) ? data : data
      setOrders(list)
    } catch (e: any) {
      setOrders([]); setError(e?.message || 'Erro ao carregar')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (auth?.id) loadOrders(auth) }, [auth, loadOrders])

  const filtered = useMemo(() => statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter), [orders, statusFilter])

  function statusBadge(st: OrderStatus) {
    if (st === 'em_andamento') return <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">Em andamento</Badge>
    if (st === 'entregue') return <Badge className="bg-green-100 text-green-800" variant="secondary">Entregue</Badge>
    return <Badge className="bg-red-100 text-red-800" variant="secondary">Cancelado</Badge>
  }

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar')
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: data.status } : o))
      toast({ title: 'Status atualizado', description: `Pedido ${id} agora está ${status}` })
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Erro ao atualizar' })
    } finally { setUpdatingId(null) }
  }

  return (
    <div className="min-h-[70vh] w-full px-6 py-8">
      <div className="mb-4">
        <Button variant="ghost" className="flex items-center gap-2 px-2" onClick={() => window.location.href = '/'}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Meus pedidos</CardTitle>
          <CardDescription>
            {auth?.role === 'seller' ? 'Pedidos das suas vendas' : 'Todos os pedidos que você realizou'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm" variant={statusFilter==='all' ? 'default':'outline'} onClick={()=>setStatusFilter('all')}>Todos ({orders.length})</Button>
            <Button size="sm" variant={statusFilter==='em_andamento' ? 'default':'outline'} onClick={()=>setStatusFilter('em_andamento')}>Em andamento ({orders.filter(o=>o.status==='em_andamento').length})</Button>
            <Button size="sm" variant={statusFilter==='entregue' ? 'default':'outline'} onClick={()=>setStatusFilter('entregue')}>Entregues ({orders.filter(o=>o.status==='entregue').length})</Button>
            <Button size="sm" variant={statusFilter==='cancelado' ? 'default':'outline'} onClick={()=>setStatusFilter('cancelado')}>Cancelados ({orders.filter(o=>o.status==='cancelado').length})</Button>
            <div className="ml-auto flex gap-2 text-xs text-sage-600 items-center">
              <Package className="h-4 w-4" /><span>Total itens nas vendas/compras: {orders.reduce((a,o)=>a+o.items.reduce((s,i)=>s+i.quantity,0),0)}</span>
            </div>
          </div>

          {loading ? (
            <p className="text-sage-600">Carregando...</p>
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : !filtered.length ? (
            <p className="text-sage-600">Nenhum pedido encontrado.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    {auth?.role==='seller' && <TableHead>Comprador</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Itens</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Criado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(o => (
                    <TableRow key={o.id} className="cursor-pointer hover:bg-sage-50" onClick={()=>router.push(`/orders/${o.id}`)}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      {auth?.role==='seller' && <TableCell>#{o.buyerId}</TableCell>}
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-right">{o.items.reduce((a,i)=>a+i.quantity,0)}</TableCell>
                      <TableCell className="text-right">R$ {o.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs">{new Date(o.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={e=>e.stopPropagation()}>
                          {auth?.role !== 'buyer' && o.status==='em_andamento' && (
                            <Button size="sm" variant="outline" disabled={updatingId===o.id} onClick={()=>updateStatus(o.id,'entregue')}><CheckCircle2 className="h-4 w-4 mr-1"/>Entregar</Button>
                          )}
                          {o.status==='em_andamento' && (
                            <Button size="sm" variant="destructive" disabled={updatingId===o.id} onClick={()=>updateStatus(o.id,'cancelado')}><XCircle className="h-4 w-4 mr-1"/>Cancelar</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
