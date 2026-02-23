"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SopEntry } from "@/lib/types";
import { ArrowLeft, Save, Download, Sparkles, Loader2, FileText, CheckCircle } from "lucide-react";
import { generateSopDraft } from "@/ai/flows/generate-sop-draft";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { TiptapEditor } from "./TiptapEditor";

interface SopEditorProps {
  sop: SopEntry;
  onSave: (content: string) => void;
  onClose: () => void;
}

/** Convert plain text (possibly multi-line) to simple HTML paragraphs for Tiptap */
function textToHtml(text: string): string {
  if (/<(p|h[1-6]|ul|ol|li|blockquote|br)\b/i.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** HTML entities to decode when stripping HTML */
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
};

/** Strip HTML tags for plain-text extraction */
function stripHtml(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li)>/gi, "\n");
  let prev = "";
  while (prev !== text) {
    prev = text;
    text = text.replace(/<[^>]*>/g, "");
  }
  return text
    .replace(/&(?:amp|lt|gt|nbsp|quot|#39);/g, (m) => HTML_ENTITIES[m] ?? m)
    .trim();
}

const AUTOSAVE_DELAY = 2000;

export function SopEditor({ sop, onSave, onClose }: SopEditorProps) {
  const [content, setContent] = useState(() => textToHtml(sop.content || ""));
  const [isDrafting, setIsDrafting] = useState(false);
  const [background, setBackground] = useState("");
  const [achievements, setAchievements] = useState("");
  const [goals, setGoals] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setSaveStatus("saving");
    autosaveTimer.current = setTimeout(() => {
      onSave(content);
      setSaveStatus("saved");
      idleTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
    }, AUTOSAVE_DELAY);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleDownload = async () => {
    const plainText = stripHtml(content);
    const doc = new Document({
      sections: [{
        properties: {},
        children: plainText.split("\n").map((line) =>
          line.trim()
            ? new Paragraph({ children: [new TextRun(line)] })
            : new Paragraph({ children: [] })
        ),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `SOP_${sop.college}_${sop.program}.docx`);
  };

  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const result = await generateSopDraft({
        college: sop.college,
        program: sop.program,
        studentBackground: background || "Strong academic background in the field.",
        achievements: achievements || "Dean's list, research publications, internship experience.",
        goals: goals || "To contribute to cutting-edge research and pursue an academic/industry career.",
      });
      setContent(textToHtml(result.draft));
      setShowAiPanel(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDrafting(false);
    }
  };

  const plainText = stripHtml(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const charCount = plainText.length;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-primary leading-tight">{sop.college}</h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
              {sop.program}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-widest border-r pr-3 mr-1">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </span>
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600" aria-live="polite">
              <CheckCircle className="h-3 w-3" aria-hidden="true" />
              Saved
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiPanel((v) => !v)}
            className="border-accent text-accent hover:bg-accent hover:text-white h-8"
          >
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            AI Draft
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onSave(content)} className="h-8">
            <Save className="h-3.5 w-3.5 mr-2" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} className="bg-primary h-8">
            <Download className="h-3.5 w-3.5 mr-2" />
            Export .docx
          </Button>
        </div>
      </header>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="border-b bg-accent/5 px-6 py-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase text-accent tracking-wide">
            AI Draft Parameters
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label className="text-xs" htmlFor="bg">Your Background</Label>
              <Input
                id="bg"
                placeholder="e.g. B.Tech in CS with 9.2 GPA"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs" htmlFor="ach">Key Achievements</Label>
              <Input
                id="ach"
                placeholder="e.g. Published paper, hackathon winner"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs" htmlFor="goals">Career Goals</Label>
              <Input
                id="goals"
                placeholder="e.g. AI research, product management"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAIDraft}
              disabled={isDrafting}
              className="bg-accent text-white h-8"
            >
              {isDrafting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-2" />
              )}
              Generate Draft
            </Button>
          </div>
        </div>
      )}

      {/* Main Editing Area */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <Card className="border-none shadow-xl bg-white min-h-[85vh] flex flex-col">
            <CardContent className="p-12 md:p-16 flex-1 flex flex-col">
              <div className="mb-10 flex items-center gap-4 text-muted-foreground border-b border-muted/30 pb-6">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">
                    Statement of Purpose
                  </h1>
                  <p className="text-sm font-literata">
                    Target: <span className="text-accent font-bold">{sop.program}</span> at{" "}
                    <span className="text-accent font-bold">{sop.college}</span>
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your Statement of Purpose..."
                />
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-center text-xs text-muted-foreground italic">
              Use the toolbar above to format your SOP. Use AI Draft to generate a professional structure.
            </p>
            <div className="flex gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              <span>Characters: {charCount}</span>
              <span>Words: {wordCount}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
