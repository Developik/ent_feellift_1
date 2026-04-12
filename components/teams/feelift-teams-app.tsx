"use client"

import { useState, useEffect, useRef } from "react"
import {
  Wind, Sparkles, ArrowRight, Heart,
  Sun, Coffee, ChevronRight, Check,
  Shield, Lock, Waves, CloudRain, Zap, Snowflake
} from "lucide-react"
import { Button } from "@/components/ui/button"

type CheckInStep =
  | "intro" | "checkin" | "good-response"
  | "ehh-weather" | "ehh-energy" | "ehh-breathing"
  | "ehh-after" | "bad-response"
type BreathPhase = "inhale" | "hold" | "exhale" | "rest"

const WEATHER_OPTIONS = [
  { id: "sunny",    Icon: Sun,       label: "Bright",   desc: "Clear & energized" },
  { id: "calm",     Icon: Waves,     label: "Calm",     desc: "Peaceful, still"   },
  { id: "cloudy",   Icon: Wind,      label: "Mixed",    desc: "Some clouds"       },
  { id: "stormy",   Icon: CloudRain, label: "Heavy",    desc: "Carrying weight"   },
  { id: "electric", Icon: Zap,       label: "Restless", desc: "No outlet"         },
  { id: "frozen",   Icon: Snowflake, label: "Numb",     desc: "Disconnected"      },
] as const

const ENERGY_OPTIONS = [
  { v: 5, l: "Vibrant"  },
  { v: 4, l: "Flowing"  },
  { v: 3, l: "Steady"   },
  { v: 2, l: "Low"      },
  { v: 1, l: "Depleted" },
] as const

const CSS = `
  @keyframes fl-breathe  { 0%,100%{transform:scale(1)}                         50%{transform:scale(1.08)} }
  @keyframes fl-fade-in  { from{opacity:0;transform:translateY(8px)}           to{opacity:1;transform:none} }
  @keyframes fl-ripple   { 0%{transform:scale(1);opacity:0.5}                  100%{transform:scale(1.55);opacity:0} }
  @keyframes fl-pop      { 0%{transform:scale(0.85);opacity:0}                 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
  @keyframes fl-dot      { 0%,100%{transform:translateY(0);opacity:0.4}        50%{transform:translateY(-4px);opacity:1} }
  @keyframes fl-slide-up { from{opacity:0;transform:translateY(12px)}          to{opacity:1;transform:none} }
  @keyframes fl-ring     { 0%,100%{transform:scale(1);opacity:0.6}             50%{transform:scale(1.22);opacity:0} }
  @keyframes fl-shimmer  { 0%{background-position:200% 0}                      100%{background-position:-200% 0} }
  .anim-fade { animation: fl-fade-in 0.35s ease both }
  .anim-pop  { animation: fl-pop     0.4s  ease both }
  .anim-up   { animation: fl-slide-up 0.4s ease both }
`

// ─── Shell ────────────────────────────────────────────────────────────────────

interface FeeliftTeamsAppProps {
  isVisible: boolean
  onOpenMobileApp: () => void
}

