import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Business Case",
	description:
		"Explore our test product catalog powered by DummyJSON. Browse dummy data for smartphones, laptops, fragrances, and more to test your e-commerce application.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
