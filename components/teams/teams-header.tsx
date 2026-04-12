"use client"

import { Search, ChevronDown, Minus, Square, X, Maximize2, Minimize2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamsHeaderProps {
  userName: string
  userInitials: string
  userAvatar?: string
}

export function TeamsHeader({ userName, userInitials, userAvatar }: TeamsHeaderProps) {
  return (
    <div className="h-12 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 select-none">
      {/* Left section - navigation and title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-teams-purple rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Microsoft Teams</span>
        </div>
      </div>

      {/* Center - search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-8 bg-input rounded-md pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right section - user and controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
            <AvatarFallback className="bg-teams-purple text-white text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 ml-4">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent rounded transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent rounded transition-colors">
            <Square className="w-3 h-3" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-red-600 hover:text-white rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
