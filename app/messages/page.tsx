"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react"

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState("1")
  const [message, setMessage] = useState("")

  const conversations = [
    {
      id: "1",
      name: "Customer Support",
      lastMessage: "Thank you for contacting us! How can we help you today?",
      time: "2 min ago",
      unread: 2,
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    {
      id: "2",
      name: "Order Updates",
      lastMessage: "Your order #ORD-001 has been shipped!",
      time: "1 hour ago",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
    {
      id: "3",
      name: "Sarah Johnson",
      lastMessage: "Love the new tote bag collection! 😍",
      time: "3 hours ago",
      unread: 1,
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
  ]

  const messages = [
    {
      id: "1",
      sender: "support",
      content: "Hello! Welcome to our store. How can I assist you today?",
      time: "10:30 AM",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "2",
      sender: "user",
      content: "Hi! I'm interested in the Monocle Canvas Tote Bag. Do you have it in different colors?",
      time: "10:32 AM",
    },
    {
      id: "3",
      sender: "support",
      content:
        "Great choice! Yes, we have the Monocle Canvas Tote Bag available in 5 different colors: Black, Brown, Navy, Olive, and Cream. Would you like me to show you the options?",
      time: "10:33 AM",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "4",
      sender: "user",
      content: "Yes, please! I'm particularly interested in the Navy and Olive options.",
      time: "10:35 AM",
    },
    {
      id: "5",
      sender: "support",
      content:
        "Perfect! I'll send you the product images for both Navy and Olive. Both are currently in stock and available for immediate shipping. The Navy has a more classic look while the Olive gives a more earthy, natural vibe.",
      time: "10:36 AM",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const selectedConversation = conversations.find((conv) => conv.id === selectedChat)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="Messages" subtitle="Stay connected with our support team" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
                <Input className="pl-10 border-sage-200 focus:border-sage-400" placeholder="Search conversations..." />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`w-full p-4 text-left hover:bg-sage-50 transition-colors ${
                      selectedChat === conversation.id ? "bg-sage-100 border-r-4 border-sage-600" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                          <AvatarFallback className="bg-sage-100 text-sage-700">
                            {conversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sage-800 truncate">{conversation.name}</h4>
                          <span className="text-xs text-sage-600">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-sage-600 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge className="bg-sage-600 text-white text-xs">{conversation.unread}</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-sage-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={selectedConversation?.avatar || "/placeholder.svg"}
                          alt={selectedConversation?.name}
                        />
                        <AvatarFallback className="bg-sage-100 text-sage-700">
                          {selectedConversation?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation?.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800">{selectedConversation?.name}</h3>
                      <p className="text-sm text-sage-600">
                        {selectedConversation?.online ? "Online" : "Last seen 2 hours ago"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="hover:bg-sage-100">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-sage-100">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-sage-100">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender !== "user" && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.avatar || "/placeholder.svg"} alt="Support" />
                          <AvatarFallback className="bg-sage-100 text-sage-700 text-xs">CS</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-sage-600 text-white rounded-br-md"
                            : "bg-sage-100 text-sage-800 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-sage-200" : "text-sage-500"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-sage-100 p-4">
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="ghost" className="hover:bg-sage-100">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="border-sage-200 focus:border-sage-400 pr-12"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          // Handle send message
                          setMessage("")
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-sage-100"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="bg-sage-600 hover:bg-sage-700 rounded-full" onClick={() => setMessage("")}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
