import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — RESET USER PASSWORD (NO OTP)
 *
 * Backend expects:
 *
 * POST /api/forget
 * email
 * new_password
 */

export async function POST(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");

		/* =========================================================
           READ FORMDATA FROM FRONTEND
        ========================================================= */

		const formData = await request.formData();

		const email = formData.get("email");
		const newPassword = formData.get("new_password");

		if (
			!email ||
			typeof email !== "string" ||
			!newPassword ||
			typeof newPassword !== "string"
		) {
			return NextResponse.json(
				{
					status: 400,
					message: "email and new_password are required.",
				},
				{
					status: 400,
				},
			);
		}

		console.log("=================================");
		console.log("ADMIN FORGET PASSWORD PROXY");
		console.log("Email:", email);
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		/* =========================================================
           SEND FORMDATA TO BACKEND
        ========================================================= */

		const backendFormData = new FormData();

		backendFormData.append("email", email);
		backendFormData.append("new_password", newPassword);

		const response = await fetch(`${API_URL}/api/forget`, {
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
			console.error("INVALID FORGET RESPONSE:", text);

			data = {
				message: text || "Invalid response from password server.",
			};
		}

		console.log("Backend Forget Status:", response.status);
		console.log("Backend Forget Response:", data);

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
		console.error("Admin forget-password proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to connect to password server.",
			},
			{
				status: 500,
			},
		);
	}
}
