import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

export async function POST(request: NextRequest) {
	try {
		/*
		 * Read the incoming multipart/form-data.
		 */
		const incomingFormData = await request.formData();

		/*
		 * Create a new FormData for the actual backend.
		 */
		const formData = new FormData();

		const fields = [
			"primary",
			"flat_house_building",
			"road_area_colony",
			"landmark",
			"city",
			"state",
			"pincode",
			"phone",
		];

		for (const field of fields) {
			const value = incomingFormData.get(field);

			if (value !== null) {
				formData.append(field, String(value));
			}
		}

		console.log(
			"FORWARDING ADDRESS FORM DATA:",
			Object.fromEntries(formData.entries()),
		);

		const response = await fetch(`${API_URL}/api/add_address`, {
			method: "POST",
			headers: {
				Accept: "application/json",

				/*
				 * Forward the user's authentication cookie.
				 */
				Cookie: request.headers.get("cookie") || "",
			},
			body: formData,
			cache: "no-store",
		});

		const text = await response.text();

		let data: unknown;

		try {
			data = JSON.parse(text);
		} catch {
			data = {
				message: text || "Invalid response from address server.",
			};
		}

		console.log("BACKEND ADD ADDRESS RESPONSE:", data);

		const nextResponse = NextResponse.json(data, {
			status: response.status,
		});

		/*
		 * Forward backend cookies if it sends any.
		 */
		const setCookie = response.headers.get("set-cookie");

		if (setCookie) {
			nextResponse.headers.set("set-cookie", setCookie);
		}

		return nextResponse;
	} catch (error) {
		console.error("Add address proxy error:", error);

		return NextResponse.json(
			{
				message: "Unable to connect to address server.",
			},
			{
				status: 500,
			},
		);
	}
}
