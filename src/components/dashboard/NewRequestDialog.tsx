"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, GraduationCap, Link2, Loader2, PlusCircle, User } from "lucide-react";
import { Professor, UniversityApplication, LoRRequest } from "@/lib/types";

interface NewRequestDialogProps {
  professors: Professor[];
  applications: UniversityApplication[];
  onAdd: (req: LoRRequest) => void | Promise<void>;
  initialApplicationId?: string | null;
  lockApplicationSelection?: boolean;
  onInitialApplicationHandled?: () => void;
  autoOpenOnInitialApplication?: boolean;
  children?: ReactNode;
}

export function NewRequestDialog({
  professors,
  applications,
  onAdd,
  initialApplicationId,
  lockApplicationSelection = false,
  onInitialApplicationHandled,
  autoOpenOnInitialApplication = true,
  children,
}: NewRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    professorId: "",
    applicationId: "",
    deadline: "",
    googleDocsLink: "",
  });

  useEffect(() => {
    if (!initialApplicationId) return;

    const application = applications.find((entry) => entry.id === initialApplicationId);
    if (!application) return;

    setFormData((current) => ({
      ...current,
      applicationId: application.id,
      deadline: application.deadline,
    }));
    if (autoOpenOnInitialApplication) {
      setOpen(true);
      onInitialApplicationHandled?.();
    }
  }, [applications, autoOpenOnInitialApplication, initialApplicationId, onInitialApplicationHandled]);

  const lockedApplication = lockApplicationSelection && initialApplicationId
    ? applications.find((entry) => entry.id === initialApplicationId) ?? null
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professorId || !formData.applicationId || !formData.deadline) return;

    try {
      setIsSubmitting(true);
      await onAdd({
        id: Math.random().toString(36).substr(2, 9),
        professorId: formData.professorId,
        applicationId: formData.applicationId,
        status: "Requested",
        deadline: formData.deadline,
        reminderSent: false,
        googleDocsLink: formData.googleDocsLink.trim() || undefined,
      });
      setFormData({ professorId: "", applicationId: "", deadline: "", googleDocsLink: "" });
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Log New Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Request New Letter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
              <Label htmlFor="professor-select" className="inline-flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Professor
              </Label>
              <Select
                value={formData.professorId}
                onValueChange={(val) => setFormData({ ...formData, professorId: val })}
                required
              >
                <SelectTrigger id="professor-select">
                  <SelectValue placeholder="Choose a professor" />
                </SelectTrigger>
                <SelectContent>
                  {professors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>{professor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
          {lockedApplication ? (
            <div className="grid gap-2">
              <Label className="inline-flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                College Shortlist
              </Label>
              <Input
                value={`${lockedApplication.university} - ${lockedApplication.program}`}
                readOnly
                disabled
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label className="inline-flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                Link College Shortlist
              </Label>
              <Select
                value={formData.applicationId}
                onValueChange={(val) => {
                  const application = applications.find((entry) => entry.id === val);
                  setFormData({
                    ...formData,
                    applicationId: val,
                    deadline: application?.deadline ?? formData.deadline,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a shortlist" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.university} - {a.program}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="deadline" className="inline-flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Submission Deadline
            </Label>
            <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
          </div>
          <div className="rounded-md border border-dashed border-info/30 bg-info/5 px-3 py-2 text-xs text-muted-foreground">
            Optional: attach a Google Docs link if your recommender is drafting outside this app.
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
            <Button type="submit" className="bg-primary text-primary-foreground w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : "Track Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
