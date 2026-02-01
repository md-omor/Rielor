import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/upload(.*)",
  "/api/upload(.*)",
  "/api/webhooks/clerk(.*)",
  "/pricing(.*)",
  "/knowledge-center(.*)",
  "/ai-assistant(.*)",
  "/career-insights(.*)",
  "/contact(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/api/contact(.*)"
]);

export default clerkMiddleware(async (auth: any, req: any) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
};
