import { createFileRoute } from "@tanstack/react-router";
import { PillarPage } from "@/components/zayed/PillarPage";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live in Abu Dhabi — Zayed One" },
      { name: "description", content: "Neighbourhoods, schools, healthcare and daily life in Abu Dhabi — guidance and verified official handoffs from Zayed One." },
      { property: "og:title", content: "Live in Abu Dhabi — Zayed One" },
      { property: "og:description", content: "Neighbourhoods, schools, healthcare and daily life in Abu Dhabi — guidance and verified official handoffs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PillarPage id="live" />,
});