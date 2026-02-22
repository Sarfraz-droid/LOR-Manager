"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { Professor } from "@/lib/types";

export function NewProfessorDialog({ onAdd }: { onAdd: (p: Professor) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    expertise: "",
    courses: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      expertise: formData.expertise,
      courses: formData.courses.split(",").map(c => c.trim()).filter(c => c !== ""),
    });
    setFormData({ name: "", email: "", expertise: "", courses: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Professor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">New Professor Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Dr. Jane Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="j.doe@univ.edu" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expertise">Primary Expertise</Label>
            <Input id="expertise" value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})} placeholder="Organic Chemistry" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="courses">Courses Taught (comma separated)</Label>
            <Input id="courses" value={formData.courses} onChange={(e) => setFormData({...formData, courses: e.target.value})} placeholder="CHM101, CHM405" />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent text-accent-foreground">Save Profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}