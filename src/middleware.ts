// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
// 	const { pathname } = request.nextUrl;

// 	// Define the routes you want to block for deployment
// 	const blockedRoutes = ["/admin","/secret-route/:path*", "/profile", "/wishlist", "/cart", "/login", "/register", "/forgot-password", "/reset-password", "/checkout", "/orders", "/order-tracking", "/settings"];

// 	// Check if the current path matches any blocked routes
// 	if (blockedRoutes.some((route) => pathname.startsWith(route))) {
// 		// Rewrite the URL internally to the 404 page
// 		return NextResponse.rewrite(new URL("/404", request.url));
// 	}

// 	return NextResponse.next();
// }

// // Optimize performance by only running middleware on specific paths
// export const config = {
// 	matcher: ["/admin/:path*", "/secret-route/:path*", "/test-page"],
// };
