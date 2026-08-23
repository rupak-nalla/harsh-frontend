import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function GET(request: NextRequest) {
	try {
		const response = await fetch(`${API_URL}/api/user`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Cookie: request.headers.get("cookie") || "",
			},
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from user server.",
			};
		}

		console.log("BACKEND USER RESPONSE:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		/*
		 * Forward Set-Cookie headers from backend.
		 * This is important if the backend uses a session cookie.
		 */
		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("User proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to user server.",
			},
			{
				status: 500,
			},
		);
	}
}
