"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Wind, Sparkles, ArrowRight, Heart,
  Sun, Coffee, ChevronRight, Check,
  Shield, Lock, Waves, CloudRain, Zap, Snowflake
} from "lucide-react"

const P = {
  skyTop:     "#a8c8f0",
  peach:      "#f5b87a",
  orange:     "#e87040",
  softOrange: "#f5a070",
  green:      "#4ade80",
  yellow:     "#fbbf24",
  red:        "#f87171",
  textDark:   "#2d3a5c",
  textMid:    "#5a6a8a",
}

const CSS = `
  @keyframes fl-float-a    { 0%,100%{transform:translateY(0) rotate(0deg)}    50%{transform:translateY(-18px) rotate(3deg)} }
  @keyframes fl-float-b    { 0%,100%{transform:translateY(0) rotate(0deg)}    50%{transform:translateY(-12px) rotate(-2deg)} }
  @keyframes fl-scale-in   { 0%{transform:scale(0.85);opacity:0}              100%{transform:scale(1);opacity:1} }
  @keyframes fl-slide-up   { 0%{transform:translateY(16px);opacity:0}         100%{transform:translateY(0);opacity:1} }
  @keyframes fl-slide-down { 0%{transform:translateY(-12px);opacity:0}        100%{transform:translateY(0);opacity:1} }
  @keyframes fl-fade-in    { 0%{opacity:0}                                    100%{opacity:1} }
  @keyframes fl-breathe    { 0%,100%{transform:scale(1)}                      50%{transform:scale(1.07)} }
  @keyframes fl-ripple     { 0%{transform:scale(1);opacity:0.6}               100%{transform:scale(1.6);opacity:0} }
  @keyframes fl-typing     { 0%,100%{transform:translateY(0);opacity:0.4}     50%{transform:translateY(-5px);opacity:1} }
  @keyframes fl-pop        { 0%{transform:scale(0.6) rotate(-8deg);opacity:0} 70%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes fl-shimmer    { 0%{background-position:200% 0}                   100%{background-position:-200% 0} }
  @keyframes fl-sweep      { 0%{transform:translateX(-100%)}                  100%{transform:translateX(100%)} }
  @keyframes fl-ring-pulse { 0%,100%{transform:scale(1);opacity:0.7}          50%{transform:scale(1.2);opacity:0} }
  @keyframes fl-bounce-in  { 0%{transform:scale(0.7);opacity:0}               70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes fl-glow       { 0%,100%{box-shadow:0 0 12px #e8704040}           50%{box-shadow:0 0 28px #e8704080} }
`

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckInStep =
  | "intro"
  | "checkin"
  | "good-response"
  | "ehh-weather"
  | "ehh-energy"
  | "ehh-breathing"
  | "ehh-after"
  | "bad-response"

type BreathPhase = "inhale" | "hold" | "exhale" | "rest"

// ─── Weather & Energy data ────────────────────────────────────────────────────

const WEATHER_OPTIONS = [
  { id: "sunny",    Icon: Sun,        label: "Bright",   desc: "Clear & energized" },
  { id: "calm",     Icon: Waves,      label: "Calm",     desc: "Peaceful, still"   },
  { id: "cloudy",   Icon: Wind,       label: "Mixed",    desc: "Some clouds, okay" },
  { id: "stormy",   Icon: CloudRain,  label: "Heavy",    desc: "Carrying weight"   },
  { id: "electric", Icon: Zap,        label: "Restless", desc: "Energy, no outlet" },
  { id: "frozen",   Icon: Snowflake,  label: "Numb",     desc: "Disconnected"      },
] as const

const ENERGY_OPTIONS = [
  { v: 5, l: "Vibrant"  },
  { v: 4, l: "Flowing"  },
  { v: 3, l: "Steady"   },
  { v: 2, l: "Low"      },
  { v: 1, l: "Depleted" },
] as const

// ─── Shell ────────────────────────────────────────────────────────────────────

interface FeeliftTeamsAppProps {
  isVisible: boolean
  onOpenMobileApp: () => void
}

