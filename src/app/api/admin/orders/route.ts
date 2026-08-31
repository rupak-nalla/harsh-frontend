import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/*
 * ADMIN — LIST ALL ORDERS
 *
 * NOTE:
 *
 * This endpoint was not explicitly confirmed. It's inferred from
 * the same pattern as /api/admin/users and /api/admin/occasions —
 * hitting the existing backend route (/api/orders) with
 * command_type=admin instead of relying on the requesting user's
 * cookie session, on the assumption the backend switches between
 * "my orders" and "all orders" the same way /api/products
 * switches between a single product_id and a command_type.
 *
 * Confirm with the backend team and adjust the endpoint / field
 * name if this assumption is wrong.
 */

export async function GET(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");

		const backendFormData = new FormData();

		backendFormData.append("command_type", "admin");

		console.log("=================================");
		console.log("ADMIN ORDERS PROXY");
		console.log("Has Cookie:", Boolean(cookie));
		console.log("=================================");

		const response = await fetch(`${API_URL}/api/orders`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				...(cookie ? { Cookie: cookie } : {}),
			},
			body: backendFormData,
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			console.error("INVALID ADMIN ORDERS RESPONSE:", text);

			data = {
				message: text || "Invalid response from orders server.",
			};
		}

		console.log("Backend Admin Orders Status:", response.status);
		console.log("Backend Admin Orders Response:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}
        console.log(nextResponse);
		return nextResponse;
	} catch (error) {
		console.error("Admin orders proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to connect to orders server.",
			},
			{
				status: 500,
			},
		);
	}
}
