import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/grazu/placeholder-page";
import { pageHead } from "@/lib/grazu-navigation";
export const Route = createFileRoute("/admin/news/")({
  head: () => pageHead("Kelola Berita", "Kelola artikel, informasi, dan publikasi yang ditampilkan pada platform GRAZU-AI."),
  component: () => <PlaceholderPage title="Kelola Berita" description="Kelola artikel, informasi, dan publikasi yang ditampilkan pada platform GRAZU-AI." />,
});
