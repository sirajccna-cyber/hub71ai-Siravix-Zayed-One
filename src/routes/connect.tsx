import { createFileRoute } from "@tanstack/react-router";
import { PillarPage } from "@/components/zayed/PillarPage";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect in Abu Dhabi — Zayed One" },
      { name: "description", content: "Connect through culture, community, faith, sports and family life in Abu Dhabi — guidance and verified official handoffs from Zayed One." },
      { property: "og:title", content: "Connect in Abu Dhabi — Zayed One" },
      { property: "og:description", content: "Connect through culture, community, faith, sports and family life in Abu Dhabi — guidance and verified official handoffs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PillarPage id="connect" />,
});