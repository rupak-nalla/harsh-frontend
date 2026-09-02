import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — LIST CATEGORIES (GET)
 * ADMIN — CREATE/EDIT/DELETE CATEGORIES (POST)
 *
 * Same pattern as occasions — supports mode=new, mode=edit, mode=delete
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
		console.log("ADMIN CATEGORIES PROXY (GET)");
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

/*
 * ADMIN — CREATE/EDIT/DELETE CATEGORIES
 */

export async function POST(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");
		const contentType = request.headers.get("content-type");

		/* =========================================================
           READ INCOMING REQUEST
        ========================================================= */

		let backendFormData: FormData;

		if (contentType?.includes("application/x-www-form-urlencoded")) {
			const text = await request.text();
			backendFormData = new FormData();

			const params = new URLSearchParams(text);
			for (const [key, value] of params) {
				backendFormData.append(key, value);
			}

			backendFormData.set("command_type", "admin");
		} else if (contentType?.includes("multipart/form-data")) {
			backendFormData = await request.formData();
			backendFormData.set("command_type", "admin");
		} else {
			const body = await request.json();

			backendFormData = new FormData();

			for (const [key, value] of Object.entries(body)) {
				if (value instanceof File) {
					backendFormData.append(key, value);
				} else if (Array.isArray(value)) {
					for (const item of value) {
						backendFormData.append(`${key}[]`, item);
					}
				} else if (value !== null && value !== undefined) {
					backendFormData.append(key, String(value));
				}
			}

			backendFormData.set("command_type", "admin");
		}

		const mode = backendFormData.get("mode");

		console.log("=================================");
		console.log("ADMIN CATEGORIES PROXY (POST)");
		console.log("Mode:", mode);
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		/* =========================================================
           FORWARD TO BACKEND
        ========================================================= */

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
				message: "Unable to process categories request.",
			},
			{
				status: 500,
			},
		);
	}
}