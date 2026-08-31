import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — CREATE ACCOUNT (NO OTP)
 *
 * Backend expects:
 *
 * POST /api/sinup   <-- kept exactly as given; confirm with backend
 *                        whether this is really "sinup" or a typo
 *                        for "signup".
 *
 * name
 * email
 * phone
 * password
 * reseller (yes / no)
 *
 * The frontend's reseller toggle can send true/false, "on"/"off",
 * "1"/"0", or "yes"/"no" — this route normalizes any of those to
 * the "yes"/"no" string the backend expects.
 */

function normalizeReseller(value: FormDataEntryValue | null): "yes" | "no" {
	if (value === null) {
		return "no";
	}

	const normalized = String(value).trim().toLowerCase();

	const truthy = ["yes", "true", "on", "1"];

	return truthy.includes(normalized) ? "yes" : "no";
}

export async function POST(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");

		/* =========================================================
           READ FORMDATA FROM FRONTEND
        ========================================================= */

		const formData = await request.formData();

		const name = formData.get("name");
		const email = formData.get("email");
		const phone = formData.get("phone");
		const password = formData.get("password");
		const reseller = normalizeReseller(formData.get("reseller"));

		if (
			!name ||
			typeof name !== "string" ||
			!email ||
			typeof email !== "string" ||
			!phone ||
			typeof phone !== "string" ||
			!password ||
			typeof password !== "string"
		) {
			return NextResponse.json(
				{
					status: 400,
					message: "name, email, phone, and password are required.",
				},
				{
					status: 400,
				},
			);
		}

		console.log("=================================");
		console.log("ADMIN SIGNUP PROXY");
		console.log("Name:", name);
		console.log("Email:", email);
		console.log("Phone:", phone);
		console.log("Reseller:", reseller);
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		/* =========================================================
           SEND FORMDATA TO BACKEND
        ========================================================= */

		const backendFormData = new FormData();

		backendFormData.append("name", name);
		backendFormData.append("email", email);
		backendFormData.append("phone", phone);
		backendFormData.append("password", password);
		backendFormData.append("reseller", reseller);

		const response = await fetch(`${API_URL}/api/sinup`, {
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
			console.error("INVALID SIGNUP RESPONSE:", text);

			data = {
				message: text || "Invalid response from signup server.",
			};
		}

		console.log("Backend Signup Status:", response.status);
		console.log("Backend Signup Response:", data);

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
		console.error("Admin signup proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to connect to signup server.",
			},
			{
				status: 500,
			},
		);
	}
}
