"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useIntro } from "@/components/ui/Intro";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { useTransition } from "@/components/ui/PageTransition";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { chapterHash, type ChapterId } from "@/data/scenes";
import { skillCategories, skillsByCategory } from "@/data/skills";
import { gotoChapter } from "@/lib/deck";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Mr. Nimbus: the office cat at GLAZY (Krutik's own, a tuxedo, and a
 * gentleman) and the site's guide. Helps visitors get what they came for,
 * with the occasional joke.
 *
 * Without an AI key he is a guided assistant: he recognises what people ask
 * about (a website, the services, hiring, the work, the toolkit, contact)
 * and answers from the same data the site is built from, with buttons that
 * do the thing. With GEMINI_API_KEY set, real questions go to Gemini through
 * /api/nimbus, grounded in the same data.
 */

type Action =
  | { kind: "link"; label: string; href: string }
  | { kind: "chapter"; label: string; chapter: ChapterId }
  | { kind: "resume"; label: string };

interface Message {
  id: number;
  from: "nimbus" | "you";
  text: string;
  actions?: Action[];
  replies?: string[];
}

const whatsapp = `https://wa.me/${profile.phone.replace(/\D/g, "")}`;
const mail = (subject: string) => `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;
const founder = profile.name.split(" ")[0];
const internship = profile.experience.find((e) => /intern/i.test(e.role));

const QUICK = ["I need a website", "What does GLAZY make?", "Show me the work", "I'm hiring", "How do I reach you?", "Tell me a joke"];

/** Mr. Nimbus's material. Original, and delivered with a straight face. */
const JOKES = [
  "Why am I the guide here? Someone had to supervise the code, and I was already sitting on the keyboard.",
  "I have personally reviewed every project on this site. Mostly by lying across the laptop while it compiled.",
  "The tuxedo is natural. It saves a great deal of time before formal occasions, which, for a gentleman, is all of them.",
  `${founder} fixes bugs. I catch them. We are not the same.`,
  "People ask whether I'm an AI. I am a cat. The AI is merely here to assist me.",
  "My hourly rate is two treats and one uninterrupted nap. GLAZY's rates are on request; I'm told they are more reasonable.",
  "I once pushed a glass off the desk to test gravity. Results were reproducible. That is what we call good engineering.",
];
let jokeIndex = 0;
/** Timestamps for the "thinking" pause, kept outside render. */
const clock = () => performance.now();

function answer(input: string): Omit<Message, "id" | "from"> {
  const q = input.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("joke", "funny", "laugh", "humour", "humor", "make me smile")) {
    const text = JOKES[jokeIndex % JOKES.length];
    jokeIndex++;
    return { text, replies: ["Another one", "I need a website", "What does GLAZY make?"] };
  }
  if (has("another")) return answer("joke");

  const project = projects.find((p) => q.includes(p.title.toLowerCase()) || q.includes(p.slug.replace(/-/g, " ")));
  if (project) {
    return {
      text: `Ah, ${project.title}. ${project.tagline} ${project.description} A fine piece of work, if I may say so.`,
      actions: [
        { kind: "link", label: "Open the case study", href: `/projects/${project.slug}` },
        ...(project.live ? [{ kind: "link" as const, label: "Live site", href: project.live }] : []),
        ...(project.demo ? [{ kind: "link" as const, label: "Watch the demo", href: project.demo }] : []),
      ],
    };
  }
  if (has("price", "cost", "charge", "budget", "quote", "rate")) {
    return {
      text: "A gentleman never guesses at a price. Send us a short brief (what the site is for, any site you have now, and your timeline) and you'll get a plan and a proper quote.",
      actions: [
        { kind: "chapter", label: "Write a brief", chapter: "contact" },
        { kind: "link", label: "WhatsApp", href: whatsapp },
      ],
    };
  }
  if (has("what does glazy", "service", "offer", "what do you do", "what do you make", "what you make")) {
    return {
      text: `GLAZY makes ${services.map((s) => s.title.toLowerCase()).join(", ")}. Each one starts with a short brief and ends with a launch.`,
      actions: [{ kind: "chapter", label: "See what we make", chapter: "services" }],
      replies: ["I need a website", "How much does it cost?"],
    };
  }
  if (has("website", "site", "landing", "web app", "build me", "business", "shop", "redesign", "fix my", "develop")) {
    return {
      text: "Splendid. GLAZY builds websites and web apps as paid projects, entirely online: email, WhatsApp and video calls. Business sites, cinematic sites like this one, web apps like CRM360, AI features as in ScamShield, or rescuing a site that has misbehaved.",
      actions: [
        { kind: "chapter", label: "Write a brief", chapter: "contact" },
        { kind: "link", label: "WhatsApp", href: whatsapp },
        { kind: "chapter", label: "See how it works", chapter: "contact" },
      ],
    };
  }
  if (has("hire", "hiring", "intern", "job", "role", "recruit", "position", "opening", "resume", "cv")) {
    return {
      text: `Excellent taste. ${founder}, the founder, is also open to paid remote internships: a B.Tech student at KJ Somaiya (2025–2029)${internship ? ` who has completed a web development internship at ${internship.company}` : ""}. I can vouch for the work ethic; ${founder} rarely naps before I do.`,
      actions: [
        { kind: "resume", label: "View resume" },
        { kind: "link", label: `Email ${founder}`, href: mail("Internship opportunity") },
        { kind: "link", label: "LinkedIn", href: profile.socials.find((s) => s.label === "LinkedIn")?.href ?? "#" },
      ],
    };
  }
  if (has("project", "work", "portfolio", "built", "made", "show")) {
    return {
      text: `${projects.length} projects, each live, shipped or open source: ${projects.map((p) => p.title).join(", ")}. Name any one and I'll tell you about it.`,
      actions: [{ kind: "chapter", label: "Walk through the work", chapter: "work" }],
      replies: projects.slice(0, 3).map((p) => p.title),
    };
  }
  if (has("stack", "skill", "tech", "language", "framework", "react", "next", "node", "build with", "tools")) {
    const lines = skillCategories.map((c) => `${c}: ${skillsByCategory(c).map((s) => s.name).join(", ")}`);
    return { text: `Our toolkit, catalogued:\n${lines.join("\n")}`, actions: [{ kind: "chapter", label: "See the toolkit", chapter: "stack" }] };
  }
  if (has("contact", "email", "mail", "phone", "whatsapp", "reach", "call", "talk to")) {
    return {
      text: `Email ${profile.email}, or send a WhatsApp message. Every message is read, which is more than I can say for the mail I receive.`,
      actions: [
        { kind: "link", label: "Email", href: `mailto:${profile.email}` },
        { kind: "link", label: "WhatsApp", href: whatsapp },
      ],
    };
  }
  if (has("available", "free", "when", "start", "open to")) {
    return { text: `Indeed: GLAZY is taking on paid web and SaaS projects, and ${founder} is open to paid remote internships.`, replies: ["I need a website", "I'm hiring"] };
  }
  if (has("who are you", "your name", "nimbus", "are you a cat", "are you ai", "are you real")) {
    return {
      text: `Mr. Nimbus, the office cat at GLAZY and ${founder}'s own. Tuxedo by nature, gentleman by choice. I answer the common questions, and when my AI line is connected you may chat with me about anything.`,
      replies: QUICK.slice(0, 3),
    };
  }
  if (has("glazy", "studio", "agency", "company", "founder", "founded")) {
    return {
      text: `GLAZY is a web and SaaS agency founded by ${profile.name} in ${site.founded}, in ${profile.location.split(",")[0]}. We design and build websites, web apps, SaaS products and AI features, from the first sketch to launch.`,
      actions: [
        { kind: "chapter", label: "Meet the founder", chapter: "about" },
        { kind: "chapter", label: "See what we make", chapter: "services" },
      ],
    };
  }
  if (has("who", "about", "student", "college", "study", "experience", "krutik")) {
    return { text: profile.about[0], actions: [{ kind: "chapter", label: "Meet the founder", chapter: "about" }] };
  }
  if (has("thank", "thanks", "cheers")) {
    return { text: "A pleasure. Do mind the whiskers on your way out." };
  }
  if (has("hi", "hello", "hey", "yo", "sup", "good morning", "good evening")) {
    return { text: "Good day to you. Mr. Nimbus, at your service. What brings you in?", replies: QUICK };
  }
  return {
    text: "Ah, a question beyond my whiskers. May I offer one of these instead? For anything else, we read every email.",
    replies: QUICK,
  };
}

