import { NextRequest, NextResponse } from "next/server";

const INIT_API_URL = "https://printinghouseujjain.in/api/init";

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	/*
	 * -------------------------------------------------------
	 * ADMIN AUTHENTICATION
	 * -------------------------------------------------------
	 */

	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		try {
			const cookie = request.headers.get("cookie");

			/*
			 * No browser cookie means there is no
			 * authenticated session.
			 */
			if (!cookie) {
				return NextResponse.redirect(new URL("/login", request.url));
			}

			/*
			 * Ask the backend to validate the
			 * existing session.
			 */
			const response = await fetch(INIT_API_URL, {
				method: "GET",

				headers: {
					Cookie: cookie,
					Accept: "application/json",
				},

				cache: "no-store",
			});

			/*
			 * ------------------------------------------------
			 * READ BACKEND COOKIES
			 * ------------------------------------------------
			 */

			const setCookies =
				typeof response.headers.getSetCookie === "function"
					? response.headers.getSetCookie()
					: [];

			console.log("ADMIN INIT STATUS:", response.status);

			console.log("ADMIN INIT SET-COOKIE:", setCookies);

			/*
			 * ------------------------------------------------
			 * CHECK FOR user_auth=deleted
			 * ------------------------------------------------
			 */

			const userAuthDeleted = setCookies.some((cookieHeader) =>
				/user_auth=deleted(?:;|,|$)/i.test(cookieHeader),
			);

			if (userAuthDeleted) {
				console.log(
					"ADMIN: user_auth=deleted detected. Clearing browser cookie.",
				);

				const redirectResponse = NextResponse.redirect(
					new URL("/login", request.url),
				);

				/*
				 * Explicitly delete the browser cookie.
				 *
				 * This is required because user_auth
				 * is HttpOnly and cannot be deleted
				 * using document.cookie.
				 */
				redirectResponse.cookies.set({
					name: "user_auth",
					value: "",
					expires: new Date(0),
					maxAge: 0,
					path: "/",
					httpOnly: true,
					secure: true,
					sameSite: "lax",
				});

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * BACKEND HTTP ERROR
			 * ------------------------------------------------
			 */

			if (!response.ok) {
				console.log("ADMIN: backend rejected session.");

				const redirectResponse = NextResponse.redirect(
					new URL("/login", request.url),
				);

				/*
				 * Also clear our known auth cookie
				 * because the backend rejected it.
				 */
				redirectResponse.cookies.set({
					name: "user_auth",
					value: "",
					expires: new Date(0),
					maxAge: 0,
					path: "/",
					httpOnly: true,
					secure: true,
					sameSite: "lax",
				});

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * PARSE RESPONSE
			 * ------------------------------------------------
			 */

			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				console.error("ADMIN INIT INVALID JSON:", text);

				const redirectResponse = NextResponse.redirect(
					new URL("/login", request.url),
				);

				redirectResponse.cookies.set({
					name: "user_auth",
					value: "",
					expires: new Date(0),
					maxAge: 0,
					path: "/",
					httpOnly: true,
					secure: true,
					sameSite: "lax",
				});

				return redirectResponse;
			}

			console.log("ADMIN INIT RESPONSE:", data);

			/*
			 * ------------------------------------------------
			 * CHECK ADMIN AUTHENTICATION
			 * ------------------------------------------------
			 */

			const isAdmin = data?.login_status === true && data?.type === "admin";

			if (!isAdmin) {
				console.log("ADMIN: user is not authenticated as admin.");

				const redirectResponse = NextResponse.redirect(
					new URL("/login", request.url),
				);

				/*
				 * Clear stale user authentication
				 * cookie before redirecting.
				 */
				redirectResponse.cookies.set({
					name: "user_auth",
					value: "",
					expires: new Date(0),
					maxAge: 0,
					path: "/",
					httpOnly: true,
					secure: true,
					sameSite: "lax",
				});

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * VALID ADMIN
			 * ------------------------------------------------
			 */

			console.log("ADMIN: valid admin session.");

			const nextResponse = NextResponse.next();

			/*
			 * Forward any Set-Cookie headers
			 * returned by the backend.
			 *
			 * This is important if /api/init
			 * refreshes the session.
			 */
			for (const cookieHeader of setCookies) {
				nextResponse.headers.append("Set-Cookie", cookieHeader);
			}

			return nextResponse;
		} catch (error) {
			console.error("Admin authentication failed:", error);

			const redirectResponse = NextResponse.redirect(
				new URL("/login", request.url),
			);

			redirectResponse.cookies.set({
				name: "user_auth",
				value: "",
				expires: new Date(0),
				maxAge: 0,
				path: "/",
				httpOnly: true,
				secure: true,
				sameSite: "lax",
			});

			return redirectResponse;
		}
	}

	/*
	 * -------------------------------------------------------
	 * OTHER ROUTES
	 * -------------------------------------------------------
	 */

	if (process.env.NODE_ENV !== "production") {
		return NextResponse.next();
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
