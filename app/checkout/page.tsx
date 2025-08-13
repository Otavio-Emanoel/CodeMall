"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { CreditCard, Truck, MapPin, Lock, Gift } from "lucide-react"

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [shippingMethod, setShippingMethod] = useState("standard")

  const cartItems = [
    {
      id: "1",
      name: "Monocle Canvas Tote Bag",
      price: 213.99,
      quantity: 1,
      size: "L",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/The%20Best%20Media%20Tote%20Bags,%20Ranked.jpg-z2O2nGPSTrjey8xEM1cc5aTI2ggjXE.jpeg",
    },
    {
      id: "2",
      name: "Square One District Tote",
      price: 189.99,
      quantity: 1,
      size: "M",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg",
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = shippingMethod === "express" ? 15.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="Checkout" subtitle="Complete your purchase" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-sage-800">
                  <MapPin className="h-6 w-6" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" className="border-sage-200 focus:border-sage-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="border-sage-200 focus:border-sage-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="border-sage-200 focus:border-sage-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Main Street" className="border-sage-200 focus:border-sage-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="New York" className="border-sage-200 focus:border-sage-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="NY" className="border-sage-200 focus:border-sage-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" placeholder="10001" className="border-sage-200 focus:border-sage-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-sage-800">
                  <Truck className="h-6 w-6" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-3 p-4 border border-sage-200 rounded-xl hover:bg-sage-50 transition-colors">
                    <RadioGroupItem value="standard" id="standard" />
                    <div className="flex-1">
                      <Label htmlFor="standard" className="font-semibold text-sage-800">
                        Standard Shipping
                      </Label>
                      <p className="text-sm text-sage-600">5-7 business days • FREE</p>
                    </div>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-sage-200 rounded-xl hover:bg-sage-50 transition-colors">
                    <RadioGroupItem value="express" id="express" />
                    <div className="flex-1">
                      <Label htmlFor="express" className="font-semibold text-sage-800">
                        Express Shipping
                      </Label>
                      <p className="text-sm text-sage-600">2-3 business days</p>
                    </div>
                    <span className="font-semibold text-sage-800">$15.99</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-sage-800">
                  <CreditCard className="h-6 w-6" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border border-sage-200 rounded-xl">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="font-semibold text-sage-800">
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-sage-200 rounded-xl">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="font-semibold text-sage-800">
                      PayPal
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="border-sage-200 focus:border-sage-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" className="border-sage-200 focus:border-sage-400" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" className="border-sage-200 focus:border-sage-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="John Doe" className="border-sage-200 focus:border-sage-400" />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox id="saveCard" />
                  <Label htmlFor="saveCard" className="text-sm text-sage-700">
                    Save payment information for future purchases
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl text-sage-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 object-cover rounded-lg bg-sage-100"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sage-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-sage-600">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                        <p className="font-semibold text-sage-800">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Promo code" className="border-sage-200 focus:border-sage-400" />
                    <Button variant="outline" className="border-sage-300 text-sage-700 hover:bg-sage-50 bg-transparent">
                      Apply
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <Gift className="h-4 w-4" />
                    <span>Have a gift card or promo code?</span>
                  </div>
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sage-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sage-700">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sage-700">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-sage-800">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <Lock className="h-5 w-5 mr-2" />
                  Complete Order
                </Button>

                <p className="text-xs text-sage-600 text-center">Your payment information is secure and encrypted</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
