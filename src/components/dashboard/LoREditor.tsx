"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoRRequest, Professor, UniversityApplication } from "@/lib/types";
import { ArrowLeft, Save, Download, Sparkles, Loader2, FileText, CheckCircle, Share2, ChevronDown } from "lucide-react";
import { generateLoRDraft } from "@/ai/flows/generate-lor-draft";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TiptapEditor } from "./TiptapEditor";
import { downloadAsPdf } from "@/lib/downloadUtils";

interface LoREditorProps {
  request: LoRRequest;
  professor?: Professor;
  application?: UniversityApplication;
  onSave: (content: string) => void;
  onClose: () => void;
  onShare?: (requestId: string) => Promise<string | null>;
  geminiKey?: string;
}

/** Convert plain text (possibly multi-line) to simple HTML paragraphs for Tiptap */
function textToHtml(text: string): string {
  // If already looks like HTML (contains common block elements), return as-is
  if (/<(p|h[1-6]|ul|ol|li|blockquote|br)\b/i.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Strip HTML tags for plain-text extraction (used for DOCX export and word counting only) */
function stripHtml(html: string): string {
  // Convert block-level elements to newlines before stripping tags
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li)>/gi, "\n");

  // Repeatedly strip tags to handle any malformed or nested tag patterns
  let prev = "";
  while (prev !== text) {
    prev = text;
    text = text.replace(/<[^>]*>/g, "");
  }

  // Decode a fixed set of HTML entities in a single pass (no chaining)
  return text
    .replace(/&(?:amp|lt|gt|nbsp|quot|#39);/g, (m) =>
      ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&quot;": '"', "&#39;": "'" }[m] ?? m)
    )
    .trim();
}

const AUTOSAVE_DELAY = 2000;

export function LoREditor({ request, professor, application, onSave, onClose, onShare, geminiKey }: LoREditorProps) {
  const [content, setContent] = useState(() => {
    const raw = request.content || "";
    return textToHtml(raw);
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
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

  const handleCopyShareLink = async () => {
    let token = request.shareToken;
    if (!token && onShare) {
      token = (await onShare(request.id)) ?? undefined;
    }
    if (!token) return;
    const url = `${window.location.origin}/lor/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      if (shareTimer.current) clearTimeout(shareTimer.current);
      shareTimer.current = setTimeout(() => setShareStatus("idle"), 3000);
    } catch {
      // clipboard unavailable – silently ignore
    }
  };

  const handleDownloadPdf = () => {
    downloadAsPdf(content, `LoR_${application?.university || "Application"}_${professor?.name || "Professor"}.pdf`);
  };

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
    saveAs(blob, `LoR_${application?.university || "Application"}_${professor?.name || "Professor"}.docx`);
  };

  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const result = await generateLoRDraft({
        professorName: professor?.name || "Dr. [Name]",
        professorExpertise: professor?.expertise || "[Expertise]",
        studentName: "[Student Name]",
        studentHistory: "The student has been a top performer in courses and shown great research aptitude.",
        university: application?.university || "[University]",
        program: application?.program || "[Program]",
      }, geminiKey || undefined);
      setContent(textToHtml(result.draft));
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
      {/* Notion-style Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-primary leading-tight">
              {application?.university || "Application Draft"}
            </h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
              Drafting for {professor?.name || "Professor"}
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
              <span className="hidden sm:inline">Saving…</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600" aria-live="polite">
              <CheckCircle className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIDraft}
            disabled={isDrafting}
            className="border-accent text-accent hover:bg-accent hover:text-white h-8"
          >
            {isDrafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 sm:mr-2" />}
            <span className="hidden sm:inline">AI Draft</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onSave(content)} className="h-8">
            <Save className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyShareLink}
            className="h-8 border-blue-500 text-blue-600 hover:bg-blue-50"
            title="Generate a shareable link anyone can view"
          >
            <Share2 className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline">{shareStatus === "copied" ? "Link Copied!" : "Share Link"}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="bg-primary h-8">
                <Download className="h-3.5 w-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Export PDF</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <FileText className="mr-2 h-4 w-4" />
                Download as DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Editing Area */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <Card className="border-none shadow-xl bg-white min-h-[85vh] flex flex-col">
            <CardContent className="p-6 sm:p-12 md:p-16 flex-1 flex flex-col">
              <div className="mb-10 flex items-center gap-4 text-muted-foreground border-b border-muted/30 pb-6">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">
                    Letter of Recommendation
                  </h1>
                  <p className="text-sm font-literata">
                    Target: <span className="text-accent font-bold">{application?.program || "General Program"}</span>
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your Letter of Recommendation..."
                />
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-center text-xs text-muted-foreground italic">
              Use the toolbar above to format your letter. Use AI Draft to generate a professional structure.
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
