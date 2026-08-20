import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => null);

		const productId = body?.productId ?? body?.product_id;
		const quantity = body?.quantity;

		if (
			productId === undefined ||
			productId === null ||
			String(productId).trim() === ""
		) {
			return NextResponse.json(
				{
					message: "Missing required product id.",
				},
				{
					status: 400,
				},
			);
		}

		/*
		 * quantity is optional.
		 *
		 * undefined → backend default (+1)
		 * 0         → remove product
		 * 1         → set quantity to 1
		 * 2         → set quantity to 2
		 * etc.
		 */
		if (
			quantity !== undefined &&
			(typeof quantity !== "number" ||
				!Number.isFinite(quantity) ||
				quantity < 0 ||
				!Number.isInteger(quantity))
		) {
			return NextResponse.json(
				{
					message: "Invalid quantity.",
				},
				{
					status: 400,
				},
			);
		}

		const backendFormData = new FormData();

		backendFormData.append("product_id", String(productId));

		/*
		 * Only send quantity when explicitly provided.
		 *
		 * This is important because:
		 *
		 * no quantity → backend's default +1
		 * quantity 0   → backend receives 0
		 */
		if (quantity !== undefined) {
			backendFormData.append("quantity", String(quantity));
		}

		console.log("FORWARDING ADD TO CART:", {
			product_id: String(productId),
			quantity:
				quantity === undefined ? "(not set — backend default)" : quantity,
		});

		const incomingCookie = request.headers.get("cookie");

		const response = await fetch(`${API_URL}/api/add_to_cart`, {
			method: "POST",
			body: backendFormData,
			headers: {
				Accept: "application/json",
				...(incomingCookie ? { Cookie: incomingCookie } : {}),
			},
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from cart server.",
			};
		}

		console.log("BACKEND ADD TO CART RESPONSE:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		/*
		 * Forward updated session cookie.
		 */
		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("Add to cart proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to cart server.",
			},
			{
				status: 500,
			},
		);
	}
}
