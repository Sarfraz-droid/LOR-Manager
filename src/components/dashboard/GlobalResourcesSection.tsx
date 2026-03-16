"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, FileUp, Link2, Loader2, PencilLine, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { extractUniqueTags, filterResourcesByQuery, filterResourcesByTags } from "@/lib/resourceSearch";
import { supabase } from "@/lib/supabase";
import type { ApplicationResource, UniversityApplication } from "@/lib/types";

interface GlobalResourcesSectionProps {
  applications: UniversityApplication[];
  resources: ApplicationResource[];
  addResource: (resource: Omit<ApplicationResource, "createdAt" | "updatedAt">) => Promise<boolean>;
  uploadResource: (input: {
    applicationId: string;
    title: string;
    tags: string[];
    file: File;
  }) => Promise<ApplicationResource | null>;
  updateResourceTags: (id: string, tags: string[]) => Promise<boolean>;
  deleteResource: (id: string) => Promise<boolean>;
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

export function GlobalResourcesSection({
  applications,
  resources,
  addResource,
  uploadResource,
  updateResourceTags,
  deleteResource,
}: GlobalResourcesSectionProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [applicationFilterId, setApplicationFilterId] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTagsInput, setLinkTagsInput] = useState("");
  const [linkApplicationId, setLinkApplicationId] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadTagsInput, setUploadTagsInput] = useState("");
  const [uploadApplicationId, setUploadApplicationId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingTagsForId, setEditingTagsForId] = useState<string | null>(null);
  const [editingTagsInput, setEditingTagsInput] = useState("");
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [isSubmittingTags, setIsSubmittingTags] = useState(false);
  const [openingResourceId, setOpeningResourceId] = useState<string | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  const uniqueTags = useMemo(() => extractUniqueTags(resources), [resources]);

  const visibleResources = useMemo(() => {
    const byApplication =
      applicationFilterId === "all"
        ? resources
        : resources.filter((resource) => resource.applicationId === applicationFilterId);
    const byQuery = filterResourcesByQuery(byApplication, query);
    return filterResourcesByTags(byQuery, selectedTags);
  }, [applicationFilterId, query, resources, selectedTags]);

  const getApplicationName = (applicationId: string) => {
    const application = applications.find((entry) => entry.id === applicationId);
    if (!application) return "Unknown application";
    return `${application.university} - ${application.program}`;
  };

  const handleAddLink = async () => {
    if (!linkApplicationId || !linkTitle.trim() || !linkUrl.trim()) return;

    try {
      setIsSubmittingLink(true);
      const success = await addResource({
        id: crypto.randomUUID(),
        applicationId: linkApplicationId,
        resourceType: "link",
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        tags: parseTags(linkTagsInput),
      });
      if (!success) throw new Error("Add link failed");

      setLinkApplicationId("");
      setLinkTitle("");
      setLinkUrl("");
      setLinkTagsInput("");
      setIsAddLinkOpen(false);
      toast({
        title: "Link added",
        description: "The resource link is now available in global resources.",
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
    if (!uploadApplicationId || !uploadTitle.trim() || !uploadFile) return;

    try {
      setIsSubmittingUpload(true);
      const created = await uploadResource({
        applicationId: uploadApplicationId,
        title: uploadTitle.trim(),
        tags: parseTags(uploadTagsInput),
        file: uploadFile,
      });
      if (!created) throw new Error("Upload failed");

      setUploadApplicationId("");
      setUploadTitle("");
      setUploadTagsInput("");
      setUploadFile(null);
      setIsUploadOpen(false);
      toast({
        title: "File uploaded",
        description: "The resource file is now available in global resources.",
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
      const success = await updateResourceTags(editingTagsForId, parseTags(editingTagsInput));
      if (!success) throw new Error("Tag update failed");

      setEditingTagsForId(null);
      setEditingTagsInput("");
      toast({
        title: "Tags updated",
        description: "Tag changes are now reflected in search results.",
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

  const handleDelete = async (id: string) => {
    try {
      setDeletingResourceId(id);
      const success = await deleteResource(id);
      if (!success) throw new Error("Delete failed");
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-2xl font-headline text-primary">Resources</CardTitle>
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
                    <Label htmlFor="global-link-application">Application</Label>
                    <Select value={linkApplicationId} onValueChange={setLinkApplicationId}>
                      <SelectTrigger id="global-link-application">
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications.map((application) => (
                          <SelectItem key={application.id} value={application.id}>
                            {application.university} - {application.program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="global-link-title">Title</Label>
                    <Input
                      id="global-link-title"
                      value={linkTitle}
                      onChange={(event) => setLinkTitle(event.target.value)}
                      placeholder="Example: Visa checklist"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="global-link-url">URL</Label>
                    <Input
                      id="global-link-url"
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="global-link-tags">Tags</Label>
                    <Input
                      id="global-link-tags"
                      value={linkTagsInput}
                      onChange={(event) => setLinkTagsInput(event.target.value)}
                      placeholder="admissions, scholarship"
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
                    <Label htmlFor="global-upload-application">Application</Label>
                    <Select value={uploadApplicationId} onValueChange={setUploadApplicationId}>
                      <SelectTrigger id="global-upload-application">
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications.map((application) => (
                          <SelectItem key={application.id} value={application.id}>
                            {application.university} - {application.program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="global-upload-title">Title</Label>
                    <Input
                      id="global-upload-title"
                      value={uploadTitle}
                      onChange={(event) => setUploadTitle(event.target.value)}
                      placeholder="Example: SOP draft v2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="global-upload-file">File</Label>
                    <Input
                      id="global-upload-file"
                      type="file"
                      onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="global-upload-tags">Tags</Label>
                    <Input
                      id="global-upload-tags"
                      value={uploadTagsInput}
                      onChange={(event) => setUploadTagsInput(event.target.value)}
                      placeholder="draft, final, transcript"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => void handleUpload()} disabled={isSubmittingUpload}>
                    {isSubmittingUpload ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, URL, filename, or tags"
          />
          <Select value={applicationFilterId} onValueChange={setApplicationFilterId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All applications</SelectItem>
              {applications.map((application) => (
                <SelectItem key={application.id} value={application.id}>
                  {application.university} - {application.program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {uniqueTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Button
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="h-7 rounded-full px-3"
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]
                    )
                  }
                >
                  {tag}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-accent/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground italic">
                    No resources found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                visibleResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">{resource.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {resource.resourceType === "link" ? resource.url : resource.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{getApplicationName(resource.applicationId)}</span>
                        <Link href={`/colleges/${resource.applicationId}`} className="text-xs text-primary hover:underline">
                          Open application
                        </Link>
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
                              <Label htmlFor="global-edit-tags">Tags</Label>
                              <Input
                                id="global-edit-tags"
                                value={editingTagsInput}
                                onChange={(event) => setEditingTagsInput(event.target.value)}
                                placeholder="funding, deadlines, docs"
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
