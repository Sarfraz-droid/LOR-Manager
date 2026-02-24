"use client";

import { useEffect, useRef } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { Download, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadAsPdf } from "@/lib/downloadUtils";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";

interface LorShareViewProps {
  content: string;
  professorName: string;
  university: string;
  program: string;
}

/** Strip HTML tags to extract plain text for DOCX export */
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
    .replace(/&(?:amp|lt|gt|nbsp|quot|#39);/g, (m) =>
      ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&quot;": '"', "&#39;": "'" }[m] ?? m)
    )
    .trim();
}

export function LorShareView({ content, professorName, university, program }: LorShareViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sanitize and inject HTML content safely via the DOM after mount
  useEffect(() => {
    if (contentRef.current && isHtml) {
      contentRef.current.innerHTML = DOMPurify.sanitize(content);
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const isHtml = /<(p|h[1-6]|ul|ol|li|blockquote|br)\b/i.test(content);

  const handleDownloadPdf = () => {
    downloadAsPdf(content, `LoR_${university}_${professorName}.pdf`);
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
    saveAs(blob, `LoR_${university}_${professorName}.docx`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary leading-tight">Letter of Recommendation</h1>
              <p className="text-sm text-muted-foreground">
                {university} &mdash; {program}
              </p>
              <p className="text-xs text-muted-foreground">Authored by {professorName}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
                <ChevronDown className="h-3 w-3" />
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

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-muted/20 min-h-[60vh]">
          {content ? (
            isHtml ? (
              <div
                ref={contentRef}
                className="prose prose-slate max-w-none text-foreground"
              />
            ) : (
              <div className="prose prose-slate max-w-none text-foreground">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )
          ) : (
            <p className="text-muted-foreground italic text-center py-12">
              This letter has no content yet.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This letter was shared via LoR Tracker Pro. Use the button above to download it as a PDF or Word document.
        </p>
      </div>
    </div>
  );
}
