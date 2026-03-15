"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { ArrowLeft, Download, FileText, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadAsPdf } from "@/lib/downloadUtils";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";

interface LorPreviewViewProps {
  content: string;
  professorName: string;
  university: string;
  program: string;
  deadline: string;
  status: string;
  backUrl: string;
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

export function LorPreviewView({
  content,
  professorName,
  university,
  program,
  deadline,
  status,
  backUrl,
}: LorPreviewViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exportingFormat, setExportingFormat] = useState<"pdf" | "docx" | null>(null);
  const isHtml = /<(p|h[1-6]|ul|ol|li|blockquote|br)\b/i.test(content);

  useEffect(() => {
    if (contentRef.current && isHtml) {
      contentRef.current.innerHTML = DOMPurify.sanitize(content);
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadPdf = async () => {
    setExportingFormat("pdf");
    try {
      downloadAsPdf(content, `LoR_${university}_${professorName}.pdf`);
      await Promise.resolve();
    } finally {
      setExportingFormat(null);
    }
  };

  const handleDownloadDocx = async () => {
    setExportingFormat("docx");
    const plainText = stripHtml(content);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: plainText.split("\n").map((line) =>
              line.trim()
                ? new Paragraph({ children: [new TextRun(line)] })
                : new Paragraph({ children: [] })
            ),
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `LoR_${university}_${professorName}.docx`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shortlist
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary leading-tight">
                Letter of Recommendation
              </h1>
              <p className="text-sm text-muted-foreground">
                {university} &mdash; {program}
              </p>
              <p className="text-xs text-muted-foreground">
                Authored by {professorName}
              </p>
              {deadline && (
                <p className="text-xs text-muted-foreground">
                  Deadline:{" "}
                  {new Date(deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant={
                status === "Submitted"
                  ? "default"
                  : status === "In Progress"
                  ? "secondary"
                  : "outline"
              }
            >
              {status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2" disabled={exportingFormat !== null}>
                  {exportingFormat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {exportingFormat === "pdf" ? "Preparing PDF..." : exportingFormat === "docx" ? "Preparing DOCX..." : "Download"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void handleDownloadPdf()} disabled={exportingFormat !== null}>
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleDownloadDocx()} disabled={exportingFormat !== null}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download as DOCX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card/95 rounded-xl shadow-lg p-8 md:p-12 border border-border/70 min-h-[60vh]">
          {content ? (
            isHtml ? (
              <div
                ref={contentRef}
                className="prose max-w-none text-foreground prose-headings:text-primary prose-strong:text-primary"
              />
            ) : (
              <div className="prose max-w-none text-foreground prose-headings:text-primary prose-strong:text-primary">
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
          This letter was shared via LoR Tracker Pro. Use the button above to
          download it as a PDF or Word document.
        </p>
      </div>
    </div>
  );
}