type Intent = "website" | "hire" | "projects" | "stack" | "contact" | "about" | "joke" | "none";

/** Buttons that follow an AI reply: the same actions as the guided answers, picked by intent. */
function followUp(intent: Intent): Pick<Message, "actions" | "replies"> {
  const trigger: Record<Intent, string> = {
    website: "website",
    hire: "hiring",
    projects: "projects",
    stack: "stack",
    contact: "contact",
    about: "about krutik",
    joke: "joke",
    none: "",
  };
  if (intent === "none") return {};
  if (intent === "joke") return { replies: ["Another one"] };
  const { actions, replies } = answer(trigger[intent]);
  return { actions, replies };
}

/** Mr. Nimbus's portrait (his own photo, cleaned up). */
function Portrait({ size, tilt = false, twitch = false }: { size: number; tilt?: boolean; twitch?: boolean }) {
  return (
    <motion.span
      className={cn("relative inline-block shrink-0 rounded-full", twitch && "[animation:nimbus-twitch_7s_ease-in-out_infinite]")}
      style={{ width: size, height: size }}
      animate={{ rotate: tilt ? -11 : 0, y: tilt ? -1 : 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
    >
      <Image
        src={size > 48 ? "/nimbus/mr-nimbus-512.webp" : "/nimbus/mr-nimbus-160.webp"}
        alt="Mr. Nimbus, a black-and-white tuxedo cat"
        width={size}
        height={size}
        className="rounded-full object-cover ring-1 ring-white/20"
        style={{ width: size, height: size }}
      />
    </motion.span>
  );
}

export function Nimbus() {
  const { done } = useIntro();
  const pathname = usePathname();
  const { navigate } = useTransition();
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 0,
      from: "nimbus",
      text: "Good day. Mr. Nimbus, at your service: the office cat at GLAZY and, if I may say, the best-dressed guide on this site. What brings you in?",
      replies: QUICK,
    },
  ]);
  const idRef = useRef(1);
  const [ai, setAi] = useState<boolean | null>(null);
  const history = useRef<Message[]>([]);
  useEffect(() => {
    history.current = messages;
  }, [messages]);

  // Is his AI line connected? Asked once, when the chat is first opened.
  useEffect(() => {
    if (!open || ai !== null) return;
    let cancelled = false;
    fetch("/api/nimbus")
      .then((r) => r.json())
      .then((d: { ai?: boolean }) => !cancelled && setAi(!!d.ai))
      .catch(() => !cancelled && setAi(false));
    return () => {
      cancelled = true;
    };
  }, [open, ai]);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // The invitation: once per visit, a little after the opening.
  useEffect(() => {
    if (!done) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem("nimbus:invited") === "1";
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => setBubble(true), 7000);
    return () => window.clearTimeout(t);
  }, [done]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Escape closes the chat.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Let the page know the chat is open (on phones the Continue prompt steps aside).
  useEffect(() => {
    const html = document.documentElement;
    if (open) html.dataset.nimbus = "open";
    else delete html.dataset.nimbus;
    return () => {
      delete html.dataset.nimbus;
    };
  }, [open]);

  const dismissBubble = () => {
    setBubble(false);
    try {
      window.sessionStorage.setItem("nimbus:invited", "1");
    } catch {}
  };

  const ask = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    const mine: Message = { id: idRef.current++, from: "you", text: t };
    setMessages((m) => [...m, mine]);
    setInput("");
    setTyping(true);
    const started = clock();
    let reply: Omit<Message, "id" | "from"> | null = null;
    // Jokes and the like stay instant; real questions go to Gemini when it is connected.
    const quick = /^(tell me a joke|another one)$/i.test(t) || QUICK.includes(t);
    if (ai && !quick) {
      try {
        const res = await fetch("/api/nimbus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...history.current, mine].slice(-12).map(({ from, text: m }) => ({ from, text: m })) }),
        });
        if (res.ok) {
          const data = (await res.json()) as { reply: string; intent: Intent };
          reply = { text: data.reply, ...followUp(data.intent) };
        } else if (res.status !== 429) {
          // His AI line is down: say so honestly, and carry on with his own answers.
          setAi(false);
        }
      } catch {
        /* fall back below */
      }
    }
    if (!reply) reply = answer(t);
    // A beat of "thinking" so replies never snap in.
    const wait = Math.max(0, 500 - (clock() - started));
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, from: "nimbus", ...reply! }]);
    }, wait);
  };

  const goChapter = (c: ChapterId) => {
    setOpen(false);
    window.setTimeout(() => {
      if (pathname === "/") gotoChapter(c);
      else navigate(`/#${chapterHash(c)}`);
    }, 250);
  };

  const renderAction = (a: Action, i: number): ReactNode => {
    const cls = "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] text-bone transition-colors hover:bg-white/[0.14]";
    if (a.kind === "resume")
      return (
        <ResumeViewer key={i}>
          <button type="button" className={cls}>
            {a.label}
          </button>
        </ResumeViewer>
      );
    if (a.kind === "chapter")
      return (
        <button key={i} type="button" onClick={() => goChapter(a.chapter)} className={cls}>
          {a.label} →
        </button>
      );
    const internal = a.href.startsWith("/");
    return (
      <a
        key={i}
        href={a.href}
        className={cls}
        onClick={(e) => {
          if (internal) {
            e.preventDefault();
            setOpen(false);
            navigate(a.href);
          }
        }}
        {...(!internal && a.href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {a.label} {!internal && <ArrowUpRight />}
      </a>
    );
  };

  if (!done) return null;

  return (
    <>
      {/* Launcher and invitation. The invitation is one line beside the launcher, in the
          strip every scene keeps free at the foot, so it never covers content; it only
          shows where there is room for it next to the Continue prompt. */}
      <div className="fixed bottom-5 right-5 z-[92] flex items-center gap-3">
        <AnimatePresence>
          {bubble && !open && (
            <motion.div
              className="hidden h-12 items-center gap-1 rounded-full border border-white/15 bg-ink-3/90 pl-4 pr-1.5 text-[13px] text-bone shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)] backdrop-blur-md min-[1180px]:flex"
              initial={{ opacity: 0, x: 16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.97 }}
              transition={{ duration: 0.5, ease: ease.outExpo }}
            >
              <span className="mr-2 text-bone-2">Have a doubt?</span>
              <button
                type="button"
                onClick={() => {
                  dismissBubble();
                  setOpen(true);
                }}
                className="inline-flex h-9 items-center rounded-full bg-bone px-4 font-medium text-ink"
              >
                Ask Mr. Nimbus
              </button>
              <button type="button" onClick={dismissBubble} aria-label="Dismiss the invitation" className="flex h-9 w-8 items-center justify-center rounded-full text-bone-2 hover:text-bone">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={() => {
            dismissBubble();
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          aria-controls="nimbus-panel"
          className="group flex h-12 items-center gap-2 rounded-full border border-white/15 bg-ink-3/85 px-2 sm:pl-3 sm:pr-4 text-sm text-bone shadow-[0_12px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md transition-colors hover:bg-ink-4/90"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.8 }}
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span aria-hidden className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,var(--color-ember),transparent_30%,var(--color-peach)_55%,transparent_80%,var(--color-ember))] opacity-80 [animation:leader-sweep_5s_linear_infinite] group-hover:opacity-100 group-hover:[animation-duration:1.6s]" />
            <span className="relative rounded-full bg-ink-3 p-px">
              <Portrait size={30} twitch={!open} />
            </span>
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#28c840] opacity-60" />
              <span className="relative h-2.5 w-2.5 rounded-full border-2 border-ink-3 bg-[#28c840]" />
            </span>
          </span>
          <span className="hidden sm:inline">{open ? "Close" : "Mr. Nimbus"}</span>
          <span className="sr-only sm:hidden">{open ? "Close chat" : "Talk to Mr. Nimbus"}</span>
        </motion.button>
      </div>

      {/* Panel. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="nimbus-panel"
            role="dialog"
            aria-label="Mr. Nimbus, site guide"
            data-lenis-prevent
            className="fixed bottom-20 right-5 z-[92] flex h-[min(560px,calc(100svh-7rem))] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink-2/95 text-bone shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md"
            style={{ transformOrigin: "100% 100%" }}
            initial={{ opacity: 0, y: 30, scale: 0.6, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.7, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Portrait size={44} tilt={typing} twitch={!typing} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">Mr. Nimbus</p>
                <p className="text-xs text-bone-2">{typing ? "Thinking it over…" : "Office cat · gentleman · your guide"}</p>
              </div>
              <motion.button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the chat with Mr. Nimbus"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-bone-2 transition-colors hover:bg-white/[0.12] hover:text-bone"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </motion.button>
            </div>
            <p className="border-b border-white/10 bg-ember/10 px-4 py-2.5 text-[12px] leading-snug text-peach">
              {ai
                ? "Mr. Nimbus now chats freely, with a little help from AI. He is a cat, so for anything important, email us."
                : "AI is being linked to Mr. Nimbus. Soon you'll be able to chat with him freely; for now he answers the common questions (and tells a joke on request)."}
            </p>

            <div ref={list} className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  className={cn("flex flex-col gap-2", m.from === "you" ? "items-end" : "items-start")}
                  initial={{ opacity: 0, x: m.from === "you" ? 14 : -14, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  {m.from === "nimbus" && (
                    <span className="flex items-center gap-2 text-[11px] text-bone-3">
                      <Portrait size={20} /> Mr. Nimbus
                    </span>
                  )}
                  <p
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                      m.from === "you" ? "rounded-br-md bg-ember text-white" : "rounded-bl-md bg-white/[0.07] text-bone",
                    )}
                  >
                    {m.text}
                  </p>
                  {m.actions && <div className="flex flex-wrap gap-2">{m.actions.map(renderAction)}</div>}
                  {m.replies && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.replies.map((r) => (
                        <button key={r} type="button" onClick={() => ask(r)} className="rounded-full border border-ember/50 px-3 py-1.5 text-[13px] text-peach transition-colors hover:bg-ember/15">
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/[0.07] px-3.5 py-2.5" role="status" aria-label="Mr. Nimbus is thinking">
                  {[0, 1, 2].map((i) => (
                    <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 text-peach [animation:paw-hop_1.1s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.18}s` }} aria-hidden>
                      <ellipse cx="10" cy="13.5" rx="4.6" ry="3.8" fill="currentColor" />
                      <ellipse cx="4.2" cy="8.4" rx="1.9" ry="2.3" fill="currentColor" />
                      <ellipse cx="8" cy="5.2" rx="1.9" ry="2.4" fill="currentColor" />
                      <ellipse cx="12" cy="5.2" rx="1.9" ry="2.4" fill="currentColor" />
                      <ellipse cx="15.8" cy="8.4" rx="1.9" ry="2.3" fill="currentColor" />
                    </svg>
                  ))}
                </div>
              )}
            </div>

            <form
              className="flex items-center gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
                field.current?.focus();
              }}
            >
              <label htmlFor="nimbus-input" className="sr-only">
                Ask Nimbus
              </label>
              <input
                id="nimbus-input"
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a website, a project, the agency…"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 text-[14px] text-bone placeholder:text-bone-3 focus:border-ember/60 focus:outline-none"
              />
              <button type="submit" aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember text-white disabled:opacity-40" disabled={!input.trim()}>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
