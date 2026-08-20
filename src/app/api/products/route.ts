import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function GET(request: NextRequest) {
	try {
		const productId = request.nextUrl.searchParams.get("product_id");

		/*
		 * If product_id is provided:
		 * Send it to the backend as FormData.
		 *
		 * If product_id is not provided:
		 * Fetch all products normally.
		 */
		if (productId) {
			const formData = new FormData();

			formData.append("product_id", productId);

			const response = await fetch(`${API_URL}/api/products`, {
				method: "POST",
				body: formData,
				cache: "no-store",
				headers: {
					Accept: "application/json",
				},
			});

			const text = await response.text();

			let data: unknown;

			try {
				data = JSON.parse(text);
			} catch {
				data = {
					message: text || "Invalid response from product server.",
				};
			}

			return NextResponse.json(data, {
				status: response.status,
			});
		}

		/*
		 * No product_id → fetch all products.
		 */
		const response = await fetch(`${API_URL}/api/products`, {
			method: "GET",
			cache: "no-store",
			headers: {
				Accept: "application/json",
			},
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from product server.",
			};
		}

		return NextResponse.json(data, {
			status: response.status,
		});
	} catch (error) {
		console.error("Products proxy error:", error);

		return NextResponse.json(
			{
				message: "Failed to fetch products",
			},
			{
				status: 500,
			},
		);
	}
}
