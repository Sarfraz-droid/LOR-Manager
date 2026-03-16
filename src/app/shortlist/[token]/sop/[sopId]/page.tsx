import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { SopPreviewView } from "./SopPreviewView";

interface PageProps {
  params: Promise<{ token: string; sopId: string }>;
}

type SharedSopRow = {
  id: string;
  program: string | null;
  deadline: string | null;
  status: string | null;
  content: string | null;
  google_docs_link: string | null;
};

type SharedShortlistRow = {
  id: string;
  university: string | null;
  program: string | null;
  deadline: string | null;
  description: string | null;
};

async function getSopData(token: string, sopId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [{ data: shortlist, error: shortlistError }, { data: sops }] =
    await Promise.all([
      supabase
        .rpc("get_shared_shortlist", { share_token_input: token })
        .single<SharedShortlistRow>(),
      supabase.rpc("get_shared_shortlist_sops", { share_token_input: token }),
    ]);

  if (shortlistError || !shortlist) return null;

  const sop = ((sops ?? []) as SharedSopRow[]).find((s) => s.id === sopId);
  if (!sop) return null;

  return {
    content: typeof sop.content === "string" ? sop.content : "",
    program: typeof sop.program === "string" ? sop.program : "Program",
    university:
      typeof shortlist.university === "string"
        ? shortlist.university
        : "University",
    deadline: typeof sop.deadline === "string" ? sop.deadline : "",
    status: typeof sop.status === "string" ? sop.status : "Draft",
    googleDocsLink:
      typeof sop.google_docs_link === "string" ? sop.google_docs_link : undefined,
  };
}

export default async function SopPreviewPage({ params }: PageProps) {
  const { token, sopId } = await params;
  const data = await getSopData(token, sopId);

  if (!data) {
    notFound();
  }

  if (data.googleDocsLink) {
    redirect(data.googleDocsLink);
  }

  return (
    <SopPreviewView {...data} backUrl={`/shortlist/${token}`} />
  );
}
