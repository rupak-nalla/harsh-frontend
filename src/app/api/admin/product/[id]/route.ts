import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

type RouteContext = {
	params: Promise<{ id: string }>;
};

function parseBackendResponse(text: string): unknown {
	if (!text) {
		return {};
	}

	try {
		return JSON.parse(text);
	} catch {
		return {
			message: text,
		};
	}
}

function getLogicalStatus(data: unknown, fallbackStatus: number): number {
	if (
		data &&
		typeof data === "object" &&
		"status" in data &&
		typeof (data as { status?: unknown }).status === "number"
	) {
		const status = (data as { status: number }).status;

		if (status >= 100 && status <= 599) {
			return status;
		}
	}

	if (
		data &&
		typeof data === "object" &&
		"success" in data &&
		(data as { success?: unknown }).success === false
	) {
		return fallbackStatus >= 400 ? fallbackStatus : 400;
	}

	return fallbackStatus;
}

function forwardSetCookie(
	sourceResponse: Response,
	nextResponse: NextResponse,
) {
	const setCookie = sourceResponse.headers.get("set-cookie");

	if (setCookie) {
		nextResponse.headers.set("set-cookie", setCookie);
	}
}

export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;

		const productId = decodeURIComponent(id);
		const cookie = request.headers.get("cookie");

		if (!productId) {
			return NextResponse.json(
				{
					status: 400,
					message: "Product ID is required.",
				},
				{ status: 400 },
			);
		}

		const backendFormData = new FormData();

		backendFormData.append("command_type", "admin");
		backendFormData.append("product_id", productId);

		const response = await fetch(`${API_URL}/api/products`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				...(cookie ? { Cookie: cookie } : {}),
			},
			body: backendFormData,
			cache: "no-store",
		});

		const text = await response.text();
		const data = parseBackendResponse(text);

		const status = getLogicalStatus(data, response.status);

		const nextResponse = NextResponse.json(data, {
			status,
		});

		forwardSetCookie(response, nextResponse);

		return nextResponse;
	} catch (error) {
		console.error("Admin product proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to load product.",
			},
			{ status: 500 },
		);
	}
}
