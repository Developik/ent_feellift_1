"use client"

import { useState } from "react"
import {
  Play,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Shield,
  Wind,
  ArrowRight,
  Zap,
  Heart,
} from "lucide-react"
import { TeamsSidebar } from "@/components/teams/teams-sidebar"
import { TeamsHeader } from "@/components/teams/teams-header"
import { FeeliftTeamsApp } from "@/components/teams/feelift-teams-app"

const P = {
  skyTop: "#a8c8f0",
  peach: "#f5b87a",
  orange: "#e87040",
  textDark: "#2d3a5c",
  textMid: "#5a6a8a",
  textLight: "#8a9ab8",
  card: "rgba(255,255,255,0.4)",
  cardBorder: "rgba(168,200,240,0.35)",
  green: "#4ade80",
  yellow: "#fbbf24",
  red: "#f87171",
}

type DemoStep = "intro" | "teams"

export default function TeamsDemo() {
  const [activeTab, setActiveTab] = useState("chat")
  const [demoStep, setDemoStep] = useState<DemoStep>("intro")
  const [showNotification, setShowNotification] = useState(false)

  const userInitials = "AP"

  const handleStartDemo = () => {
    setDemoStep("teams")
    setActiveTab("chat")
    setShowNotification(false)
    setTimeout(() => setShowNotification(true), 1500)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "feelift") setShowNotification(false)
  }

  const resetDemo = () => {
    setDemoStep("intro")
    setActiveTab("chat")
    setShowNotification(false)
  }

  if (demoStep === "intro") {
    return (
      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(175deg,#e8f3fc 0%,#f5e8d8 52%,#fdf0e0 100%)",
        }}
      >
        <style>{`
          .soft-card { backdrop-filter: blur(12px); transition: transform 0.2s ease; }
          .soft-card:active { transform: scale(0.98); }
          .pill-active { background: #2d3a5c !important; color: white !important; border-color: transparent !important; }
          .feature-card { backdrop-filter: blur(8px); transition: transform 0.2s ease; }
          .feature-card:hover { transform: translateY(-4px); }
        `}</style>

        {/* Decorative blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 400, height: 400, borderRadius: "50%",
            background: `radial-gradient(circle, ${P.skyTop}25, transparent 70%)`,
            top: -120, left: -120,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 350, height: 350, borderRadius: "50%",
            background: `radial-gradient(circle, ${P.peach}20, transparent 70%)`,
            bottom: -60, right: -60,
          }}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
          <div className="max-w-2xl w-full text-center space-y-6">

            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-6">
              <div
                className="w-14 h-14 rounded-[18px] items-center justify-center shadow-lg"
                style={{ background: `` }}
              >
                  <img
                    src="/logo-my-1.png"
                    alt="Aura"
                    width={80}
                    height={80}
                  />              </div>
              <div className="text-left">
                <p className="text-xl font-serif font-bold" style={{ color: P.textDark }}>Aura</p>
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: P.textMid }}>
                  Employee Wellness
                </p>
              </div>
            </div>

            {/* Badge */}
            <div>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase"
                style={{
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid ${P.cardBorder}`,
                  color: P.orange,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Microsoft Teams Integration
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight" style={{ color: P.textDark }}>
                Wellness check-ins that
              </h1>
              <h1
                className="text-4xl md:text-5xl font-serif font-bold leading-tight mt-1"
                style={{
                  background: `linear-gradient(135deg, ${P.skyTop}, ${P.peach}, ${P.orange})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                meet people where they work
              </h1>
            </div>

            <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: P.textMid }}>
              A dedicated Teams app for daily wellness. A guided AI check-in,
              immediate breathing resets, and private support — all in one place.
            </p>

            {/* Mood dots */}
            <div className="flex items-center justify-center gap-8 py-2">
              {[
                { color: P.green, label: "Good" },
                { color: P.yellow, label: "OK" },
                { color: P.red, label: "Not well" },
              ].map(({ color, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{ background: color, boxShadow: `0 4px 14px ${color}50` }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P.textLight }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase text-white shadow-lg transition-transform active:scale-95"
                style={{ background: P.orange }}
                onClick={handleStartDemo}
              >
                <Play className="w-4 h-4" />
                Start Demo
              </button>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mt-16 px-4 w-full">
            {[
              {
                icon: <MessageSquare className="w-5 h-5" style={{ color: P.skyTop }} />,
                title: "Teams native chat",
                desc: "A guided AI check-in with steps at the top — Check-in, Reflect, Suggest, Wrap-up. No forms, no friction.",
                accent: P.skyTop,
              },
              {
                icon: <Wind className="w-5 h-5" style={{ color: P.peach }} />,
                title: "Support when you need it",
                desc: "A 60-second breathing reset, a crisis line, a therapist, and short reads — always one tap away.",
                accent: P.peach,
              },
              {
                icon: <Shield className="w-5 h-5" style={{ color: P.orange }} />,
                title: "Private to you",
                desc: "Anonymous and confidential. Nothing you share will ever be tied back to you.",
                accent: P.orange,
              },
            ].map(({ icon, title, desc, accent }) => (
              <div
                key={title}
                className="feature-card p-6 rounded-[32px] border"
                style={{
                  background: "rgba(255,255,255,0.45)",
                  borderColor: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
                >
                  {icon}
                </div>
                <h3 className="font-serif font-bold text-[16px] mb-2" style={{ color: P.textDark }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: P.textMid }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(175deg,#e8f3fc 0%,#f5e8d8 52%,#fdf0e0 100%)" }}>
      {/* Demo bar */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${P.cardBorder}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: P.orange }} />
          </div>
          <div className="h-4 w-px" style={{ background: P.cardBorder }} />
          <p className="text-xs" style={{ color: P.textMid }}>
            {showNotification
              ? "Click the Aura app in the sidebar to start your check-in"
              : "Watch for the notification on the Aura app..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${P.cardBorder}`, color: P.textDark }}
            onClick={resetDemo}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      <TeamsHeader userName="Nick Kohuch" userInitials={userInitials} />

      <div className="flex-1 flex overflow-hidden">
        <TeamsSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasNotification={showNotification}
        />
        {activeTab === "feelift" ? (
          <FeeliftTeamsApp isVisible={true} />
        ) : (
          <DefaultTeamsContent
            activeTab={activeTab}
            onGoToFeelit={() => handleTabChange("feelift")}
            showHint={showNotification}
          />
        )}
      </div>
    </div>
  )
}

const tabNames: Record<string, string> = {
  activity: "Activity", chat: "Chat", teams: "Teams",
  calendar: "Calendar", calls: "Calls", files: "Files",
}

function DefaultTeamsContent({
  activeTab, onGoToFeelit, showHint,
}: {
  activeTab: string
  onGoToFeelit: () => void
  showHint: boolean
}) {
  return (
    <div className="flex-1 flex flex-col" style={{ background: "rgba(255,255,255,0.2)" }}>
      <div
        className="h-12 flex items-center px-6"
        style={{ borderBottom: "1px solid rgba(168,200,240,0.3)", background: "rgba(255,255,255,0.3)" }}
      >
        <h2 className="font-serif font-bold text-lg" style={{ color: "#2d3a5c" }}>
          {tabNames[activeTab] || activeTab}
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          {showHint ? (
            <>
              <div
                className="w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto shadow-lg"
                style={{ background: `` }}
              >
              <div
                className="w-14 h-14 rounded-[18px] items-center justify-center shadow-lg"
                style={{ background: `` }}
              >
                  <img
                    src="/logo-my-1.png"
                    alt="Aura"
                    width={80}
                    height={80}
                  />              </div>              </div>
              <div>
                <h3 className="text-xl font-serif font-bold" style={{ color: P.textDark }}>
                  You have a new check-in!
                </h3>
                <p className="text-sm mt-2" style={{ color: P.textMid }}>
                  Click the Aura app in the sidebar to start your daily wellness check-in.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white shadow-lg"
                style={{ background: P.orange }}
                onClick={onGoToFeelit}
              >
                Open Aura <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(168,200,240,0.2)", border: "1px solid rgba(168,200,240,0.35)" }}
              >
                {activeTab === "chat" && <MessageSquare className="w-7 h-7" style={{ color: P.skyTop }} />}
                {activeTab === "activity" && <Zap className="w-7 h-7" style={{ color: P.skyTop }} />}
                {activeTab === "teams" && <Heart className="w-7 h-7" style={{ color: P.skyTop }} />}
                {!["chat", "activity", "teams"].includes(activeTab) && (
                  <MessageSquare className="w-7 h-7" style={{ color: P.skyTop }} />
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg" style={{ color: P.textDark }}>
                  {tabNames[activeTab]}
                </h3>
                <p className="text-sm mt-1" style={{ color: P.textMid }}>
                  This is a demo. Watch for the Aura notification...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: P.peach, opacity: 0.6 + i * 0.2 }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
