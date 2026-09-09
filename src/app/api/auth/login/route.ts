import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => null);

		const email = body?.email;
		const password = body?.password;

		if (typeof email !== "string" || typeof password !== "string") {
			return NextResponse.json(
				{
					message: "Missing required login fields.",
				},
				{
					status: 400,
				},
			);
		}

		// Backend expects multipart/form-data
		const backendFormData = new FormData();

		backendFormData.append("email", email.trim().toLowerCase());
		backendFormData.append("password", password);

		const response = await fetch(`${API_URL}/api/login`, {
			method: "POST",
			body: backendFormData,
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from login server.",
			};
		}

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		/*
		 * Forward ALL Set-Cookie headers from the backend.
		 */
		const setCookies =
			typeof response.headers.getSetCookie === "function"
				? response.headers.getSetCookie()
				: [];

		if (setCookies.length > 0) {
			for (const cookie of setCookies) {
				nextResponse.headers.append("Set-Cookie", cookie);
			}
		} else {
			/*
			 * Fallback for environments where getSetCookie()
			 * isn't available.
			 */
			const setCookie = response.headers.get("set-cookie");

			if (setCookie) {
				nextResponse.headers.set("Set-Cookie", setCookie);
			}
		}

		return nextResponse;
	} catch (error) {
		console.error("Login proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to login server.",
			},
			{
				status: 500,
			},
		);
	}
}
