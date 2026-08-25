import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function GET(request: NextRequest) {
	try {
		const cookie = request.headers.get("cookie");

		const response = await fetch(`${API_URL}/api/init`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				...(cookie ? { Cookie: cookie } : {}),
			},
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			console.error("INVALID INIT RESPONSE:", text);

			data = {
				message: text || "Invalid response from init server.",
			};
		}

		console.log("BACKEND INIT RESPONSE:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("Init proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to init server.",
			},
			{
				status: 500,
			},
		);
	}
}
