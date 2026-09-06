import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const cookie = request.headers.get("cookie");
		const backendFormData = new FormData();
		backendFormData.append("command_type", "admin");
		backendFormData.append("product_id", decodeURIComponent(id));

		const response = await fetch(`${API_URL}/api/products`, {
			method: "POST",
			headers: { Accept: "application/json", ...(cookie ? { Cookie: cookie } : {}) },
			body: backendFormData,
			cache: "no-store",
		});

		const text = await response.text();
		let data: unknown;
		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			data = { message: text || "Invalid product response." };
		}
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Admin product proxy error:", error);
		return NextResponse.json({ message: "Unable to load product." }, { status: 500 });
	}
}
