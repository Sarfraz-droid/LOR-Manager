"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import { Professor, UniversityApplication, LoRRequest } from "@/lib/types";

interface NewRequestDialogProps {
  professors: Professor[];
  applications: UniversityApplication[];
  onAdd: (req: LoRRequest) => void | Promise<void>;
  initialApplicationId?: string | null;
  onInitialApplicationHandled?: () => void;
  autoOpenOnInitialApplication?: boolean;
  children?: ReactNode;
}

export function NewRequestDialog({
  professors,
  applications,
  onAdd,
  initialApplicationId,
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
      });
      setFormData({ professorId: "", applicationId: "", deadline: "" });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Request New Letter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
              <Label htmlFor="professor-select">Professor</Label>
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
          <div className="grid gap-2">
            <Label>Link College Shortlist</Label>
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
          <div className="grid gap-2">
            <Label htmlFor="deadline">Submission Deadline</Label>
            <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
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
