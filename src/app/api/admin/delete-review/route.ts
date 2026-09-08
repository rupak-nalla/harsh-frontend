import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const reviewId = String(formData.get("review_id") ?? "").trim();

		if (!reviewId) {
			return NextResponse.json(
				{
					status: 400,
					message: "review_id is required.",
				},
				{ status: 400 },
			);
		}

		// Always enforce admin mode server-side.
		formData.set("review_id", reviewId);
		formData.set("command_type", "admin");

		const headers = new Headers();
		const cookie = request.headers.get("cookie");
		const authorization = request.headers.get("authorization");

		if (cookie) headers.set("cookie", cookie);
		if (authorization) headers.set("authorization", authorization);

		const response = await fetch(`${API_URL}/api/delete_review`, {
			method: "POST",
			body: formData,
			headers,
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown = {};

		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			data = {
				message: text || "Unexpected response from server.",
			};
		}

		let status = response.status;

		if (
			data &&
			typeof data === "object" &&
			"status" in data &&
			typeof (data as { status?: unknown }).status === "number"
		) {
			status = (data as { status: number }).status;
		}

		if (status < 200 || status >= 600) {
			status = response.ok ? 200 : response.status;
		}

		if (status === 204 || status === 205) {
			return new NextResponse(null, {
				status,
				headers: {
					"Cache-Control": "no-store",
				},
			});
		}

		return NextResponse.json(data, {
			status,
			headers: {
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Delete review proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to delete review.",
			},
			{ status: 500 },
		);
	}
}
