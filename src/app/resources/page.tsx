"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GlobalResourcesSection } from "@/components/dashboard/GlobalResourcesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useLoRStore } from "@/lib/store";

export default function ResourcesPage() {
  const {
    user,
    authLoading,
    isLoading,
    applications,
    resources,
    addResource,
    uploadResource,
    updateResourceTags,
    deleteResource,
  } = useLoRStore();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading resources…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-accent/20">
          <CardContent className="p-8 space-y-4 text-center">
            <h1 className="text-2xl font-headline font-bold text-primary">Resources</h1>
            <p className="text-sm text-muted-foreground">
              Sign in from the main dashboard to manage your files and links.
            </p>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/">Go to main dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster />
      {(isLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-sm text-muted-foreground font-medium">Loading resources...</p>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
        <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-primary">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <GlobalResourcesSection
          applications={applications}
          resources={resources}
          addResource={addResource}
          uploadResource={uploadResource}
          updateResourceTags={updateResourceTags}
          deleteResource={deleteResource}
        />
      </main>
    </div>
  );
}
