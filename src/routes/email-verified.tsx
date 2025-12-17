import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/email-verified")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Email Verified!</h1>
      <p>Your email has been successfully verified.</p>

      <Link
        to="/login"
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        Please Login
      </Link>
    </div>
  );
}
