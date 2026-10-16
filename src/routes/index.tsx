import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Initialized" },
      { name: "description", content: "Blank starter project." },
      { property: "og:title", content: "Project Initialized" },
      { property: "og:description", content: "Blank starter project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-medium">Project Initialized</h1>
    </div>
  );
}
