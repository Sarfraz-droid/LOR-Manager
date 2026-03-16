"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Calendar, FileText, GraduationCap, Link2, Loader2, PlusCircle } from "lucide-react";
import { SopEntry, UniversityApplication } from "@/lib/types";

interface NewSopDialogProps {
  onAdd: (s: SopEntry) => void | Promise<void>;
  initialApplication?: UniversityApplication | null;
  onInitialApplicationHandled?: () => void;
  autoOpenOnInitialApplication?: boolean;
  children?: ReactNode;
}

export function NewSopDialog({
  onAdd,
  initialApplication,
  onInitialApplicationHandled,
  autoOpenOnInitialApplication = true,
  children,
}: NewSopDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    college: "",
    program: "",
    deadline: "",
    applicationId: "",
    googleDocsLink: "",
  });

  useEffect(() => {
    if (!initialApplication) return;

    setFormData({
      college: initialApplication.university,
      program: initialApplication.program,
      deadline: initialApplication.deadline,
      applicationId: initialApplication.id,
      googleDocsLink: "",
    });
    if (autoOpenOnInitialApplication) {
      setOpen(true);
      onInitialApplicationHandled?.();
    }
  }, [autoOpenOnInitialApplication, initialApplication, onInitialApplicationHandled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onAdd({
        id: Math.random().toString(36).substr(2, 9),
        college: formData.college,
        program: formData.program,
        deadline: formData.deadline,
        applicationId: formData.applicationId || undefined,
        status: "Draft",
        content: "",
        googleDocsLink: formData.googleDocsLink.trim() || undefined,
      });
      setFormData({ college: "", program: "", deadline: "", applicationId: "", googleDocsLink: "" });
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="bg-primary text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> New SOP
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-primary">New Statement of Purpose</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="college" className="inline-flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              College / University
            </Label>
            <Input
              id="college"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="MIT"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="program" className="inline-flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
              Program
            </Label>
            <Input
              id="program"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              placeholder="MS in Computer Science"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline" className="inline-flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Application Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>
          <div className="rounded-md border border-dashed border-info/30 bg-info/5 px-3 py-2 text-xs text-muted-foreground">
            Optional: paste a Google Docs URL if you want to manage this SOP outside the editor.
          </div>
          <div className="grid gap-2">
            <Label htmlFor="google-docs-link" className="inline-flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              Google Docs Link (Optional)
            </Label>
            <Input
              id="google-docs-link"
              type="url"
              value={formData.googleDocsLink}
              onChange={(e) => setFormData({ ...formData, googleDocsLink: e.target.value })}
              placeholder="https://docs.google.com/document/d/..."
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent text-accent-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {!isSubmitting ? <FileText className="mr-2 h-4 w-4" /> : null}
              {isSubmitting ? "Saving..." : "Create SOP"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