export function FeeliftTeamsApp({ isVisible, onOpenMobileApp }: FeeliftTeamsAppProps) {
  const [step,                setStep]                = useState<CheckInStep>("intro")
  const [weather,             setWeather]             = useState<string | null>(null)
  const [energy,              setEnergy]              = useState<number>(3)
  const [breathPhase,         setBreathPhase]         = useState<BreathPhase>("rest")
  const [breathCount,         setBreathCount]         = useState(0)
  const [breathCycleComplete, setBreathCycleComplete] = useState(false)
  const breathRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isVisible) return
    const t = setTimeout(() => setStep("checkin"), 2000)
    return () => clearTimeout(t)
  }, [isVisible])

  useEffect(() => {
    if (step !== "ehh-breathing") {
      if (breathRef.current) clearTimeout(breathRef.current)
      return
    }
    setBreathPhase("inhale")
    let cycles = 0
    const phases: { name: BreathPhase; duration: number }[] = [
      { name: "inhale", duration: 1500 },
      { name: "hold",   duration: 500  },
      { name: "exhale", duration: 1500 },
      { name: "rest",   duration: 300  },
    ]
    let idx = 0
    const run = () => {
      setBreathPhase(phases[idx].name)
      breathRef.current = setTimeout(() => {
        idx++
        if (idx >= phases.length) {
          idx = 0; cycles++
          setBreathCount(cycles)
          if (cycles >= 2) { setBreathCycleComplete(true); return }
        }
        run()
      }, phases[idx].duration)
    }
    run()
    return () => { if (breathRef.current) clearTimeout(breathRef.current) }
  }, [step])

  const onMood = (mood: "good" | "ehh" | "bad") => {
    if (mood === "good") {
      setStep("good-response")
    } else {
      // Both "ehh" and "bad" go through the same weather → energy → breathing flow
      setStep("ehh-weather")
    }
  }

  const reset = () => {
    setWeather(null)
    setEnergy(3)
    setStep("intro")
    setTimeout(() => setStep("checkin"), 2000)
  }

  if (!isVisible) return null

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "linear-gradient(175deg,#fff8f0 0%,#fef5eb 50%,#fdf2e6 100%)" }}>
      <style>{CSS}</style>

      {/* Ambient blobs */}
      <div className="absolute pointer-events-none" style={{ width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle,${P.skyTop}20,transparent 70%)`, top: -60, right: -60, animation: "fl-float-a 7s ease-in-out infinite" }} />
      <div className="absolute pointer-events-none" style={{ width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle,${P.peach}15,transparent 70%)`, bottom: 60, left: -40, animation: "fl-float-b 9s ease-in-out infinite" }} />

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between relative z-10" style={{ borderBottom: `1px solid ${P.skyTop}30` }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: ``, animation: "fl-glow 3s ease-in-out infinite" }}>
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
          <div>
            <h1 className="text-lg font-semibold" style={{ color: P.textDark }}>FeelLift</h1>
            <p className="text-xs" style={{ color: P.textMid }}>Daily Check-in</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ background: `${P.green}15`, color: P.green }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.green }} />
          Secure
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        {step === "intro"          && <IntroAnimation />}
        {step === "checkin"        && <CheckInCard onMoodSelect={onMood} />}
        {step === "good-response"  && <GoodResponseCard onReset={reset} />}
        {step === "ehh-weather"    && (
          <WeatherCard
            selected={weather}
            onSelect={setWeather}
            onNext={() => setStep("ehh-energy")}
          />
        )}
        {step === "ehh-energy"     && (
          <EnergyCard
            selected={energy}
            onSelect={setEnergy}
            onNext={() => {
              setBreathCount(0)
              setBreathCycleComplete(false)
              setStep("ehh-breathing")
            }}
          />
        )}
        {step === "ehh-breathing"  && (
          <BreathingExercise
            phase={breathPhase}
            cycleCount={breathCount}
            isComplete={breathCycleComplete}
            onComplete={() => setStep("ehh-after")}
          />
        )}
        {step === "ehh-after"      && (
          <AfterBreathingCard
            onFeelBetter={() => setStep("good-response")}
            onStillBad={() => setStep("bad-response")}
          />
        )}
        {step === "bad-response"   && <BadResponseCard onReset={reset} />}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 flex items-center justify-between relative z-10" style={{ background: `linear-gradient(90deg,${P.skyTop}10,${P.peach}08)`, borderTop: `1px solid ${P.skyTop}25` }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" style={{ color: P.orange }} />
            <span className="text-sm font-medium" style={{ color: P.textDark }}>5 day streak</span>
          </div>
          <div className="h-4 w-px" style={{ background: P.skyTop }} />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: P.peach }} />
            <span className="text-sm" style={{ color: P.textMid }}>Team wellness: Great</span>
          </div>
        </div>
        <div className="text-xs" style={{ color: P.textMid }}>Last check-in: Yesterday at 9:15 AM</div>
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ShimmerStrip({ colors }: { colors: string }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: colors, backgroundSize: "200% 100%", animation: "fl-shimmer 4s linear infinite", borderRadius: "inherit", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
  )
}

