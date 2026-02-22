"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { Professor, UniversityApplication, LoRRequest } from "@/lib/types";

interface NewRequestDialogProps {
  professors: Professor[];
  applications: UniversityApplication[];
  onAdd: (req: LoRRequest) => void;
}

export function NewRequestDialog({ professors, applications, onAdd }: NewRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    professorId: "",
    applicationId: "",
    deadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professorId || !formData.applicationId || !formData.deadline) return;

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      professorId: formData.professorId,
      applicationId: formData.applicationId,
      status: "Requested",
      deadline: formData.deadline,
      reminderSent: false,
    });
    setFormData({ professorId: "", applicationId: "", deadline: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Log New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Request New Letter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select Professor</Label>
            <Select onValueChange={(val) => setFormData({...formData, professorId: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a professor" />
              </SelectTrigger>
              <SelectContent>
                {professors.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Link Application</Label>
            <Select onValueChange={(val) => setFormData({...formData, applicationId: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an application" />
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
            <Button type="submit" className="bg-primary text-primary-foreground w-full">Track Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}