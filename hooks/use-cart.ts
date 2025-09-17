"use client";
import { useCallback, useEffect, useState } from 'react'

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  sellerId?: number | null
}

const STORAGE_KEY = 'cart'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

function readStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter(it => typeof it?.productId === 'number' && typeof it?.price === 'number' && typeof it?.quantity === 'number')
  } catch { return [] }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('cart_updated'))
}

function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(jsonPayload)
  } catch { return null }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readStorage())
  const [userId, setUserId] = useState<number | null>(null)
  const [loadingSync, setLoadingSync] = useState(false)

  // load user id from token
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem('token')
    if (!t) { setUserId(null); return }
    const payload = decodeJwt(t)
    const id = Number(payload?.sub)
    if (Number.isFinite(id)) setUserId(id); else setUserId(null)
  }, [])

  // sync from backend when userId available
  useEffect(() => {
    async function fetchRemote() {
      if (!userId) return
      try {
        setLoadingSync(true)
        const res = await fetch(`${API_URL}/api/cart?userId=${userId}`)
        const data = await res.json().catch(() => ({}))
        if (Array.isArray(data?.items)) {
          setItems(data.items)
          writeStorage(data.items)
        }
      } catch {} finally { setLoadingSync(false) }
    }
    fetchRemote()
  }, [userId])

  // sync across tabs / custom event
  useEffect(() => {
    function handler() { setItems(readStorage()) }
    window.addEventListener('storage', handler)
    window.addEventListener('cart_updated', handler as any)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('cart_updated', handler as any)
    }
  }, [])

  // detectar login depois de adicionar itens localmente: mesclar
  useEffect(() => {
    async function mergeAfterLogin() {
      if (!userId) return
      try {
        const res = await fetch(`${API_URL}/api/cart?userId=${userId}`)
        const remote = await res.json().catch(()=>({}))
        const remoteItems: CartItem[] = Array.isArray(remote?.items) ? remote.items : []
        // Se remoto vazio e local tem itens -> enviar local
        if (remoteItems.length === 0 && items.length > 0) {
          await fetch(`${API_URL}/api/cart/set`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ userId, items })
          })
          return
        }
        // Se remoto tem itens e local vazio -> salvar remoto local
        if (remoteItems.length > 0 && items.length === 0) {
          setItems(remoteItems); writeStorage(remoteItems); return
        }
        // Se ambos tem itens: manter o maior quantity por productId
        if (remoteItems.length > 0 && items.length > 0) {
          const map: Record<number, CartItem> = {}
          for (const it of remoteItems) map[it.productId] = { ...it }
          for (const it of items) {
            if (!map[it.productId]) map[it.productId] = { ...it }
            else map[it.productId].quantity = Math.max(map[it.productId].quantity, it.quantity)
          }
          const merged = Object.values(map)
          await fetch(`${API_URL}/api/cart/set`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ userId, items: merged })
          })
          setItems(merged); writeStorage(merged)
        }
      } catch {}
    }
    mergeAfterLogin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const save = useCallback((next: CartItem[]) => {
    setItems(next)
    writeStorage(next)
  }, [])

  const addItem = useCallback(async (p: { productId: number; name: string; price: number; image?: string; sellerId?: number | null; quantity?: number }) => {
    const qty = Math.max(1, p.quantity || 1)
    let updated: CartItem[] = []
    setItems(prevItems => {
      const existing = prevItems.find(i => i.productId === p.productId)
      if (existing) {
        updated = prevItems.map(i => i.productId === p.productId ? { ...i, quantity: i.quantity + qty } : i)
      } else {
        updated = [...prevItems, { productId: p.productId, name: p.name, price: Number(p.price), image: p.image, quantity: qty, sellerId: p.sellerId ?? null }]
      }
      writeStorage(updated)
      return updated
    })
    if (userId) {
      try {
        const payload = { userId, productId: p.productId, name: p.name, price: Number(p.price), quantity: qty, image: p.image, sellerId: p.sellerId }
        console.debug('[cart] POST /api/cart/add payload', payload)
        const res = await fetch(`${API_URL}/api/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        })
        const dj = await res.json().catch(()=>({}))
        console.debug('[cart] /add response', res.status, dj)
        if (res.ok && Array.isArray(dj.items)) {
          setItems(dj.items)
          writeStorage(dj.items)
        } else {
          console.warn('[cart] /add fallback -> /set')
          await fetch(`${API_URL}/api/cart/set`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ userId, items: updated }) })
        }
      } catch (e) {
        console.error('[cart] addItem error', e)
        setTimeout(async () => {
          try {
            const r2 = await fetch(`${API_URL}/api/cart?userId=${userId}`)
            const dj2 = await r2.json().catch(()=>({}))
            if (Array.isArray(dj2.items)) { setItems(dj2.items); writeStorage(dj2.items) }
          } catch {}
        }, 1200)
      }
    }
    return true
  }, [userId])

  const removeItem = useCallback(async (productId: number) => {
    save(items.filter(i => i.productId !== productId))
    if (userId) {
      try { await fetch(`${API_URL}/api/cart/remove`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, productId }) }) } catch {}
    }
  }, [items, save, userId])

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity < 1) quantity = 1
    save(items.map(i => i.productId === productId ? { ...i, quantity } : i))
    if (userId) {
      try { await fetch(`${API_URL}/api/cart/update`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, productId, quantity }) }) } catch {}
    }
  }, [items, save, userId])

  const clear = useCallback(async () => {
    save([])
    if (userId) {
      try { await fetch(`${API_URL}/api/cart/clear`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }) } catch {}
    }
  }, [userId, save])

  const totalItems = items.reduce((a, i) => a + i.quantity, 0)
  const totalPrice = items.reduce((a, i) => a + i.price * i.quantity, 0)

  return { items, addItem, removeItem, updateQuantity, clear, totalItems, totalPrice, userId, loadingSync }
}
