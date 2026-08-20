import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "printinghouseujjain.in",
				pathname: "/assets/**",
			},
		],
	},
};

export default nextConfig;
