import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (user === "admin" && pwd === process.env.DEXORY_PASS) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    "/(.*dexory.*)",
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // or more specifically:
    // '/dashboard/:path*',
    // '/protected/:path*',
  ],
};
