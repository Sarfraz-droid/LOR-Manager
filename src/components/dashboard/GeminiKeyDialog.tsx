"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Eye, EyeOff, CheckCircle2, Trash2 } from "lucide-react";

interface GeminiKeyDialogProps {
  geminiKey: string;
  onSave: (key: string) => void;
}

export function GeminiKeyDialog({ geminiKey, onSave }: GeminiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(geminiKey);
  const [showKey, setShowKey] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setInputValue(geminiKey);
    setOpen(isOpen);
    setShowKey(false);
  };

  const handleSave = () => {
    onSave(inputValue.trim());
    setOpen(false);
  };

  const handleRemove = () => {
    setInputValue("");
    onSave("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 px-3 py-2"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Settings</span>
          {geminiKey && (
            <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-green-400" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to use AI features. Your key is stored
            locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-key"
                  type={showKey ? "text" : "password"}
                  placeholder="AIza..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your free API key at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline hover:no-underline"
              >
                Google AI Studio
              </a>
              . Your key is stored in your browser&apos;s local storage and is
              only used to call the Gemini API directly from the server.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          {geminiKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remove Key
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!inputValue.trim()}>
              Save Key
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
