"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";
import {
  SendIcon,
  LoaderIcon,
  Command,
  Brain,
  BookOpen,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: {
  minHeight: number;
  maxHeight?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = `${minHeight}px`;
      if (!reset) {
        el.style.height = `${Math.max(
          minHeight,
          Math.min(el.scrollHeight, maxHeight ?? Infinity)
        )}px`;
      }
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current)
      textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{ boxShadow: "0 0 4px rgba(255,255,255,0.3)" }}
        />
      ))}
    </div>
  );
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [context, setContext] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showContext, setShowContext] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <Brain className="w-4 h-4" />,
      label: "Explain",
      description: "Explain a concept clearly",
      prefix: "/explain",
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      label: "Quiz Me",
      description: "Generate quiz questions",
      prefix: "/quiz",
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: "Summarize",
      description: "Summarize study material",
      prefix: "/summary",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Practice",
      description: "Get practice problems",
      prefix: "/practice",
    },
  ];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Mouse tracking for glow
  useEffect(() => {
    const handler = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Show command palette on /
  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const idx = commandSuggestions.findIndex((c) =>
        c.prefix.startsWith(value)
      );
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close palette on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = document.querySelector("[data-command-button]");
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !btn?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function buildPrompt(raw: string): string {
    if (raw.startsWith("/explain "))
      return `Explain "${raw.slice(9)}" in simple, clear terms with examples.`;
    if (raw.startsWith("/quiz "))
      return `Generate 5 quiz questions (mix of MCQ and short answer) on: ${raw.slice(6)}`;
    if (raw.startsWith("/summary "))
      return `Summarize the following in concise bullet points:\n${raw.slice(9)}`;
    if (raw.startsWith("/practice "))
      return `Give me 5 practice problems on: ${raw.slice(10)}. Include hints.`;
    return raw;
  }

  async function handleSendMessage() {
    const raw = value.trim();
    if (!raw || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: raw }]);
    setValue("");
    adjustHeight(true);
    setIsTyping(true);

    try {
      const prompt = buildPrompt(raw);
      const res = await aiApi.ask(prompt, context || undefined);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.result },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function selectCommand(index: number) {
    setValue(commandSuggestions[index].prefix + " ");
    setShowCommandPalette(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((p) =>
          p < commandSuggestions.length - 1 ? p + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((p) =>
          p > 0 ? p - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) selectCommand(activeSuggestion);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white relative overflow-hidden">
      {/* Background ambient blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[96px] animate-pulse delay-1000" />
      </div>

      {/* Messages / empty state */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {isEmpty ? (
            <motion.div
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block"
              >
                <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                  How can I help today?
                </h1>
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </motion.div>
              <motion.p
                className="text-sm text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Ask a question or type <span className="text-white/60 font-mono">/</span> for commands
              </motion.p>

              {/* Quick action chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                {commandSuggestions.map((s, i) => (
                  <motion.button
                    key={s.prefix}
                    onClick={() => selectCommand(i)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 border border-white/[0.05] transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-white text-gray-900"
                        : "backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] text-white/90"
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 rounded-2xl flex items-center gap-2">
                    <span className="text-xs text-white/50">Thinking</span>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area — sticky bottom */}
      <div className="relative z-10 border-t border-white/[0.05] bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto p-4 space-y-2">
          {/* Optional context panel */}
          <AnimatePresence>
            {showContext && (
              <motion.div
                className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-xl p-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs text-white/40 mb-2">
                  Study notes context (grounded answers)
                </p>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste your notes here..."
                  rows={3}
                  className="w-full bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat input box */}
          <motion.div
            className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Command palette */}
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div
                  ref={commandPaletteRef}
                  className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="py-1 bg-black/95">
                    {commandSuggestions.map((s, i) => (
                      <motion.div
                        key={s.prefix}
                        onClick={() => selectCommand(i)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors",
                          activeSuggestion === i
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div className="w-5 h-5 flex items-center justify-center text-white/60">
                          {s.icon}
                        </div>
                        <span className="font-medium">{s.label}</span>
                        <span className="text-white/40 ml-1 font-mono">{s.prefix}</span>
                        <span className="text-white/30 ml-auto">{s.description}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask anything, or type / for commands..."
                className={cn(
                  "w-full px-4 py-3 resize-none bg-transparent border-none",
                  "text-white/90 text-sm placeholder:text-white/20",
                  "focus:outline-none min-h-[60px]"
                )}
                style={{ overflow: "hidden" }}
              />
            </div>

            {/* Toolbar */}
            <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => setShowContext((p) => !p)}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors text-xs px-3",
                    showContext && "bg-white/10 text-white/90"
                  )}
                >
                  Context
                </motion.button>
                <motion.button
                  type="button"
                  data-command-button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowCommandPalette((p) => !p);
                  }}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors",
                    showCommandPalette && "bg-white/10 text-white/90"
                  )}
                >
                  <Command className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                type="button"
                onClick={handleSendMessage}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isTyping || !value.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  value.trim() && !isTyping
                    ? "bg-white text-gray-900 shadow-lg shadow-white/10"
                    : "bg-white/[0.05] text-white/40"
                )}
              >
                {isTyping ? (
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
                <span>Send</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cursor glow follows mouse when input focused */}
      {inputFocused && (
        <motion.div
          className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </div>
  );
}
