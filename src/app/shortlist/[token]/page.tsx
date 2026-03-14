import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { ShortlistShareView } from "./ShortlistShareView";

interface PageProps {
  params: Promise<{ token: string }>;
}

type SharedProfessor = {
  id: string;
  name: string;
  email: string;
};

async function getShortlistData(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: shortlist, error: shortlistError } = await supabase
    .from("university_applications")
    .select("*")
    .eq("share_token", token)
    .single();

  if (shortlistError || !shortlist) return null;

  const [{ data: sops }, { data: lors }] = await Promise.all([
    supabase
      .from("sop_entries")
      .select("*")
      .eq("application_id", shortlist.id),
    supabase
      .from("lor_requests")
      .select("*")
      .eq("application_id", shortlist.id),
  ]);

  const professorIds = Array.from(
    new Set((lors ?? []).map((lor) => lor.professor_id).filter((id): id is string => typeof id === "string"))
  );

  const { data: professors } = professorIds.length
    ? await supabase.from("professors").select("id, name, email").in("id", professorIds)
    : { data: [] as SharedProfessor[] };

  return {
    shortlist: {
      university: typeof shortlist.university === "string" ? shortlist.university : "University",
      program: typeof shortlist.program === "string" ? shortlist.program : "Program",
      deadline: typeof shortlist.deadline === "string" ? shortlist.deadline : "",
      description: typeof shortlist.description === "string" ? shortlist.description : "",
    },
    sops: (sops ?? []).map((sop) => ({
      id: String(sop.id),
      program: typeof sop.program === "string" ? sop.program : "Program",
      deadline: typeof sop.deadline === "string" ? sop.deadline : "",
      status: typeof sop.status === "string" ? sop.status : "Draft",
      content: typeof sop.content === "string" ? sop.content : "",
    })),
    lors: (lors ?? []).map((lor) => ({
      id: String(lor.id),
      deadline: typeof lor.deadline === "string" ? lor.deadline : "",
      status: typeof lor.status === "string" ? lor.status : "Requested",
      content: typeof lor.content === "string" ? lor.content : "",
      professorName:
        professors?.find((professor) => professor.id === lor.professor_id)?.name ?? "Professor",
    })),
  };
}

export default async function ShortlistSharePage({ params }: PageProps) {
  const { token } = await params;
  const data = await getShortlistData(token);

  if (!data) {
    notFound();
  }

  return <ShortlistShareView {...data} />;
}
