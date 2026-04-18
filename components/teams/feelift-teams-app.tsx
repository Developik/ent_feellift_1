"use client"

import { useState, useEffect, useRef } from "react"
import {
  Heart, Sun, Shield, Lock, Send, Sparkles,
  MessageCircle, LifeBuoy, Settings as SettingsIcon,
  Check, Phone, BookOpen, Wind, Trash2, ChevronRight,
  AlertTriangle, Eye, Bell, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "chat" | "support" | "settings"
type ChatStep = 0 | 1 | 2 | 3  // check-in, reflect, suggest, wrap-up
type Sender = "ai" | "user"

interface ChatMessage {
  id: number
  sender: Sender
  text: string
  replies?: string[]       // quick-reply chips (for ai messages)
  step?: ChatStep          // which step this message advanced to
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface FeeliftTeamsAppProps {
  isVisible: boolean
  onOpenMobileApp: () => void
}

const STEP_LABELS = ["Check-in", "Reflect", "Suggest", "Wrap-up"] as const
const SESSION_LIMIT = 5 * 60 // 5:00

const CSS = `
  @keyframes fl-breathe  { 0%,100%{transform:scale(1)}                         50%{transform:scale(1.08)} }
  @keyframes fl-fade-in  { from{opacity:0;transform:translateY(8px)}           to{opacity:1;transform:none} }
  @keyframes fl-pop      { 0%{transform:scale(0.85);opacity:0}                 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
  @keyframes fl-dot      { 0%,100%{transform:translateY(0);opacity:0.4}        50%{transform:translateY(-4px);opacity:1} }
  @keyframes fl-slide-up { from{opacity:0;transform:translateY(12px)}          to{opacity:1;transform:none} }
  @keyframes fl-shimmer  { 0%{background-position:200% 0}                      100%{background-position:-200% 0} }
  @keyframes fl-stepPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(232,112,64,0.45)}   70%{box-shadow:0 0 0 8px rgba(232,112,64,0)} }
  .anim-fade { animation: fl-fade-in 0.35s ease both }
  .anim-pop  { animation: fl-pop     0.4s  ease both }
  .anim-up   { animation: fl-slide-up 0.4s ease both }
  .fl-scroll::-webkit-scrollbar { width: 4px }
  .fl-scroll::-webkit-scrollbar-thumb { background: rgba(168,200,240,0.4); border-radius: 4px }
`

export function FeeliftTeamsApp({ isVisible, onOpenMobileApp }: FeeliftTeamsAppProps) {
  const [activeTab, setActiveTab] = useState<TabId>("chat")

  // Memory state — for the demo, a past topic is remembered by default.
  const [memoriesEnabled, setMemoriesEnabled] = useState(true)
  const [hasPastMemory, setHasPastMemory] = useState(true)

  if (!isVisible) return null

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg,#fff8f0 0%,#fef5eb 50%,#fdf2e6 100%)",
        fontFamily: "var(--font-sans, system-ui)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{CSS}</style>

      {/* Ambient blobs */}
      <div style={{ position: "absolute", pointerEvents: "none", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,200,240,0.18),transparent 70%)", top: -50, right: -50, animation: "fl-breathe 7s ease-in-out infinite" }} />
      <div style={{ position: "absolute", pointerEvents: "none", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,184,122,0.14),transparent 70%)", bottom: 60, left: -30, animation: "fl-breathe 9s 1s ease-in-out infinite" }} />

      {/* ── Header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
          borderBottom: "0.5px solid rgba(168,200,240,0.28)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, overflow: "hidden", flexShrink: 0, animation: "fl-breathe 3s ease-in-out infinite", boxShadow: "0 0 14px rgba(232,112,64,0.22)" }}>
            <img src="/logo-my-1.png" alt="FeelLift" width={38} height={38} style={{ display: "block" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#2d3a5c", lineHeight: 1.2 }}>FeelLift</p>
            <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a", lineHeight: 1.2 }}>Anonymous &amp; confidential</p>
          </div>
        </div>

        <TabBar active={activeTab} onChange={setActiveTab} />
      </header>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          padding: 0,
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
        }}
      >
        {activeTab === "chat" && (
          <ChatView
            memoriesEnabled={memoriesEnabled}
            hasPastMemory={hasPastMemory && memoriesEnabled}
            onOpenSettings={() => setActiveTab("settings")}
            onOpenSupport={() => setActiveTab("support")}
          />
        )}
        {activeTab === "support" && (
          <SupportView onOpenMobileApp={onOpenMobileApp} />
        )}
        {activeTab === "settings" && (
          <SettingsView
            memoriesEnabled={memoriesEnabled}
            onToggleMemories={() => setMemoriesEnabled(v => !v)}
            hasPastMemory={hasPastMemory}
            onDeleteMemories={() => setHasPastMemory(false)}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 16px",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
          borderTop: "0.5px solid rgba(168,200,240,0.22)",
          background: "linear-gradient(90deg,rgba(168,200,240,0.08),rgba(245,184,122,0.06))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#2d3a5c" }}>
            <Sun size={13} color="#e87040" /> 5 day streak
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(168,200,240,0.6)" }} />
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a6a8a" }}>
            <Shield size={13} color="#4ade80" /> Responses aggregated anonymously
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#5a6a8a" }}>Last check-in: Yesterday</span>
      </footer>
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string; Icon: typeof MessageCircle }[] = [
    { id: "chat",     label: "Chat",     Icon: MessageCircle },
    { id: "support",  label: "Support",  Icon: LifeBuoy      },
    { id: "settings", label: "Settings", Icon: SettingsIcon  },
  ]
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: "rgba(168,200,240,0.14)",
        border: "0.5px solid rgba(168,200,240,0.28)",
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              fontSize: 11,
              fontWeight: 600,
              color: isActive ? "white" : "#5a6a8a",
              background: isActive
                ? "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)"
                : "transparent",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: isActive ? "0 4px 12px rgba(232,112,64,0.24)" : "none",
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function ShimmerBar({ colors }: { colors: string }) {
  return (
    <div
      style={{
        height: 3,
        background: colors,
        backgroundSize: "200% 100%",
        animation: "fl-shimmer 4s linear infinite",
      }}
    />
  )
}

function Panel({
  children,
  accentColors = "linear-gradient(90deg,#a8c8f0,#f5b87a,#e87040,#f5b87a,#a8c8f0)",
  style,
}: {
  children: React.ReactNode
  accentColors?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="anim-pop"
      style={{
        width: "100%",
        maxWidth: 460,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 22,
        border: "0.5px solid rgba(168,200,240,0.28)",
        boxShadow: "0 12px 40px rgba(168,200,240,0.22), 0 4px 16px rgba(245,184,122,0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <ShimmerBar colors={accentColors} />
      {children}
    </div>
  )
}

// ─── CHAT VIEW ────────────────────────────────────────────────────────────────

function ChatView({
  memoriesEnabled,
  hasPastMemory,
  onOpenSettings,
  onOpenSupport,
}: {
  memoriesEnabled: boolean
  hasPastMemory: boolean
  onOpenSettings: () => void
  onOpenSupport: () => void
}) {
  const [step, setStep] = useState<ChatStep>(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [memoryHandled, setMemoryHandled] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(1)

  // Start timer
  useEffect(() => {
    const iv = setInterval(() => setSeconds(s => Math.min(s + 1, SESSION_LIMIT)), 1000)
    return () => clearInterval(iv)
  }, [])

  // Seed the opening message
  useEffect(() => {
    const opener: ChatMessage = {
      id: idRef.current++,
      sender: "ai",
      step: 0,
      text:
        "Hello! I'm here to support you today. This is a safe space to share what's on your mind. What would you like to talk about?",
    }
    const first: ChatMessage[] = [opener]

    if (hasPastMemory && memoriesEnabled) {
      first.push({
        id: idRef.current++,
        sender: "ai",
        step: 0,
        text:
          "Last week you mentioned feeling uncertain about the Q3 restructuring announcement. Would you like to revisit that, or start fresh today?",
        replies: ["Revisit that topic", "Start fresh today"],
      })
    } else {
      first[0].replies = ["Work is stressful", "Feeling good", "Not sure"]
    }
    setMessages(first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const pushAi = (text: string, opts?: { replies?: string[]; step?: ChatStep; delay?: number }) => {
    const delay = opts?.delay ?? 700
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [
        ...m,
        { id: idRef.current++, sender: "ai", text, replies: opts?.replies, step: opts?.step },
      ])
      if (opts?.step !== undefined) setStep(opts.step)
    }, delay)
  }

  const pushUser = (text: string) => {
    setMessages(m => [...m, { id: idRef.current++, sender: "user", text }])
  }

  const handleSend = (value: string) => {
    const text = value.trim()
    if (!text) return
    pushUser(text)
    setInput("")
    advanceConversation(text)
  }

  // Drives the scripted demo conversation.
  function advanceConversation(userText: string) {
    const lower = userText.toLowerCase()

    // Handle the memory branch on first reply
    if (hasPastMemory && memoriesEnabled && !memoryHandled) {
      setMemoryHandled(true)
      if (
        lower.includes("revisit") ||
        lower.includes("that topic") ||
        lower.includes("q3") ||
        lower.includes("restructuring")
      ) {
        pushAi(
          "Thanks for letting me come back to that with you. What's sitting with you most about the announcement right now?",
          { step: 1, replies: ["Worried about my role", "Unclear direction", "The pace of change"] }
        )
        return
      }
      if (lower.includes("fresh") || lower.includes("new") || lower.includes("something new")) {
        pushAi(
          "Of course — we'll leave that for another time. How are you feeling about work today?",
          { step: 0, replies: ["Stressed", "OK, just tired", "Actually good"] }
        )
        return
      }
      // fall through to normal flow
    }

    // Step progression
    if (step === 0) {
      // Check-in → Reflect
      pushAi(
        "Thanks for sharing that. What's contributing to how you're feeling — is there a recent change or pressure behind it?",
        { step: 1, replies: ["Workload", "Leadership clarity", "Team dynamics"] }
      )
      return
    }

    if (step === 1) {
      // Reflect → Suggest (include a company-context nudge, per the brief)
      pushAi(
        "That makes sense, and I appreciate you naming it. A lot of folks on your team have been sitting with similar feelings this week.",
        { delay: 600 }
      )
      setTimeout(() => {
        pushAi(
          "Quick note from leadership that may help: no team-level decisions have been finalized after last week's announcement — the CEO confirmed updates will come by end of month. In the meantime, try taking it one day at a time.",
          { step: 2, delay: 1200, replies: ["Try a 60-sec reset", "That helps", "Still overwhelmed"] }
        )
      }, 900)
      return
    }

    if (step === 2) {
      // Suggest → Wrap-up (route to Support if they say "overwhelmed")
      if (lower.includes("overwhelmed") || lower.includes("struggl") || lower.includes("crisis")) {
        pushAi(
          "I hear you — that's a lot to carry. I'd like to point you to a few private resources outside of this check-in.",
          { delay: 500 }
        )
        setTimeout(() => {
          pushAi(
            "You can open the Support tab anytime for a confidential line or professional help. None of this is shared with your employer.",
            { step: 3, delay: 1100, replies: ["Open Support", "Finish check-in"] }
          )
        }, 900)
        return
      }
      pushAi(
        "Great. Here's a suggestion you can try right now: 4 slow breaths — in for 4, out for 6. It takes under a minute and can soften the edges of a tough moment.",
        { delay: 600 }
      )
      setTimeout(() => {
        pushAi(
          "Before we wrap: is there one small thing you'd like to carry into the rest of your day?",
          { step: 3, delay: 1100, replies: ["A calmer mindset", "A clearer focus", "Skip — I'm good"] }
        )
      }, 1000)
      return
    }

    if (step === 3) {
      // Wrap-up
      if (lower.includes("open support")) {
        pushAi("Opening Support now. Take care of yourself.", { delay: 400 })
        setTimeout(onOpenSupport, 600)
        return
      }
      pushAi(
        "Thank you for checking in today. Your response is combined anonymously with others and only used to help leadership make better decisions — nothing is tied back to you. See you next week.",
        { delay: 700 }
      )
    }
  }

  const sessionLabel = `${formatTime(seconds)} / ${formatTime(SESSION_LIMIT)}`
  const sessionPct = Math.min(100, (seconds / SESSION_LIMIT) * 100)

  return (
    <div style={{ width: "100%", height: "100%", padding: "12px 16px", display: "flex", justifyContent: "center", boxSizing: "border-box" }}>
      <Panel style={{ height: "100%" }}>
        {/* Progress / session row */}
        <div style={{ padding: "10px 14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5a6a8a", fontVariantNumeric: "tabular-nums" }}>
              <Sparkles size={12} color="#e87040" />
              <span style={{ fontWeight: 600, color: "#2d3a5c" }}>{sessionLabel}</span>
              <span style={{ opacity: 0.7 }}>session</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: "rgba(74,222,128,0.12)", fontSize: 10, fontWeight: 600, color: "#22c55e" }}>
              <Lock size={9} /> Anonymous
            </div>
          </div>

          {/* Session progress */}
          <div style={{ height: 2, background: "rgba(168,200,240,0.25)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${sessionPct}%`,
                background: "linear-gradient(90deg,#a8c8f0,#f5b87a,#e87040)",
                transition: "width 0.4s linear",
              }}
            />
          </div>

          {/* Steps */}
          <StepsRow step={step} />
        </div>

        {/* AI Support label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px 8px",
            borderBottom: "0.5px solid rgba(168,200,240,0.2)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(232,112,64,0.26)",
            }}
          >
            <Heart size={13} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#2d3a5c", lineHeight: 1.2 }}>AI Support</p>
            <p style={{ margin: 0, fontSize: 10, color: "#5a6a8a", lineHeight: 1.2 }}>Guided check-in</p>
          </div>
          <button
            onClick={onOpenSettings}
            title="Privacy & settings"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#5a6a8a", padding: 4 }}
          >
            <SettingsIcon size={14} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="fl-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "linear-gradient(180deg,rgba(255,255,255,0.0),rgba(168,200,240,0.04))",
          }}
        >
          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1
            return (
              <MessageBubble
                key={m.id}
                message={m}
                showReplies={isLast && !typing && !!m.replies?.length}
                onReply={(r) => handleSend(r)}
              />
            )
          })}
          {typing && <TypingIndicator />}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input) }}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "10px 12px",
            borderTop: "0.5px solid rgba(168,200,240,0.2)",
            background: "rgba(255,255,255,0.85)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response…"
            style={{
              flex: 1,
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              border: "0.5px solid rgba(168,200,240,0.4)",
              background: "white",
              fontSize: 13,
              color: "#2d3a5c",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              cursor: input.trim() ? "pointer" : "default",
              background: input.trim()
                ? "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)"
                : "rgba(168,200,240,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: input.trim() ? "0 3px 10px rgba(232,112,64,0.24)" : "none",
              transition: "all 0.2s",
            }}
          >
            <Send size={14} color="white" />
          </button>
        </form>

        {/* Disclaimer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderTop: "0.5px solid rgba(168,200,240,0.18)",
            background: "rgba(245,184,122,0.08)",
            fontSize: 10,
            color: "#7a5a3a",
            lineHeight: 1.4,
          }}
        >
          <AlertTriangle size={11} color="#e87040" style={{ flexShrink: 0 }} />
          <span>
            This is not a replacement for professional care. If you&apos;re in crisis, please contact emergency services.
          </span>
        </div>
      </Panel>
    </div>
  )
}

function StepsRow({ step }: { step: ChatStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {STEP_LABELS.map((label, i) => {
        const isActive = i === step
        const isDone = i < step
        return (
          <div key={label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                flexShrink: 0,
                background: isDone
                  ? "linear-gradient(135deg,#86efac,#4ade80)"
                  : isActive
                  ? "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)"
                  : "rgba(168,200,240,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: isActive ? "0 0 0 0 rgba(232,112,64,0.45)" : "none",
                animation: isActive ? "fl-stepPulse 2s ease-out infinite" : "none",
                transition: "background 0.25s",
              }}
            >
              {isDone ? (
                <Check size={9} strokeWidth={3} />
              ) : (
                <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? "white" : "#5a6a8a" }}>{i + 1}</span>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? "#2d3a5c" : isDone ? "#22c55e" : "#8a9ab8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  minWidth: 8,
                  background: isDone ? "rgba(74,222,128,0.55)" : "rgba(168,200,240,0.3)",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MessageBubble({
  message,
  showReplies,
  onReply,
}: {
  message: ChatMessage
  showReplies: boolean
  onReply: (r: string) => void
}) {
  const isAi = message.sender === "ai"
  return (
    <div className="anim-up" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: isAi ? "flex-start" : "flex-end" }}>
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: 16,
          borderBottomLeftRadius: isAi ? 4 : 16,
          borderBottomRightRadius: isAi ? 16 : 4,
          fontSize: 12.5,
          lineHeight: 1.45,
          background: isAi
            ? "rgba(255,248,240,0.95)"
            : "linear-gradient(135deg,#a8c8f0,#f5b87a)",
          color: isAi ? "#2d3a5c" : "white",
          border: isAi ? "0.5px solid rgba(168,200,240,0.3)" : "none",
          boxShadow: isAi
            ? "0 2px 6px rgba(168,200,240,0.12)"
            : "0 4px 14px rgba(245,184,122,0.28)",
        }}
      >
        {message.text}
      </div>
      {showReplies && message.replies && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "100%" }}>
          {message.replies.map((r) => (
            <button
              key={r}
              onClick={() => onReply(r)}
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                border: "0.5px solid rgba(232,112,64,0.4)",
                background: "rgba(255,255,255,0.9)",
                color: "#e87040",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)"
                e.currentTarget.style.color = "white"
                e.currentTarget.style.border = "0.5px solid transparent"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.9)"
                e.currentTarget.style.color = "#e87040"
                e.currentTarget.style.border = "0.5px solid rgba(232,112,64,0.4)"
              }}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="anim-fade" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 16, borderBottomLeftRadius: 4, background: "rgba(255,248,240,0.9)", border: "0.5px solid rgba(168,200,240,0.3)" }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#e87040",
            animation: `fl-dot 1.2s ${i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

function formatTime(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ─── SUPPORT VIEW ─────────────────────────────────────────────────────────────

function SupportView({ onOpenMobileApp }: { onOpenMobileApp: () => void }) {
  const items = [
    {
      id: "crisis",
      Icon: Phone,
      label: "Crisis line",
      sub: "24/7 confidential, free — call or text 988",
      grad: ["#fca5a5", "#f87171"] as [string, string],
      glow: "#f8717140",
      onClick: () => {},
    },
    {
      id: "therapist",
      Icon: Heart,
      label: "Talk to a therapist",
      sub: "Book a session with a certified professional",
      grad: ["#c4b5fd", "#8b5cf6"] as [string, string],
      glow: "#8b5cf640",
      onClick: () => {},
    },
    {
      id: "breathing",
      Icon: Wind,
      label: "60-second breathing reset",
      sub: "Guided inhale / exhale to soften a hard moment",
      grad: ["#a8c8f0", "#60a5fa"] as [string, string],
      glow: "#60a5fa40",
      onClick: () => {},
    },
    {
      id: "articles",
      Icon: BookOpen,
      label: "Self-guided resources",
      sub: "Short reads on workload, clarity, and change",
      grad: ["#fde68a", "#f5b87a"] as [string, string],
      glow: "#f5b87a40",
      onClick: () => {},
    },
  ]

  return (
    <div style={{ width: "100%", height: "100%", padding: "12px 16px", display: "flex", justifyContent: "center", boxSizing: "border-box" }}>
      <Panel>
        <div style={{ padding: "16px 18px 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg,rgba(245,184,122,0.3),rgba(232,112,64,0.25))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(232,112,64,0.18)",
              }}
            >
              <LifeBuoy size={18} color="#e87040" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#2d3a5c" }}>We&apos;re here for you</p>
              <p style={{ margin: 0, fontSize: 12, color: "#5a6a8a" }}>Confidential, independent of your workplace</p>
            </div>
          </div>

          {/* Private-app banner */}
          <button
            onClick={onOpenMobileApp}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 16,
              border: "0.5px solid rgba(168,200,240,0.3)",
              cursor: "pointer",
              marginBottom: 14,
              background: "linear-gradient(135deg,rgba(168,200,240,0.18),rgba(245,184,122,0.12))",
              boxShadow: "0 2px 10px rgba(168,200,240,0.16)",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 8px rgba(232,112,64,0.2)" }}>
              <img src="/logo-my-1.png" alt="FeelLift private app" width={40} height={40} style={{ display: "block" }} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#2d3a5c" }}>Open private FeelLift app</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5a6a8a" }}>Completely separate from your workplace</p>
            </div>
            <ChevronRight size={15} color="#5a6a8a" />
          </button>

          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a6a8a" }}>
            Immediate help
          </p>
        </div>

        <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((r, i) => (
            <button
              key={r.id}
              onClick={r.onClick}
              className="anim-up"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 14,
                border: "0.5px solid rgba(168,200,240,0.25)",
                cursor: "pointer",
                textAlign: "left",
                background: "rgba(255,248,240,0.85)",
                boxShadow: "0 1px 6px rgba(168,200,240,0.12)",
                animationDelay: `${0.05 + i * 0.05}s`,
                transition: "transform 0.18s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${r.grad[0]},${r.grad[1]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${r.glow}`,
                }}
              >
                <r.Icon size={16} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#2d3a5c" }}>{r.label}</p>
                <p style={{ margin: "1px 0 0", fontSize: 11, color: "#5a6a8a" }}>{r.sub}</p>
              </div>
              <ChevronRight size={14} color="#c0cce0" />
            </button>
          ))}

          <div
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "9px 12px",
              borderRadius: 12,
              background: "rgba(248,113,113,0.08)",
              border: "0.5px solid rgba(248,113,113,0.25)",
            }}
          >
            <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 11, color: "#7a3a3a", lineHeight: 1.45 }}>
              If you&apos;re in immediate danger, call your local emergency number. This app is not a substitute for professional care.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

