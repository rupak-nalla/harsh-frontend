import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — LIST OCCASIONS
 *
 * Backend expects:
 *
 * POST /api/occasions
 * command_type=admin
 *
 * The frontend just calls GET on this proxy (no body needed) —
 * this route builds the command_type form field internally and
 * forwards it to the backend as a POST.
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
		console.log("ADMIN OCCASIONS PROXY");
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		const response = await fetch(`${API_URL}/api/occasions`, {
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
			console.error("INVALID OCCASIONS RESPONSE:", text);

			data = {
				message: text || "Invalid response from occasions server.",
			};
		}

		console.log("Backend Occasions Status:", response.status);
		console.log("Backend Occasions Response:", data);

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
		console.error("Admin occasions proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to connect to occasions server.",
			},
			{
				status: 500,
			},
		);
	}
}
