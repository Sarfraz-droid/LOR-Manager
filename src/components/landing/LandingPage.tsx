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

type Props = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

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

export function LandingPage({ onGetStarted, onSignIn }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-md">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-headline font-bold text-primary text-lg leading-none">
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
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 text-center max-w-3xl mx-auto overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          AI-assisted · Free to use
        </div>
        <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary leading-tight mb-4 break-words">
          Your Academic Applications, Organized
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
          LoR Tracker Pro helps university students manage letters of recommendation, statements
          of purpose, and application deadlines — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Free Account
          </Button>
          <Button size="lg" variant="outline" onClick={onSignIn} className="w-full sm:w-auto">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary text-center mb-2">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center text-sm sm:text-base mb-10">
            Built specifically for graduate &amp; undergraduate applicants.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-accent/15 p-2.5 rounded-lg w-fit mb-4">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-headline font-semibold text-primary mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary text-center mb-10">
          Get Started in Minutes
        </h2>
        <ol className="space-y-6">
          {[
            {
              step: "1",
              title: "Create your free account",
              detail: "Sign up with email or Google — no credit card required.",
            },
            {
              step: "2",
              title: "Add professors &amp; applications",
              detail:
                "Build your faculty contact list and log every program you're applying to.",
            },
            {
              step: "3",
              title: "Track requests &amp; draft documents",
              detail:
                "Log LoR requests, write SOPs in the editor, and let AI help you refine them.",
            },
            {
              step: "4",
              title: "Stay on top of deadlines",
              detail:
                "Receive automatic reminders so nothing slips through the cracks.",
            },
          ].map(({ step, title, detail }) => (
            <li key={step} className="flex gap-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-headline font-bold text-sm">
                {step}
              </div>
              <div>
                <h3
                  className="font-headline font-semibold text-primary"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
                <p className="text-muted-foreground text-sm mt-0.5">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA banner */}
      <section className="py-16 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-headline font-bold mb-3">
            Ready to take control of your applications?
          </h2>
          <p className="text-primary-foreground/70 text-sm sm:text-base mb-6">
            Join students who are already managing their academic journey with LoR Tracker Pro.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Get Started — It&apos;s Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-bold text-foreground">LoR Tracker Pro</span>
          </div>
          <span>Built for students, by students.</span>
        </div>
      </footer>
    </div>
  );
}