export function FeeliftTeamsApp({ isVisible, onOpenMobileApp }: FeeliftTeamsAppProps) {
  const [step,        setStep]        = useState<CheckInStep>("intro")
  const [weather,     setWeather]     = useState<string | null>(null)
  const [energy,      setEnergy]      = useState<number>(3)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("rest")
  const [breathCount, setBreathCount] = useState(0)
  const [breathDone,  setBreathDone]  = useState(false)
  const breathRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isVisible) return
    const t = setTimeout(() => setStep("checkin"), 1800)
    return () => clearTimeout(t)
  }, [isVisible])

  useEffect(() => {
    if (step !== "ehh-breathing") {
      if (breathRef.current) clearTimeout(breathRef.current)
      return
    }
    setBreathCount(0); setBreathDone(false); setBreathPhase("inhale")
    let cycles = 0, idx = 0
    const phases: { name: BreathPhase; ms: number }[] = [
      { name: "inhale", ms: 1500 }, { name: "hold",   ms: 500  },
      { name: "exhale", ms: 1500 }, { name: "rest",   ms: 300  },
    ]
    const run = () => {
      setBreathPhase(phases[idx].name)
      breathRef.current = setTimeout(() => {
        idx++
        if (idx >= phases.length) {
          idx = 0; cycles++; setBreathCount(cycles)
          if (cycles >= 2) { setBreathDone(true); return }
        }
        run()
      }, phases[idx].ms)
    }
    run()
    return () => { if (breathRef.current) clearTimeout(breathRef.current) }
  }, [step])

  const reset = () => {
    setWeather(null); setEnergy(3); setStep("intro")
    setTimeout(() => setStep("checkin"), 1800)
  }

  if (!isVisible) return null

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg,#fff8f0 0%,#fef5eb 50%,#fdf2e6 100%)",
      fontFamily: "var(--font-sans, system-ui)",
      overflow: "hidden", position: "relative",
    }}>
      <style>{CSS}</style>

      {/* Ambient blobs */}
      <div style={{ position: "absolute", pointerEvents: "none", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,200,240,0.18),transparent 70%)", top: -50, right: -50, animation: "fl-breathe 7s ease-in-out infinite" }} />
      <div style={{ position: "absolute", pointerEvents: "none", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,184,122,0.14),transparent 70%)", bottom: 60, left: -30, animation: "fl-breathe 9s 1s ease-in-out infinite" }} />

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", flexShrink: 0, position: "relative", zIndex: 10,
        borderBottom: "0.5px solid rgba(168,200,240,0.28)",
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(6px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, overflow: "hidden", flexShrink: 0, animation: "fl-breathe 3s ease-in-out infinite", boxShadow: "0 0 14px rgba(232,112,64,0.22)" }}>
            <img src="/logo-my-1.png" alt="FeelLift" width={38} height={38} style={{ display: "block" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#2d3a5c", lineHeight: 1.2 }}>FeelLift</p>
            <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a", lineHeight: 1.2 }}>Daily check-in</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "rgba(74,222,128,0.12)", fontSize: 11, fontWeight: 500, color: "#22c55e" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          Secure
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", overflow: "hidden", position: "relative", zIndex: 10 }}>
        {step === "intro"          && <IntroScreen />}
        {step === "checkin"        && <CheckInCard onMood={m => setStep(m === "good" ? "good-response" : "ehh-weather")} />}
        {step === "good-response"  && <GoodResponseCard onReset={reset} />}
        {step === "ehh-weather"    && <WeatherCard selected={weather} onSelect={setWeather} onNext={() => setStep("ehh-energy")} />}
        {step === "ehh-energy"     && <EnergyCard selected={energy} onSelect={setEnergy} onNext={() => { setBreathCount(0); setBreathDone(false); setStep("ehh-breathing") }} />}
        {step === "ehh-breathing"  && <BreathingExercise phase={breathPhase} count={breathCount} done={breathDone} onComplete={() => setStep("ehh-after")} />}
        {step === "ehh-after"      && <AfterBreathingCard onFeelBetter={() => setStep("good-response")} onStillBad={() => setStep("bad-response")} />}
        {step === "bad-response"   && <BadResponseCard onReset={reset} onOpenMobileApp={onOpenMobileApp} />}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 16px", flexShrink: 0, position: "relative", zIndex: 10,
        borderTop: "0.5px solid rgba(168,200,240,0.22)",
        background: "linear-gradient(90deg,rgba(168,200,240,0.08),rgba(245,184,122,0.06))",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#2d3a5c" }}>
            <Sun size={13} color="#e87040" /> 5 day streak
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(168,200,240,0.6)" }} />
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a6a8a" }}>
            <Heart size={13} color="#f5b87a" /> Team wellness: Great
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#5a6a8a" }}>Yesterday 9:15 AM</span>
      </footer>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function ShimmerBar({ colors }: { colors: string }) {
  return (
    <div style={{ height: 3, background: colors, backgroundSize: "200% 100%", animation: "fl-shimmer 4s linear infinite" }} />
  )
}

function Card({ children, accentColors = "linear-gradient(90deg,#a8c8f0,#f5b87a,#e87040,#f5b87a,#a8c8f0)", style }: {
  children: React.ReactNode; accentColors?: string; style?: React.CSSProperties
}) {
  return (
    <div className="anim-pop" style={{
      width: "100%", maxWidth: 430,
      background: "rgba(255,255,255,0.97)",
      borderRadius: 22, border: "0.5px solid rgba(168,200,240,0.28)",
      boxShadow: "0 12px 40px rgba(168,200,240,0.22), 0 4px 16px rgba(245,184,122,0.1)",
      overflow: "hidden", ...style,
    }}>
      <ShimmerBar colors={accentColors} />
      <div style={{ padding: "18px 20px 20px" }}>{children}</div>
    </div>
  )
}

function MoodCircle({
  size = 68, grad, glow, hovered,
  onEnter, onLeave, onClick, children,
}: {
  size?: number; grad: [string, string, string]; glow: string
  hovered: boolean; onEnter: () => void; onLeave: () => void
  onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{
      position: "relative", width: size, height: size, borderRadius: "50%",
      border: hovered ? "none" : "1.5px solid rgba(168,200,240,0.4)",
      cursor: "pointer", overflow: "visible", flexShrink: 0,
      background: hovered ? `linear-gradient(135deg,${grad[0]},${grad[1]},${grad[2]})` : "rgba(255,248,240,0.9)",
      boxShadow: hovered ? `0 14px 32px ${glow}, 0 4px 14px ${grad[1]}30` : "0 4px 14px rgba(168,200,240,0.18)",
      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      transform: hovered ? "scale(1.1) translateY(-3px)" : "scale(1)",
    }}>
      {hovered && (
        <>
          <div style={{ position: "absolute", inset: -8,  borderRadius: "50%", border: `2px solid ${grad[1]}`,   animation: "fl-ring 1.8s ease-in-out infinite",        pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `2px solid ${grad[1]}50`, animation: "fl-ring 1.8s 0.5s ease-in-out infinite",   pointerEvents: "none" }} />
        </>
      )}
      <div style={{ position: "absolute", inset: -5, borderRadius: "50%", background: glow, filter: "blur(10px)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.24) 0%,transparent 55%)" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </button>
  )
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntroScreen() {
  return (
    <div className="anim-fade" style={{ textAlign: "center", width: "100%", maxWidth: 340 }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 18px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "linear-gradient(135deg,rgba(168,200,240,0.38),rgba(245,184,122,0.28),rgba(232,112,64,0.38))", animation: "fl-breathe 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, border: "1.5px solid rgba(245,184,122,0.4)", animation: "fl-ripple 2.2s ease-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, border: "1.5px solid rgba(168,200,240,0.3)", animation: "fl-ripple 2.2s 0.6s ease-out infinite" }} />
        <div style={{ position: "absolute", inset: 4, borderRadius: 18, background: "linear-gradient(135deg,#a8c8f0,#f5b87a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/logo-my-1.png" alt="FeelLift" width={52} height={52} style={{ display: "block", borderRadius: 14 }} />
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 600, color: "#2d3a5c", margin: "0 0 6px" }}>Good morning, Nick</p>
      <p style={{ fontSize: 14, color: "#5a6a8a", margin: "0 0 22px" }}>Taking a moment for your daily check-in…</p>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#e87040", animation: `fl-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

function CheckInCard({ onMood }: { onMood: (m: "good" | "ehh" | "bad") => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const moods = [
    { id: "good" as const, label: "Good",      sub: "Doing well",      grad: ["#86efac", "#4ade80", "#22c55e"] as [string,string,string], glow: "#4ade8045" },
    { id: "ehh"  as const, label: "OK…",       sub: "Could be better", grad: ["#fde68a", "#fbbf24", "#f59e0b"] as [string,string,string], glow: "#fbbf2445" },
    { id: "bad"  as const, label: "Not great", sub: "Struggling",      grad: ["#fca5a5", "#f87171", "#ef4444"] as [string,string,string], glow: "#f8717145" },
  ]

  return (
    <Card>
      <div className="anim-fade" style={{ textAlign: "center", marginBottom: 22 }}>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 5px" }}>How are you feeling today?</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: 0 }}>Take a moment to check in with yourself</p>
      </div>

      <div className="anim-up" style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", marginBottom: 20, padding: "0 8px" }}>
        {moods.map((mood, i) => {
          const isHov = hovered === mood.id
          return (
            <div key={mood.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, animation: `fl-pop 0.5s ${0.1 + i * 0.08}s ease both` }}>
              <MoodCircle
                size={66}
                grad={mood.grad}
                glow={mood.glow}
                hovered={isHov}
                onEnter={() => setHovered(mood.id)}
                onLeave={() => setHovered(null)}
                onClick={() => onMood(mood.id)}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: isHov ? "rgba(255,255,255,0.32)" : mood.grad[1], boxShadow: isHov ? "none" : `0 2px 8px ${mood.glow}`, transition: "background 0.3s" }} />
              </MoodCircle>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: isHov ? mood.grad[1] : "#2d3a5c", transition: "color 0.3s" }}>{mood.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a", opacity: isHov ? 1 : 0.65, transform: isHov ? "none" : "translateY(-2px)", transition: "all 0.3s" }}>{mood.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#5a6a8a", margin: 0 }}>Your response helps us support you better</p>
    </Card>
  )
}

// ─── Good response ────────────────────────────────────────────────────────────

function GoodResponseCard({ onReset }: { onReset: () => void }) {
  const coworkers = [
    { initials: "SC", name: "Sarah Chen",     status: "Free for coffee"   },
    { initials: "MJ", name: "Marcus Johnson", status: "Available to chat" },
  ]

  return (
    <Card accentColors="linear-gradient(90deg,#86efac,#4ade80,#22c55e,#4ade80,#86efac)">
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 14px" }}>
          <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid #4ade8055", animation: "fl-ring 2s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "#4ade8014", filter: "blur(6px)" }} />
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#86efac,#4ade80,#22c55e)", boxShadow: "0 10px 28px rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.24) 0%,transparent 55%)" }} />
            <Check size={28} color="white" strokeWidth={3} style={{ position: "relative", zIndex: 1 }} />
          </div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 5px" }}>Great to hear!</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: 0 }}>Keep up the positive energy. Here's a suggestion to make your day even better:</p>
      </div>

      <div style={{ background: "linear-gradient(135deg,rgba(168,200,240,0.1),rgba(245,184,122,0.07))", borderRadius: 16, padding: "14px 16px", marginBottom: 14, border: "0.5px solid rgba(168,200,240,0.22)" }}>
        <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#2d3a5c", margin: "0 0 12px" }}>
          <Coffee size={14} color="#e87040" /> Connect with a colleague
        </p>
        {coworkers.map((p, i) => (
          <button key={p.name} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12, marginBottom: i < coworkers.length - 1 ? 8 : 0,
            background: "white", border: "0.5px solid rgba(168,200,240,0.28)", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(168,200,240,0.14)", animation: `fl-slide-up 0.4s ${0.15 + i * 0.1}s ease both`,
            transition: "transform 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#a8c8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "white", flexShrink: 0 }}>{p.initials}</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#2d3a5c" }}>{p.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a" }}>{p.status}</p>
            </div>
            <ChevronRight size={14} color="#5a6a8a" />
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <Button variant="ghost" size="sm" onClick={onReset} style={{ color: "#5a6a8a" }}>Done for today</Button>
      </div>
    </Card>
  )
}

// ─── Weather card ─────────────────────────────────────────────────────────────

function WeatherCard({ selected, onSelect, onNext }: {
  selected: string | null; onSelect: (id: string) => void; onNext: () => void
}) {
  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a6a8a", margin: "0 0 4px" }}>Step 1 of 2</p>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 4px" }}>What's your inner weather?</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: 0 }}>Choose the landscape that matches you right now</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {WEATHER_OPTIONS.map(({ id, Icon, label, desc }, i) => {
          const sel = selected === id
          return (
            <button key={id} onClick={() => onSelect(id)} style={{
              padding: "10px 8px", borderRadius: 14, border: sel ? "1.5px solid rgba(232,112,64,0.6)" : "0.5px solid rgba(168,200,240,0.4)",
              cursor: "pointer", textAlign: "left",
              background: sel ? "linear-gradient(135deg,rgba(168,200,240,0.2),rgba(245,184,122,0.16))" : "rgba(255,248,240,0.7)",
              transform: sel ? "scale(1.04)" : "scale(1)",
              transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              animation: `fl-pop 0.35s ${0.04 + i * 0.04}s ease both`,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", marginBottom: 6, background: sel ? "linear-gradient(135deg,#a8c8f0,#f5b87a)" : "rgba(168,200,240,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s" }}>
                <Icon size={13} color={sel ? "white" : "#5a6a8a"} />
              </div>
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: sel ? "#2d3a5c" : "#5a6a8a" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 9, color: "#5a6a8a", opacity: 0.72 }}>{desc}</p>
            </button>
          )
        })}
      </div>

      <button onClick={() => selected && onNext()} style={{
        width: "100%", padding: 13, borderRadius: 14, border: "none",
        cursor: selected ? "pointer" : "default",
        background: selected ? "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)" : "rgba(168,200,240,0.25)",
        color: selected ? "white" : "#5a6a8a", fontWeight: 600, fontSize: 14,
        transition: "all 0.3s",
      }}>
        {selected ? "Continue →" : "Choose one to continue"}
      </button>
    </Card>
  )
}

// ─── Energy card ──────────────────────────────────────────────────────────────

function EnergyCard({ selected, onSelect, onNext }: {
  selected: number; onSelect: (v: number) => void; onNext: () => void
}) {
  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a6a8a", margin: "0 0 4px" }}>Step 2 of 2</p>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 4px" }}>How is your energy today?</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: 0 }}>Tap the level that feels right</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
        {ENERGY_OPTIONS.map(({ v, l }) => {
          const sel = selected === v
          const pct = (v - 1) / 4
          return (
            <button key={v} onClick={() => onSelect(v)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 14, border: sel ? "1.5px solid rgba(232,112,64,0.5)" : "0.5px solid rgba(168,200,240,0.4)",
              cursor: "pointer",
              background: sel ? `linear-gradient(135deg,#a8c8f0,#f5b87a ${50 + pct * 20}%,${pct > 0.6 ? "#e87040" : "#f5b87a"})` : "rgba(255,248,240,0.7)",
              transform: sel ? "scale(1.025)" : "scale(1)",
              transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: sel ? "white" : "#5a6a8a" }}>{l}</span>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} style={{ width: 4, height: 5 + n * 3, borderRadius: 3, background: n <= v ? (sel ? "rgba(255,255,255,0.8)" : "rgba(232,112,64,0.52)") : "rgba(168,200,240,0.25)", transition: "all 0.25s" }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <button onClick={onNext} style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)", color: "white", fontWeight: 600, fontSize: 14 }}>
        Continue →
      </button>
    </Card>
  )
}

