"use client"

import { useState } from "react"
import Image from "next/image"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Star, ShoppingCart, Truck, Shield, RotateCcw, Award, Plus, Minus } from "lucide-react"

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("M")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const product = {
    id: "1",
    name: "Monocle Canvas Tote Bag",
    price: 213.99,
    originalPrice: 299.99,
    discount: 29,
    rating: 4.9,
    reviews: 234,
    description:
      "Crafted from premium canvas with leather accents, this tote bag combines style and functionality. Perfect for daily use, work, or travel. Features multiple compartments and a secure zip closure.",
    features: [
      "Premium canvas construction",
      "Genuine leather handles and trim",
      "Multiple interior compartments",
      "Secure zip closure",
      'Dimensions: 15" x 12" x 5"',
      "Sustainable materials",
    ],
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/The%20Best%20Media%20Tote%20Bags,%20Ranked.jpg-z2O2nGPSTrjey8xEM1cc5aTI2ggjXE.jpeg",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20(2).jpg-zbeT25jMphcVf4DmpAlTVsGALg88Zn.jpeg",
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    badge: "Bestseller",
  }

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      date: "Dec 10, 2023",
      comment: "Absolutely love this tote! The quality is exceptional and it fits everything I need for work.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 5,
      date: "Dec 8, 2023",
      comment: "Great bag, very sturdy and stylish. The leather handles are a nice touch.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emma Wilson",
      rating: 4,
      date: "Dec 5, 2023",
      comment: "Beautiful bag, exactly as described. Fast shipping too!",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const benefits = [
    { icon: Truck, title: "Free Shipping", description: "On orders over $100" },
    { icon: RotateCcw, title: "30-Day Returns", description: "Easy returns & exchanges" },
    { icon: Shield, title: "2-Year Warranty", description: "Quality guarantee" },
    { icon: Award, title: "Premium Quality", description: "Handcrafted materials" },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="Product Details" subtitle="Discover our premium tote bag collection" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-500 text-white">{product.badge}</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="destructive">-{product.discount}%</Badge>
              </div>
            </div>
            <div className="flex gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-sage-600 scale-105" : "border-sage-200 hover:border-sage-400"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-sage-800 mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sage-600">({product.reviews} reviews)</span>
                </div>
                <Badge className={product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-sage-800">${product.price}</span>
                <span className="text-2xl text-gray-400 line-through">${product.originalPrice}</span>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-sage-800 mb-3">Size</h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={`w-12 h-12 rounded-full ${
                      selectedSize === size
                        ? "bg-sage-600 hover:bg-sage-700"
                        : "border-sage-300 text-sage-700 hover:bg-sage-50"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-sage-800 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-sage-300 rounded-full">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 bg-sage-600 hover:bg-sage-700 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="w-14 h-14 rounded-full border-sage-300 hover:bg-sage-50 bg-transparent"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-sage-600"}`} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                  <div className="p-2 bg-sage-100 rounded-full">
                    <benefit.icon className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sage-800 text-sm">{benefit.title}</p>
                    <p className="text-sage-600 text-xs">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-sage-800 mb-6">Product Details</h3>
              <p className="text-sage-700 mb-6 leading-relaxed">{product.description}</p>
              <h4 className="text-lg font-semibold text-sage-800 mb-4">Features</h4>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sage-700">
                    <div className="w-2 h-2 bg-sage-600 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-sage-800 mb-6">Customer Reviews</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-sage-100 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                        <AvatarFallback className="bg-sage-100 text-sage-700">
                          {review.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sage-800">{review.name}</h4>
                          <span className="text-sm text-sage-600">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sage-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
