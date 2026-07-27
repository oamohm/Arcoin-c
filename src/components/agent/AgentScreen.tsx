"use client"
import { useArcBalance } from "@/hooks/useArcBalance"
import { useToast } from "@/components/ui/Toast"
import { useState } from "react"
export function AgentScreen({ onNavigate }: { onNavigate: (s: string) => void }) {
  const balance = useArcBalance()
  const toast = useToast()
  const [enabled, setEnabled] = useState(false)
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", backdropFilter: "blur(12px)" }}>
        <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: "20px", cursor: "pointer" }}>←</button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", letterSpacing: "0.1em", color: "var(--text)", textTransform: "uppercase", fontWeight: "600" }}>PayFlow Agent</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", background: enabled ? "#10B98118" : "var(--surface)", border: `1px solid ${enabled ? "var(--green)" : "var(--border)"}`, borderRadius: "20px", padding: "4px 10px", fontFamily: "var(--font-mono)", fontSize: "10px", color: enabled ? "var(--green)" : "var(--text-dim)" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: enabled ? "var(--green)" : "var(--text-muted)" }} />
          {enabled ? "Active" : "Inactive"}
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ background: "linear-gradient(135deg, #7C3AED18, #22D3EE18)", border: "1px solid #7C3AED44", borderRadius: "var(--radius)", padding: "14px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#A78BFA", fontWeight: "600", marginBottom: "4px" }}>🏆 Arc Hackathon — Agentic Economy Track</p>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.6 }}>AI Agent जो Arc पर autonomous USDC payments करता है।</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: "700", color: "var(--cyan)" }}>{balance.display}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "4px" }}>Agent Balance</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: "700", color: enabled ? "var(--green)" : "var(--text-dim)" }}>{enabled ? "Running" : "Stopped"}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "4px" }}>Status</p>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: `1px solid ${enabled ? "var(--green)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "14px", color: "var(--text)", fontWeight: "600" }}>Agent Enable करो</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)", marginTop: "2px" }}>Autonomous USDC payments activate होंगी</p>
            </div>
            <button onClick={() => setEnabled(e => !e)} style={{ width: "44px", height: "24px", background: enabled ? "var(--green)" : "var(--border)", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: "2px", left: enabled ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
            </button>
          </div>
        </div>
        <div style={{ background: "var(--cyan-glow)", border: "1px solid var(--cyan-dim)", borderRadius: "var(--radius)", padding: "14px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", fontWeight: "600", marginBottom: "6px" }}>⚡ Nanopayments</p>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.5 }}>Minimum 0.001 USDC — Agent-to-Agent micro payments।</p>
        </div>
        <button onClick={() => toast.info("Agent", "Wallet connect होने के बाद available होगा।")} style={{ width: "100%", background: "var(--cyan)", color: "#0A0E1A", fontWeight: "700", fontSize: "15px", border: "none", borderRadius: "var(--radius)", padding: "16px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Send Nanopayment ⚡
        </button>
      </div>
    </div>
  )
}
