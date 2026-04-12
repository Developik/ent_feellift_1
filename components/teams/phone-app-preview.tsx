"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Phone,
  ChevronRight,
  User,
  Bell,
  Send,
  Mic,
  ArrowLeft,
  MoreVertical,
  Wifi,
  Battery,
  Signal,
  Wind,
  Play,
  Sparkles
} from "lucide-react"

const P = {
  skyTop: "#a8c8f0",
  peach: "#f5b87a", 
  orange: "#e87040",
  accent: "#f5a070",
  textDark: "#2d3a5c",
  textMid: "#5a6a8a",
  textLight: "#8a9ab8",
}

type AppScreen = "home" | "chat"

export function PhoneAppPreview() {
  const [screen, setScreen] = useState<AppScreen>("home")
  const [chatMessages] = useState([
    { id: 1, isUser: false, text: "Hi there! I'm your personal wellness companion. Everything here stays private and is never shared with your employer. How are you feeling right now?" },
    { id: 2, isUser: true, text: "I've been feeling overwhelmed with work lately" },
    { id: 3, isUser: false, text: "I hear you. Work stress can be really challenging. Would you like to try a quick breathing exercise, or talk about what's been causing the most pressure?" },
  ])

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${P.skyTop}, ${P.peach}, ${P.orange})` }}
        >
          <span className="font-serif font-bold text-white text-sm">fl</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Private Mobile App</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
        Your private sanctuary - completely separate from enterprise data
      </p>
      
      {/* Phone frame */}
      <div className="relative w-[280px] h-[580px] bg-black rounded-[40px] p-2 shadow-2xl">
        {/* Phone bezel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div 
          className="w-full h-full rounded-[32px] overflow-hidden"
          style={{ background: "linear-gradient(175deg, #e8f3fc 0%, #f5e8d8 52%, #fdf0e0 100%)" }}
        >
          {/* Status bar */}
          <div className="h-10 px-4 flex items-center justify-between text-[10px]" style={{ color: P.textMid }}>
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-4 h-3" />
            </div>
          </div>

          {screen === "home" && (
            <div className="flex flex-col h-[calc(100%-40px)]">
              {/* App header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${P.skyTop}, ${P.peach}, ${P.orange})` }}
                    >
                      <span className="font-serif font-bold text-white text-sm">fl</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm" style={{ color: P.textDark }}>Feelift</span>
                      <p className="text-[10px]" style={{ color: P.textLight }}>Your sanctuary</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full"
                      style={{ background: `${P.skyTop}20` }}
                    >
                      <Bell className="w-4 h-4" style={{ color: P.textMid }} />
                    </button>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full"
                      style={{ background: `${P.skyTop}20` }}
                    >
                      <User className="w-4 h-4" style={{ color: P.textMid }} />
                    </button>
                  </div>
                </div>

                {/* Welcome card */}
                <div 
                  className="rounded-2xl p-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${P.skyTop}30, ${P.peach}25, ${P.orange}20)`,
                    border: `1px solid ${P.skyTop}40`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" style={{ color: P.orange }} />
                    <p className="text-sm font-medium" style={{ color: P.textDark }}>Welcome back</p>
                  </div>
                  <p className="text-xs" style={{ color: P.textMid }}>
                    Your journey to wellness continues here, privately and securely.
                  </p>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 px-4 space-y-2.5 overflow-y-auto">
                {/* Talk to someone */}
                <button 
                  onClick={() => setScreen("chat")}
                  className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    background: "rgba(255,248,240,0.8)",
                    border: `1px solid ${P.skyTop}35`
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${P.orange}20` }}
                  >
                    <MessageCircle className="w-5 h-5" style={{ color: P.orange }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: P.textDark }}>Talk to someone</p>
                    <p className="text-[10px]" style={{ color: P.textMid }}>Private wellness chat</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: P.textLight }} />
                </button>

                {/* Breathing */}
                <button 
                  className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    background: "rgba(255,248,240,0.8)",
                    border: `1px solid ${P.skyTop}35`
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${P.skyTop}25` }}
                  >
                    <Wind className="w-5 h-5" style={{ color: P.skyTop }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: P.textDark }}>Breathing exercises</p>
                    <p className="text-[10px]" style={{ color: P.textMid }}>Calm reset in 2 minutes</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: P.textLight }} />
                </button>

                {/* Uplift videos */}
                <button 
                  className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    background: "rgba(255,248,240,0.8)",
                    border: `1px solid ${P.skyTop}35`
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${P.peach}25` }}
                  >
                    <Play className="w-5 h-5" style={{ color: P.peach }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: P.textDark }}>Uplift videos</p>
                    <p className="text-[10px]" style={{ color: P.textMid }}>Personal memory montage</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: P.textLight }} />
                </button>

                {/* Self-help resources */}
                <button 
                  className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    background: "rgba(255,248,240,0.8)",
                    border: `1px solid ${P.skyTop}35`
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${P.accent}25` }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: P.accent }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: P.textDark }}>Self-help resources</p>
                    <p className="text-[10px]" style={{ color: P.textMid }}>Guided exercises & articles</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: P.textLight }} />
                </button>

                {/* Crisis support */}
                <button 
                  className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    background: "rgba(255,248,240,0.8)",
                    border: `1px solid ${P.skyTop}35`
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(232,80,80,0.15)" }}
                  >
                    <Phone className="w-5 h-5" style={{ color: "#e85050" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: P.textDark }}>Crisis support</p>
                    <p className="text-[10px]" style={{ color: P.textMid }}>24/7 confidential helpline</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: P.textLight }} />
                </button>
              </div>

              {/* Privacy badge */}
              <div className="p-4">
                <div 
                  className="flex items-center justify-center gap-2 py-2 rounded-full text-[10px]"
                  style={{ background: `${P.skyTop}15`, color: P.textMid }}
                >
                  <Shield className="w-3 h-3" style={{ color: P.skyTop }} />
                  <span>End-to-end encrypted</span>
                  <span>•</span>
                  <span>Never shared</span>
                </div>
              </div>
            </div>
          )}

          {screen === "chat" && (
            <div className="flex flex-col h-[calc(100%-40px)]">
              {/* Chat header */}
              <div 
                className="p-3 flex items-center gap-3"
                style={{ 
                  background: "rgba(255,248,240,0.9)",
                  borderBottom: `1px solid ${P.skyTop}25`
                }}
              >
                <button 
                  onClick={() => setScreen("home")}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: `${P.skyTop}20` }}
                >
                  <ArrowLeft className="w-4 h-4" style={{ color: P.textMid }} />
                </button>
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${P.skyTop}, ${P.peach}, ${P.orange})` }}
                >
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: P.textDark }}>Wellness Coach</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <p className="text-[10px]" style={{ color: P.textMid }}>Online</p>
                  </div>
                </div>
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: `${P.skyTop}20` }}
                >
                  <MoreVertical className="w-4 h-4" style={{ color: P.textMid }} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2.5",
                      msg.isUser ? "ml-auto rounded-br-sm" : "rounded-bl-sm"
                    )}
                    style={{
                      background: msg.isUser 
                        ? `linear-gradient(135deg, ${P.skyTop}, ${P.peach})` 
                        : "rgba(255,248,240,0.95)",
                      color: msg.isUser ? "white" : P.textDark,
                      border: msg.isUser ? "none" : `1px solid ${P.skyTop}30`
                    }}
                  >
                    <p className="text-[11px] leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div 
                className="p-3"
                style={{ 
                  background: "rgba(255,248,240,0.9)",
                  borderTop: `1px solid ${P.skyTop}25`
                }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 h-9 rounded-full px-4 text-xs focus:outline-none"
                    style={{ 
                      background: "rgba(255,255,255,0.8)",
                      border: `1px solid ${P.skyTop}30`,
                      color: P.textDark
                    }}
                  />
                  <button 
                    className="w-9 h-9 flex items-center justify-center rounded-full"
                    style={{ background: `${P.skyTop}20` }}
                  >
                    <Mic className="w-4 h-4" style={{ color: P.textMid }} />
                  </button>
                  <button 
                    className="w-9 h-9 flex items-center justify-center rounded-full"
                    style={{ background: `linear-gradient(135deg, ${P.skyTop}, ${P.peach}, ${P.orange})` }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy callouts */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm">
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
          style={{ background: `${P.skyTop}15`, color: P.textMid }}
        >
          <Shield className="w-3 h-3" style={{ color: P.skyTop }} />
          <span>Private</span>
        </div>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
          style={{ background: `${P.peach}15`, color: P.textMid }}
        >
          <Heart className="w-3 h-3" style={{ color: P.peach }} />
          <span>Professional support</span>
        </div>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
          style={{ background: `${P.orange}15`, color: P.textMid }}
        >
          <MessageCircle className="w-3 h-3" style={{ color: P.orange }} />
          <span>24/7 available</span>
        </div>
      </div>
    </div>
  )
}

export default PhoneAppPreview