function CircleButton({
  size = 72,
  grad,
  glow,
  hovered,
  onEnter,
  onLeave,
  onClick,
  children,
  pulseRings = true,
}: {
  size?: number
  grad: string[]
  glow: string
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
  children: React.ReactNode
  pulseRings?: boolean
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "relative", width: size, height: size,
        borderRadius: "50%", border: "none", cursor: "pointer", overflow: "visible",
        background: hovered
          ? `linear-gradient(135deg,${grad[0]},${grad[1]},${grad[2] ?? grad[1]})`
          : "rgba(255,248,240,0.9)",
        boxShadow: hovered
          ? `0 14px 36px ${glow},0 4px 14px ${grad[1]}30`
          : `0 4px 14px rgba(168,200,240,0.2)`,
        border: hovered ? "none" : `1.5px solid ${P.skyTop}40`,
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "scale(1.1) translateY(-3px)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      {pulseRings && hovered && (
        <>
          <div style={{ position: "absolute", inset: -8,  borderRadius: "50%", border: `2px solid ${grad[1]}`,   animation: "fl-ring-pulse 1.8s ease-in-out infinite",      pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `2px solid ${grad[1]}50`, animation: "fl-ring-pulse 1.8s 0.5s ease-in-out infinite", pointerEvents: "none" }} />
        </>
      )}
      <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: glow, filter: "blur(12px)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.26) 0%,transparent 55%)" }} />
        {hovered && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.22) 50%,transparent 65%)", animation: "fl-sweep 0.7s ease both" }} />}
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </button>
  )
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntroAnimation() {
  return (
    <div className="text-center space-y-6" style={{ animation: "fl-scale-in 0.8s ease both" }}>
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-3xl" style={{ background: `linear-gradient(135deg,${P.skyTop}40,${P.peach}30,${P.orange}40)`, animation: "fl-breathe 2s ease-in-out infinite" }} />
        <div className="absolute inset-2 rounded-2xl flex items-center justify-center" style={{ background: `` }}>
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
        <div className="absolute inset-0 rounded-3xl" style={{ border: `2px solid ${P.peach}40`, animation: "fl-ripple 2s ease-out infinite" }} />
        <div className="absolute inset-0 rounded-3xl" style={{ border: `2px solid ${P.skyTop}30`, animation: "fl-ripple 2s 0.6s ease-out infinite" }} />
      </div>
      <div style={{ animation: "fl-slide-up 0.6s 0.3s ease both" }}>
        <h2 className="text-2xl font-semibold" style={{ color: P.textDark }}>Good morning, Alex</h2>
        <p className="text-lg mt-2" style={{ color: P.textMid }}>Taking a moment for your daily check-in...</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ background: P.orange, animation: `fl-typing 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

function CheckInCard({ onMoodSelect }: { onMoodSelect: (mood: "good" | "ehh" | "bad") => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const moods = [
    { id: "good", label: "Good",      sub: "Doing well",      grad: ["#86efac", "#4ade80", "#22c55e"], glow: "#4ade8045" },
    { id: "ehh",  label: "OK...",     sub: "Could be better", grad: ["#fde68a", "#fbbf24", "#f59e0b"], glow: "#fbbf2445" },
    { id: "bad",  label: "Not great", sub: "Struggling",      grad: ["#fca5a5", "#f87171", "#ef4444"], glow: "#f8717145" },
  ] as const

  return (
    <div className="max-w-md w-full" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: `0 25px 80px ${P.skyTop}30,0 10px 30px ${P.peach}15`, border: `1px solid ${P.skyTop}25` }}>
        <ShimmerStrip colors={`linear-gradient(90deg,${P.skyTop},${P.peach},${P.orange},${P.peach},${P.skyTop})`} />
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-25" style={{ background: `radial-gradient(circle,${P.peach},transparent)` }} />

        <div className="relative z-10 text-center space-y-10 pt-1">
          <div style={{ animation: "fl-slide-down 0.4s 0.1s ease both" }}>
            <h2 className="text-2xl font-semibold" style={{ color: P.textDark }}>How are you feeling today?</h2>
            <p className="text-sm mt-2" style={{ color: P.textMid }}>Take a moment to check in with yourself</p>
          </div>

          <div className="flex items-start justify-center gap-10" style={{ animation: "fl-slide-up 0.5s 0.2s ease both" }}>
            {moods.map((mood, i) => {
              const isHov = hovered === mood.id
              return (
                <div key={mood.id} className="flex flex-col items-center gap-3" style={{ animation: `fl-bounce-in 0.6s ${0.3 + i * 0.1}s ease both` }}>
                  <CircleButton
                    size={68}
                    grad={[...mood.grad]}
                    glow={mood.glow}
                    hovered={isHov}
                    onEnter={() => setHovered(mood.id)}
                    onLeave={() => setHovered(null)}
                    onClick={() => onMoodSelect(mood.id)}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: isHov ? "rgba(255,255,255,0.35)" : mood.grad[1], boxShadow: isHov ? "none" : `0 2px 8px ${mood.glow}`, transition: "background 0.3s ease" }} />
                  </CircleButton>
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: isHov ? mood.grad[1] : P.textDark, transition: "color 0.3s ease" }}>{mood.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: P.textMid, opacity: isHov ? 1 : 0.65, transform: isHov ? "translateY(0)" : "translateY(-2px)", transition: "all 0.3s ease" }}>{mood.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs" style={{ color: P.textMid, animation: "fl-fade-in 0.5s 0.6s ease both" }}>
            Your response helps us support you better
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Good Response ─────────────────────────────────────────────────────────────

function GoodResponseCard({ onReset }: { onReset: () => void }) {
  const coworkers = [
    { name: "Sarah Chen",     initials: "SC", status: "Free for coffee"   },
    { name: "Marcus Johnson", initials: "MJ", status: "Available to chat" },
  ]

  return (
    <div className="max-w-md w-full" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: `0 25px 80px ${P.green}20,0 10px 30px ${P.skyTop}15`, border: `1px solid ${P.green}30` }}>
        <ShimmerStrip colors="linear-gradient(90deg,#86efac,#4ade80,#22c55e,#4ade80,#86efac)" />

        <div className="text-center space-y-6 pt-1">
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto", animation: "fl-pop 0.5s ease both" }}>
            <div style={{ position: "absolute", inset: -7, borderRadius: "50%", border: "2px solid #4ade8060", animation: "fl-ring-pulse 2s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "#4ade8018", filter: "blur(8px)" }} />
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#86efac,#4ade80,#22c55e)", boxShadow: "0 10px 28px #4ade8040", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.25) 0%,transparent 55%)" }} />
              <Check style={{ width: 32, height: 32, color: "white", strokeWidth: 3, position: "relative", zIndex: 1 }} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold" style={{ color: P.textDark }}>Great to hear!</h2>
            <p className="text-sm mt-2" style={{ color: P.textMid }}>Keep up the positive energy. Here&apos;s a suggestion to make your day even better:</p>
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: `linear-gradient(135deg,${P.skyTop}10,${P.peach}08)`, border: `1px solid ${P.skyTop}20` }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: P.textDark }}>
              <Coffee className="w-4 h-4" style={{ color: P.orange }} />
              Connect with a colleague
            </div>
            {coworkers.map((person, i) => (
              <button key={person.name} className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]" style={{ background: "white", boxShadow: `0 2px 8px ${P.skyTop}20`, animation: `fl-slide-up 0.4s ${0.2 + i * 0.1}s ease both`, border: "none", cursor: "pointer" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ background: P.skyTop }}>{person.initials}</div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium" style={{ color: P.textDark }}>{person.name}</p>
                  <p className="text-xs" style={{ color: P.textMid }}>{person.status}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: P.textMid }} />
              </button>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={onReset} style={{ color: P.textMid }}>Done for today</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Weather Card (shared step 1 of 2) ───────────────────────────────────────

function WeatherCard({
  selected,
  onSelect,
  onNext,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
}) {
  return (
    <div className="max-w-md w-full" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: `0 25px 80px ${P.skyTop}30,0 10px 30px ${P.peach}15`, border: `1px solid ${P.skyTop}25` }}>
        <ShimmerStrip colors={`linear-gradient(90deg,${P.skyTop},${P.peach},${P.orange},${P.peach},${P.skyTop})`} />
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-20" style={{ background: `radial-gradient(circle,${P.skyTop},transparent)` }} />

        <div className="relative z-10 pt-1 space-y-6">
          <div style={{ animation: "fl-slide-down 0.4s 0.1s ease both", textAlign: "center" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: P.textMid }}>Step 1 of 2</p>
            <h2 className="text-2xl font-semibold" style={{ color: P.textDark }}>What&apos;s your inner weather?</h2>
            <p className="text-sm mt-2" style={{ color: P.textMid }}>Choose the landscape that matches you right now</p>
          </div>

          <div className="grid grid-cols-3 gap-3" style={{ animation: "fl-slide-up 0.5s 0.2s ease both" }}>
            {WEATHER_OPTIONS.map(({ id, Icon, label, desc }, i) => {
              const sel = selected === id
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  style={{
                    padding: "12px 10px", borderRadius: 16, textAlign: "left", border: "none", cursor: "pointer",
                    background: sel ? `linear-gradient(135deg,${P.skyTop}22,${P.peach}18)` : "rgba(255,248,240,0.7)",
                    outline: sel ? `1.5px solid ${P.orange}80` : `0.5px solid rgba(168,200,240,0.45)`,
                    transform: sel ? "scale(1.04)" : "scale(1)",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    animation: `fl-pop 0.35s ${0.05 + i * 0.05}s ease both`,
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: sel ? `linear-gradient(135deg,${P.skyTop},${P.peach})` : "rgba(168,200,240,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, transition: "all 0.3s" }}>
                    <Icon size={14} color={sel ? "white" : P.textMid} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: sel ? P.textDark : P.textMid, marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 10, color: P.textMid, opacity: 0.7 }}>{desc}</p>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => selected && onNext()}
            style={{
              width: "100%", padding: "14px", borderRadius: 16, border: "none",
              cursor: selected ? "pointer" : "default",
              background: selected ? `linear-gradient(135deg,${P.skyTop},${P.peach},${P.orange})` : "rgba(168,200,240,0.25)",
              color: selected ? "white" : P.textMid,
              fontWeight: 600, fontSize: 14,
              transition: "all 0.3s ease",
              animation: "fl-fade-in 0.5s 0.5s ease both",
            }}
          >
            {selected ? "Continue →" : "Choose one to continue"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Energy Card (shared step 2 of 2) ────────────────────────────────────────

function EnergyCard({
  selected,
  onSelect,
  onNext,
}: {
  selected: number
  onSelect: (v: number) => void
  onNext: () => void
}) {
  return (
    <div className="max-w-md w-full" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: `0 25px 80px ${P.skyTop}30,0 10px 30px ${P.peach}15`, border: `1px solid ${P.skyTop}25` }}>
        <ShimmerStrip colors={`linear-gradient(90deg,${P.skyTop},${P.peach},${P.orange},${P.peach},${P.skyTop})`} />

        <div className="relative z-10 pt-1 space-y-6">
          <div style={{ animation: "fl-slide-down 0.4s 0.1s ease both", textAlign: "center" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: P.textMid }}>Step 2 of 2</p>
            <h2 className="text-2xl font-semibold" style={{ color: P.textDark }}>How is your energy today?</h2>
            <p className="text-sm mt-2" style={{ color: P.textMid }}>Tap the level that feels right</p>
          </div>

          <div className="flex flex-col gap-2.5" style={{ animation: "fl-slide-up 0.5s 0.2s ease both" }}>
            {ENERGY_OPTIONS.map(({ v, l }) => {
              const sel = selected === v
              const pct = (v - 1) / 4
              return (
                <button
                  key={v}
                  onClick={() => onSelect(v)}
                  style={{
                    padding: "13px 18px", borderRadius: 16, border: "none", cursor: "pointer",
                    background: sel
                      ? `linear-gradient(135deg,${P.skyTop},${P.peach} ${50 + pct * 20}%,${pct > 0.6 ? P.orange : P.peach})`
                      : "rgba(255,248,240,0.7)",
                    outline: sel ? `1.5px solid ${P.orange}60` : `0.5px solid rgba(168,200,240,0.45)`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transform: sel ? "scale(1.025)" : "scale(1)",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: sel ? "white" : P.textMid }}>{l}</span>
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} style={{ width: 5, height: 6 + n * 3, borderRadius: 3, background: n <= v ? (sel ? "rgba(255,255,255,0.8)" : "rgba(232,112,64,0.55)") : "rgba(168,200,240,0.25)", transition: "all 0.3s" }} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={onNext}
            style={{
              width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${P.skyTop},${P.peach},${P.orange})`,
              color: "white", fontWeight: 600, fontSize: 14,
              animation: "fl-fade-in 0.5s 0.3s ease both",
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Breathing Exercise ────────────────────────────────────────────────────────

function BreathingExercise({
  phase,
  cycleCount,
  isComplete,
  onComplete,
}: {
  phase: BreathPhase
  cycleCount: number
  isComplete: boolean
  onComplete: () => void
}) {
  const text     = { inhale: "Breathe in...", hold: "Hold...", exhale: "Breathe out...", rest: "Rest..." }
  const scale    = { inhale: 1.4, hold: 1.4, exhale: 1, rest: 1 }
  const duration = { inhale: "1.5s", hold: "0.1s", exhale: "1.5s", rest: "0.1s" }

  if (isComplete) return (
    <div className="max-w-md w-full text-center" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: `0 25px 80px ${P.skyTop}30`, border: `1px solid ${P.skyTop}25` }}>
        <ShimmerStrip colors={`linear-gradient(90deg,${P.skyTop},${P.peach},${P.orange},${P.peach},${P.skyTop})`} />
        <div className="space-y-6 pt-1">
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${P.skyTop}30,${P.peach}20)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            <Wind className="w-10 h-10" style={{ color: P.skyTop }} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: P.textDark }}>Nice breathing!</h2>
            <p className="text-sm mt-2" style={{ color: P.textMid }}>You completed 2 breath cycles. Take a moment to notice how you feel.</p>
          </div>
          <button
            onClick={onComplete}
            style={{ width: "100%", height: 56, borderRadius: 18, border: "none", cursor: "pointer", position: "relative", overflow: "hidden", background: `linear-gradient(135deg,${P.skyTop},${P.peach})`, boxShadow: `0 8px 24px ${P.skyTop}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "white", fontWeight: 600, fontSize: 15 }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 60%)" }} />
            <span style={{ position: "relative", zIndex: 1 }}>Continue</span>
            <ArrowRight style={{ width: 16, height: 16, position: "relative", zIndex: 1 }} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="text-center space-y-8" style={{ animation: "fl-fade-in 0.5s ease both" }}>
      <div className="relative w-56 h-56 mx-auto">
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle,${P.skyTop}20,transparent 70%)`, transform: `scale(${scale[phase] * 1.2})`, transition: `transform ${duration[phase]} ease-in-out` }} />
        <div className="absolute inset-4 rounded-full" style={{ background: `radial-gradient(circle,${P.peach}25,transparent 70%)`, transform: `scale(${scale[phase] * 1.1})`, transition: `transform ${duration[phase]} ease-in-out` }} />
        <div className="absolute inset-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${P.skyTop}90,${P.peach}90,${P.softOrange}90)`, boxShadow: `0 20px 60px ${P.skyTop}40,inset 0 -5px 20px ${P.orange}20`, transform: `scale(${scale[phase]})`, transition: `transform ${duration[phase]} ease-in-out` }}>
          <Wind className="w-12 h-12 text-white opacity-80" />
        </div>
        <div className="absolute inset-6 rounded-full border-2" style={{ borderColor: `${P.orange}40`, transform: `scale(${scale[phase]})`, transition: `transform ${duration[phase]} ease-in-out` }} />
      </div>
      <div>
        <h2 className="text-3xl font-light" key={phase} style={{ color: P.textDark, animation: "fl-fade-in 0.3s ease both" }}>{text[phase]}</h2>
        <p className="text-sm mt-3" style={{ color: P.textMid }}>Cycle {cycleCount + 1} of 2</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        {[0, 1].map(i => (
          <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{ background: i < cycleCount ? P.green : i === cycleCount ? P.orange : `${P.skyTop}40`, transform: i === cycleCount ? "scale(1.3)" : "scale(1)" }} />
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onComplete} style={{ color: P.textMid }}>Skip breathing exercise</Button>
    </div>
  )
}

