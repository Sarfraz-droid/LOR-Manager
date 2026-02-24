import jsPDF from "jspdf";

// App theme colors derived from globals.css CSS variables
const PRIMARY: [number, number, number] = [45, 73, 97];     // hsl(208, 36%, 28%)
const ACCENT: [number, number, number] = [212, 175, 53];    // hsl(46, 65%, 52%)
const FOREGROUND: [number, number, number] = [24, 39, 52];  // hsl(208, 36%, 15%)
const MUTED: [number, number, number] = [90, 116, 138];     // hsl(208, 20%, 45%)
const BORDER: [number, number, number] = [180, 193, 204];   // hsl(208, 20%, 85%)

interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

type BlockType = "h1" | "h2" | "h3" | "paragraph" | "list-item" | "blockquote" | "divider";

interface ContentBlock {
  type: BlockType;
  runs: TextRun[];
  indent: number;
  ordered: boolean;
  listIndex: number;
}

/** Shared y-position context passed between all rendering functions. */
interface YContext {
  y: number;
}

function getTextRuns(el: Element): TextRun[] {
  const runs: TextRun[] = [];
  const walkNode = (node: Node, bold: boolean, italic: boolean): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) runs.push({ text, bold, italic });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      const b = bold || tag === "strong" || tag === "b";
      const i = italic || tag === "em" || tag === "i";
      node.childNodes.forEach((child) => walkNode(child, b, i));
    }
  };
  el.childNodes.forEach((child) => walkNode(child, false, false));
  return runs;
}

/**
 * Walk an element's children, splitting into separate run arrays at each <br> element.
 * Returns one or more arrays of TextRun – one per visual line within the element.
 */
function getRunGroups(el: Element): TextRun[][] {
  const groups: TextRun[][] = [[]];
  const walkNode = (node: Node, bold: boolean, italic: boolean): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) groups[groups.length - 1].push({ text, bold, italic });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      if (tag === "br") {
        groups.push([]);
      } else {
        const b = bold || tag === "strong" || tag === "b";
        const i = italic || tag === "em" || tag === "i";
        node.childNodes.forEach((child) => walkNode(child, b, i));
      }
    }
  };
  el.childNodes.forEach((child) => walkNode(child, false, false));
  // A trailing <br> (e.g. TipTap's ProseMirror-trailingBreak in empty paragraphs)
  // creates a superfluous empty group at the end; remove it.
  if (groups.length > 1 && groups[groups.length - 1].length === 0) {
    groups.pop();
  }
  return groups;
}

function parseHtmlToBlocks(html: string): ContentBlock[] {
  const domDoc = new DOMParser().parseFromString(html, "text/html");
  const blocks: ContentBlock[] = [];

  const processNode = (el: Element, indent: number): void => {
    const tag = el.tagName.toLowerCase();
    if (tag === "h1") {
      blocks.push({ type: "h1", runs: getTextRuns(el), indent, ordered: false, listIndex: 0 });
    } else if (tag === "h2") {
      blocks.push({ type: "h2", runs: getTextRuns(el), indent, ordered: false, listIndex: 0 });
    } else if (tag === "h3") {
      blocks.push({ type: "h3", runs: getTextRuns(el), indent, ordered: false, listIndex: 0 });
    } else if (tag === "p") {
      // Split on <br> elements (Shift+Enter in TipTap) and preserve empty
      // paragraphs so that blank lines entered with Enter are kept in the PDF.
      const runGroups = getRunGroups(el);
      for (const runs of runGroups) {
        blocks.push({ type: "paragraph", runs, indent, ordered: false, listIndex: 0 });
      }
    } else if (tag === "blockquote") {
      blocks.push({ type: "blockquote", runs: getTextRuns(el), indent: indent + 8, ordered: false, listIndex: 0 });
    } else if (tag === "ul" || tag === "ol") {
      const ordered = tag === "ol";
      let idx = 1;
      Array.from(el.children).forEach((child) => {
        if (child.tagName.toLowerCase() === "li") {
          blocks.push({ type: "list-item", runs: getTextRuns(child), indent: indent + 8, ordered, listIndex: ordered ? idx++ : 0 });
        }
      });
    } else if (tag === "hr") {
      blocks.push({ type: "divider", runs: [], indent: 0, ordered: false, listIndex: 0 });
    } else {
      Array.from(el.children).forEach((child) => processNode(child, indent));
    }
  };

  Array.from(domDoc.body.children).forEach((child) => processNode(child, 0));
  return blocks;
}

