import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HUB_HOSTS = new Set(["singareddyai.com", "www.singareddyai.com"]);

function isHubHost(host: string) {
  return HUB_HOSTS.has(host.split(":")[0].toLowerCase());
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;
  const hub = isHubHost(host);

  if (hub && pathname === "/") {
    return NextResponse.rewrite(new URL("/hub", request.url));
  }

  if (!hub && pathname.startsWith("/hub")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/hub"],
};
