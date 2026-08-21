import { NextRequest, NextResponse } from "next/server";

const BLOCKED_ROUTES = [
	"/login",
	"/admin",
	"/checkout",
	"/cart",
	"/register",
	"/forgot-password",
	"/profile",
	"/orders",
	"/order-tracking",
];

export function proxy(request: NextRequest) {
	// Allow all routes during local development
	if (process.env.NODE_ENV !== "production") {
		return NextResponse.next();
	}

	const pathname = request.nextUrl.pathname;

	const isBlocked = BLOCKED_ROUTES.some(
		(route) =>
			pathname === route ||
			pathname.startsWith(`${route}/`)
	);

	if (isBlocked) {
		return new NextResponse(null, {
		status: 404,
		});
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/login/:path*",
		"/admin/:path*",
		"/checkout/:path*",
		"/cart/:path*",
		"/register/:path*",
		"/forgot-password/:path*",
		"/profile/:path*",
		"/orders/:path*",
		"/order-tracking/:path*",
	],
};