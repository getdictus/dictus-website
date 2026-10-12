import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlProxy = createMiddleware(routing);
// Blog slugs differ by language. Each page's head owns its validated alternates.
const blogProxy = createMiddleware({ ...routing, alternateLinks: false });

export function proxy(request: NextRequest) {
  return /^\/(?:fr\/|en\/)?blog(?:\/|$)/.test(request.nextUrl.pathname)
    ? blogProxy(request)
    : intlProxy(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
