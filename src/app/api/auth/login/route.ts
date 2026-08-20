import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		/*
		 * The frontend (LoginPage) sends JSON:
		 * { email, password }
		 */
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

		/*
		 * Backend expects FORM DATA, not JSON.
		 */
		const backendFormData = new FormData();

		backendFormData.append("email", email.trim().toLowerCase());
		backendFormData.append("password", password);

		console.log("FORWARDING LOGIN FORM DATA:", {
			email,
			password: "[HIDDEN]",
		});

		/*
		 * Browser
		 *   ↓
		 * /api/auth/login
		 *   ↓
		 * https://printinghouseujjain.in/api/login
		 */

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

		console.log("BACKEND LOGIN RESPONSE:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		/*
		 * Forward cookies from the backend.
		 *
		 * This is important if /api/login sets the
		 * authenticated session using a Set-Cookie header.
		 */
		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
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