function parsePlainTextToBlocks(text: string): ContentBlock[] {
  return text.split("\n").map((line) => ({
    type: "paragraph" as BlockType,
    runs: [{ text: line, bold: false, italic: false }],
    indent: 0,
    ordered: false,
    listIndex: 0,
  }));
}

/** Render inline text runs with mixed bold/italic formatting, advancing ctx.y for each line. */
function renderRuns(
  pdf: jsPDF,
  runs: TextRun[],
  x: number,
  ctx: YContext,
  maxW: number,
  fontSize: number,
  lineH: number,
  checkBreak: (n: number) => void
): void {
  const hasFormatting = runs.some((r) => r.bold || r.italic);

  if (!hasFormatting) {
    pdf.setFont("times", "normal");
    pdf.setFontSize(fontSize);
    const text = runs.map((r) => r.text).join("");
    const lines = pdf.splitTextToSize(text, maxW);
    for (const line of lines) {
      checkBreak(lineH);
      pdf.text(line, x, ctx.y);
      ctx.y += lineH;
    }
    return;
  }

  // Inline mixed formatting: tokenize into words with their style
  type Token = { word: string; bold: boolean; italic: boolean };
  const tokens: Token[] = [];
  for (const run of runs) {
    const parts = run.text.split(/(\s+)/);
    for (const part of parts) {
      if (part.trim()) {
        tokens.push({ word: part, bold: run.bold, italic: run.italic });
      } else if (part && tokens.length > 0) {
        tokens[tokens.length - 1].word += part;
      }
    }
  }

  let lineTokens: Token[] = [];
  let lineW = 0;

  const flushLine = (): void => {
    if (lineTokens.length === 0) return;
    checkBreak(lineH);
    let tx = x;
    for (const tok of lineTokens) {
      const style = tok.bold && tok.italic ? "bolditalic" : tok.bold ? "bold" : tok.italic ? "italic" : "normal";
      pdf.setFont("times", style);
      pdf.setFontSize(fontSize);
      pdf.text(tok.word, tx, ctx.y);
      tx += pdf.getTextWidth(tok.word);
    }
    ctx.y += lineH;
    lineTokens = [];
    lineW = 0;
  };

  for (const token of tokens) {
    const style = token.bold && token.italic ? "bolditalic" : token.bold ? "bold" : token.italic ? "italic" : "normal";
    pdf.setFont("times", style);
    pdf.setFontSize(fontSize);
    const tw = pdf.getTextWidth(token.word);
    if (lineW + tw > maxW && lineW > 0) {
      flushLine();
    }
    lineTokens.push(token);
    lineW += tw;
  }
  flushLine();

  pdf.setFont("times", "normal");
}

/**
 * Generate and download a styled PDF file from HTML or plain text content.
 * Applies the app's serif font (Times) and theme colors (primary, accent, foreground).
 * Handles headings, paragraphs, bold/italic, lists, blockquotes, and multi-page documents.
 */