// ─── After Breathing ──────────────────────────────────────────────────────────

function AfterBreathingCard({
  onFeelBetter,
  onStillBad,
}: {
  onFeelBetter: () => void
  onStillBad: () => void
}) {
  const [hovered, setHovered] = useState<"better" | "bad" | null>(null)

  const btns = [
    { id: "better" as const, label: "Feeling better", sub: "I'm doing okay",   grad: ["#86efac", "#4ade80", "#22c55e"], glow: "#4ade8045", Icon: Check, strokeWidth: 3, fill: false },
    { id: "bad"    as const, label: "Need support",    sub: "Still struggling", grad: ["#fca5a5", "#f87171", "#ef4444"], glow: "#f8717145", Icon: Heart, strokeWidth: 2, fill: true  },
  ]

  return (
    <div className="max-w-md w-full" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", boxShadow: `0 32px 80px ${P.skyTop}25,0 8px 24px ${P.peach}12`, border: `1px solid ${P.skyTop}20` }}>
        <ShimmerStrip colors={`linear-gradient(90deg,${P.skyTop},${P.peach},${P.orange},${P.peach},${P.skyTop})`} />

        <div className="p-8 pt-9 text-center space-y-8">
          <div style={{ position: "relative", width: 76, height: 76, margin: "0 auto" }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `radial-gradient(circle,${P.peach}20,transparent 70%)`, animation: "fl-breathe 3s ease-in-out infinite" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${P.peach}30`, animation: "fl-ripple 3s 0.5s ease-out infinite" }} />
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: `linear-gradient(135deg,${P.skyTop}18,${P.peach}14,${P.orange}10)`, border: `1px solid ${P.peach}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles className="w-9 h-9" style={{ color: P.orange }} />
            </div>
          </div>

          <div style={{ animation: "fl-slide-down 0.4s 0.1s ease both" }}>
            <h2 className="text-xl font-semibold" style={{ color: P.textDark }}>How are you feeling now?</h2>
            <p className="text-sm mt-2" style={{ color: P.textMid }}>Sometimes a moment of pause is all we need</p>
          </div>

          <div className="flex items-start justify-center gap-12" style={{ animation: "fl-slide-up 0.5s 0.2s ease both" }}>
            {btns.map(b => {
              const isHov = hovered === b.id
              return (
                <div key={b.id} className="flex flex-col items-center gap-3">
                  <CircleButton
                    size={76}
                    grad={[...b.grad]}
                    glow={b.glow}
                    hovered={isHov}
                    onEnter={() => setHovered(b.id)}
                    onLeave={() => setHovered(null)}
                    onClick={b.id === "better" ? onFeelBetter : onStillBad}
                  >
                    <b.Icon style={{ width: 26, height: 26, color: isHov ? "white" : b.grad[1], strokeWidth: b.strokeWidth, fill: b.fill && isHov ? "white" : "none", transition: "color 0.3s ease" }} />
                  </CircleButton>
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: isHov ? b.grad[1] : P.textDark, transition: "color 0.3s ease" }}>{b.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: P.textMid, opacity: isHov ? 1 : 0.65, transform: isHov ? "translateY(0)" : "translateY(-2px)", transition: "all 0.3s ease" }}>{b.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs pb-1" style={{ color: P.textMid, opacity: 0.6, animation: "fl-fade-in 0.5s 0.5s ease both" }}>
            Your response is completely private
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Bad Response ─────────────────────────────────────────────────────────────

function BadResponseCard({ onReset }: { onReset: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const resources = [
    { id: "therapist", label: "Talk to a Therapist", sub: "Schedule an appointment with a company certified therapist", grad: ["#c4b5fd", "#8b5cf6"], glow: "#8b5cf640" },
    { id: "crisis",    label: "Crisis Support",      sub: "Available 24/7",                                            grad: ["#fca5a5", "#f87171"], glow: "#f8717140" },
  ]

  return (
    <div className="max-w-lg w-full" style={{ animation: "fl-scale-in 0.5s ease both" }}>
      <div className="rounded-3xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", boxShadow: `0 32px 80px ${P.skyTop}25,0 8px 24px ${P.peach}12`, border: `1px solid ${P.peach}30` }}>
        <ShimmerStrip colors={`linear-gradient(90deg,${P.peach},${P.orange},${P.peach})`} />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full" style={{ background: `radial-gradient(circle,${P.orange},transparent)`, opacity: 0.12 }} />

        <div className="p-8 pt-9 relative z-10">
          <div className="text-center mb-8" style={{ animation: "fl-slide-down 0.4s 0.1s ease both" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${P.peach}25,${P.orange}20)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Heart className="w-7 h-7" style={{ color: P.orange }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: P.textDark }}>We&apos;re here for you</h2>
            <p className="text-sm mt-1.5" style={{ color: P.textMid }}>You don&apos;t have to navigate this alone</p>
          </div>

          <div className="grid grid-cols-2 gap-4" style={{ animation: "fl-slide-up 0.5s 0.2s ease both" }}>

            {/* Left: App redirect */}
            <div className="rounded-2xl p-5 flex flex-col items-center text-center gap-4" style={{ background: `linear-gradient(160deg,${P.skyTop}12,${P.peach}08)`, border: `1px solid ${P.skyTop}25` }}>
              <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: P.textMid }}>Go to App</p>
              <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>Do a memory recall session on the FeelLift App</p>

              <div style={{ position: "relative", padding: 16 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${P.orange}35`, animation: "fl-ring-pulse 2.5s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `2px solid ${P.peach}25`, animation: "fl-ring-pulse 2.5s 0.7s ease-in-out infinite", pointerEvents: "none" }} />
                <CircleButton
                  size={80}
                  grad={[P.skyTop, P.peach, P.orange]}
                  glow={`${P.orange}45`}
                  hovered={hovered === "app"}
                  onEnter={() => setHovered("app")}
                  onLeave={() => setHovered(null)}
                  onClick={() => { window.location.href = "https://app-feellift-1.vercel.app/lift" }}
                  pulseRings={false}
                >
                  <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 4.5C14.5 5.88071 13.3807 7 12 7C10.6193 7 9.5 5.88071 9.5 4.5C9.5 3.11929 10.6193 2 12 2C13.3807 2 14.5 3.11929 14.5 4.5Z" stroke="#1C274C" strokeWidth="1.5"/>
                    <path d="M21 17L19.8423 16.61C19.6151 16.5335 19.399 16.4267 19.1998 16.2925L19.0985 16.2243C18.4122 15.762 18 14.9837 18 14.1502C18 13.7872 17.9613 13.4321 17.8876 13.0894M3 17L4.1577 16.61C4.38488 16.5335 4.60096 16.4267 4.80022 16.2925L4.90145 16.2243C5.58776 15.762 6 14.9837 6 14.1502C6 11.713 7.74373 9.63312 10.1228 9.23246L11.0136 9.08245C11.5 9 12.5 8.99986 12.9864 9.08245L13.8772 9.23246C14.2705 9.2987 14.6464 9.41083 15 9.56289" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.5 16L8.57549 17.2327C8.42794 17.4294 8.35416 17.5278 8.27135 17.6144C8.06638 17.8287 7.81632 17.9947 7.53929 18.1004C7.42736 18.1432 7.30805 18.173 7.06948 18.2326L5.27607 18.681C4.52611 18.8685 4 19.5423 4 20.3153C4 21.2458 4.75425 22 5.68466 22H6.36842C8.07661 22 9.73871 21.446 11.1053 20.4211L13 19M14.5 16L15.2267 16.9689C15.5701 17.4269 15.7419 17.6558 15.9648 17.825C16.0318 17.8759 16.102 17.9225 16.1749 17.9645C16.4174 18.1043 16.695 18.1738 17.2503 18.3126L18.7239 18.681C19.4739 18.8685 20 19.5423 20 20.3153C20 21.2458 19.2458 22 18.3153 22H17.3776C16.8153 22 16.5342 22 16.2554 21.9844C15.4319 21.9384 14.6172 21.7907 13.83 21.5446C13.5635 21.4613 13.3003 21.3626 12.7738 21.1652L11 20.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </CircleButton>
              </div>

              <div>
                <p className="text-sm font-semibold" style={{ color: P.textDark }}>Open App</p>
                <p className="text-[10px] mt-0.5" style={{ color: P.textMid }}>Tap to continue privately</p>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-full text-[10px] font-medium" style={{ background: `${P.green}15`, color: P.green }}>
                  <Lock style={{ width: 9, height: 9 }} />100% Private
                </div>
                <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-full text-[10px] font-medium" style={{ background: `${P.skyTop}20`, color: P.skyTop }}>
                  <Shield style={{ width: 9, height: 9 }} />Not shared with employer
                </div>
              </div>
            </div>

            {/* Right: Resources */}
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: `linear-gradient(160deg,${P.peach}10,${P.orange}06)`, border: `1px solid ${P.peach}25` }}>
              <p className="text-[10px] tracking-widest uppercase font-bold text-center" style={{ color: P.textMid }}>Immediate Help</p>

              {resources.map((r, i) => {
                const isHov = hovered === r.id
                return (
                  <button
                    key={r.id}
                    onMouseEnter={() => setHovered(r.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 16,
                      border: "none", cursor: "pointer", textAlign: "left",
                      background: isHov ? "white" : "rgba(255,255,255,0.55)",
                      boxShadow: isHov ? `0 8px 24px ${r.glow},0 2px 8px rgba(168,200,240,0.15)` : `0 2px 8px rgba(168,200,240,0.1)`,
                      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: isHov ? "scale(1.03) translateX(2px)" : "scale(1)",
                      animation: `fl-slide-up 0.4s ${0.1 + i * 0.08}s ease both`,
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, position: "relative", overflow: "hidden", background: isHov ? `linear-gradient(135deg,${r.grad[0]},${r.grad[1]})` : `${r.grad[1]}18`, boxShadow: isHov ? `0 4px 14px ${r.glow}` : "none", transition: "all 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 55%)" }} />
                      <ArrowRight style={{ width: 13, height: 13, color: isHov ? "white" : r.grad[1], position: "relative", zIndex: 1, transition: "color 0.25s ease" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: P.textDark, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</p>
                      <p style={{ fontSize: 9, color: P.textMid, marginTop: 2, letterSpacing: "0.03em" }}>{r.sub}</p>
                    </div>
                  </button>
                )
              })}

              <p className="text-[9px] text-center mt-auto pt-1 leading-relaxed" style={{ color: P.textMid, opacity: 0.7 }}>
                All resources are confidential and independent of your workplace
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button variant="ghost" size="sm" onClick={onReset} style={{ color: P.textMid }}>I&apos;ll check in later</Button>
          </div>
        </div>
      </div>
    </div>
  )
}