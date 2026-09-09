import { NextRequest, NextResponse } from "next/server";

const INIT_API_URL = "https://printinghouseujjain.in/api/init";

/*
 * -------------------------------------------------------
 * Clear admin authentication cookie
 * -------------------------------------------------------
 */
function clearAdminAuthCookie(response: NextResponse) {
	response.cookies.set({
		name: "admin_auth",
		value: "",
		expires: new Date(0),
		maxAge: 0,
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax",
	});
}

/*
 * -------------------------------------------------------
 * Redirect to login and clear admin session
 * -------------------------------------------------------
 */
function redirectToLogin(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/login", request.url));

	clearAdminAuthCookie(response);

	return response;
}

/*
 * -------------------------------------------------------
 * Get all Set-Cookie headers
 * -------------------------------------------------------
 */
function getSetCookies(response: Response): string[] {
	if (typeof response.headers.getSetCookie === "function") {
		return response.headers.getSetCookie();
	}

	const setCookie = response.headers.get("set-cookie");

	return setCookie ? [setCookie] : [];
}

/*
 * -------------------------------------------------------
 * Check whether admin_auth was deleted
 * -------------------------------------------------------
 */
function hasDeletedAdminAuth(setCookies: string[]): boolean {
	return setCookies.some((cookieHeader) =>
		/admin_auth=deleted(?:;|,|$)/i.test(cookieHeader),
	);
}

/*
 * -------------------------------------------------------
 * Forward backend cookies
 * -------------------------------------------------------
 */
function forwardSetCookies(response: NextResponse, setCookies: string[]) {
	for (const cookieHeader of setCookies) {
		response.headers.append("Set-Cookie", cookieHeader);
	}
}

/*
 * =======================================================
 * PROXY
 * =======================================================
 */
export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	/*
	 * =====================================================
	 * ADMIN AUTHENTICATION
	 * =====================================================
	 */
	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		try {
			/*
			 * Get cookies sent by browser.
			 */
			const cookie = request.headers.get("cookie");

			console.log("========================================");

			console.log("ADMIN PROXY REQUEST:", pathname);

			console.log("ADMIN REQUEST HAS COOKIE:", !!cookie);

			/*
			 * ------------------------------------------------
			 * No cookies at all
			 * ------------------------------------------------
			 */
			if (!cookie) {
				console.log("ADMIN: No cookies found.");

				return redirectToLogin(request);
			}

			/*
			 * ------------------------------------------------
			 * Call backend /api/init
			 * ------------------------------------------------
			 */
			const response = await fetch(INIT_API_URL, {
				method: "GET",

				headers: {
					Cookie: cookie,
					Accept: "application/json",
				},

				cache: "no-store",
			});

			console.log("ADMIN INIT STATUS:", response.status);

			/*
			 * ------------------------------------------------
			 * Read Set-Cookie headers
			 * ------------------------------------------------
			 */
			const setCookies = getSetCookies(response);

			console.log("ADMIN INIT SET-COOKIE:", setCookies);

			/*
			 * ------------------------------------------------
			 * Backend explicitly deleted admin_auth
			 * ------------------------------------------------
			 */
			if (hasDeletedAdminAuth(setCookies)) {
				console.log("ADMIN: admin_auth=deleted received.");

				return redirectToLogin(request);
			}

			/*
			 * ------------------------------------------------
			 * Backend HTTP error
			 * ------------------------------------------------
			 */
			if (!response.ok) {
				console.log("ADMIN: /api/init returned HTTP error.");

				return redirectToLogin(request);
			}

			/*
			 * ------------------------------------------------
			 * Read response
			 * ------------------------------------------------
			 */
			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				console.error("ADMIN: Invalid JSON from /api/init:", text);

				return redirectToLogin(request);
			}

			console.log("ADMIN INIT RESPONSE:", data);

			console.log("ADMIN LOGIN STATUS:", data?.login_status);

			console.log("ADMIN TYPE:", data?.type);

			/*
			 * ------------------------------------------------
			 * Validate admin
			 * ------------------------------------------------
			 */
			const isAdmin = data?.login_status === true && data?.type === "admin";

			console.log("ADMIN AUTHENTICATED:", isAdmin);

			/*
			 * ------------------------------------------------
			 * Not authenticated / not admin
			 * ------------------------------------------------
			 */
			if (!isAdmin) {
				console.log("ADMIN: Invalid admin session.");

				return redirectToLogin(request);
			}

			/*
			 * ------------------------------------------------
			 * Valid admin
			 * ------------------------------------------------
			 */
			console.log("ADMIN: Valid admin session.");

			const nextResponse = NextResponse.next();

			/*
			 * Forward any cookies generated/refreshed
			 * by backend.
			 */
			forwardSetCookies(nextResponse, setCookies);

			console.log("ADMIN: Request allowed.");

			console.log("========================================");

			return nextResponse;
		} catch (error) {
			console.error("ADMIN AUTHENTICATION ERROR:", error);

			return redirectToLogin(request);
		}
	}

	/*
	 * =====================================================
	 * OTHER ROUTES
	 * =====================================================
	 */

	if (process.env.NODE_ENV !== "production") {
		return NextResponse.next();
	}

	return NextResponse.next();
}

/*
 * =======================================================
 * MATCHER
 * =======================================================
 */
export const config = {
	matcher: [
		"/admin/:path*",
		"/cart/:path*",
		"/orders/:path*",
		"/order-tracking/:path*",
	],
};
