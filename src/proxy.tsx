import { NextRequest, NextResponse } from "next/server";

const INIT_API_URL = "https://printinghouseujjain.in/api/init";

const BLOCKED_ROUTES = [
	// "/login",
	// "/admin",
	// "/checkout",
	// "/cart",
	// "/register",
	// "/forgot-password",
	// "/profile",
	// "/orders",
	"/order-tracking",
];

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	/*
	 * -------------------------------------------------------
	 * ADMIN AUTHENTICATION
	 * -------------------------------------------------------
	 *
	 * Every request under /admin is checked against
	 * printinghouseujjain.in/api/init.
	 */

	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		try {
			// Get the cookies sent by the browser
			const cookie = request.headers.get("cookie");

			// No cookie = not logged in
			if (!cookie) {
				return NextResponse.redirect(new URL("/login", request.url));
			}

			// Send the same cookies to the actual backend
			const response = await fetch(INIT_API_URL, {
				method: "GET",
				headers: {
					Cookie: cookie,
					Accept: "application/json",
				},
				cache: "no-store",
			});

			// Backend rejected the request
			if (!response.ok) {
				return NextResponse.redirect(new URL("/login", request.url));
			}

			const data = await response.json();

			/*
			 * Admin is allowed only when:
			 *
			 * login_status === true
			 * AND
			 * type === "admin"
			 */
			const isAdmin = data?.login_status === true && data?.type === "admin";

			if (!isAdmin) {
				return NextResponse.redirect(new URL("/login", request.url));
			}

			// Valid admin session
			return NextResponse.next();
		} catch (error) {
			console.error("Admin authentication failed:", error);

			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	/*
	 * -------------------------------------------------------
	 * BLOCKED ROUTES
	 * -------------------------------------------------------
	 */

	if (process.env.NODE_ENV !== "production") {
		return NextResponse.next();
	}

	const isBlocked = BLOCKED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);

	if (isBlocked) {
		return new NextResponse(null, {
			status: 404,
		});
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin/:path*",
		"/cart/:path*",
		"/orders/:path*",
		"/order-tracking/:path*",
	],
};
