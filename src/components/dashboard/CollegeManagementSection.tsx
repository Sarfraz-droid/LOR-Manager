"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NewApplicationDialog } from "@/components/dashboard/NewApplicationDialog";
import { NewRequestDialog } from "@/components/dashboard/NewRequestDialog";
import { NewSopDialog } from "@/components/dashboard/NewSopDialog";
import { CollegeDashboardDialog } from "@/components/dashboard/CollegeDashboardDialog";
import { useToast } from "@/hooks/use-toast";
import type { LoRRequest, Professor, SopEntry, UniversityApplication } from "@/lib/types";
import { LayoutTemplate, Share2 } from "lucide-react";

interface CollegeManagementSectionProps {
  applications: UniversityApplication[];
  requests: LoRRequest[];
  sops: SopEntry[];
  professors: Professor[];
  addApplication: (application: UniversityApplication) => void | Promise<void>;
  addRequest: (request: LoRRequest) => void | Promise<void>;
  addSop: (sop: SopEntry) => void | Promise<void>;
  deleteApplication: (applicationId: string) => void | Promise<void>;
  removeSopsForApplication: (applicationId: string) => void;
  generateApplicationShareToken: (applicationId: string) => Promise<string | null>;
  onOpenSop: (sop: SopEntry) => void;
  onOpenLor: (request: LoRRequest) => void;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function CollegeManagementSection({
  applications,
  requests,
  sops,
  professors,
  addApplication,
  addRequest,
  addSop,
  deleteApplication,
  removeSopsForApplication,
  generateApplicationShareToken,
  onOpenSop,
  onOpenLor,
  title = "College Shortlists",
  description = "Open each college dashboard to review the shortlist, its connected SOPs, connected LORs, and its public share link.",
  emptyMessage = "No college shortlists tracked yet.",
}: CollegeManagementSectionProps) {
  const { toast } = useToast();
  const [shortlistForRequest, setShortlistForRequest] = useState<string | null>(null);
  const [shortlistForSop, setShortlistForSop] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  const shortlistedApplicationForSop = useMemo(
    () => applications.find((application) => application.id === shortlistForSop) ?? null,
    [applications, shortlistForSop]
  );
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId]
  );
  const connectedSops = useMemo(() => {
    if (!selectedApplication) return [];
    return sops.filter((sop) =>
      sop.applicationId === selectedApplication.id ||
      (!sop.applicationId &&
        sop.college === selectedApplication.university &&
        sop.program === selectedApplication.program)
    );
  }, [selectedApplication, sops]);
  const connectedRequests = useMemo(() => {
    if (!selectedApplication) return [];
    return requests.filter((request) => request.applicationId === selectedApplication.id);
  }, [selectedApplication, requests]);

  const handleShareShortlist = async (applicationId: string) => {
    const token = await generateApplicationShareToken(applicationId);
    if (!token) {
      toast({
        title: "Unable to share shortlist",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    try {
      await navigator.clipboard.writeText(`${baseUrl}/shortlist/${token}`);
      toast({
        title: "Public link copied",
        description: "The college shortlist link is ready to share.",
      });
    } catch {
      toast({
        title: "Share link created",
        description: `${baseUrl}/shortlist/${token}`,
      });
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    await deleteApplication(applicationId);
    removeSopsForApplication(applicationId);
    if (selectedApplicationId === applicationId) {
      setSelectedApplicationId(null);
    }
  };

  return (
    <>
      <CollegeDashboardDialog
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) setSelectedApplicationId(null);
        }}
        application={selectedApplication}
        sops={connectedSops}
        requests={connectedRequests}
        professors={professors}
        onCreateSop={() => {
          if (!selectedApplication) return;
          setSelectedApplicationId(null);
          setShortlistForSop(selectedApplication.id);
        }}
        onCreateLor={() => {
          if (!selectedApplication) return;
          setSelectedApplicationId(null);
          setShortlistForRequest(selectedApplication.id);
        }}
        onOpenSop={onOpenSop}
        onOpenLor={onOpenLor}
        onShare={() => {
          if (selectedApplication) {
            void handleShareShortlist(selectedApplication.id);
          }
        }}
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center gap-3">
          <div>
            <h3 className="text-2xl font-headline font-bold text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground font-literata">{description}</p>
          </div>
          <div className="flex gap-2">
            <NewRequestDialog
              professors={professors}
              applications={applications}
              onAdd={addRequest}
              initialApplicationId={shortlistForRequest}
              onInitialApplicationHandled={() => setShortlistForRequest(null)}
            />
            <NewSopDialog
              onAdd={addSop}
              initialApplication={shortlistedApplicationForSop}
              onInitialApplicationHandled={() => setShortlistForSop(null)}
            />
            <NewApplicationDialog onAdd={addApplication} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => (
            <Card key={app.id} className="group overflow-hidden border-accent/20">
              <div className="h-2 bg-accent/20 w-full" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-primary">{app.university}</CardTitle>
                    <CardDescription className="text-accent font-bold">{app.program}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-accent text-accent">
                    {app.deadline}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="font-literata text-sm text-muted-foreground italic">
                {app.description || "No specific notes provided."}
              </CardContent>
              <CardFooter className="bg-muted/20 py-3 flex flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() => setSelectedApplicationId(app.id)}
                  >
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    Open Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setShortlistForSop(app.id)}
                  >
                    Add SOP
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setShortlistForRequest(app.id)}
                  >
                    Add LOR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => void handleShareShortlist(app.id)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                <button
                  onClick={() => void handleDeleteApplication(app.id)}
                  className="text-xs text-destructive hover:underline font-bold"
                >
                  Remove Shortlist
                </button>
              </CardFooter>
            </Card>
          ))}
          {applications.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
