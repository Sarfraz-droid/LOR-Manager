"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { UniversityApplication } from "@/lib/types";

type ApplicationFormData = {
  university: string;
  program: string;
  deadline: string;
  description: string;
  relevantLinks: string;
};

type NewApplicationDialogProps = {
  mode?: "create" | "edit";
  initialApplication?: UniversityApplication;
  onAdd?: (a: UniversityApplication) => void | Promise<void | boolean> | boolean;
  onUpdate?: (
    id: string,
    updates: Pick<UniversityApplication, "university" | "program" | "deadline" | "description" | "relevantLinks">
  ) => void | Promise<void | boolean> | boolean;
  children?: ReactNode;
};

const EMPTY_FORM: ApplicationFormData = {
  university: "",
  program: "",
  deadline: "",
  description: "",
  relevantLinks: "",
};

function toFormData(application?: UniversityApplication): ApplicationFormData {
  if (!application) return EMPTY_FORM;
  return {
    university: application.university,
    program: application.program,
    deadline: application.deadline,
    description: application.description,
    relevantLinks: application.relevantLinks.join("\n"),
  };
}

function parseLinks(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((link) => link.trim())
    .filter((link) => link.length > 0);
}

export function NewApplicationDialog({
  mode = "create",
  initialApplication,
  onAdd,
  onUpdate,
  children,
}: NewApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>(toFormData(initialApplication));
  const isEditMode = mode === "edit";

  const dialogTitle = useMemo(
    () => (isEditMode ? "Edit College Shortlist" : "Add College Shortlist"),
    [isEditMode]
  );

  useEffect(() => {
    if (!open) return;
    setFormData(toFormData(initialApplication));
  }, [open, initialApplication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const nextValues = {
        university: formData.university,
        program: formData.program,
        deadline: formData.deadline,
        description: formData.description,
        relevantLinks: parseLinks(formData.relevantLinks),
      };

      if (isEditMode) {
        if (!initialApplication || !onUpdate) return;
        await onUpdate(initialApplication.id, nextValues);
      } else {
        if (!onAdd) return;
        await onAdd({
          id: crypto.randomUUID(),
          ...nextValues,
        });
      }

      if (!isEditMode) {
        setFormData(EMPTY_FORM);
      }
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <PlusCircle className="mr-2 h-4 w-4" /> Add College Shortlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="univ">University/Organization</Label>
            <Input id="univ" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} placeholder="Yale University" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prog">Program/Position</Label>
            <Input id="prog" value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})} placeholder="PhD in Comparative Literature" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Overall Application Deadline</Label>
            <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Notes/Description</Label>
            <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Mention research in late-medieval poetry." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="links">Relevant Links (comma or new line separated)</Label>
            <Textarea
              id="links"
              value={formData.relevantLinks}
              onChange={(e) => setFormData({ ...formData, relevantLinks: e.target.value })}
              placeholder="https://department.example.edu&#10;https://faculty.example.edu/lab"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : isEditMode ? "Update Shortlist" : "Save Shortlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
