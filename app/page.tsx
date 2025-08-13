"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Heart, Star, ShoppingCart, Eye, TrendingUp, Award, Users } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  size: string
  quantity: number
  image: string
}

export default function Dashboard() {
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

  const [wishlist, setWishlist] = useState<string[]>([])

  const popularItems = [
    {
      id: "1",
      name: "Monocle Canvas Tote Bag",
      price: 213.99,
      originalPrice: 299.99,
      rating: 4.9,
      reviews: 234,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/The%20Best%20Media%20Tote%20Bags,%20Ranked.jpg-z2O2nGPSTrjey8xEM1cc5aTI2ggjXE.jpeg",
      badge: "Bestseller",
      discount: 29,
    },
    {
      id: "2",
      name: "Square One District Tote",
      price: 189.99,
      originalPrice: 249.99,
      rating: 4.8,
      reviews: 189,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg",
      badge: "New",
      discount: 24,
    },
    {
      id: "3",
      name: "Sporty & Rich Canvas Tote",
      price: 221.99,
      originalPrice: 289.99,
      rating: 4.9,
      reviews: 156,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20(2).jpg-zbeT25jMphcVf4DmpAlTVsGALg88Zn.jpeg",
      badge: "Limited",
      discount: 23,
    },
  ]

  const stats = [
    { label: "Total Orders", value: "1,234", icon: ShoppingCart, change: "+12%" },
    { label: "Happy Customers", value: "5,678", icon: Users, change: "+8%" },
    { label: "Products Sold", value: "9,876", icon: Award, change: "+15%" },
    { label: "Revenue", value: "$45,678", icon: TrendingUp, change: "+23%" },
  ]

  const toggleWishlist = useCallback(
    (itemId: string) => {
      setWishlist((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
      toast({
        title: wishlist.includes(itemId) ? "Removed from wishlist" : "Added to wishlist",
        description: wishlist.includes(itemId) ? "Item removed from your wishlist" : "Item added to your wishlist",
      })
    },
    [wishlist],
  )

  const addToCart = useCallback((item: (typeof popularItems)[0]) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      toast({
        title: "Added to cart! 🛍️",
        description: `${item.name} has been added to your cart.`,
      })
      return [...prevItems, { ...item, quantity: 1, size: "M" }]
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="Hi, Dollar! 👋" subtitle="Welcome back to your dashboard" />

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sage-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-sage-800">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-sage-100 rounded-full">
                    <stat.icon className="h-6 w-6 text-sage-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hero Cards */}
        <div className="mb-12 grid grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-sage-100 to-sage-200 border-0 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-8 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 hover:bg-green-600">BEST OFFERS</Badge>
              </div>
              <h3 className="mb-4 text-3xl font-bold text-sage-800">Tote Bag Collection</h3>
              <p className="mb-6 text-sage-700 text-lg">
                Discover premium quality bags crafted for the modern lifestyle
              </p>
              <Button className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Explore Collection
              </Button>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sage-300/30 rounded-full blur-xl"></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-100 to-orange-200 border-0 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <CardContent className="flex items-center justify-between p-8 relative">
              <div className="z-10">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-3xl font-bold text-orange-800">Flash Sale</h3>
                  <span className="text-2xl animate-bounce-subtle">✨</span>
                </div>
                <p className="text-6xl font-black text-orange-900 mb-6">75% OFF</p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Shop Now!
                </Button>
              </div>
              <div className="relative">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg"
                  alt="Square One District Tote"
                  width={200}
                  height={200}
                  className="object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-300/40 rounded-full blur-xl"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Collection */}
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-3xl font-bold text-sage-800">Popular Collection</h3>
          <Button variant="link" className="text-sage-600 hover:text-sage-800 text-lg">
            View All Products →
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {popularItems.map((item, index) => (
            <Card
              key={item.id}
              className="group border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader className="p-0 relative">
                <div className="absolute top-4 left-4 z-20">
                  <Badge
                    className={`${
                      item.badge === "Bestseller"
                        ? "bg-green-500"
                        : item.badge === "New"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                    } text-white`}
                  >
                    {item.badge}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
                    onClick={() => toggleWishlist(item.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-sage-600"
                      }`}
                    />
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-10" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 opacity-0 transform translate-y-4 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  <Button size="sm" className="bg-white text-sage-800 hover:bg-sage-100 rounded-full shadow-lg">
                    <Eye className="h-4 w-4 mr-2" />
                    Quick View
                  </Button>
                </div>
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-sage-800 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(item.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-sage-600">({item.reviews} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-sage-800">$ {item.price}</p>
                    <p className="text-lg text-gray-400 line-through">$ {item.originalPrice}</p>
                    <Badge variant="destructive" className="text-xs">
                      -{item.discount}%
                    </Badge>
                  </div>
                  <Button
                    className="bg-sage-600 hover:bg-sage-700 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => addToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