// ─── Breathing exercise ───────────────────────────────────────────────────────

function BreathingExercise({ phase, count, done, onComplete }: {
  phase: BreathPhase; count: number; done: boolean; onComplete: () => void
}) {
  const label = { inhale: "Breathe in…", hold: "Hold…", exhale: "Breathe out…", rest: "Rest…" }
  const scale = { inhale: 1.38, hold: 1.38, exhale: 1, rest: 1 }
  const dur   = { inhale: "1.5s", hold: "0.1s", exhale: "1.5s", rest: "0.1s" }

  if (done) return (
    <Card>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", margin: "0 auto 14px", background: "linear-gradient(135deg,rgba(168,200,240,0.28),rgba(245,184,122,0.18))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wind size={30} color="#a8c8f0" />
        </div>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 6px" }}>Nice breathing!</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: "0 0 20px" }}>You completed 2 breath cycles. Take a moment to notice how you feel.</p>
        <button onClick={onComplete} style={{
          width: "100%", height: 52, borderRadius: 16, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#a8c8f0,#f5b87a)", color: "white",
          fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </Card>
  )

  return (
    <div className="anim-fade" style={{ textAlign: "center", width: "100%", maxWidth: 340 }}>
      <div style={{ position: "relative", width: 190, height: 190, margin: "0 auto 22px" }}>
        {/* outer glow */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,200,240,0.18),transparent 70%)", transform: `scale(${scale[phase] * 1.18})`, transition: `transform ${dur[phase]} ease-in-out` }} />
        {/* mid ring */}
        <div style={{ position: "absolute", inset: "10%", borderRadius: "50%", background: "radial-gradient(circle,rgba(245,184,122,0.22),transparent 70%)", transform: `scale(${scale[phase] * 1.08})`, transition: `transform ${dur[phase]} ease-in-out` }} />
        {/* core */}
        <div style={{ position: "absolute", inset: "20%", borderRadius: "50%", background: "linear-gradient(135deg,rgba(168,200,240,0.9),rgba(245,184,122,0.9),rgba(232,112,64,0.9))", boxShadow: "0 18px 50px rgba(168,200,240,0.35)", transform: `scale(${scale[phase]})`, transition: `transform ${dur[phase]} ease-in-out`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wind size={32} color="white" style={{ opacity: 0.85 }} />
        </div>
        {/* outline ring */}
        <div style={{ position: "absolute", inset: "18%", borderRadius: "50%", border: "1.5px solid rgba(232,112,64,0.38)", transform: `scale(${scale[phase]})`, transition: `transform ${dur[phase]} ease-in-out` }} />
      </div>

      <p key={phase} className="anim-fade" style={{ fontSize: 28, fontWeight: 300, color: "#2d3a5c", margin: "0 0 8px" }}>{label[phase]}</p>
      <p style={{ fontSize: 13, color: "#5a6a8a", margin: "0 0 18px" }}>Cycle {count + 1} of 2</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < count ? "#4ade80" : i === count ? "#e87040" : "rgba(168,200,240,0.4)", transition: "all 0.3s", transform: i === count ? "scale(1.3)" : "scale(1)" }} />
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onComplete} style={{ color: "#5a6a8a" }}>Skip breathing exercise</Button>
    </div>
  )
}

