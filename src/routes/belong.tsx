import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/belong")({
  beforeLoad: ({ location }) => {
    throw redirect({ to: "/connect", ...(location.hash ? { hash: location.hash } : {}), replace: true });
  },
});