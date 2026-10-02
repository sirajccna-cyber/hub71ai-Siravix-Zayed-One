import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/zayed/AuthForm";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in — Zayed One" },
      { name: "description", content: "Log in to Zayed One to continue your personalised Abu Dhabi journey." },
      { property: "og:title", content: "Log in — Zayed One" },
      { property: "og:description", content: "Continue your personalised Abu Dhabi journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="login" redirect={Route.useSearch().redirect} />,
});