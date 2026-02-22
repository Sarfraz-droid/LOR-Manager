"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoRRequest, Professor, UniversityApplication } from "@/lib/types";
import { ArrowLeft, Save, Download, Sparkles, Loader2, FileText, Eye, Edit3 } from "lucide-react";
import { generateLoRDraft } from "@/ai/flows/generate-lor-draft";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoREditorProps {
  request: LoRRequest;
  professor?: Professor;
  application?: UniversityApplication;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function LoREditor({ request, professor, application, onSave, onClose }: LoREditorProps) {
  const [content, setContent] = useState(request.content || "");
  const [isDrafting, setIsDrafting] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");

  const handleDownload = async () => {
    // Basic conversion from markdown to DOCX lines
    const doc = new Document({
      sections: [{
        properties: {},
        children: content.split('\n').map(line => new Paragraph({
          children: [new TextRun(line)],
        })),
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
      });
      setContent(result.draft);
      setMode("write");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDrafting(false);
    }
  };

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

        <div className="flex items-center gap-4">
          <Tabs value={mode} onValueChange={(val) => setMode(val as "write" | "preview")} className="w-auto">
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="write" className="text-xs px-3 h-6">
                <Edit3 className="h-3 w-3 mr-1.5" /> Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs px-3 h-6">
                <Eye className="h-3 w-3 mr-1.5" /> Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-4 w-[1px] bg-border mx-2" />

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAIDraft} 
              disabled={isDrafting}
              className="border-accent text-accent hover:bg-accent hover:text-white h-8"
            >
              {isDrafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
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
        </div>
      </header>

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
                    Letter of Recommendation
                  </h1>
                  <p className="text-sm font-literata">
                    Target: <span className="text-accent font-bold">{application?.program || "General Program"}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex-1">
                {mode === "write" ? (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type in Markdown (e.g., # Header, **Bold**, etc.)..."
                    className="w-full h-full border-none focus-visible:ring-0 text-lg leading-relaxed font-literata resize-none p-0 bg-transparent min-h-[600px] placeholder:text-muted/30"
                  />
                ) : (
                  <div className="prose prose-slate max-w-none font-literata text-lg leading-relaxed text-primary">
                    <ReactMarkdown className="markdown-preview">
                      {content || "*No content to preview. Start writing in the 'Write' tab.*"}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-center text-xs text-muted-foreground italic">
              Tip: Markdown formatting is supported. Use the AI Draft to generate a professional structure.
            </p>
            <div className="flex gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              <span>Characters: {content.length}</span>
              <span>Words: {content.split(/\s+/).filter(Boolean).length}</span>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .markdown-preview h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1.5rem; color: hsl(var(--primary)); }
        .markdown-preview h2 { font-size: 1.875rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: hsl(var(--primary)); }
        .markdown-preview p { margin-bottom: 1.25rem; line-height: 1.75; }
        .markdown-preview ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .markdown-preview strong { color: hsl(var(--primary)); font-weight: 700; }
        .markdown-preview blockquote { border-left: 4px solid hsl(var(--accent)); padding-left: 1rem; font-style: italic; color: hsl(var(--muted-foreground)); margin: 1.5rem 0; }
      `}</style>
    </div>
  );
}
