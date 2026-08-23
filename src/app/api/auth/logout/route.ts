import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		/*
		 * Forward cookies from the browser to the backend.
		 * This is important if the backend uses a session/auth cookie.
		 */
		const cookie = request.headers.get("cookie");

		const response = await fetch(`${API_URL}/api/logout`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				...(cookie ? { Cookie: cookie } : {}),
			},
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from logout server.",
			};
		}

		console.log("BACKEND LOGOUT RESPONSE:", data);

		/*
		 * Create response for the frontend.
		 */
		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		/*
		 * Forward Set-Cookie headers from backend.
		 * This allows the backend to clear the authentication
		 * cookie/session properly.
		 */
		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("Logout proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to logout server.",
			},
			{
				status: 500,
			},
		);
	}
}