// ─── After breathing ──────────────────────────────────────────────────────────

function AfterBreathingCard({ onFeelBetter, onStillBad }: { onFeelBetter: () => void; onStillBad: () => void }) {
  const [hovered, setHovered] = useState<"better" | "bad" | null>(null)

  const btns = [
    { id: "better" as const, label: "Feeling better", sub: "I'm doing okay",   grad: ["#86efac", "#4ade80", "#22c55e"] as [string,string,string], glow: "#4ade8045", Icon: Check,  strokeWidth: 3, fill: false, onClick: onFeelBetter },
    { id: "bad"    as const, label: "Need support",    sub: "Still struggling", grad: ["#fca5a5", "#f87171", "#ef4444"] as [string,string,string], glow: "#f8717145", Icon: Heart, strokeWidth: 2, fill: true,  onClick: onStillBad   },
  ]

  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 68, height: 68, margin: "0 auto 12px" }}>
          <div style={{ position: "absolute", inset: -7, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,184,122,0.18),transparent 70%)", animation: "fl-breathe 3s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(245,184,122,0.28)", animation: "fl-ripple 3s 0.5s ease-out infinite" }} />
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,rgba(168,200,240,0.16),rgba(245,184,122,0.12),rgba(232,112,64,0.1))", border: "0.5px solid rgba(245,184,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={28} color="#e87040" />
          </div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 5px" }}>How are you feeling now?</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: 0 }}>Sometimes a moment of pause is all we need</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 18 }}>
        {btns.map(b => {
          const isHov = hovered === b.id
          return (
            <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <MoodCircle
                size={72}
                grad={b.grad}
                glow={b.glow}
                hovered={isHov}
                onEnter={() => setHovered(b.id)}
                onLeave={() => setHovered(null)}
                onClick={b.onClick}
              >
                <b.Icon size={24} style={{ color: isHov ? "white" : b.grad[1], fill: b.fill && isHov ? "white" : "none", transition: "color 0.3s" } as React.CSSProperties} strokeWidth={b.strokeWidth} />
              </MoodCircle>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: isHov ? b.grad[1] : "#2d3a5c", transition: "color 0.3s" }}>{b.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a", opacity: isHov ? 1 : 0.65, transition: "all 0.3s" }}>{b.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#5a6a8a", margin: 0, opacity: 0.7 }}>Your response is completely private</p>
    </Card>
  )
}