export function downloadAsPdf(content: string, filename: string): void {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const mLeft = 25;
  const mRight = 25;
  const mTop = 25;
  const mBottom = 25;
  const contentW = pageW - mLeft - mRight;

  // Shared mutable y-position context so page breaks stay in sync across helpers
  const ctx: YContext = { y: mTop };

  const checkBreak = (needed: number): void => {
    if (ctx.y + needed > pageH - mBottom) {
      pdf.addPage();
      ctx.y = mTop;
    }
  };

  const isHtml = /<(p|h[1-6]|ul|ol|li|blockquote|br)\b/i.test(content);
  const blocks = isHtml ? parseHtmlToBlocks(content) : parsePlainTextToBlocks(content);

  for (const block of blocks) {
    const x = mLeft + block.indent;
    const w = contentW - block.indent;

    if (block.type === "h1") {
      ctx.y += 4;
      checkBreak(18);
      pdf.setFont("times", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(...PRIMARY);
      const text = block.runs.map((r) => r.text).join("");
      const lines = pdf.splitTextToSize(text, w);
      for (const line of lines) {
        checkBreak(10);
        pdf.text(line, x, ctx.y);
        ctx.y += 10;
      }
      // Accent underline beneath the first line
      pdf.setFont("times", "bold");
      pdf.setFontSize(20);
      const underlineW = Math.min(pdf.getTextWidth(lines[0] ?? ""), w);
      pdf.setDrawColor(...ACCENT);
      pdf.setLineWidth(0.5);
      pdf.line(x, ctx.y - 2, x + underlineW, ctx.y - 2);
      ctx.y += 4;
    } else if (block.type === "h2") {
      ctx.y += 4;
      checkBreak(12);
      pdf.setFont("times", "bold");
      pdf.setFontSize(15);
      pdf.setTextColor(...PRIMARY);
      const text = block.runs.map((r) => r.text).join("");
      const lines = pdf.splitTextToSize(text, w);
      for (const line of lines) {
        checkBreak(9);
        pdf.text(line, x, ctx.y);
        ctx.y += 9;
      }
      ctx.y += 2;
    } else if (block.type === "h3") {
      ctx.y += 3;
      checkBreak(10);
      pdf.setFont("times", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(...PRIMARY);
      const text = block.runs.map((r) => r.text).join("");
      const lines = pdf.splitTextToSize(text, w);
      for (const line of lines) {
        checkBreak(8);
        pdf.text(line, x, ctx.y);
        ctx.y += 8;
      }
      ctx.y += 2;
    } else if (block.type === "paragraph") {
      pdf.setTextColor(...FOREGROUND);
      renderRuns(pdf, block.runs, x, ctx, w, 11, 7, checkBreak);
      ctx.y += 2;
    } else if (block.type === "blockquote") {
      const startY = ctx.y;
      pdf.setFont("times", "italic");
      pdf.setFontSize(11);
      pdf.setTextColor(...MUTED);
      const text = block.runs.map((r) => r.text).join("");
      const lines = pdf.splitTextToSize(text, w - 5);
      for (const line of lines) {
        checkBreak(7);
        pdf.text(line, x + 5, ctx.y);
        ctx.y += 7;
      }
      pdf.setDrawColor(...ACCENT);
      pdf.setLineWidth(1);
      pdf.line(x, startY - 3, x, ctx.y - 2);
      ctx.y += 4;
    } else if (block.type === "list-item") {
      const bullet = block.ordered ? `${block.listIndex}.` : "\u2022";
      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...FOREGROUND);
      const bulletW = pdf.getTextWidth(bullet + "  ");
      const text = block.runs.map((r) => r.text).join("");
      const lines = pdf.splitTextToSize(text, w - bulletW);
      checkBreak(7);
      pdf.text(bullet, x, ctx.y);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) checkBreak(7);
        pdf.text(lines[i], x + bulletW, ctx.y);
        ctx.y += 7;
      }
    } else if (block.type === "divider") {
      ctx.y += 4;
      pdf.setDrawColor(...BORDER);
      pdf.setLineWidth(0.3);
      pdf.line(mLeft, ctx.y, pageW - mRight, ctx.y);
      ctx.y += 8;
    }
  }

  pdf.save(filename);
}
