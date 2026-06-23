"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Send, X } from "lucide-react";
import { FeedbackAPI, type FeedbackType } from "@/lib/api";
import styles from "./FeedbackWidget.module.css";

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: "suggestion", label: "Suggestion" },
  { value: "bug", label: "Bug" },
  { value: "complaint", label: "Complaint" },
  { value: "praise", label: "Praise" },
];

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = message.trim();
    if (clean.length < 5) {
      setError("Please write at least 5 characters.");
      return;
    }

    setState("sending");
    setError("");

    try {
      await FeedbackAPI.create({
        type,
        message: clean,
        pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      setState("sent");
      setMessage("");
      setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 1700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send feedback.");
      setState("idle");
    }
  }

  return (
    <div className={styles.wrap}>
      {open && (
        <section className={styles.panel} aria-label="Send feedback">
          <div className={styles.head}>
            <div>
              <p className="eyebrow">Feedback</p>
              <h2>Help improve FlowFit</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close feedback">
              <X size={18} />
            </button>
          </div>

          {state === "sent" ? (
            <div className={styles.success}>
              <CheckCircle2 size={24} />
              <strong>Feedback sent</strong>
              <span>Thank you. The FlowFit team can review it from Admin.</span>
            </div>
          ) : (
            <form onSubmit={submit} className={styles.form}>
              <label>
                Type
                <select value={type} onChange={(e) => setType(e.target.value as FeedbackType)}>
                  {TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell us what is wrong, confusing, missing, or working well…"
                />
              </label>

              {error && <p className={styles.error}>{error}</p>}

              <button className="primary-btn" type="submit" disabled={state === "sending"}>
                <Send size={16} />
                {state === "sending" ? "Sending…" : "Send Feedback"}
              </button>
            </form>
          )}
        </section>
      )}

      <button type="button" className={styles.fab} onClick={() => setOpen((v) => !v)} aria-label="Open feedback">
        <MessageSquare size={20} />
        <span>Feedback</span>
      </button>
    </div>
  );
}
