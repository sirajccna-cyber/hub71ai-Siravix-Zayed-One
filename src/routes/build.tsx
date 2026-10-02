import { createFileRoute } from "@tanstack/react-router";
import { PillarPage } from "@/components/zayed/PillarPage";

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Build in Abu Dhabi — Zayed One" },
      { name: "description", content: "Company setup, startups, investment, offices and hiring in Abu Dhabi — guidance and verified official handoffs from Zayed One." },
      { property: "og:title", content: "Build in Abu Dhabi — Zayed One" },
      { property: "og:description", content: "Company setup, startups, investment, offices and hiring in Abu Dhabi — guidance and verified official handoffs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PillarPage id="build" />,
});