"use client";

import { motion } from "framer-motion";
import { UserQuest, ASPECT_COLORS, ASPECT_LABELS } from "@/lib/api";
import { Zap } from "lucide-react";

interface Props {
  quest: UserQuest;
  onClose: () => void;
}

const SIDE_COLOR = "#f97316";

export default function SideQuestTriggeredModal({ quest, onClose }: Props) {
  const { quest: q } = quest;
  const aspectColor = ASPECT_COLORS[q.aspect];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-sm w-full mx-4 p-8 rounded-lg text-center"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "linear-gradient(135deg, #0a0b18 0%, #130d08 100%)",
          border: `1px solid ${SIDE_COLOR}88`,
          boxShadow: `0 0 60px ${SIDE_COLOR}30, 0 0 120px ${SIDE_COLOR}12, 0 20px 60px rgba(0,0,0,0.8)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner lines */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: SIDE_COLOR }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: SIDE_COLOR }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: SIDE_COLOR }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: SIDE_COLOR }} />

        <div className="system-header mb-1" style={{ color: SIDE_COLOR }}>
          ◈ SYSTEM ALERT
        </div>

        <div
          className="text-lg font-black mb-1 tracking-wide"
          style={{
            fontFamily: "var(--font-orbitron), monospace",
            color: SIDE_COLOR,
            textShadow: `0 0 20px ${SIDE_COLOR}60`,
          }}
        >
          SIDE MISSION UNLOCKED
        </div>

        <p className="text-xs mb-6" style={{ color: "var(--sl-text-muted)" }}>
          You completed {3} daily quests — the system has issued a bonus mission.
        </p>

        {/* Quest details card */}
        <div
          className="rounded-lg p-4 mb-6 text-left"
          style={{
            background: `${SIDE_COLOR}0c`,
            border: `1px solid ${SIDE_COLOR}40`,
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-bold text-sm leading-tight"
              style={{ color: "var(--sl-text)" }}
            >
              {q.title}
            </h3>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
              style={{ color: SIDE_COLOR, background: `${SIDE_COLOR}18`, border: `1px solid ${SIDE_COLOR}40` }}
            >
              {q.rank}
            </span>
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--sl-text-muted)" }}>
            {q.description}
          </p>

          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ color: aspectColor, background: `${aspectColor}14`, border: `1px solid ${aspectColor}30` }}
            >
              {ASPECT_LABELS[q.aspect]}
            </span>

            <div className="flex items-center gap-1">
              <Zap size={12} style={{ color: SIDE_COLOR }} />
              <span className="font-mono text-sm font-bold" style={{ color: SIDE_COLOR }}>
                +{q.xp_reward} XP
              </span>
            </div>
          </div>
        </div>

        {/* Timer note */}
        <p className="text-xs mb-5" style={{ color: "var(--sl-text-dim)" }}>
          ⏱ 48 hour window — complete it before time runs out.
        </p>

        <button
          className="sl-btn w-full"
          style={{
            background: `${SIDE_COLOR}18`,
            border: `1px solid ${SIDE_COLOR}88`,
            color: SIDE_COLOR,
            fontSize: "0.7rem",
          }}
          onClick={onClose}
        >
          <Zap size={13} />
          ACCEPT MISSION
        </button>
      </motion.div>
    </motion.div>
  );
}
