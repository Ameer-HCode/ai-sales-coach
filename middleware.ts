import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect all routes under /dashboard and /call
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/call(.*)',
    '/api/create-call',
    '/api/end-call',
    '/api/customer-memory'
]);

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth().protect();
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
