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
  relevant_links: string[] | null;
};

type SharedSopRow = {
  id: string;
  program: string | null;
  deadline: string | null;
  status: string | null;
  content: string | null;
  google_docs_link: string | null;
};

type SharedLorRow = {
  id: string;
  professor_id: string | null;
  deadline: string | null;
  status: string | null;
  content: string | null;
  professor_name: string | null;
  google_docs_link: string | null;
};

type SharedResourceRow = {
  id: string;
  application_id: string | null;
  resource_type: "upload" | "link" | null;
  title: string | null;
  url: string | null;
  storage_path: string | null;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  tags: string[] | null;
};

async function getShortlistData(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: shortlist, error: shortlistError } = await supabase
    .rpc("get_shared_shortlist", { share_token_input: token })
    .single<SharedShortlistRow>();

  if (shortlistError || !shortlist) return null;

  const [{ data: sops }, { data: lors }, { data: resources }] = await Promise.all([
    supabase.rpc("get_shared_shortlist_sops", { share_token_input: token }),
    supabase.rpc("get_shared_shortlist_lors", { share_token_input: token }),
    supabase.rpc("get_shared_shortlist_resources", { share_token_input: token }),
  ]);
  const shortlistSops = (sops ?? []) as SharedSopRow[];
  const shortlistLors = (lors ?? []) as SharedLorRow[];
  const shortlistResources = (resources ?? []) as SharedResourceRow[];

  const resourcesWithOpenUrl = await Promise.all(
    shortlistResources.map(async (resource) => {
      if (resource.resource_type !== "upload" || !resource.storage_path) {
        return {
          id: String(resource.id),
          resourceType: resource.resource_type === "upload" ? "upload" : "link",
          title: typeof resource.title === "string" ? resource.title : "Resource",
          url: typeof resource.url === "string" ? resource.url : undefined,
          filename:
            typeof resource.filename === "string" ? resource.filename : undefined,
          mimeType:
            typeof resource.mime_type === "string" ? resource.mime_type : undefined,
          sizeBytes:
            typeof resource.size_bytes === "number" ? resource.size_bytes : undefined,
          tags: resource.tags ?? [],
          openUrl: undefined as string | undefined,
        };
      }

      const { data: signedData } = await supabase.storage
        .from("application-resources")
        .createSignedUrl(resource.storage_path, 60 * 60);

      return {
        id: String(resource.id),
        resourceType: "upload" as const,
        title: typeof resource.title === "string" ? resource.title : "Uploaded file",
        url: undefined,
        filename: typeof resource.filename === "string" ? resource.filename : undefined,
        mimeType:
          typeof resource.mime_type === "string" ? resource.mime_type : undefined,
        sizeBytes:
          typeof resource.size_bytes === "number" ? resource.size_bytes : undefined,
        tags: resource.tags ?? [],
        openUrl: signedData?.signedUrl,
      };
    })
  );

  return {
    shortlist: {
      university: typeof shortlist.university === "string" ? shortlist.university : "University",
      program: typeof shortlist.program === "string" ? shortlist.program : "Program",
      deadline: typeof shortlist.deadline === "string" ? shortlist.deadline : "",
      description: typeof shortlist.description === "string" ? shortlist.description : "",
      relevantLinks: shortlist.relevant_links ?? [],
    },
    sops: shortlistSops.map((sop) => ({
      id: String(sop.id),
      program: typeof sop.program === "string" ? sop.program : "Program",
      deadline: typeof sop.deadline === "string" ? sop.deadline : "",
      status: typeof sop.status === "string" ? sop.status : "Draft",
      content: typeof sop.content === "string" ? sop.content : "",
      googleDocsLink:
        typeof sop.google_docs_link === "string" ? sop.google_docs_link : undefined,
    })),
    lors: shortlistLors.map((lor) => ({
      id: String(lor.id),
      deadline: typeof lor.deadline === "string" ? lor.deadline : "",
      status: typeof lor.status === "string" ? lor.status : "Requested",
      content: typeof lor.content === "string" ? lor.content : "",
      professorName: lor.professor_name || "Professor",
      googleDocsLink:
        typeof lor.google_docs_link === "string" ? lor.google_docs_link : undefined,
    })),
    resources: resourcesWithOpenUrl,
  };
}

export default async function ShortlistSharePage({ params }: PageProps) {
  const { token } = await params;
  const data = await getShortlistData(token);

  if (!data) {
    notFound();
  }

  return <ShortlistShareView token={token} {...data} />;
}
