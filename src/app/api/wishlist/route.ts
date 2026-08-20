import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function GET(request: NextRequest) {
	try {
		/*
		 * Forward the incoming session cookie so the backend
		 * knows which user's wishlist to return.
		 */
		const incomingCookie = request.headers.get("cookie");

		const response = await fetch(`${API_URL}/api/wishlist`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				...(incomingCookie ? { Cookie: incomingCookie } : {}),
			},
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from wishlist server.",
			};
		}

		console.log("BACKEND WISHLIST RESPONSE:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("Wishlist fetch proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to wishlist server.",
			},
			{
				status: 500,
			},
		);
	}
}
