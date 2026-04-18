"use client"

import { useState, useEffect, useRef } from "react"
import {
  Heart, Sun, Shield, Lock, Send, Sparkles,
  MessageCircle, LifeBuoy, Settings as SettingsIcon,
  Check, Phone, BookOpen, Wind, Trash2, ChevronRight,
  ChevronLeft, AlertTriangle, Info, Calendar, Clock,
  MessageSquareText,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "chat" | "support" | "settings"
type ChatStep = 0 | 1 | 2 | 3  // check-in, reflect, suggest, wrap-up
type Sender = "ai" | "user"
type SupportPageId = "list" | "crisis" | "therapist" | "breathing" | "articles"

interface ChatMessage {
  id: number
  sender: Sender
  text: string
  replies?: string[]       // quick-reply chips (for ai messages)
  step?: ChatStep          // which step this message advanced to
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AuraTeamsAppProps {
  isVisible: boolean
}

const STEP_LABELS = ["Check-in", "Reflect", "Suggest", "Wrap-up"] as const

// ── Psychologist-informed micro-copy helpers ───────────────────────────────
// Each helper returns a short line tuned to what the user just disclosed.
// Tone: warm, specific, non-performative; never "I understand", always
// "That makes sense" / "That tracks". Reflections mirror before moving.

function parseArea(lower: string): "work" | "life" | "both" | "not-sure" {
  if (/both/.test(lower)) return "both"
  if (/life|home|family|personal|outside/.test(lower)) return "life"
  if (/work|job|team|manager|boss|career|office/.test(lower)) return "work"
  return "not-sure"
}

function areaReflect(area: "work" | "life" | "both" | "not-sure"): string {
  switch (area) {
    case "work": return "Work stuff can be especially sticky because it follows us home. Thanks for saying."
    case "life": return "Life outside work asks a lot — even when nothing is technically wrong, it can still wear you down."
    case "both": return "That combination is heavy. When both sides are asking for something, it's hard to find a place to land."
    case "not-sure": return "That's okay. Sometimes it's just a cloudy day, not a clear reason."
  }
}

// Maps a user reply (quick-reply label or free-text) to a single feeling word.
function parseFeeling(lower: string, original: string): string {
  if (/overwhelm/.test(lower)) return "Overwhelmed"
  if (/anx|nerv|worr|panic/.test(lower)) return "Anxious"
  if (/frustr|angry|mad|irrit/.test(lower)) return "Frustrated"
  if (/stuck|blocked|paralyz/.test(lower)) return "Stuck"
  if (/sad|down|cry|tear/.test(lower)) return "Sad"
  if (/flat|numb|empty|nothing/.test(lower)) return "Flat"
  if (/tired|exhaust|drain|burn/.test(lower)) return "Tired"
  if (/calm|peace|steady|settl/.test(lower)) return "Calm"
  if (/focus|clear|sharp/.test(lower)) return "Focused"
  if (/content|satisf|grateful/.test(lower)) return "Content"
  // Fall back to the first word the user offered, capitalized.
  const first = original.trim().split(/\s+/)[0] || "Something"
  return first[0]?.toUpperCase() + first.slice(1).toLowerCase()
}

// Short validation per feeling — normalizes, doesn't pathologize.
function feelingValidate(feeling: string): string {
  const f = feeling.toLowerCase()
  if (f.startsWith("overwhelm"))
    return "Overwhelm usually shows up when more is coming in than you can process. That's a human response, not a weakness."
  if (f.startsWith("anx"))
    return "Anxiety is often your system working overtime to protect you. It isn't who you are — and it doesn't get the final word."
  if (f.startsWith("frustr"))
    return "Frustration usually means something matters to you and feels outside your control. That tracks."
  if (f.startsWith("stuck"))
    return "Stuck can feel like failure, but it's often just your mind asking for a different angle."
  if (f.startsWith("sad"))
    return "Sadness deserves room. It doesn't always mean something is wrong with you — sometimes it's just passing through."
  if (f.startsWith("flat"))
    return "Flat is real too. Not every day has to be lit up to be a valid one."
  if (f.startsWith("tired"))
    return "Tired is information — your body and mind asking for something. That's worth listening to."
  if (f.startsWith("calm") || f.startsWith("content") || f.startsWith("focus"))
    return "Nice. Noticing the good ones makes them stick a little longer."
  return `That's a real word for it. Thank you for naming it — noticing is already doing something.`
}

function parseIntensity(lower: string): number | null {
  // Range buckets as fallback
  if (/low|1\s*[–-]\s*3|barely/.test(lower)) return 2
  if (/medium|mid|4\s*[–-]\s*6/.test(lower)) return 5
  if (/high|7\s*[–-]\s*9/.test(lower)) return 8
  if (/peak|10/.test(lower)) return 10
  const m = lower.match(/\b([1-9]|10)\b/)
  if (m) return parseInt(m[1], 10)
  return null
}

function scaleAck(n: number): string {
  if (n <= 3) return `${n}/10 is useful — there's something there, even if it's quiet. Good to name it before it grows.`
  if (n <= 6) return `${n}/10 is real. You don't have to fix it to deserve a break. Naming it is already doing work.`
  if (n <= 9) return `${n}/10 is a lot to be carrying. You're not being dramatic — that's a real load.`
  return `${n}/10 is heavy. Thank you for trusting me with how big it is.`
}

function heardDeep(c: { feeling: string | null; area: "work" | "life" | "both" | "not-sure" | null; intensity: number | null }): string {
  const pieces: string[] = []
  if (c.area === "work") pieces.push("work has been the hard part")
  else if (c.area === "life") pieces.push("life outside work is the weight")
  else if (c.area === "both") pieces.push("both sides are pulling")
  if (c.feeling) pieces.push(`the word that fit was "${c.feeling.toLowerCase()}"`)
  if (c.intensity !== null) pieces.push(`and you put it around ${c.intensity}/10`)
  if (pieces.length === 0) return "Okay — I'm just here. No agenda."
  return `Okay — just sitting with it: ${pieces.join(", ")}. That's real, and you don't have to talk it into being smaller.`
}

const CSS = `
  @keyframes fl-breathe   { 0%,100%{transform:scale(1)}                         50%{transform:scale(1.08)} }
  @keyframes fl-fade-in   { from{opacity:0;transform:translateY(8px)}           to{opacity:1;transform:none} }
  @keyframes fl-pop       { 0%{transform:scale(0.85);opacity:0}                 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
  @keyframes fl-dot       { 0%,100%{transform:translateY(0);opacity:0.4}        50%{transform:translateY(-4px);opacity:1} }
  @keyframes fl-slide-up  { from{opacity:0;transform:translateY(12px)}          to{opacity:1;transform:none} }
  @keyframes fl-shimmer   { 0%{background-position:200% 0}                      100%{background-position:-200% 0} }
  @keyframes fl-stepPulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,112,64,0.45)}   70%{box-shadow:0 0 0 8px rgba(232,112,64,0)} }
  @keyframes aura-breathe-big { 0%,100%{transform:scale(0.78);box-shadow:0 0 30px rgba(168,200,240,0.35)} 50%{transform:scale(1.18);box-shadow:0 0 60px rgba(232,112,64,0.4)} }
  .anim-fade { animation: fl-fade-in 0.35s ease both }
  .anim-pop  { animation: fl-pop     0.4s  ease both }
  .anim-up   { animation: fl-slide-up 0.4s ease both }
  .fl-scroll::-webkit-scrollbar { width: 4px }
  .fl-scroll::-webkit-scrollbar-thumb { background: rgba(168,200,240,0.4); border-radius: 4px }
`

export function FeeliftTeamsApp({ isVisible }: AuraTeamsAppProps) {
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
            <img src="/logo-my-1.png" alt="Aura" width={38} height={38} style={{ display: "block" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#2d3a5c", lineHeight: 1.2 }}>Aura</p>
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
        {activeTab === "support" && <SupportView />}
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
            <Lock size={13} color="#4ade80" /> Private to you
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

// Distress detection — any of these phrases trigger the safety branch.
// Kept deliberately conservative; false-positives are acceptable here.
const DISTRESS_PATTERNS: RegExp[] = [
  /\b(kill|hurt|harm)\s+(myself|me)\b/i,
  /\b(suicid\w*|suicidal)\b/i,
  /\b(end\s+it\s+all|end\s+my\s+life)\b/i,
  /\bcan(?:'|)t\s+(go\s+on|do\s+this\s+anymore|take\s+(?:it|this)\s+anymore|keep\s+going)\b/i,
  /\bno\s+(point|reason)\s+(in|to|anymore)\b/i,
  /\b(give\s+up|giving\s+up)\b/i,
  /\b(hopeless|worthless)\b/i,
  /\b(want\s+to\s+die)\b/i,
]
const isDistress = (text: string) => DISTRESS_PATTERNS.some(rx => rx.test(text))

// Conversation state — collected as the user moves through stages.
type Mood = "good" | "ok" | "not-well"
type Area = "work" | "life" | "both" | "not-sure"
type ConvoState = {
  mood: Mood | null
  area: Area | null
  feeling: string | null
  intensity: number | null
  choice: "breathing" | "reframe" | "boundary" | "therapist" | null
  takeaway: string | null
}
const INITIAL_STATE: ConvoState = {
  mood: null, area: null, feeling: null, intensity: null, choice: null, takeaway: null,
}

// Each node is a step in the scripted flow. Free text routes through
// lightweight keyword matching into the closest node.
type NodeId =
  | "memory-prompt" | "opener"
  | "mood-good-area" | "mood-ok-choice" | "mood-notwell-area"
  | "area-bridge"
  | "feeling-picker" | "feeling-validate" | "scale" | "scale-ack"
  | "permission" | "heard-deep" | "options"
  | "breathing-suggest" | "reframe-ask" | "boundary-ask" | "therapist-suggest"
  | "takeaway-ack"
  | "summary" | "memory-save" | "close"
  | "distress-1" | "distress-options" | "distress-stay"
  | "good-wrap"

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
  const [convo, setConvo] = useState<ConvoState>(INITIAL_STATE)
  const [nodeId, setNodeId] = useState<NodeId>(
    hasPastMemory && memoriesEnabled ? "memory-prompt" : "opener"
  )
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(1)
  const convoRef = useRef<ConvoState>(INITIAL_STATE)
  const nodeRef = useRef<NodeId>(nodeId)

  // Keep refs in sync so async setTimeouts read fresh state.
  useEffect(() => { convoRef.current = convo }, [convo])
  useEffect(() => { nodeRef.current = nodeId }, [nodeId])

  // Seed the opening message(s) once.
  useEffect(() => {
    const first: ChatMessage[] = []
    if (hasPastMemory && memoriesEnabled) {
      first.push({
        id: idRef.current++,
        sender: "ai",
        step: 0,
        text:
          "Welcome back. When we talked last, you said the pace of work was sitting heavy — want to pick that thread back up, or start somewhere new today?",
        replies: ["Pick it back up", "Start fresh", "Erase that memory"],
      })
    } else {
      first.push({
        id: idRef.current++,
        sender: "ai",
        step: 0,
        text:
          "Hey — glad you came by. No rush, no wrong answers here. How are you feeling right now, honestly?",
        replies: ["Good", "OK", "Not well"],
      })
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

  // Push a single AI message.
  const pushAi = (text: string, opts?: { replies?: string[]; step?: ChatStep; delay?: number; node?: NodeId }) => {
    const delay = opts?.delay ?? 700
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [
        ...m,
        { id: idRef.current++, sender: "ai", text, replies: opts?.replies, step: opts?.step },
      ])
      if (opts?.step !== undefined) setStep(opts.step)
      if (opts?.node) { setNodeId(opts.node); nodeRef.current = opts.node }
    }, delay)
  }

  // Push two AI messages in sequence (validate → next). Second one carries the replies.
  const pushAiPair = (
    first: string,
    second: string,
    opts: { replies?: string[]; step?: ChatStep; node?: NodeId; firstDelay?: number; secondDelay?: number } = {}
  ) => {
    pushAi(first, { delay: opts.firstDelay ?? 650 })
    setTimeout(() => {
      pushAi(second, {
        delay: opts.secondDelay ?? 1100,
        replies: opts.replies,
        step: opts.step,
        node: opts.node,
      })
    }, 850)
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

  const updateConvo = (patch: Partial<ConvoState>) => {
    setConvo(c => {
      const next = { ...c, ...patch }
      convoRef.current = next
      return next
    })
  }

  // Build the wrap-up mirror sentence from collected state.
  const buildSummary = (): string => {
    const c = convoRef.current
    const parts: string[] = []
    if (c.mood === "not-well") parts.push("things are feeling heavy right now")
    else if (c.mood === "ok") parts.push("today is landing somewhere in the middle")
    else if (c.mood === "good") parts.push("today's in a decent place")
    if (c.feeling) parts.push(`the word that fit best was "${c.feeling.toLowerCase()}"`)
    if (c.intensity !== null) parts.push(`you put it around ${c.intensity}/10`)
    if (c.takeaway) parts.push(`and one thing you named was to ${c.takeaway.toLowerCase()}`)
    else if (c.choice === "breathing") parts.push("and you gave yourself a minute to breathe")
    else if (c.choice === "therapist") parts.push("and you opened the door to talking with someone")
    if (parts.length === 0) return "you came by, and that counts"
    if (parts.length === 1) return parts[0]
    return parts.slice(0, -1).join(", ") + ", " + parts[parts.length - 1]
  }

  // ── Main conversation router ──
  function advanceConversation(userText: string) {
    const lower = userText.toLowerCase().trim()

    // Distress is always the highest-priority branch, regardless of stage.
    if (isDistress(lower)) {
      triggerDistress()
      return
    }

    const current = nodeRef.current

    switch (current) {
      // ── Memory prompt (session start, if applicable) ──
      case "memory-prompt": {
        if (/(pick|revisit|yes|continue|that)/i.test(lower)) {
          pushAiPair(
            "Thank you for letting me come back to that with you.",
            "What's sitting with you most about it right now — or has anything shifted since we last talked?",
            { step: 1, node: "feeling-picker",
              replies: ["Overwhelmed", "Anxious", "Frustrated", "Stuck", "Sad", "Flat", "Something else"] }
          )
        } else if (/erase|delete|forget/.test(lower)) {
          pushAiPair(
            "Done. Nothing saved on my end.",
            "Let's start where you actually are today. How are you feeling right now?",
            { step: 0, node: "opener", replies: ["Good", "OK", "Not well"] }
          )
        } else {
          pushAi(
            "Totally fine. How are you feeling today?",
            { step: 0, node: "opener", replies: ["Good", "OK", "Not well"] }
          )
        }
        return
      }

      // ── Stage 0 · Check-in ──
      case "opener": {
        if (/not\s*well|bad|awful|terrible|low|down|rough|not\s*great|struggl/.test(lower)) {
          updateConvo({ mood: "not-well" })
          pushAi(
            "I'm sorry it's like that right now — I'm glad you said it. Is this more tied to work, life outside work, or both?",
            { node: "mood-notwell-area", replies: ["Work", "Life outside work", "Both", "Not sure"] }
          )
        } else if (/^ok\b|okay|fine|meh|so-?so|alright/.test(lower)) {
          updateConvo({ mood: "ok" })
          pushAi(
            "Thanks for being honest — \"ok\" is a real answer. Is there something on your mind you'd like to look at, or would you rather just take a minute?",
            { node: "mood-ok-choice", replies: ["Something on my mind", "Just take a minute"] }
          )
        } else if (/good|great|well|fine\s*actually|positive/.test(lower)) {
          updateConvo({ mood: "good" })
          pushAi(
            "Glad to hear that. Even on good days, checking in matters. What's giving you a lift — work, life outside work, or both?",
            { node: "mood-good-area", replies: ["Work", "Life outside work", "Both", "Not sure"] }
          )
        } else {
          // Freeform: treat as a disclosure and reflect.
          updateConvo({ mood: "ok" })
          pushAi(
            "Thanks for putting words to it. Would it help to look at what's behind that a little, or would you rather just sit with it for a minute?",
            { node: "mood-ok-choice", replies: ["Look at it a little", "Just take a minute"] }
          )
        }
        return
      }

      case "mood-good-area": {
        const area = parseArea(lower)
        updateConvo({ area })
        pushAiPair(
          "That's good to hear.",
          "Since you're here, do you want to keep going with a quick reflection, or is this check-in enough for today? Both are valid.",
          { node: "good-wrap", replies: ["Quick reflection", "This is enough", "Actually, not as good as I said"] }
        )
        return
      }

      case "good-wrap": {
        if (/reflection|keep|quick/.test(lower)) {
          pushAi(
            "Okay — gently. If you had to put a word on today's vibe, which feels closest?",
            { step: 1, node: "feeling-picker",
              replies: ["Calm", "Focused", "Content", "Tired but okay", "Flat", "Something else"] }
          )
        } else if (/not\s*as\s*good|actually|worse|lie/.test(lower)) {
          updateConvo({ mood: "not-well" })
          pushAi(
            "Thank you for saying that out loud. It's okay to rewrite the answer. Is this more tied to work, life outside work, or both?",
            { node: "mood-notwell-area", replies: ["Work", "Life outside work", "Both", "Not sure"] }
          )
        } else {
          pushAi(
            "Good call. Thanks for checking in — I'll be here whenever you want to come back.",
            { step: 3, node: "close", replies: ["End check-in"] }
          )
        }
        return
      }

      case "mood-ok-choice": {
        if (/minute|sit|just|breath/.test(lower)) {
          pushAiPair(
            "Okay — no agenda.",
            "You can step away whenever. If you want a soft 60-second breathing reset, I can open it for you. Otherwise, I'm here.",
            { step: 2, node: "breathing-suggest", replies: ["Open breathing reset", "Just sit for a minute", "Actually, let's talk"] }
          )
        } else {
          pushAi(
            "Okay. Is this more tied to work, life outside work, or both?",
            { node: "mood-notwell-area", replies: ["Work", "Life outside work", "Both", "Not sure"] }
          )
        }
        return
      }

      case "mood-notwell-area": {
        const area = parseArea(lower)
        updateConvo({ area })
        pushAiPair(
          areaReflect(area),
          "If you had to put one word on how it's landing, which feels closest? There's no wrong pick.",
          { step: 1, node: "feeling-picker",
            replies: ["Overwhelmed", "Anxious", "Frustrated", "Stuck", "Sad", "Flat", "Something else"] }
        )
        return
      }

      // ── Stage 1 · Reflect ──
      case "feeling-picker": {
        const feeling = parseFeeling(lower, userText)
        updateConvo({ feeling })
        pushAi(feelingValidate(feeling), { delay: 600 })
        setTimeout(() => {
          pushAi(
            "On a scale of 1 to 10, how loud is that feeling right now? 1 is barely there, 10 is as big as it gets.",
            { delay: 1100, node: "scale",
              replies: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] }
          )
        }, 900)
        return
      }

      case "scale": {
        const n = parseIntensity(lower)
        if (n === null) {
          pushAi(
            "No pressure on the number — rough is fine. Low, medium, or high?",
            { replies: ["Low (1–3)", "Medium (4–6)", "High (7–9)", "Peak (10)"] }
          )
          return
        }
        if (n >= 10) { triggerDistress(); return }
        updateConvo({ intensity: n })
        pushAiPair(
          scaleAck(n),
          "Would it help to try one small thing together, or would you rather just be heard today? Either is fine — really.",
          { step: 2, node: "permission",
            replies: ["Try one small thing", "Just want to be heard", "Not sure"] }
        )
        return
      }

      // ── Stage 2 · Suggest ──
      case "permission": {
        if (/heard|just|listen|vent|sit/.test(lower)) {
          pushAiPair(
            heardDeep(convoRef.current),
            "You don't owe me a plan. Whenever you're ready to close out, just say the word.",
            { node: "heard-deep", replies: ["One small thing after all", "Close out for today"] }
          )
        } else if (/try|one|small|sure|yes|okay|ok/.test(lower)) {
          offerOptions()
        } else {
          // Not sure
          pushAi(
            "No pressure. I can list a couple of small things — you can always pass.",
            { node: "permission", replies: ["Sure, list them", "Just be heard", "End check-in"] }
          )
        }
        return
      }

      case "heard-deep": {
        if (/one\s*small|try|something/.test(lower)) { offerOptions(); return }
        goToSummary()
        return
      }

      case "options": {
        if (/breath|reset|60/.test(lower)) {
          updateConvo({ choice: "breathing" })
          pushAi(
            "Good pick. 60 seconds, inhale 4, exhale 6. It's a soft anchor, not a fix — that's the point.",
            { delay: 600, node: "breathing-suggest", replies: ["Open breathing now", "Maybe later"] }
          )
        } else if (/refram|angle|question|shift|perspective/.test(lower)) {
          updateConvo({ choice: "reframe" })
          pushAi(
            "Here's the question: what's one part of today — even a small one — that went a little better than you expected? No need to force it.",
            { delay: 600, node: "reframe-ask", replies: ["Nothing comes to mind", "Skip for now"] }
          )
        } else if (/boundar|plate|pause|delegate|hand/.test(lower)) {
          updateConvo({ choice: "boundary" })
          pushAi(
            "Okay. If you could take one thing off your plate today — pause it, push it to tomorrow, or ask for help — what would it be? Just naming it counts.",
            { delay: 600, node: "boundary-ask", replies: ["Not sure yet", "Skip for now"] }
          )
        } else if (/therapist|professional|person|talk\s*to/.test(lower)) {
          updateConvo({ choice: "therapist" })
          pushAi(
            "That's a real step. I can open Aura's private therapist booking for you — free, confidential, no tie to work.",
            { delay: 600, node: "therapist-suggest", replies: ["Open therapist booking", "Not today"] }
          )
        } else {
          offerOptions()
        }
        return
      }

      case "breathing-suggest": {
        if (/open|yes|now|sure|ok/.test(lower)) {
          pushAi("Opening it now. Come back when you're ready — I'll be here.", { delay: 400 })
          setTimeout(onOpenSupport, 700)
          return
        }
        goToSummary()
        return
      }

      case "reframe-ask": {
        if (/nothing|skip|pass|can(?:'|)t/.test(lower)) {
          pushAi(
            "That's okay. Some days, the honest answer is \"not today\" — and that's still information.",
            { delay: 600 }
          )
          setTimeout(goToSummary, 1100)
          return
        }
        updateConvo({ takeaway: userText.slice(0, 80) })
        pushAi(
          "That's a real answer. Small things like that compound.",
          { delay: 600 }
        )
        setTimeout(goToSummary, 1100)
        return
      }

      case "boundary-ask": {
        if (/not\s*sure|skip|pass|can(?:'|)t|dunno/.test(lower)) {
          pushAi(
            "Fair. Even sitting with the question is a kind of answer.",
            { delay: 600 }
          )
          setTimeout(goToSummary, 1100)
          return
        }
        updateConvo({ takeaway: userText.slice(0, 80) })
        pushAi(
          "Naming it is already most of the work. See what feels possible — no pressure either way.",
          { delay: 600 }
        )
        setTimeout(goToSummary, 1100)
        return
      }

      case "therapist-suggest": {
        if (/open|yes|book|now|sure|ok/.test(lower)) {
          pushAi("Opening it for you. Everything there is confidential.", { delay: 400 })
          setTimeout(onOpenSupport, 700)
          return
        }
        pushAi(
          "No pressure. The door's open whenever — from this chat or the Support tab.",
          { delay: 600 }
        )
        setTimeout(goToSummary, 1000)
        return
      }

      // ── Stage 3 · Wrap-up ──
      case "summary": {
        if (/not\s*quite|off|wrong/.test(lower)) {
          pushAi(
            "Thanks for telling me — I'd rather get it right than get it fast. What did I miss?",
            { node: "summary" }
          )
          return
        }
        pushAiPair(
          "Thanks for showing up today. That took something, even if it didn't feel like much.",
          memoriesEnabled
            ? "Want me to remember this conversation for next time, or start fresh when you come back?"
            : "I don't keep anything from this chat — it starts clean next time. See you soon.",
          memoriesEnabled
            ? { node: "memory-save", replies: ["Remember this", "Start fresh next time"] }
            : { node: "close", replies: ["End check-in"] }
        )
        return
      }

      case "memory-save": {
        if (/start\s*fresh|don(?:'|)t|no|erase|clean/.test(lower)) {
          pushAi(
            "Okay — nothing saved. Clean slate next time. Take care of yourself today.",
            { node: "close", replies: ["End check-in"] }
          )
        } else {
          pushAi(
            "Okay — I'll hold onto the shape of this, not the details. Take care of yourself today.",
            { node: "close", replies: ["End check-in"] }
          )
        }
        return
      }

      case "close": {
        pushAi(
          "I'm here whenever you need to talk. There's no wrong time.",
          { delay: 500 }
        )
        return
      }

      // ── Distress branch ──
      case "distress-1": {
        // After Aura's first distress message, show the three options.
        showDistressOptions()
        return
      }

      case "distress-options": {
        if (/988|call|text|crisis/.test(lower)) {
          pushAi(
            "Good. I'm opening the crisis line now — you can call or text. You don't have to explain yourself first.",
            { delay: 400 }
          )
          setTimeout(onOpenSupport, 700)
          return
        }
        if (/therap|urgent|session|book/.test(lower)) {
          pushAi(
            "Okay — I'm opening a private therapist session now. It's confidential and free.",
            { delay: 400 }
          )
          setTimeout(onOpenSupport, 700)
          return
        }
        if (/stay|keep\s*talking|here|talk/.test(lower)) {
          pushAi(
            "Okay. I'm not going anywhere. Tell me whatever you want — you don't have to make it make sense.",
            { node: "distress-stay" }
          )
          return
        }
        showDistressOptions()
        return
      }

      case "distress-stay": {
        // Keep responses short and validating; do not problem-solve.
        pushAi(
          "Thank you for saying that. I'm with you.",
          { delay: 600 }
        )
        setTimeout(() => {
          pushAi(
            "Whenever you're ready — 988 or a therapist through Aura are both there. Nothing has to happen right now.",
            { delay: 1100, node: "distress-options",
              replies: ["Call or text 988", "Book urgent therapist", "Keep talking"] }
          )
        }, 1000)
        return
      }

      default:
        // Fallback: steer back to wrap-up.
        goToSummary()
        return
    }
  }

  // ── Helpers used by the router ──

  function offerOptions() {
    const intensity = convoRef.current.intensity ?? 0
    const base = [
      "60-second breathing reset",
      "A gentle reframe",
      "A boundary idea",
    ]
    if (intensity >= 8) base.push("Talk to a therapist")
    pushAi(
      "Okay. Three small options — pick whichever sounds easiest right now. You can also skip.",
      { node: "options", replies: [...base, "Actually, just be heard"] }
    )
  }

  function goToSummary() {
    const summary = buildSummary()
    pushAi(
      `Here's what I heard — ${summary}. Did I get that close to right?`,
      { step: 3, node: "summary", replies: ["Yep, that's it", "Close enough", "Not quite"] }
    )
  }

  function triggerDistress() {
    pushAi(
      "What you just said landed with me. I'm really glad you said it out loud.",
      { delay: 500 }
    )
    setTimeout(() => {
      pushAi(
        "Please know you don't have to carry this alone right now.",
        { delay: 900, node: "distress-1" }
      )
      setTimeout(showDistressOptions, 1200)
    }, 800)
  }

  function showDistressOptions() {
    pushAi(
      "Here are three things we can do — whichever feels closest.",
      { delay: 600, node: "distress-options",
        replies: ["Call or text 988", "Book urgent therapist", "Stay here and keep talking"] }
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", padding: "12px 16px", display: "flex", justifyContent: "center", boxSizing: "border-box" }}>
      <Panel style={{ height: "100%" }}>
        {/* Steps row */}
        <div style={{ padding: "12px 14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5a6a8a", fontVariantNumeric: "tabular-nums" }}>
              <Sparkles size={12} color="#e87040" />
              <span style={{ fontWeight: 600, color: "#2d3a5c" }}>Check-in</span>
              <span style={{ opacity: 0.7 }}>Step {step + 1} of 4</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: "rgba(74,222,128,0.12)", fontSize: 10, fontWeight: 600, color: "#22c55e" }}>
              <Lock size={9} /> Anonymous
            </div>
          </div>

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

// ─── SUPPORT VIEW ─────────────────────────────────────────────────────────────

function SupportView() {
  const [page, setPage] = useState<SupportPageId>("list")

  const items: {
    id: SupportPageId
    Icon: typeof Phone
    label: string
    sub: string
    grad: [string, string]
    glow: string
  }[] = [
    {
      id: "crisis",
      Icon: Phone,
      label: "Crisis line",
      sub: "24/7 confidential, free — call or text 988",
      grad: ["#fca5a5", "#f87171"],
      glow: "#f8717140",
    },
    {
      id: "therapist",
      Icon: Heart,
      label: "Talk to a therapist",
      sub: "Book a session with a certified professional",
      grad: ["#c4b5fd", "#8b5cf6"],
      glow: "#8b5cf640",
    },
    {
      id: "breathing",
      Icon: Wind,
      label: "60-second breathing reset",
      sub: "Guided inhale / exhale to soften a hard moment",
      grad: ["#a8c8f0", "#60a5fa"],
      glow: "#60a5fa40",
    },
    {
      id: "articles",
      Icon: BookOpen,
      label: "Self-guided resources",
      sub: "Short reads on workload, clarity, and change",
      grad: ["#fde68a", "#f5b87a"],
      glow: "#f5b87a40",
    },
  ]

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
        {page === "list" ? (
          <>
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
                  <p style={{ margin: 0, fontSize: 12, color: "#5a6a8a" }}>Confidential support, always available</p>
                </div>
              </div>
            </div>

            <div style={{ padding: "6px 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setPage(r.id)}
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
                  If you&apos;re in immediate danger, call your local emergency number. This is not a substitute for professional care.
                </p>
              </div>
            </div>
          </>
        ) : (
          <SupportDetail page={page} onBack={() => setPage("list")} />
        )}
      </Panel>
    </div>
  )
}

function SupportDetail({ page, onBack }: { page: Exclude<SupportPageId, "list">; onBack: () => void }) {
  return (
    <div style={{ padding: "12px 16px 18px" }}>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 10px 5px 6px",
          borderRadius: 999,
          border: "0.5px solid rgba(168,200,240,0.35)",
          background: "rgba(255,255,255,0.9)",
          color: "#5a6a8a",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        <ChevronLeft size={13} /> Back
      </button>

      {page === "crisis" && <CrisisPage />}
      {page === "therapist" && <TherapistPage />}
      {page === "breathing" && <BreathingPage />}
      {page === "articles" && <ArticlesPage />}
    </div>
  )
}

function DetailHeader({
  Icon,
  title,
  subtitle,
  grad,
  glow,
}: {
  Icon: typeof Phone
  title: string
  subtitle: string
  grad: [string, string]
  glow: string
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: `linear-gradient(135deg,${grad[0]},${grad[1]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 16px ${glow}`,
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="white" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#2d3a5c" }}>{title}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#5a6a8a" }}>{subtitle}</p>
      </div>
    </div>
  )
}

function CrisisPage() {
  return (
    <div>
      <DetailHeader
        Icon={Phone}
        title="Crisis line"
        subtitle="24/7 confidential, free"
        grad={["#fca5a5", "#f87171"]}
        glow="#f8717140"
      />

      <div
        style={{
          padding: "14px 14px",
          borderRadius: 14,
          background: "linear-gradient(135deg,rgba(252,165,165,0.14),rgba(248,113,113,0.08))",
          border: "0.5px solid rgba(248,113,113,0.3)",
          fontSize: 12.5,
          color: "#5a2a2a",
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        You can reach the <strong>988 Suicide &amp; Crisis Lifeline</strong> any time, day or night. Trained counselors listen, support, and connect you to local help.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <a
          href="tel:988"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 14px",
            borderRadius: 12,
            textDecoration: "none",
            background: "linear-gradient(135deg,#f87171,#ef4444)",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 6px 18px rgba(239,68,68,0.3)",
          }}
        >
          <Phone size={15} /> Call 988
        </a>
        <a
          href="sms:988"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 14px",
            borderRadius: 12,
            textDecoration: "none",
            background: "white",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: 14,
            border: "0.5px solid rgba(248,113,113,0.5)",
          }}
        >
          <MessageSquareText size={15} /> Text 988
        </a>
      </div>

      <div style={{ fontSize: 11, color: "#7a3a3a", lineHeight: 1.5 }}>
        If you&apos;re in immediate danger, call your local emergency number (911 in the U.S.).
      </div>
    </div>
  )
}

function TherapistPage() {
  const [slot, setSlot] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [sent, setSent] = useState(false)

  const slots = [
    { id: "today-4", label: "Today", time: "4:00 PM" },
    { id: "today-6", label: "Today", time: "6:30 PM" },
    { id: "tomorrow-10", label: "Tomorrow", time: "10:00 AM" },
    { id: "tomorrow-2", label: "Tomorrow", time: "2:00 PM" },
  ]

  if (sent) {
    return (
      <div>
        <DetailHeader
          Icon={Heart}
          title="Request sent"
          subtitle="A therapist will reach out privately"
          grad={["#c4b5fd", "#8b5cf6"]}
          glow="#8b5cf640"
        />
        <div
          style={{
            padding: "14px",
            borderRadius: 14,
            background: "linear-gradient(135deg,rgba(196,181,253,0.18),rgba(139,92,246,0.08))",
            border: "0.5px solid rgba(139,92,246,0.3)",
            fontSize: 12.5,
            color: "#2d3a5c",
            lineHeight: 1.55,
          }}
        >
          Thanks for taking this step. You&apos;ll get a confidential message within 24 hours to confirm your session.
        </div>
      </div>
    )
  }

  return (
    <div>
      <DetailHeader
        Icon={Heart}
        title="Talk to a therapist"
        subtitle="Book a session with a certified professional"
        grad={["#c4b5fd", "#8b5cf6"]}
        glow="#8b5cf640"
      />

      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5a6a8a" }}>
        Choose a time
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
        {slots.map(s => {
          const active = slot === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSlot(s.id)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: active ? "0.5px solid transparent" : "0.5px solid rgba(168,200,240,0.35)",
                background: active
                  ? "linear-gradient(135deg,#c4b5fd,#8b5cf6)"
                  : "rgba(255,255,255,0.9)",
                color: active ? "white" : "#2d3a5c",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s",
                boxShadow: active ? "0 4px 14px rgba(139,92,246,0.25)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, opacity: active ? 0.9 : 0.7 }}>
                <Calendar size={10} /> {s.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                <Clock size={11} /> {s.time}
              </div>
            </button>
          )
        })}
      </div>

      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5a6a8a" }}>
        What&apos;s on your mind (optional)
      </p>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="A sentence or two helps your therapist prepare…"
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "0.5px solid rgba(168,200,240,0.4)",
          background: "white",
          fontSize: 12.5,
          color: "#2d3a5c",
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={() => slot && setSent(true)}
        disabled={!slot}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "none",
          background: slot
            ? "linear-gradient(135deg,#c4b5fd,#8b5cf6)"
            : "rgba(168,200,240,0.3)",
          color: "white",
          fontWeight: 700,
          fontSize: 13,
          cursor: slot ? "pointer" : "default",
          boxShadow: slot ? "0 6px 18px rgba(139,92,246,0.28)" : "none",
          transition: "all 0.18s",
        }}
      >
        Request session
      </button>

      <p style={{ margin: "10px 0 0", fontSize: 10, color: "#8a9ab8", lineHeight: 1.45, textAlign: "center" }}>
        Confidential. Nothing you share here will ever be tied back to you.
      </p>
    </div>
  )
}

function BreathingPage() {
  const TOTAL = 60 // seconds
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    startRef.current = performance.now() - elapsed * 1000
    const tick = (t: number) => {
      const e = (t - (startRef.current ?? t)) / 1000
      if (e >= TOTAL) {
        setElapsed(TOTAL)
        setRunning(false)
        return
      }
      setElapsed(e)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // 4s in, 2s hold, 6s out
  const CYCLE = 12
  const t = elapsed % CYCLE
  let phase: "Breathe in" | "Hold" | "Breathe out"
  let scale: number
  if (t < 4) {
    phase = "Breathe in"
    scale = 0.78 + (t / 4) * 0.4
  } else if (t < 6) {
    phase = "Hold"
    scale = 1.18
  } else {
    phase = "Breathe out"
    scale = 1.18 - ((t - 6) / 6) * 0.4
  }

  const remaining = Math.max(0, TOTAL - Math.floor(elapsed))
  const mm = Math.floor(remaining / 60)
  const ss = (remaining % 60).toString().padStart(2, "0")

  const reset = () => { setRunning(false); setElapsed(0) }

  return (
    <div>
      <DetailHeader
        Icon={Wind}
        title="60-second breathing reset"
        subtitle="Inhale 4 · Hold 2 · Exhale 6"
        grad={["#a8c8f0", "#60a5fa"]}
        glow="#60a5fa40"
      />

      <div
        style={{
          height: 210,
          borderRadius: 16,
          background: "linear-gradient(180deg,rgba(168,200,240,0.16),rgba(96,165,250,0.06))",
          border: "0.5px solid rgba(168,200,240,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%,rgba(255,255,255,0.8),rgba(168,200,240,0.6) 45%,rgba(96,165,250,0.5) 80%)",
            transform: `scale(${scale})`,
            transition: running ? "transform 0.1s linear" : "transform 0.4s ease",
            boxShadow: "0 0 40px rgba(96,165,250,0.4), 0 10px 30px rgba(96,165,250,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.04em",
          }}
        >
          {running || elapsed > 0 ? phase : "Ready"}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 12,
            fontSize: 11,
            color: "#5a6a8a",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
          }}
        >
          {mm}:{ss}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setRunning(r => !r)}
          disabled={elapsed >= TOTAL}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 12,
            border: "none",
            background: elapsed >= TOTAL
              ? "rgba(168,200,240,0.3)"
              : "linear-gradient(135deg,#a8c8f0,#60a5fa)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            cursor: elapsed >= TOTAL ? "default" : "pointer",
            boxShadow: elapsed >= TOTAL ? "none" : "0 6px 18px rgba(96,165,250,0.28)",
          }}
        >
          {elapsed >= TOTAL ? "Done" : running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
        </button>
        <button
          onClick={reset}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "0.5px solid rgba(168,200,240,0.4)",
            background: "white",
            color: "#5a6a8a",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      <p style={{ margin: "12px 0 0", fontSize: 11, color: "#8a9ab8", lineHeight: 1.45, textAlign: "center" }}>
        One minute. That&apos;s all this takes.
      </p>
    </div>
  )
}

function ArticlesPage() {
  const articles = [
    {
      id: "workload",
      title: "When workload feels heavy",
      read: "3 min read",
      category: "Workload",
      body:
        "When the to-do list grows faster than you can cross it off, your body signals overload long before you consciously notice. A useful first step is to externalize ��� list the 3 things that truly matter today, and give yourself permission to let the rest wait. Progress on the right thing beats motion on everything.",
    },
    {
      id: "clarity",
      title: "Finding clarity during change",
      read: "4 min read",
      category: "Change",
      body:
        "Uncertainty drains energy because our brains keep simulating every possible outcome. Instead, name what is actually known, what is being decided, and by when. Then choose one thing inside your control — a conversation, a boundary, a small next step — and spend your energy there.",
    },
    {
      id: "reset",
      title: "Small resets for hard moments",
      read: "2 min read",
      category: "Wellbeing",
      body:
        "A hard moment doesn't need to be fixed — it needs to be softened. Try 4-6 breathing (inhale 4, exhale 6) for a minute, a glass of water, and naming one thing you can see, hear, and feel. These micro-resets are not small — they interrupt the spiral.",
    },
    {
      id: "manager",
      title: "How to talk to your manager",
      read: "3 min read",
      category: "Communication",
      body:
        "Bringing something up doesn't mean asking for it to be fixed. Start with what you're observing (\"my workload has shifted\"), what you're feeling (\"I'm stretched thin\"), and one thing that would help (\"can we reprioritize together?\"). Clarity helps both of you.",
    },
  ]

  const [open, setOpen] = useState<string | null>(null)
  const current = articles.find(a => a.id === open) ?? null

  if (current) {
    return (
      <div>
        <DetailHeader
          Icon={BookOpen}
          title={current.title}
          subtitle={`${current.category} · ${current.read}`}
          grad={["#fde68a", "#f5b87a"]}
          glow="#f5b87a40"
        />
        <div
          style={{
            padding: "14px",
            borderRadius: 14,
            background: "rgba(255,248,240,0.95)",
            border: "0.5px solid rgba(168,200,240,0.25)",
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "#2d3a5c",
            marginBottom: 10,
          }}
        >
          {current.body}
        </div>
        <button
          onClick={() => setOpen(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px 6px 8px",
            borderRadius: 999,
            border: "0.5px solid rgba(168,200,240,0.35)",
            background: "white",
            color: "#5a6a8a",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={13} /> All resources
        </button>
      </div>
    )
  }

  return (
    <div>
      <DetailHeader
        Icon={BookOpen}
        title="Self-guided resources"
        subtitle="Short reads on workload, clarity, and change"
        grad={["#fde68a", "#f5b87a"]}
        glow="#f5b87a40"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {articles.map(a => (
          <button
            key={a.id}
            onClick={() => setOpen(a.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              borderRadius: 14,
              border: "0.5px solid rgba(168,200,240,0.28)",
              background: "rgba(255,248,240,0.85)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#2d3a5c" }}>{a.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5a6a8a" }}>
                {a.category} · {a.read}
              </p>
            </div>
            <ChevronRight size={14} color="#c0cce0" />
          </button>
        ))}
      </div>
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
              padding: "13px 14px",
              borderRadius: 14,
              background: "linear-gradient(135deg,rgba(74,222,128,0.08),rgba(168,200,240,0.06))",
              border: "0.5px solid rgba(74,222,128,0.25)",
              fontSize: 12.5,
              color: "#2d3a5c",
              lineHeight: 1.55,
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Nothing you share here will ever be tied back to you.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            <PrivacyBullet text="No individual responses surface to managers or admins" />
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
            icon={<Sun size={14} color="#a8c8f0" />}
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

function PrivacyBullet({ text }: { text: string }) {
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
        <Check size={11} color="#22c55e" strokeWidth={3} />
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
