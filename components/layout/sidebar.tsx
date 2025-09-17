"use client"

import { useCallback, useEffect, useState } from "react"
import { Home, LogOut, Mail, Settings, ShoppingBag, User2, Heart, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
	{ name: "Dashboard", href: "/", icon: Home },
	{ name: "Profile", href: "/profile", icon: User2 },
	{ name: "Orders", href: "/orders", icon: Package },
	{ name: "My Cart", href: "/cart", icon: ShoppingBag },
]

function decodeJwt(token: string): any | null {
	try {
		const base64Url = token.split(".")[1]
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
		const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(""))
		return JSON.parse(jsonPayload)
	} catch { return null }
}

export function Sidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const [isAuth, setIsAuth] = useState(false)

	useEffect(() => {
		const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
		setIsAuth(!!t)
	}, [])

	const handleLogout = useCallback(() => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('token')
		}
		router.push('/auth')
	}, [router])

	const items = isAuth ? navigation : navigation.filter(n => n.name === 'Dashboard')

	return (
		<aside className="w-64 border-r border-sage-200 bg-gradient-to-b from-cream-50 to-sage-50 px-6 py-8">
			<div className="mb-8">
				<Image
					src="/icon.png"
					alt="CodeMall"
					width={150}
					height={40}
					className="h-10 w-auto"
				/>
			</div>
			<nav className="space-y-2">
				{items.map((item) => {
					const isActive = pathname === item.href
					return (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105",
								isActive
									? "bg-sage-600 text-white shadow-lg shadow-sage-600/25"
									: "text-sage-700 hover:bg-sage-100 hover:text-sage-800",
							)}
						>
							<item.icon className="h-5 w-5" />
							{item.name}
						</Link>
					)
				})}
				<div className="pt-4">
					{isAuth ? (
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:scale-105"
						>
							<LogOut className="h-5 w-5" />
							Logout
						</button>
					) : (
						<button
							onClick={() => router.push('/auth')}
							className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sage-700 transition-all duration-200 hover:bg-sage-100 hover:scale-105"
						>
							<User2 className="h-5 w-5" />
							Entrar / Cadastrar
						</button>
					)}
				</div>
			</nav>
		</aside>
	)
}
