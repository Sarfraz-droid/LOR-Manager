"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { SopEntry } from "@/lib/types";

export function NewSopDialog({ onAdd }: { onAdd: (s: SopEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    college: "",
    program: "",
    deadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      college: formData.college,
      program: formData.program,
      deadline: formData.deadline,
      status: "Draft",
      content: "",
    });
    setFormData({ college: "", program: "", deadline: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> New SOP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">New Statement of Purpose</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="college">College / University</Label>
            <Input
              id="college"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="MIT"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              placeholder="MS in Computer Science"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent text-accent-foreground">
              Create SOP
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
