import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect all routes under /dashboard and /call
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/call(.*)",
  "/api/create-call",
  "/api/end-call",
  "/api/customer-memory",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
