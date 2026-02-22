"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoRRequest, Professor, UniversityApplication } from "@/lib/types";
import { ArrowLeft, Save, Download, Sparkles, Loader2, FileText } from "lucide-react";
import { generateLoRDraft } from "@/ai/flows/generate-lor-draft";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

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

  const handleDownload = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: content.split('\n').map(line => new Paragraph({
          children: [new TextRun(line)],
        })),
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `LoR_${application?.university}_${professor?.name}.docx`);
  };

  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const result = await generateLoRDraft({
        professorName: professor?.name || "Dr. [Name]",
        professorExpertise: professor?.expertise || "[Expertise]",
        studentName: "[Student Name]", // This would ideally come from user profile
        studentHistory: "The student has been a top performer in courses and shown great research aptitude.",
        university: application?.university || "[University]",
        program: application?.program || "[Program]",
      });
      setContent(result.draft);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-300">
      {/* Notion-style Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-primary leading-tight">
              Letter for {application?.university}
            </h2>
            <span className="text-xs text-muted-foreground">
              Drafting as {professor?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAIDraft} 
            disabled={isDrafting}
            className="border-accent text-accent hover:bg-accent hover:text-white"
          >
            {isDrafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Draft
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onSave(content)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} className="bg-primary">
            <Download className="h-4 w-4 mr-2" />
            Export .docx
          </Button>
        </div>
      </header>

      {/* Main Editing Area */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="max-w-3xl mx-auto py-12 px-6">
          <Card className="border-none shadow-xl bg-white min-h-[800px] flex flex-col">
            <CardContent className="p-12 md:p-20 flex-1 flex flex-col">
              <div className="mb-8 flex items-center gap-3 text-muted-foreground border-b pb-4">
                <FileText className="h-8 w-8 text-accent" />
                <div>
                  <h1 className="text-3xl font-headline font-bold text-primary">Recommendation Letter</h1>
                  <p className="text-sm">Created for {application?.program}</p>
                </div>
              </div>
              
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your letter here..."
                className="flex-1 border-none focus-visible:ring-0 text-lg leading-relaxed font-literata resize-none p-0 bg-transparent min-h-[500px]"
              />
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-8 italic">
            Tip: Use the AI Draft button to generate a structured starting point based on your expertise and the student's profile.
          </p>
        </div>
      </main>
    </div>
  );
}
