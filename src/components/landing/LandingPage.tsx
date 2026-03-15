"use client";

import {
  BookOpen,
  ClipboardList,
  ScrollText,
  Sparkles,
  GraduationCap,
  Bell,
  Download,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

type Props = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  {
    icon: ClipboardList,
    title: "LoR Request Tracking",
    description:
      "Track every letter of recommendation request in one place — professor, deadline, and status at a glance.",
  },
  {
    icon: ScrollText,
    title: "SOP Manager",
    description:
      "Draft and manage Statements of Purpose for each college application with a built-in rich-text editor.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Drafts",
    description:
      "Generate polished LoR drafts and smart suggestions with Google Gemini AI — tailored to each professor.",
  },
  {
    icon: GraduationCap,
    title: "Faculty Network",
    description:
      "Keep a structured contact list of professors with their department, email, and areas of expertise.",
  },
  {
    icon: Bell,
    title: "Deadline Reminders",
    description:
      "Receive automatic in-app alerts when an application deadline is less than a week away.",
  },
  {
    icon: Download,
    title: "Export to PDF & DOCX",
    description:
      "Download your finalized letters and SOPs as professional PDF or Word documents with one click.",
  },
];

const steps = [
  {
    step: "1",
    title: "Create your free account",
    detail: "Sign up with email or Google — no credit card required.",
  },
  {
    step: "2",
    title: "Add professors & applications",
    detail: "Build your faculty contact list and log every program you're applying to.",
  },
  {
    step: "3",
    title: "Track requests & draft documents",
    detail: "Log LoR requests, write SOPs in the editor, and let AI help you refine them.",
  },
  {
    step: "4",
    title: "Stay on top of deadlines",
    detail: "Receive automatic reminders so nothing slips through the cracks.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay: i * 0.08, ease: smoothEase },
  }),
};

export function LandingPage({ onGetStarted, onSignIn }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-20 bg-surface-1/85 backdrop-blur-xl border-b border-border/80"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-md">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-headline font-semibold text-primary text-lg leading-none tracking-wide">
              LoR&nbsp;Tracker&nbsp;Pro
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSignIn}>
              <LogIn className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign&nbsp;In</span>
            </Button>
            <Button size="sm" onClick={onGetStarted}>
              <UserPlus className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Get&nbsp;Started</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 text-center max-w-3xl mx-auto overflow-hidden">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="text-4xl sm:text-6xl font-headline font-semibold text-primary leading-tight mb-4 break-words"
        >
          Your Academic Applications, Organized
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 font-body"
        >
          LoR Tracker Pro helps university students manage letters of recommendation, statements
          of purpose, and application deadlines — all in one place.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Free Account
          </Button>
          <Button size="lg" variant="outline" onClick={onSignIn} className="w-full sm:w-auto">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="py-16 px-4 sm:px-6 bg-surface-1/55 border-y border-border/60">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={0}
            className="text-2xl sm:text-3xl font-headline font-semibold text-primary text-center mb-2"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={1}
            className="text-muted-foreground text-center text-sm sm:text-base mb-10 font-body"
          >
            Built specifically for graduate &amp; undergraduate applicants.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i * 0.3 + 1}
                className="bg-card/90 rounded-xl p-6 border border-border shadow-lg shadow-black/20 cursor-default"
              >
                <div className="bg-accent/15 p-2.5 rounded-lg w-fit mb-4">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-headline font-semibold text-primary mb-2 text-xl">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-body">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          className="text-2xl sm:text-3xl font-headline font-semibold text-primary text-center mb-10"
        >
          Get Started in Minutes
        </motion.h2>
        <ol className="space-y-6">
          {steps.map(({ step, title, detail }, i) => (
            <motion.li
              key={step}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              custom={i * 0.6 + 0.5}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline font-semibold text-sm">
                {step}
              </div>
              <div>
                <h3 className="font-headline font-semibold text-primary">{title}</h3>
                <p className="text-muted-foreground text-sm mt-0.5 font-body">{detail}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* CTA banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-16 px-4 sm:px-6 bg-primary/90 text-primary-foreground border-y border-primary/30"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.1 }}>
            <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-4" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="text-2xl sm:text-3xl font-headline font-semibold mb-3"
          >
            Ready to take control of your applications?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            className="text-primary-foreground/70 text-sm sm:text-base mb-6 font-body"
          >
            Join students who are already managing their academic journey with LoR Tracker Pro.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={3}
          >
            <Button
              size="lg"
              variant="secondary"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Get Started — It&apos;s Free
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 border-t border-border/70 bg-surface-1/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">LoR Tracker Pro</span>
          </div>
          <span>Built for students, by students.</span>
        </div>
      </footer>
    </div>
  );
}
