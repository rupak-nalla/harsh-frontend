import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getForwardHeaders(request: NextRequest) {
	const headers = new Headers();

	const cookie = request.headers.get("cookie");
	const authorization = request.headers.get("authorization");

	if (cookie) {
		headers.set("cookie", cookie);
	}

	if (authorization) {
		headers.set("authorization", authorization);
	}

	return headers;
}

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		// Server-side file-size validation.
		for (const [, value] of formData.entries()) {
			if (value instanceof File && value.size > MAX_FILE_SIZE) {
				return NextResponse.json(
					{
						status: 400,
						message: "Image size must not exceed 10 MB.",
					},
					{ status: 400 },
				);
			}
		}

		const response = await fetch(`${API_URL}/api/home_content_update`, {
			method: "POST",
			body: formData,
			headers: getForwardHeaders(request),
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown = {};

		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			data = {
				message: text || "Unexpected response from the server.",
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

		return NextResponse.json(data, {
			status,
			headers: {
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Home content update proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Unable to update store content.",
			},
			{ status: 500 },
		);
	}
}
