"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, FileUp, Link2, Loader2, PencilLine, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { filterResourcesByQuery } from "@/lib/resourceSearch";
import { supabase } from "@/lib/supabase";
import type { ApplicationResource } from "@/lib/types";

interface ApplicationResourcesSectionProps {
  resources: ApplicationResource[];
  onAddLink: (data: { title: string; url: string; tags: string[] }) => Promise<void>;
  onUploadFile: (data: { title: string; file: File; tags: string[] }) => Promise<void>;
  onUpdateTags: (resourceId: string, tags: string[]) => Promise<void>;
  onDelete: (resourceId: string) => Promise<void>;
}

function parseTags(rawValue: string) {
  return Array.from(
    new Set(
      rawValue
        .split(/[\n,]/g)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

export function ApplicationResourcesSection({
  resources,
  onAddLink,
  onUploadFile,
  onUpdateTags,
  onDelete,
}: ApplicationResourcesSectionProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingTagsForId, setEditingTagsForId] = useState<string | null>(null);
  const [editingTagsInput, setEditingTagsInput] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTagsInput, setLinkTagsInput] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadTagsInput, setUploadTagsInput] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [openingResourceId, setOpeningResourceId] = useState<string | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [isSubmittingTags, setIsSubmittingTags] = useState(false);

  const visibleResources = useMemo(
    () => filterResourcesByQuery(resources, query),
    [query, resources]
  );

  const handleAddLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    try {
      setIsSubmittingLink(true);
      await onAddLink({
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        tags: parseTags(linkTagsInput),
      });
      setLinkTitle("");
      setLinkUrl("");
      setLinkTagsInput("");
      setIsAddLinkOpen(false);
      toast({
        title: "Link added",
        description: "The resource link is now attached to this application.",
      });
    } catch {
      toast({
        title: "Unable to add link",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim() || !uploadFile) return;

    try {
      setIsSubmittingUpload(true);
      await onUploadFile({
        title: uploadTitle.trim(),
        file: uploadFile,
        tags: parseTags(uploadTagsInput),
      });
      setUploadTitle("");
      setUploadFile(null);
      setUploadTagsInput("");
      setIsUploadOpen(false);
      toast({
        title: "File uploaded",
        description: "The file is now attached to this application.",
      });
    } catch {
      toast({
        title: "Unable to upload file",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const handleSaveTags = async () => {
    if (!editingTagsForId) return;

    try {
      setIsSubmittingTags(true);
      await onUpdateTags(editingTagsForId, parseTags(editingTagsInput));
      setEditingTagsForId(null);
      setEditingTagsInput("");
      toast({
        title: "Tags updated",
        description: "Your tags have been updated for this resource.",
      });
    } catch {
      toast({
        title: "Unable to update tags",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTags(false);
    }
  };

  const handleOpenUpload = async (resource: ApplicationResource) => {
    if (!resource.storagePath) return;

    try {
      setOpeningResourceId(resource.id);
      const { data, error } = await supabase.storage
        .from("application-resources")
        .createSignedUrl(resource.storagePath, 60);

      if (error || !data?.signedUrl) {
        toast({
          title: "Unable to open file",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningResourceId(null);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      setDeletingResourceId(resourceId);
      await onDelete(resourceId);
    } catch {
      toast({
        title: "Unable to delete resource",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setDeletingResourceId(null);
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Resources</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Dialog open={isAddLinkOpen} onOpenChange={setIsAddLinkOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                  <Link2 className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add resource link</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="resource-link-title">Title</Label>
                    <Input
                      id="resource-link-title"
                      value={linkTitle}
                      onChange={(event) => setLinkTitle(event.target.value)}
                      placeholder="Example: Program requirements page"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resource-link-url">URL</Label>
                    <Input
                      id="resource-link-url"
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resource-link-tags">Tags</Label>
                    <Input
                      id="resource-link-tags"
                      value={linkTagsInput}
                      onChange={(event) => setLinkTagsInput(event.target.value)}
                      placeholder="admissions, deadline, visa"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => void handleAddLink()} disabled={isSubmittingLink}>
                    {isSubmittingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Save Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload resource file</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="resource-upload-title">Title</Label>
                    <Input
                      id="resource-upload-title"
                      value={uploadTitle}
                      onChange={(event) => setUploadTitle(event.target.value)}
                      placeholder="Example: CV - final"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resource-upload-file">File</Label>
                    <Input
                      id="resource-upload-file"
                      type="file"
                      onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resource-upload-tags">Tags</Label>
                    <Input
                      id="resource-upload-tags"
                      value={uploadTagsInput}
                      onChange={(event) => setUploadTagsInput(event.target.value)}
                      placeholder="transcript, recommendation, portfolio"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => void handleUpload()} disabled={isSubmittingUpload}>
                    {isSubmittingUpload ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search resources by title, URL, filename, or tag"
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-accent/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground italic">
                    No resources found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">{resource.title}</span>
                        {resource.resourceType === "link" ? (
                          <span className="text-xs text-muted-foreground line-clamp-1">{resource.url}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground line-clamp-1">{resource.filename}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={resource.resourceType === "link" ? "outline" : "secondary"}>
                        {resource.resourceType === "link" ? "Link" : "Upload"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No tags</span>
                        ) : (
                          resource.tags.map((tag) => (
                            <Badge key={`${resource.id}-${tag}`} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {resource.resourceType === "link" && resource.url ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={resource.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleOpenUpload(resource)}
                            disabled={openingResourceId === resource.id}
                          >
                            {openingResourceId === resource.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ExternalLink className="mr-2 h-4 w-4" />
                            )}
                            Open
                          </Button>
                        )}
                        <Dialog
                          open={editingTagsForId === resource.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingTagsForId(null);
                              setEditingTagsInput("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingTagsForId(resource.id);
                                setEditingTagsInput(resource.tags.join(", "));
                              }}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit tags</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2 py-2">
                              <Label htmlFor="resource-edit-tags">Tags</Label>
                              <Input
                                id="resource-edit-tags"
                                value={editingTagsInput}
                                onChange={(event) => setEditingTagsInput(event.target.value)}
                                placeholder="funding, transcript, visa"
                              />
                            </div>
                            <DialogFooter>
                              <Button onClick={() => void handleSaveTags()} disabled={isSubmittingTags}>
                                {isSubmittingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save tags
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => void handleDelete(resource.id)}
                          disabled={deletingResourceId === resource.id}
                          aria-label="Delete resource"
                        >
                          {deletingResourceId === resource.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
