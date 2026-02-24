import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { LorShareView } from "./LorShareView";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function getLorData(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: lor, error: lorError } = await supabase
    .from("lor_requests")
    .select("*")
    .eq("share_token", token)
    .single();

  if (lorError || !lor) return null;

  const [{ data: professor }, { data: application }] = await Promise.all([
    supabase.from("professors").select("name, email, expertise").eq("id", lor.professor_id).single(),
    supabase.from("university_applications").select("university, program").eq("id", lor.application_id).single(),
  ]);

  return {
    content: typeof lor.content === "string" ? lor.content : "",
    professorName: typeof professor?.name === "string" ? professor.name : "Professor",
    university: typeof application?.university === "string" ? application.university : "University",
    program: typeof application?.program === "string" ? application.program : "Program",
  };
}

export default async function LorSharePage({ params }: PageProps) {
  const { token } = await params;
  const data = await getLorData(token);

  if (!data) {
    notFound();
  }

  return <LorShareView {...data} />;
}
