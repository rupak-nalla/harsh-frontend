import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

type RouteContext = {
	params: Promise<{ id: string }>;
};

async function forwardOrderRequest(
	request: NextRequest,
	orderId: string,
	method: "GET" | "POST",
	status?: string,
) {
	const cookie = request.headers.get("cookie");
	const backendFormData = new FormData();

	backendFormData.append("command_type", "admin");
	backendFormData.append("order_id", orderId);

	if (status) {
		backendFormData.append("order_status", status);
		backendFormData.append("status", status);
	}

	const response = await fetch(`${API_URL}/api/orders`, {
		method,
		headers: {
			Accept: "application/json",
			...(cookie ? { Cookie: cookie } : {}),
		},
		...(method === "POST" ? { body: backendFormData } : {}),
		cache: "no-store",
	});

	const text = await response.text();
	let data: unknown;

	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = { message: text || "Invalid response from orders server." };
	}

	const nextResponse = NextResponse.json(data, { status: response.status });
	const setCookie = response.headers.get("set-cookie");

	if (setCookie) {
		nextResponse.headers.set("set-cookie", setCookie);
	}

	return nextResponse;
}

export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		return await forwardOrderRequest(request, decodeURIComponent(id), "POST");
	} catch (error) {
		console.error("Admin order detail proxy error:", error);
		return NextResponse.json(
			{ message: "Unable to connect to orders server." },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const body = (await request.json().catch(() => ({}))) as {
			status?: string;
		};
		const status = body.status?.trim();

		if (!status) {
			return NextResponse.json(
				{ message: "status is required." },
				{ status: 400 },
			);
		}

		return await forwardOrderRequest(
			request,
			decodeURIComponent(id),
			"POST",
			status,
		);
	} catch (error) {
		console.error("Admin order status proxy error:", error);
		return NextResponse.json(
			{ message: "Unable to update order status." },
			{ status: 500 },
		);
	}
}
