import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-4 space-y-4">
      <Link to="/login" className="text-blue-500 underline">
        Go to Login
      </Link>
    </div>
  );
}
