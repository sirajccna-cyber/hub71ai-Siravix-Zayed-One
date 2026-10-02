import { createFileRoute } from "@tanstack/react-router";
import { PillarPage } from "@/components/zayed/PillarPage";

export const Route = createFileRoute("/move")({
  head: () => ({
    meta: [
      { title: "Move in Abu Dhabi — Zayed One" },
      { name: "description", content: "Residency, documents, housing, banking, transport and utilities in Abu Dhabi — guidance and verified official handoffs from Zayed One." },
      { property: "og:title", content: "Move in Abu Dhabi — Zayed One" },
      { property: "og:description", content: "Residency, documents, housing, banking, transport and utilities in Abu Dhabi — guidance and verified official handoffs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PillarPage id="move" />,
});