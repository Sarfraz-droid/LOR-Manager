import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { ShortlistShareView } from "./ShortlistShareView";

interface PageProps {
  params: Promise<{ token: string }>;
}

type SharedShortlistRow = {
  id: string;
  university: string | null;
  program: string | null;
  deadline: string | null;
  description: string | null;
};

type SharedSopRow = {
  id: string;
  program: string | null;
  deadline: string | null;
  status: string | null;
  content: string | null;
};

type SharedLorRow = {
  id: string;
  professor_id: string | null;
  deadline: string | null;
  status: string | null;
  content: string | null;
  professor_name: string | null;
};

async function getShortlistData(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: shortlist, error: shortlistError } = await supabase
    .rpc("get_shared_shortlist", { share_token_input: token })
    .single<SharedShortlistRow>();

  if (shortlistError || !shortlist) return null;

  const [{ data: sops }, { data: lors }] = await Promise.all([
    supabase.rpc("get_shared_shortlist_sops", { share_token_input: token }),
    supabase.rpc("get_shared_shortlist_lors", { share_token_input: token }),
  ]);
  const shortlistSops = (sops ?? []) as SharedSopRow[];
  const shortlistLors = (lors ?? []) as SharedLorRow[];

  return {
    shortlist: {
      university: typeof shortlist.university === "string" ? shortlist.university : "University",
      program: typeof shortlist.program === "string" ? shortlist.program : "Program",
      deadline: typeof shortlist.deadline === "string" ? shortlist.deadline : "",
      description: typeof shortlist.description === "string" ? shortlist.description : "",
    },
    sops: shortlistSops.map((sop) => ({
      id: String(sop.id),
      program: typeof sop.program === "string" ? sop.program : "Program",
      deadline: typeof sop.deadline === "string" ? sop.deadline : "",
      status: typeof sop.status === "string" ? sop.status : "Draft",
      content: typeof sop.content === "string" ? sop.content : "",
    })),
    lors: shortlistLors.map((lor) => ({
      id: String(lor.id),
      deadline: typeof lor.deadline === "string" ? lor.deadline : "",
      status: typeof lor.status === "string" ? lor.status : "Requested",
      content: typeof lor.content === "string" ? lor.content : "",
      professorName: lor.professor_name || "Professor",
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
