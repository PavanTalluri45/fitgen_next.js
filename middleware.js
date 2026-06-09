import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function middleware(request) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session (important — do NOT remove)
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Protected routes — redirect unauthenticated users to /
    if (pathname.startsWith("/plan-builder")) {
        if (!user) {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = "/";
            return NextResponse.redirect(loginUrl);
        }
    }

    // Auth pages — redirect authenticated users to /
    if (pathname === "/login" || pathname === "/signup") {
        if (user) {
            const homeUrl = request.nextUrl.clone();
            homeUrl.pathname = "/";
            return NextResponse.redirect(homeUrl);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};