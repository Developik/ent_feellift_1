"use client"

import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Users,
  Calendar,
  Phone,
  FileText,
  MoreHorizontal,
  Bell,
  Settings,
  Grid3X3,
  Sparkles,
} from "lucide-react"

interface TeamsSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasNotification?: boolean
}

const P = {
  skyTop: "#a8c8f0",
  peach: "#f5b87a", 
  orange: "#e87040",
}

const sidebarItems = [
  { id: "activity", icon: Bell, label: "Activity" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "teams", icon: Users, label: "Teams" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "calls", icon: Phone, label: "Calls" },
  { id: "files", icon: FileText, label: "Files" },
]

export function TeamsSidebar({ activeTab, onTabChange, hasNotification }: TeamsSidebarProps) {
  return (
    <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-2">
      {/* App launcher */}
      <button className="w-10 h-10 rounded flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors mb-2">
        <Grid3X3 className="w-5 h-5" />
      </button>

      {/* Navigation items */}
      <nav className="flex-1 flex flex-col items-center gap-1 mt-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                isActive
                  ? "bg-teams-purple text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {item.id === "activity" && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}

        {/* Feelift App - Special styling */}
        <div className="my-2 w-10 h-px bg-sidebar-border" />
        
        <button
          onClick={() => onTabChange("feelift")}
          className={cn(
            "w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all relative group",
            activeTab === "feelift"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          style={{
            background: activeTab === "feelift" 
              ? `linear-gradient(135deg, ${P.skyTop}30, ${P.peach}25, ${P.orange}30)`
              : undefined
          }}
        >
          {/* Notification badge */}
          {hasNotification && activeTab !== "feelift" && (
            <span 
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ 
                background: `linear-gradient(135deg, ${P.peach}, ${P.orange})`,
                animation: "fl-pop 0.4s ease both"
              }}
            >
              1
            </span>
          )}
          
          <div 
            className={cn(
              "w-14 h-14 rounded-md flex items-center justify-center transition-all",
              activeTab === "feelift" && "fl-animate-glow"
            )}
            style={{ 
              background: ``,
            }}
          >
              <div
                className="w-14 h-14 rounded-[18px] items-center justify-center shadow-lg"
                style={{ background: `` }}
              >
                  <img
                    src="/logo-my-1.png"
                    alt="logo"
                    width={80}
                    height={80}
                  />              </div>
          </div>
          <span className="text-[10px] font-medium">FeelLift</span>
        </button>
      </nav>

      {/* More apps */}
      <button className="w-10 h-10 rounded flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors mb-2">
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* Settings */}
      <button className="w-10 h-10 rounded flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent transition-colors mb-2">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  )
}
