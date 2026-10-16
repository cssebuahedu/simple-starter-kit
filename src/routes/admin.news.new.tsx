import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/grazu/placeholder-page";
import { pageHead } from "@/lib/grazu-navigation";
export const Route = createFileRoute("/admin/news/new")({
  head: () => pageHead("Tambah Berita", "Formulir penulisan berita baru GRAZU-AI."),
  component: () => <PlaceholderPage title="Tambah Berita" description="Editor artikel akan tersedia pada tahap pengembangan berikutnya." />,
});
