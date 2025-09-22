import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RootLayout, { metadata } from "@/app/layout";

describe("RootLayout", () => {
	it("should render children inside the body tag", () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		render(
			<RootLayout>
				<main>
					<h1>Test</h1>
				</main>
			</RootLayout>,
		);

		const childElement = screen.getByText("Test");

		expect(childElement).toBeInTheDocument();

		consoleSpy.mockRestore();
	});
});

describe("Root Metadata", () => {
	it("should have the correct title", () => {
		expect(metadata.title).toBe("Business Case");
	});
});
