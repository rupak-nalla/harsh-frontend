import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — LIST OCCASIONS (GET)
 * ADMIN — CREATE/EDIT/DELETE OCCASIONS (POST)
 *
 * Backend expects:
 *
 * GET: POST /api/occasions
 *      command_type=admin
 *
 * CREATE: POST /api/occasions
 *         command_type=admin
 *         mode=new
 *         name=...
 *         Icon=... (file)
 *
 * EDIT: POST /api/occasions
 *       command_type=admin
 *       mode=edit
 *       id=...
 *       name=...
 *       Icon=... (file, optional)
 *
 * DELETE: POST /api/occasions
 *         command_type=admin
 *         mode=delete
 *         Id=...
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
		console.log("ADMIN OCCASIONS PROXY (GET)");
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

/*
 * ADMIN — CREATE/EDIT/DELETE OCCASIONS
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
		console.log("ADMIN OCCASIONS PROXY (POST)");
		console.log("Mode:", mode);
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		/* =========================================================
           FORWARD TO BACKEND
        ========================================================= */

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
				message: "Unable to process occasions request.",
			},
			{
				status: 500,
			},
		);
	}
}
