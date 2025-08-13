"use client"

import { Bell, Home, LogOut, Mail, Search, Settings, ShoppingBag, User2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  size: string
  quantity: number
  image: string
}

export default function Component() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Monocle Canvas Tote Bag",
      price: 213.99,
      size: "L",
      quantity: 1,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/The%20Best%20Media%20Tote%20Bags,%20Ranked.jpg-z2O2nGPSTrjey8xEM1cc5aTI2ggjXE.jpeg",
    },
    {
      id: "2",
      name: "Square One District Tote",
      price: 189.99,
      size: "M",
      quantity: 1,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg",
    },
  ])

  const popularItems = [
    {
      id: "1",
      name: "Monocle Canvas Tote Bag",
      price: 213.99,
      rating: 4.9,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/The%20Best%20Media%20Tote%20Bags,%20Ranked.jpg-z2O2nGPSTrjey8xEM1cc5aTI2ggjXE.jpeg",
    },
    {
      id: "2",
      name: "Square One District Tote",
      price: 189.99,
      rating: 4.9,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg",
    },
    {
      id: "3",
      name: "Sporty & Rich Canvas Tote",
      price: 221.99,
      rating: 4.9,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20(2).jpg-zbeT25jMphcVf4DmpAlTVsGALg88Zn.jpeg",
    },
  ]

  const updateQuantity = useCallback((itemId: string, change: number) => {
    setCartItems(
      (prevItems) =>
        prevItems
          .map((item) => {
            if (item.id === itemId) {
              const newQuantity = Math.max(0, item.quantity + change)
              if (newQuantity === 0) {
                toast({
                  title: "Item removed",
                  description: `${item.name} has been removed from your cart.`,
                })
                return null
              }
              return { ...item, quantity: newQuantity }
            }
            return item
          })
          .filter(Boolean) as CartItem[],
    )
  }, [])

  const addToCart = useCallback((item: (typeof popularItems)[0]) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      toast({
        title: "Item added to cart",
        description: `${item.name} has been added to your cart.`,
      })
      return [...prevItems, { ...item, quantity: 1, size: "M" }]
    })
  }, [])

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [])

  const cartTotal = calculateTotal(cartItems)

  return (
    <div className="flex min-h-screen bg-[#fcfdfd]">
      {/* Sidebar */}
      <aside className="w-64 border-r px-6 py-8">
        <div className="mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fs-OQzXWiKsdo0mSCzNZyZmZHXxrCi0Bp.png"
            alt="Fashion Store"
            width={150}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <nav className="space-y-6">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg bg-[#e0e5ce] px-3 py-2 text-[#415444] transition-colors"
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <User2 className="h-5 w-5" />
            Profile
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <Mail className="h-5 w-5" />
            Message
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <ShoppingBag className="h-5 w-5" />
            My Cart
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <User2 className="h-5 w-5" />
            Support
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-red-500 transition-colors hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">
              Hi, Dollar! <span className="ml-1">👋</span>
            </h2>
            <p className="text-gray-500">Welcome Back</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="w-64 pl-10" placeholder="Search destination" />
            </div>
            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-482Kz4Ro7YXPgsZnttDFsQEmrWQnhG.jpeg"
                alt="User avatar"
              />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="mb-12 grid grid-cols-2 gap-6">
          <Card className="bg-[#e0e5ce] border-0 rounded-[24px]">
            <CardContent className="p-6">
              <p className="mb-2 text-sm font-medium uppercase text-[#338838]">BEST OFFERS</p>
              <h3 className="mb-4 text-2xl font-semibold">Tote Bag Collection</h3>
              <p className="mb-6 text-gray-600">Join and discover the best product according to your passion</p>
              <Button className="bg-[#415444] hover:bg-[#415444]/90">See More</Button>
            </CardContent>
          </Card>
          <Card className="bg-[#e7ddd1] border-0 rounded-[24px]">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="mb-4 text-3xl font-semibold">Flash Sale ✨</h3>
                <p className="mb-6 text-5xl font-bold">75% OFF</p>
                <Button className="bg-[#415444] hover:bg-[#415444]/90">Buy Now!</Button>
              </div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg"
                alt="Square One District Tote"
                width={200}
                height={200}
                className="object-contain"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Popular Collection</h3>
          <Button variant="link">See All</Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {popularItems.map((item) => (
            <Card
              key={item.id}
              className="group border-0 bg-[#e0e5ce] rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="p-0 relative">
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 z-10" />
                <Button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 transform scale-95 transition-all group-hover:opacity-100 group-hover:scale-100 bg-white text-black hover:bg-white/90">
                  Quick View
                </Button>
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-1 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({item.rating})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#338838] text-xl font-semibold">$ {item.price}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full hover:bg-[#415444] hover:text-white transition-colors"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <aside className="w-96 border-l px-8 py-8 flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">My Cart</h3>
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-2">
            <span className="sr-only">Back</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 19L8 12L15 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>

        <div className="space-y-8 flex-grow overflow-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-6 bg-white rounded-3xl p-4 shadow-sm">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={100}
                height={100}
                className="h-[100px] w-[100px] rounded-2xl bg-[#e0e5ce] object-cover"
              />
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <p className="text-sm text-[#338838] mt-1">SIZE {item.size}</p>
                    <p className="font-semibold mt-2">$ {item.price}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, -item.quantity)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-4 bg-[#f7f7f7] rounded-full px-4 py-1">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between text-base">
            <p className="text-gray-600">Sub Total</p>
            <p className="font-semibold">$ {cartTotal.toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between text-base">
            <p className="text-gray-600">Shipping</p>
            <p className="text-[#338838]">FREE</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-semibold">
            <p>Total</p>
            <p>$ {cartTotal.toFixed(2)}</p>
          </div>
          <Button className="w-full bg-[#415444] hover:bg-[#415444]/90 rounded-2xl h-14 text-lg font-semibold mt-4">
            Checkout
          </Button>
        </div>
      </aside>
    </div>
  )
}
