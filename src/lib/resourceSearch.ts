import type { ApplicationResource } from "@/lib/types";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterResourcesByQuery(
  resources: ApplicationResource[],
  query: string
) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return resources;

  return resources.filter((resource) => {
    const haystack = [
      resource.title,
      resource.url ?? "",
      resource.filename ?? "",
      ...resource.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function filterResourcesByTags(
  resources: ApplicationResource[],
  selectedTags: string[]
) {
  if (selectedTags.length === 0) return resources;

  return resources.filter((resource) =>
    selectedTags.every((tag) =>
      resource.tags.some((resourceTag) => normalize(resourceTag) === normalize(tag))
    )
  );
}

export function extractUniqueTags(resources: ApplicationResource[]) {
  return Array.from(
    new Set(
      resources
        .flatMap((resource) => resource.tags)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}
