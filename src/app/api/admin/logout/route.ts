import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		/* =====================================================
		   CREATE BACKEND FORM DATA
		===================================================== */

		const backendFormData = new FormData();

		backendFormData.append("command_type", "admin");

		/* =====================================================
		   FORWARD AUTH COOKIES
		===================================================== */

		const cookieHeader = request.headers.get("cookie");

		/* =====================================================
		   SEND LOGOUT REQUEST TO BACKEND
		===================================================== */

		const backendResponse = await fetch(`${API_URL}/api/logout`, {
			method: "POST",
			headers: cookieHeader
				? {
						Cookie: cookieHeader,
					}
				: undefined,
			body: backendFormData,
			cache: "no-store",
		});

		/* =====================================================
		   READ BACKEND RESPONSE
		===================================================== */

		const contentType = backendResponse.headers.get("content-type") || "";

		let responseData: unknown;

		if (contentType.includes("application/json")) {
			responseData = await backendResponse.json().catch(() => ({}));
		} else {
			responseData = await backendResponse.text().catch(() => "");
		}

		/* =====================================================
		   CREATE RESPONSE
		===================================================== */

		const response = NextResponse.json(
			{
				success: backendResponse.ok,
				message: backendResponse.ok
					? "Admin logged out successfully."
					: "Logout failed.",
				backend: responseData,
			},
			{
				status: backendResponse.ok ? 200 : backendResponse.status,
			},
		);

		/* =====================================================
		   FORWARD BACKEND SET-COOKIE HEADERS
		===================================================== */

		/*
		 * The backend may return Set-Cookie headers that
		 * invalidate the authentication session.
		 *
		 * Those headers belong to the backend response and
		 * are NOT automatically sent to the browser because
		 * the browser is communicating with this Next.js
		 * proxy instead.
		 */

		const setCookieHeaders = backendResponse.headers.getSetCookie?.() ?? [];

		for (const setCookie of setCookieHeaders) {
			response.headers.append("Set-Cookie", setCookie);
		}

		/* =====================================================
		   OPTIONAL LOCAL COOKIE CLEANUP
		===================================================== */

		/*
		 * If your Next.js application has its own authentication
		 * cookies, expire them here.
		 *
		 * IMPORTANT:
		 * Replace these names ONLY if these are actually
		 * cookies used by your application.
		 */

		// response.cookies.set("admin_token", "", {
		// 	httpOnly: true,
		// 	secure: process.env.NODE_ENV === "production",
		// 	sameSite: "lax",
		// 	expires: new Date(0),
		// 	path: "/",
		// });

		/* =====================================================
		   RETURN RESPONSE
		===================================================== */

		return response;
	} catch (error) {
		console.error("Admin logout proxy error:", error);

		/*
		 * Even if the backend request fails, return an error.
		 * We don't blindly report logout as successful.
		 */

		return NextResponse.json(
			{
				success: false,
				message: "Unable to logout. Please try again.",
			},
			{
				status: 500,
			},
		);
	}
}