// ─── Bad response ─────────────────────────────────────────────────────────────

function BadResponseCard({ onReset, onOpenMobileApp }: { onReset: () => void; onOpenMobileApp: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const resources = [
    { id: "therapist", label: "Talk to a Therapist", sub: "Schedule with a certified therapist", grad: ["#c4b5fd", "#8b5cf6"] as [string,string], glow: "#8b5cf640" },
    { id: "crisis",    label: "Crisis Support",      sub: "Available 24/7",                      grad: ["#fca5a5", "#f87171"] as [string,string], glow: "#f8717140" },
  ]

  return (
    <Card accentColors="linear-gradient(90deg,#f5b87a,#e87040,#f5b87a)">
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", margin: "0 auto 10px", background: "linear-gradient(135deg,rgba(245,184,122,0.22),rgba(232,112,64,0.18))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={22} color="#e87040" />
        </div>
        <p style={{ fontSize: 20, fontWeight: 600, color: "#2d3a5c", margin: "0 0 4px" }}>We're here for you</p>
        <p style={{ fontSize: 13, color: "#5a6a8a", margin: 0 }}>You don't have to navigate this alone</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>

        {/* App CTA */}
        <div style={{ borderRadius: 18, padding: "14px 12px", background: "linear-gradient(160deg,rgba(168,200,240,0.1),rgba(245,184,122,0.07))", border: "0.5px solid rgba(168,200,240,0.28)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a6a8a" }}>Go to App</p>
          <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a", textAlign: "center", lineHeight: 1.4 }}>Do a memory recall session on the FeelLift App</p>

          <div style={{ position: "relative", padding: 14 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(232,112,64,0.3)", animation: "fl-ring 2.5s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1.5px solid rgba(245,184,122,0.22)", animation: "fl-ring 2.5s 0.7s ease-in-out infinite", pointerEvents: "none" }} />
            <button
              onClick={() => { window.location.href = "https://app-feellift-1.vercel.app/lift" }}
              onMouseEnter={() => setHovered("app")}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 72, height: 72, borderRadius: "50%", border: "none", cursor: "pointer",
                background: hovered === "app" ? "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)" : "linear-gradient(135deg,rgba(168,200,240,0.3),rgba(245,184,122,0.2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: hovered === "app" ? "0 10px 28px rgba(232,112,64,0.32)" : "0 4px 14px rgba(168,200,240,0.2)",
                transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                transform: hovered === "app" ? "scale(1.08)" : "scale(1)",
              }}
            >
              <img src="/logo-my-1.png" alt="App" width={44} height={44} style={{ borderRadius: 12 }} />
            </button>
          </div>

          <div>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: "#2d3a5c", textAlign: "center" }}>Open App</p>
            <p style={{ margin: 0, fontSize: 10, color: "#5a6a8a", textAlign: "center" }}>Continue privately</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "4px 8px", borderRadius: 20, background: "rgba(74,222,128,0.12)", fontSize: 10, fontWeight: 500, color: "#22c55e" }}>
              <Lock size={9} /> 100% Private
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "4px 8px", borderRadius: 20, background: "rgba(168,200,240,0.18)", fontSize: 10, color: "#5a6a8a" }}>
              <Shield size={9} /> Not shared with employer
            </div>
          </div>
        </div>

        {/* Resources */}
        <div style={{ borderRadius: 18, padding: "14px 12px", background: "linear-gradient(160deg,rgba(245,184,122,0.1),rgba(232,112,64,0.06))", border: "0.5px solid rgba(245,184,122,0.26)", display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a6a8a", textAlign: "center" }}>Immediate Help</p>

          {resources.map((r, i) => {
            const isHov = hovered === r.id
            return (
              <button key={r.id}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 10px",
                  borderRadius: 14, border: "none", cursor: "pointer", textAlign: "left",
                  background: isHov ? "white" : "rgba(255,255,255,0.55)",
                  boxShadow: isHov ? `0 6px 20px ${r.glow}, 0 2px 8px rgba(168,200,240,0.12)` : "0 2px 8px rgba(168,200,240,0.1)",
                  transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isHov ? "scale(1.03) translateX(2px)" : "scale(1)",
                  animation: `fl-slide-up 0.4s ${0.1 + i * 0.08}s ease both`,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: isHov ? `linear-gradient(135deg,${r.grad[0]},${r.grad[1]})` : `${r.grad[1]}18`, boxShadow: isHov ? `0 4px 12px ${r.glow}` : "none", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.22s" }}>
                  <ArrowRight size={12} color={isHov ? "white" : r.grad[1]} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#2d3a5c", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "#5a6a8a", letterSpacing: "0.02em" }}>{r.sub}</p>
                </div>
              </button>
            )
          })}

          <p style={{ margin: "auto 0 0", fontSize: 9, color: "#5a6a8a", textAlign: "center", opacity: 0.7, lineHeight: 1.4 }}>
            All resources are confidential and independent of your workplace
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Button variant="ghost" size="sm" onClick={onReset} style={{ color: "#5a6a8a" }}>I'll check in later</Button>
      </div>
    </Card>
  )
}