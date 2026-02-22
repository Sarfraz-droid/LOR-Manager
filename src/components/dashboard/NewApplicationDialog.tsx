"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { UniversityApplication } from "@/lib/types";

export function NewApplicationDialog({ onAdd }: { onAdd: (a: UniversityApplication) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    university: "",
    program: "",
    deadline: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      university: formData.university,
      program: formData.program,
      deadline: formData.deadline,
      description: formData.description,
    });
    setFormData({ university: "", program: "", deadline: "", description: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Application Target</DialogTitle>
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
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}