import { NextRequest, NextResponse } from "next/server";

const INIT_API_URL = "https://printinghouseujjain.in/api/init";

/*
 * -------------------------------------------------------
 * CLEAR AUTH COOKIE
 * -------------------------------------------------------
 */
function clearAuthCookie(response: NextResponse) {
	response.cookies.set({
		name: "user_auth",
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
 * REDIRECT TO LOGIN
 * -------------------------------------------------------
 */
function redirectToLogin(request: NextRequest) {
	return NextResponse.redirect(new URL("/login", request.url));
}

/*
 * -------------------------------------------------------
 * GET SET-COOKIE HEADERS
 * -------------------------------------------------------
 */
function getSetCookies(response: Response): string[] {
	/*
	 * Node/Next.js supports getSetCookie().
	 *
	 * This is important because /api/init can return
	 * multiple Set-Cookie headers.
	 */
	if (typeof response.headers.getSetCookie === "function") {
		return response.headers.getSetCookie();
	}

	/*
	 * Fallback for environments where getSetCookie()
	 * is not available.
	 */
	const setCookie = response.headers.get("set-cookie");

	return setCookie ? [setCookie] : [];
}

/*
 * -------------------------------------------------------
 * CHECK IF user_auth WAS DELETED
 * -------------------------------------------------------
 */
function hasDeletedUserAuth(setCookies: string[]) {
	return setCookies.some((cookieHeader) =>
		/user_auth=deleted(?:;|,|$)/i.test(cookieHeader),
	);
}

/*
 * -------------------------------------------------------
 * FORWARD BACKEND COOKIES
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
	 *
	 * Every request under /admin is validated against
	 * the real backend /api/init endpoint.
	 */
	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		try {
			/*
			 * ------------------------------------------------
			 * GET BROWSER COOKIES
			 * ------------------------------------------------
			 */
			const cookie = request.headers.get("cookie");

			console.log("========================================");

			console.log("ADMIN PROXY REQUEST:", pathname);

			console.log("ADMIN REQUEST HAS COOKIE:", !!cookie);

			/*
			 * ------------------------------------------------
			 * NO COOKIE
			 * ------------------------------------------------
			 */
			if (!cookie) {
				console.log("ADMIN: No authentication cookie.");

				const redirectResponse = redirectToLogin(request);

				clearAuthCookie(redirectResponse);

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * CALL BACKEND /api/init
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
			 * GET BACKEND SET-COOKIE HEADERS
			 * ------------------------------------------------
			 */
			const setCookies = getSetCookies(response);

			console.log("ADMIN INIT SET-COOKIE:", setCookies);

			/*
			 * ------------------------------------------------
			 * CHECK user_auth=deleted
			 * ------------------------------------------------
			 */
			const userAuthDeleted = hasDeletedUserAuth(setCookies);

			console.log("USER_AUTH DELETED:", userAuthDeleted);

			/*
			 * ------------------------------------------------
			 * BACKEND EXPLICITLY DELETED AUTH
			 * ------------------------------------------------
			 *
			 * Example:
			 *
			 * user_auth=deleted;
			 * Max-Age=0;
			 */
			if (userAuthDeleted) {
				console.log("ADMIN: Backend returned user_auth=deleted.");

				const redirectResponse = redirectToLogin(request);

				/*
				 * Make sure the browser actually
				 * removes its existing HttpOnly cookie.
				 */
				clearAuthCookie(redirectResponse);

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * BACKEND HTTP ERROR
			 * ------------------------------------------------
			 */
			if (!response.ok) {
				console.log("ADMIN: Backend rejected authentication.");

				const redirectResponse = redirectToLogin(request);

				clearAuthCookie(redirectResponse);

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * READ BACKEND RESPONSE
			 * ------------------------------------------------
			 */
			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch (error) {
				console.error("ADMIN INIT INVALID JSON:", text);

				const redirectResponse = redirectToLogin(request);

				clearAuthCookie(redirectResponse);

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * DEBUG INFORMATION
			 * ------------------------------------------------
			 */
			console.log("ADMIN INIT RESPONSE:", data);

			console.log("ADMIN LOGIN STATUS:", data?.login_status);

			console.log("ADMIN TYPE:", data?.type);

			/*
			 * ------------------------------------------------
			 * ADMIN CHECK
			 * ------------------------------------------------
			 *
			 * Both conditions must be true:
			 *
			 * login_status === true
			 * type === "admin"
			 */
			const isAdmin = data?.login_status === true && data?.type === "admin";

			console.log("ADMIN AUTHENTICATED:", isAdmin);

			/*
			 * ------------------------------------------------
			 * NOT ADMIN
			 * ------------------------------------------------
			 */
			if (!isAdmin) {
				console.log("ADMIN: Authentication failed.");

				const redirectResponse = redirectToLogin(request);

				clearAuthCookie(redirectResponse);

				return redirectResponse;
			}

			/*
			 * ------------------------------------------------
			 * VALID ADMIN SESSION
			 * ------------------------------------------------
			 */
			console.log("ADMIN: Valid admin session.");

			const nextResponse = NextResponse.next();

			/*
			 * ------------------------------------------------
			 * FORWARD ANY BACKEND SET-COOKIE HEADERS
			 * ------------------------------------------------
			 *
			 * This allows /api/init to refresh/update
			 * the session cookie when necessary.
			 */
			forwardSetCookies(nextResponse, setCookies);

			console.log("ADMIN: Allowing request.");

			console.log("========================================");

			return nextResponse;
		} catch (error) {
			/*
			 * ------------------------------------------------
			 * NETWORK / BACKEND ERROR
			 * ------------------------------------------------
			 */
			console.error("ADMIN AUTHENTICATION ERROR:", error);

			const redirectResponse = redirectToLogin(request);

			clearAuthCookie(redirectResponse);

			return redirectResponse;
		}
	}

	/*
	 * =======================================================
	 * OTHER ROUTES
	 * =======================================================
	 */

	if (process.env.NODE_ENV !== "production") {
		return NextResponse.next();
	}

	/*
	 * -------------------------------------------------------
	 * BLOCKED ROUTES
	 * -------------------------------------------------------
	 *
	 * Keep this section if you want to add route
	 * blocking later.
	 */

	/*
	const BLOCKED_ROUTES = [
		"/login",
		"/admin",
		"/checkout",
		"/cart",
		"/register",
		"/forgot-password",
		"/profile",
		"/orders",
		"/order-tracking",
	];

	const isBlocked = BLOCKED_ROUTES.some(
		(route) =>
			pathname === route ||
			pathname.startsWith(`${route}/`),
	);

	if (isBlocked) {
		return new NextResponse(null, {
			status: 404,
		});
	}
	*/

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
