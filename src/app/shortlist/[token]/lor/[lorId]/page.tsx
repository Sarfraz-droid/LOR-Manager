import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { LorPreviewView } from "./LorPreviewView";

interface PageProps {
  params: Promise<{ token: string; lorId: string }>;
}

type SharedLorRow = {
  id: string;
  professor_id: string | null;
  deadline: string | null;
  status: string | null;
  content: string | null;
  professor_name: string | null;
};

type SharedShortlistRow = {
  id: string;
  university: string | null;
  program: string | null;
  deadline: string | null;
  description: string | null;
};

async function getLorData(token: string, lorId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [{ data: shortlist, error: shortlistError }, { data: lors }] =
    await Promise.all([
      supabase
        .rpc("get_shared_shortlist", { share_token_input: token })
        .single<SharedShortlistRow>(),
      supabase.rpc("get_shared_shortlist_lors", { share_token_input: token }),
    ]);

  if (shortlistError || !shortlist) return null;

  const lor = ((lors ?? []) as SharedLorRow[]).find((l) => l.id === lorId);
  if (!lor) return null;

  return {
    content: typeof lor.content === "string" ? lor.content : "",
    professorName:
      typeof lor.professor_name === "string"
        ? lor.professor_name
        : "Professor",
    university:
      typeof shortlist.university === "string"
        ? shortlist.university
        : "University",
    program:
      typeof shortlist.program === "string" ? shortlist.program : "Program",
    deadline: typeof lor.deadline === "string" ? lor.deadline : "",
    status: typeof lor.status === "string" ? lor.status : "Requested",
  };
}

export default async function LorPreviewPage({ params }: PageProps) {
  const { token, lorId } = await params;
  const data = await getLorData(token, lorId);

  if (!data) {
    notFound();
  }

  return (
    <LorPreviewView {...data} backUrl={`/shortlist/${token}`} />
  );
}