// ─── SETTINGS VIEW ────────────────────────────────────────────────────────────

function SettingsView({
  memoriesEnabled,
  onToggleMemories,
  hasPastMemory,
  onDeleteMemories,
}: {
  memoriesEnabled: boolean
  onToggleMemories: () => void
  hasPastMemory: boolean
  onDeleteMemories: () => void
}) {
  const [notifyWeekly, setNotifyWeekly] = useState(true)
  const [notifyEvent, setNotifyEvent] = useState(true)

  return (
    <div
      className="fl-scroll"
      style={{
        width: "100%",
        height: "100%",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <Panel style={{ height: "fit-content" }}>
        <div style={{ padding: "16px 18px" }}>
          {/* Privacy section */}
          <SectionHeader
            icon={<Shield size={14} color="#22c55e" />}
            title="Your privacy"
            subtitle="How we protect you"
          />
          <div
            style={{
              padding: "11px 13px",
              borderRadius: 14,
              background: "linear-gradient(135deg,rgba(74,222,128,0.08),rgba(168,200,240,0.06))",
              border: "0.5px solid rgba(74,222,128,0.25)",
              fontSize: 11.5,
              color: "#2d3a5c",
              lineHeight: 1.55,
              marginBottom: 14,
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
              Nothing you share here will ever be tied back to you.
            </p>
            <p style={{ margin: 0, color: "#5a6a8a" }}>
              Your responses are combined anonymously with others on your team and only used to help leadership make better decisions.
              Results are never shown for groups smaller than 5 people, and raw conversations are never accessible to your employer.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            <PrivacyBullet Icon={Eye}   text="No individual responses surface to managers or admins" />
            <PrivacyBullet Icon={Lock}  text="Aggregated data has a 12–24 hour processing delay" />
            <PrivacyBullet Icon={Shield} text="Team data is withheld if fewer than 5 people respond" />
          </div>

          {/* Memory section */}
          <SectionHeader
            icon={<Info size={14} color="#e87040" />}
            title="Memory"
            subtitle="What the chat remembers between sessions"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <ToggleRow
              label="Remember past check-ins"
              description="Lets the AI reference topics you've brought up before"
              checked={memoriesEnabled}
              onToggle={onToggleMemories}
            />

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: hasPastMemory ? "rgba(168,200,240,0.1)" : "rgba(74,222,128,0.08)",
                border: "0.5px solid rgba(168,200,240,0.28)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#2d3a5c" }}>
                    Stored memories
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5a6a8a", lineHeight: 1.4 }}>
                    {hasPastMemory
                      ? "1 topic remembered: Q3 restructuring announcement (last week)"
                      : "No topics currently remembered"}
                  </p>
                </div>
                <button
                  onClick={onDeleteMemories}
                  disabled={!hasPastMemory}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "0.5px solid rgba(248,113,113,0.4)",
                    background: hasPastMemory ? "rgba(248,113,113,0.1)" : "rgba(168,200,240,0.1)",
                    color: hasPastMemory ? "#ef4444" : "#8a9ab8",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: hasPastMemory ? "pointer" : "default",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.18s",
                  }}
                >
                  <Trash2 size={11} />
                  {hasPastMemory ? "Delete all" : "Cleared"}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <SectionHeader
            icon={<Bell size={14} color="#a8c8f0" />}
            title="Notifications"
            subtitle="Low-pressure, never spammy"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ToggleRow
              label="Weekly check-in nudge"
              description="A 60-second invite, sent once a week"
              checked={notifyWeekly}
              onToggle={() => setNotifyWeekly(v => !v)}
            />
            <ToggleRow
              label="After major company events"
              description="A short prompt after town halls or announcements"
              checked={notifyEvent}
              onToggle={() => setNotifyEvent(v => !v)}
            />
          </div>
        </div>
      </Panel>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: "rgba(168,200,240,0.14)",
          border: "0.5px solid rgba(168,200,240,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#2d3a5c" }}>{title}</p>
        <p style={{ margin: 0, fontSize: 11, color: "#5a6a8a" }}>{subtitle}</p>
      </div>
    </div>
  )
}

function PrivacyBullet({ Icon, text }: { Icon: typeof Eye; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "rgba(168,200,240,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={11} color="#5a6a8a" />
      </div>
      <p style={{ margin: 0, fontSize: 11.5, color: "#5a6a8a", lineHeight: 1.4 }}>{text}</p>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,248,240,0.8)",
        border: "0.5px solid rgba(168,200,240,0.28)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#2d3a5c" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5a6a8a", lineHeight: 1.4 }}>{description}</p>
      </div>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: checked
            ? "linear-gradient(135deg,#a8c8f0,#f5b87a,#e87040)"
            : "rgba(168,200,240,0.35)",
          position: "relative",
          transition: "background 0.22s",
          flexShrink: 0,
          boxShadow: checked ? "0 2px 8px rgba(232,112,64,0.2)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.22s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        />
      </div>
    </button>
  )
}
