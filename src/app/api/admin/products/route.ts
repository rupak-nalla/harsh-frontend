import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — LIST ALL PRODUCTS
 *
 * Backend expects:
 *
 * POST /api/products
 * command_type=<value>
 *
 * NOTE:
 *
 * The spec only said "command_type" for this endpoint without
 * confirming what value it expects. Defaulting to "admin" to
 * match the other admin endpoints (users, occasions) — override
 * with ?command_type=whatever if the backend actually wants
 * something else, e.g. "all" or "admin_list".
 *
 * This reuses the same backend route (/api/products) as the
 * customer-facing single-product proxy, just with a different
 * command_type instead of a product_id, so it returns the full
 * admin listing rather than one product.
 */

export async function GET(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");

		const commandType =
			request.nextUrl.searchParams.get("command_type") || "admin";

		/* =========================================================
           BUILD BACKEND REQUEST
        ========================================================= */

		const backendFormData = new FormData();

		backendFormData.append("command_type", commandType);

		console.log("=================================");
		console.log("ADMIN PRODUCTS PROXY");
		console.log("Command Type:", commandType);
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		const response = await fetch(`${API_URL}/api/products`, {
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
			console.error("INVALID ADMIN PRODUCTS RESPONSE:", text);

			data = {
				message: text || "Invalid response from products server.",
			};
		}

		console.log("Backend Admin Products Status:", response.status);
		console.log("Backend Admin Products Response:", data);

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
		console.error("Admin products proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to connect to products server.",
			},
			{
				status: 500,
			},
		);
	}
}
