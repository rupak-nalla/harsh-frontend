import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://printinghouseujjain.in";

/* ============================================================================
   HELPERS
============================================================================ */

async function parseResponse(response: Response): Promise<unknown> {
	const text = await response.text();

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

function getMessage(data: unknown): string {
	if (
		data &&
		typeof data === "object" &&
		"message" in data &&
		typeof (data as { message?: unknown }).message === "string"
	) {
		return (data as { message: string }).message;
	}

	return "Request failed.";
}

/* ============================================================================
   GET
============================================================================ */

export async function GET(request: NextRequest) {
	try {
		const productId = request.nextUrl.searchParams.get("product_id");

		/*
		 * If product_id is provided:
		 * Send it to the backend as FormData.
		 */
		if (productId) {
			const formData = new FormData();

			formData.append("product_id", productId);

			const headers: HeadersInit = {
				Accept: "application/json",
			};

			/*
			 * Forward the browser cookie to the backend.
			 * This is useful if the backend uses authentication cookies.
			 */
			const cookie = request.headers.get("cookie");

			if (cookie) {
				headers.Cookie = cookie;
			}

			const response = await fetch(`${API_URL}/api/products`, {
				method: "POST",
				body: formData,
				cache: "no-store",
				headers,
			});

			const data = await parseResponse(response);

			const status = getLogicalStatus(data, response.status);

			return NextResponse.json(data, {
				status,
			});
		}

		/*
		 * No product_id → fetch all products.
		 */
		const headers: HeadersInit = {
			Accept: "application/json",
		};

		const cookie = request.headers.get("cookie");

		if (cookie) {
			headers.Cookie = cookie;
		}

		const response = await fetch(`${API_URL}/api/products`, {
			method: "GET",
			cache: "no-store",
			headers,
		});

		const data = await parseResponse(response);

		const status = getLogicalStatus(data, response.status);

		return NextResponse.json(data, {
			status,
		});
	} catch (error) {
		console.error("Products GET proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Failed to fetch products.",
			},
			{
				status: 500,
			},
		);
	}
}

/* ============================================================================
   POST
============================================================================ */

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		/*
		 * Expected request from admin UI:
		 *
		 * {
		 *   mode: "delete",
		 *   product_ids: [1, 2, 3],
		 *   command_type: "admin"
		 * }
		 */

		if (!body || typeof body !== "object") {
			return NextResponse.json(
				{
					status: 400,
					message: "Invalid request body.",
				},
				{
					status: 400,
				},
			);
		}

		const mode = body.mode;

		const commandType = body.command_type;

		const productIds = body.product_ids;

		/* ----------------------------------------------------------------------
		   VALIDATE MODE
		---------------------------------------------------------------------- */

		if (mode !== "delete") {
			return NextResponse.json(
				{
					status: 400,
					message: 'Invalid mode. Expected "delete".',
				},
				{
					status: 400,
				},
			);
		}

		/* ----------------------------------------------------------------------
		   VALIDATE COMMAND TYPE
		---------------------------------------------------------------------- */

		if (commandType !== "admin") {
			return NextResponse.json(
				{
					status: 400,
					message: 'Invalid command_type. Expected "admin".',
				},
				{
					status: 400,
				},
			);
		}

		/* ----------------------------------------------------------------------
		   VALIDATE PRODUCT IDS
		---------------------------------------------------------------------- */

		if (!Array.isArray(productIds) || productIds.length === 0) {
			return NextResponse.json(
				{
					status: 400,
					message: "At least one product ID is required.",
				},
				{
					status: 400,
				},
			);
		}

		/*
		 * Normalize IDs.
		 *
		 * This also removes duplicates.
		 */
		const normalizedProductIds = [
			...new Set(
				productIds
					.map((id: unknown) => {
						const numericId = Number(id);

						return Number.isInteger(numericId) && numericId > 0
							? numericId
							: null;
					})
					.filter((id): id is number => id !== null),
			),
		];

		if (normalizedProductIds.length === 0) {
			return NextResponse.json(
				{
					status: 400,
					message: "No valid product IDs were provided.",
				},
				{
					status: 400,
				},
			);
		}

		/* ----------------------------------------------------------------------
		   FORWARD AUTH COOKIE
		---------------------------------------------------------------------- */

		const cookie = request.headers.get("cookie");

		/* ----------------------------------------------------------------------
		   DELETE ONE BY ONE
		---------------------------------------------------------------------- */

		const deletedIds: number[] = [];
		const failed: {
			product_id: number;
			status: number;
			message: string;
			response: unknown;
		}[] = [];

		/*
		 * IMPORTANT:
		 *
		 * Do NOT use Promise.all here.
		 *
		 * The backend should receive:
		 *
		 * Request 1 → product 1
		 * Request 2 → product 2
		 * Request 3 → product 3
		 *
		 * one after another.
		 */

		for (const productId of normalizedProductIds) {
			try {
				const formData = new FormData();

				formData.append("mode", "delete");

				formData.append("product_id", String(productId));

				formData.append("command_type", "admin");

				const headers: HeadersInit = {
					Accept: "application/json",
				};

				if (cookie) {
					headers.Cookie = cookie;
				}

				console.log(`Deleting product ${productId}...`);

				const response = await fetch(`${API_URL}/api/products`, {
					method: "POST",
					body: formData,
					headers,
					cache: "no-store",
				});

				const data = await parseResponse(response);

				const status = getLogicalStatus(data, response.status);

				const succeeded = status >= 200 && status < 300;

				if (succeeded) {
					deletedIds.push(productId);

					console.log(`Product ${productId} deleted successfully.`);
				} else {
					failed.push({
						product_id: productId,
						status,
						message: getMessage(data),
						response: data,
					});

					console.error(`Failed to delete product ${productId}:`, data);
				}
			} catch (error) {
				console.error(`Delete product ${productId} failed:`, error);

				failed.push({
					product_id: productId,
					status: 500,
					message: error instanceof Error ? error.message : "Unknown error.",
					response: null,
				});
			}
		}

		/* ----------------------------------------------------------------------
		   FINAL RESPONSE
		---------------------------------------------------------------------- */

		/*
		 * Everything succeeded.
		 */
		if (failed.length === 0) {
			return NextResponse.json(
				{
					status: 200,
					message: "Products deleted successfully.",
					deleted_ids: deletedIds,
					failed: [],
				},
				{
					status: 200,
				},
			);
		}

		/*
		 * Some products succeeded and some failed.
		 */
		if (deletedIds.length > 0) {
			return NextResponse.json(
				{
					status: 207,
					message: "Some products were deleted, but some deletions failed.",
					deleted_ids: deletedIds,
					failed,
				},
				{
					status: 207,
				},
			);
		}

		/*
		 * Nothing was deleted.
		 */
		return NextResponse.json(
			{
				status: 400,
				message: "Unable to delete the selected products.",
				deleted_ids: [],
				failed,
			},
			{
				status: 400,
			},
		);
	} catch (error) {
		console.error("Products POST proxy error:", error);

		return NextResponse.json(
			{
				status: 500,
				message: "Failed to process product request.",
			},
			{
				status: 500,
			},
		);
	}
}
