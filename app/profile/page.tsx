"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Edit, MapPin, Calendar, Award, ShoppingBag, Heart } from "lucide-react"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Dollar Anderson",
    email: "dollar@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    bio: "Fashion enthusiast and tote bag collector. Love discovering unique designs and sustainable fashion.",
    joinDate: "March 2023",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-482Kz4Ro7YXPgsZnttDFsQEmrWQnhG.jpeg",
  })

  const stats = [
    { label: "Orders", value: "24", icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Wishlist", value: "12", icon: Heart, color: "bg-red-500" },
    { label: "Reviews", value: "18", icon: Award, color: "bg-green-500" },
  ]

  const recentOrders = [
    { id: "ORD-001", item: "Monocle Canvas Tote", date: "Dec 15, 2023", status: "Delivered", amount: "$213.99" },
    { id: "ORD-002", item: "Square One District Tote", date: "Dec 10, 2023", status: "Shipped", amount: "$189.99" },
    { id: "ORD-003", item: "Sporty & Rich Canvas Tote", date: "Dec 5, 2023", status: "Processing", amount: "$221.99" },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="My Profile" subtitle="Manage your account settings and preferences" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-32 h-32 ring-4 ring-sage-200">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback className="text-2xl bg-sage-100 text-sage-700">DA</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-sage-600 hover:bg-sage-700 shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <h2 className="text-2xl font-bold text-sage-800 mb-2">{profile.name}</h2>
                <p className="text-sage-600 mb-4">{profile.email}</p>

                <div className="flex items-center justify-center gap-2 text-sage-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-sage-600 mb-6">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {profile.joinDate}</span>
                </div>

                <p className="text-sage-700 text-sm mb-6">{profile.bio}</p>

                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div
                        className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                      >
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
                <CardTitle className="text-2xl text-sage-800">Personal Information</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-sage-300 text-sage-700 hover:bg-sage-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sage-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      disabled={!isEditing}
                      className="border-sage-200 focus:border-sage-400"
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sage-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled={!isEditing}
                      className="border-sage-200 focus:border-sage-400"
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sage-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      disabled={!isEditing}
                      className="border-sage-200 focus:border-sage-400"
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sage-700">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      disabled={!isEditing}
                      className="border-sage-200 focus:border-sage-400"
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sage-700">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    disabled={!isEditing}
                    className="border-sage-200 focus:border-sage-400 min-h-[100px]"
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-4">
                    <Button className="bg-sage-600 hover:bg-sage-700">Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-sage-800">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sage-800">{order.item}</p>
                        <p className="text-sm text-sage-600">
                          Order #{order.id} • {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sage-800">{order.amount}</p>
                        <Badge
                          className={`${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
