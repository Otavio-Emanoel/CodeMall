"use client"

import { useEffect, useMemo, useState, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Camera, Edit, MapPin, Calendar, Award, ShoppingBag, Heart } from "lucide-react"

function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(""))
    return JSON.parse(jsonPayload)
  } catch { return null }
}

export default function Profile() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [originalAvatar, setOriginalAvatar] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-482Kz4Ro7YXPgsZnttDFsQEmrWQnhG.jpeg",
  })

  // Suporte a upload de avatar/link
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const onPickFile = () => { if (isEditing) fileInputRef.current?.click() }
  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast({ title: 'Selecione uma imagem válida' }); return }
    setAvatarFile(file)
    const preview = URL.createObjectURL(file)
    setProfile(p => ({ ...p, avatar: preview }))
  }

  // Carregar dados reais do usuário e extras locais
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/auth')
      return
    }
    const payload = decodeJwt(token) as { sub?: number | string } | null
    const id = payload?.sub != null ? Number(payload.sub) : null
    if (!id) {
      router.push('/auth')
      return
    }
    setUserId(id)

    async function load() {
      setLoading(true)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
        const res = await fetch(`${base}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Falha ao carregar usuário')
        const raw = await res.json()
        const user = (raw && (raw.data ?? raw.user)) || raw || {}
        // Extras salvos localmente (não usamos mais avatar daqui)
        const extraRaw = localStorage.getItem(`profile-extra:${id}`)
        const extra = extraRaw ? JSON.parse(extraRaw) : {}
        const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''
        const avatar = user.avatar || profile.avatar
        setOriginalAvatar(avatar)
        setProfile((p) => ({
          ...p,
          name: user.name || '',
          email: user.email || '',
          joinDate,
          phone: extra.phone || '',
          location: extra.location || '',
          bio: extra.bio || '',
          avatar,
        }))
      } catch (e) {
        toast({ title: 'Não foi possível carregar seu perfil' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const stats = useMemo(() => ([
    { label: "Orders", value: "-", icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Wishlist", value: "-", icon: Heart, color: "bg-red-500" },
    { label: "Reviews", value: "-", icon: Award, color: "bg-green-500" },
  ]), [])

  const recentOrders = [] as Array<{ id: string; item: string; date: string; status: string; amount: string }>

  async function saveAvatarIfChanged(base: string, token: string) {
    if (!userId) return null
    // Se arquivo selecionado, envia multipart
    if (avatarFile) {
      const fd = new FormData()
      fd.append('file', avatarFile)
      const res = await fetch(`${base}/api/users/${userId}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Falha ao enviar avatar')
      const user = await res.json()
      setOriginalAvatar(user.avatar || '')
      setProfile((p) => ({ ...p, avatar: user.avatar || p.avatar }))
      setAvatarFile(null)
      return user
    }
    // Se mudou e é um link/url, envia JSON { url }
    if (profile.avatar && profile.avatar !== originalAvatar) {
      const res = await fetch(`${base}/api/users/${userId}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: profile.avatar }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar avatar')
      const user = await res.json()
      setOriginalAvatar(user.avatar || '')
      setProfile((p) => ({ ...p, avatar: user.avatar || p.avatar }))
      return user
    }
    return null
  }

  async function onSave() {
    if (!userId) return
    const token = localStorage.getItem('token') || ''
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
    try {
      // Atualiza name/email no backend
      const res = await fetch(`${base}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Falha ao salvar')
      }

      // Salva avatar no backend se mudou
      await saveAvatarIfChanged(base, token)

      // Salva extras localmente (sem avatar)
      localStorage.setItem(`profile-extra:${userId}`, JSON.stringify({
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
      }))

      // Notifica outras partes da UI (Header) para recarregar avatar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile-avatar-updated'))
      }
      toast({ title: 'Perfil atualizado com sucesso' })
      setIsEditing(false)
    } catch (e: any) {
      toast({ title: 'Não foi possível salvar', description: String(e?.message || '') })
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="Meu Perfil" subtitle="Gerencie suas informações e preferências" />

        {loading ? (
          <div className="text-sage-600">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <Avatar className="w-32 h-32 ring-4 ring-sage-200">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                      <AvatarFallback className="text-2xl bg-sage-100 text-sage-700">{(profile.name || 'U').slice(0,1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      disabled={!isEditing}
                      className="absolute bottom-0 right-0 rounded-full bg-sage-600 hover:bg-sage-700 shadow-lg"
                      onClick={onPickFile}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Controles de avatar durante edição */}
                  {isEditing && (
                    <div className="mt-2 space-y-2 text-left">
                      <Label htmlFor="avatarUrl" className="text-sage-700">URL da foto</Label>
                      <Input
                        id="avatarUrl"
                        placeholder="https://... ou /uploads/arquivo.jpg"
                        value={profile.avatar}
                        onChange={(e) => { setAvatarFile(null); setProfile({ ...profile, avatar: e.target.value }) }}
                        className="border-sage-200 focus:border-sage-400"
                      />
                      <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onPickFile}>Importar imagem</Button>
                        <span className="text-xs text-sage-500">Aceita JPG, PNG, WEBP</span>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelected} className="hidden" />
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-sage-800 mb-2">{profile.name || '—'}</h2>
                  <p className="text-sage-600 mb-4">{profile.email || '—'}</p>

                  {profile.location && (
                    <div className="flex items-center justify-center gap-2 text-sage-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.joinDate && (
                    <div className="flex items-center justify-center gap-2 text-sage-600 mb-6">
                      <Calendar className="h-4 w-4" />
                      <span>Membro desde {profile.joinDate}</span>
                    </div>
                  )}

                  {profile.bio && <p className="text-sage-700 text-sm mb-6">{profile.bio}</p>}

                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-sage-800">{stat.value}</p>
                        <p className="text-xs text-sage-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl text-sage-800">Informações pessoais</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-sage-300 text-sage-700 hover:bg-sage-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancelar" : "Editar perfil"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sage-700">Nome completo</Label>
                      <Input id="name" value={profile.name} disabled={!isEditing} className="border-sage-200 focus:border-sage-400" onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sage-700">Email</Label>
                      <Input id="email" type="email" value={profile.email} disabled={!isEditing} className="border-sage-200 focus:border-sage-400" onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sage-700">Telefone</Label>
                      <Input id="phone" value={profile.phone} disabled={!isEditing} className="border-sage-200 focus:border-sage-400" onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sage-700">Localização</Label>
                      <Input id="location" value={profile.location} disabled={!isEditing} className="border-sage-200 focus:border-sage-400" onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sage-700">Bio</Label>
                    <Textarea id="bio" value={profile.bio} disabled={!isEditing} className="border-sage-200 focus:border-sage-400 min-h-[100px]" onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                  </div>
                  {isEditing && (
                    <div className="flex gap-4">
                      <Button className="bg-sage-600 hover:bg-sage-700" onClick={onSave}>Salvar alterações</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-sage-800">Últimos pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                      <div className="text-sage-600">Você ainda não possui pedidos.</div>
                    ) : recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sage-800">{order.item}</p>
                          <p className="text-sm text-sage-600">Pedido #{order.id} • {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sage-800">{order.amount}</p>
                          <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
