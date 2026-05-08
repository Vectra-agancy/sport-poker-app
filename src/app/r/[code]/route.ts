import { NextResponse } from "next/server";

const COOKIE_NAME = "ref_code";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const CODE_REGEX = /^[A-Za-z0-9_-]{2,32}$/;

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = (params.code ?? "").trim();
  const response = NextResponse.redirect(new URL("/", req.url));
  if (CODE_REGEX.test(code)) {
    response.cookies.set(COOKIE_NAME, code, {
      maxAge: MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}
