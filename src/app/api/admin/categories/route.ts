import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — LIST CATEGORIES
 *
 * Backend expects:
 *
 * POST /api/categories
 * command_type=admin
 *
 * Same pattern as /api/admin/users and /api/admin/occasions —
 * the frontend calls GET on this proxy (no body needed), and this
 * route builds the command_type form field internally before
 * forwarding to the backend as a POST.
 */

export async function GET(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");

		/* =========================================================
           BUILD BACKEND REQUEST
        ========================================================= */

		const backendFormData = new FormData();

		backendFormData.append("command_type", "admin");

		console.log("=================================");
		console.log("ADMIN CATEGORIES PROXY");
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		const response = await fetch(`${API_URL}/api/categories`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				...(cookie ? { Cookie: cookie } : {}),
			},
			body: backendFormData,
			cache: "no-store",
		});

		/* =========================================================
           READ BACKEND RESPONSE
        ========================================================= */

		const text = await response.text();

		let data: unknown;

		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			console.error("INVALID CATEGORIES RESPONSE:", text);

			data = {
				message: text || "Invalid response from categories server.",
			};
		}

		console.log("Backend Categories Status:", response.status);
		console.log("Backend Categories Response:", data);

		/* =========================================================
           RETURN RESPONSE TO FRONTEND
        ========================================================= */

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("Admin categories proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to connect to categories server.",
			},
			{
				status: 500,
			},
		);
	}
}
    