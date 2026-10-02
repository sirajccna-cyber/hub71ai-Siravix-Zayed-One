import { createFileRoute } from "@tanstack/react-router";
import { PillarPage } from "@/components/zayed/PillarPage";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work in Abu Dhabi — Zayed One" },
      { name: "description", content: "Jobs, careers, talent and professional networks in Abu Dhabi — guidance and verified official handoffs from Zayed One." },
      { property: "og:title", content: "Work in Abu Dhabi — Zayed One" },
      { property: "og:description", content: "Jobs, careers, talent and professional networks in Abu Dhabi — guidance and verified official handoffs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PillarPage id="work" />,
});