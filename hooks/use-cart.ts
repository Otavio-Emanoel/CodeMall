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

  const save = useCallback((next: CartItem[]) => {
    setItems(next)
    writeStorage(next)
  }, [])

  const addItem = useCallback(async (p: { productId: number; name: string; price: number; image?: string; sellerId?: number | null }) => {
    setItems(prevItems => {
      const existing = prevItems.find(i => i.productId === p.productId)
      let next: CartItem[]
      if (existing) {
        next = prevItems.map(i => i.productId === p.productId ? { ...i, quantity: i.quantity + 1 } : i)
      } else {
        next = [...prevItems, { productId: p.productId, name: p.name, price: p.price, image: p.image, quantity: 1, sellerId: p.sellerId ?? null }]
      }
      writeStorage(next)
      return next
    })
    if (userId) {
      try {
        await fetch(`${API_URL}/api/cart/add`, {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId: p.productId, name: p.name, price: p.price, quantity: 1, image: p.image, sellerId: p.sellerId })
        })
      } catch {}
    }
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
