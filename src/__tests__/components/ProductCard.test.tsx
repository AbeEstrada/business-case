import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductCard from "@/components/ProductCard";
import type { ProductInterface } from "@/interfaces/Products";

jest.mock("next/link", () => {
	const MockLink = ({
		children,
		as,
		...props
	}: React.PropsWithChildren<{ as: string }>) => {
		return (
			<a {...props} href={as}>
				{children}
			</a>
		);
	};

	MockLink.displayName = "Link";

	return MockLink;
});

const mockProduct: ProductInterface = {
	id: 1,
	title: "Test",
	price: 1999.99,
	rating: 4.9,
	thumbnail: "https://example.com/thumbnail.jpg",
};

describe("ProductCard", () => {
	it("renders the loading skeleton when product is not provided", () => {
		render(<ProductCard />);

		const skeleton = screen.getByRole("presentation", { hidden: true });

		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass("animate-pulse");
	});

	it("renders product details and a correct link when a product is provided", () => {
		render(<ProductCard product={mockProduct} />);

		expect(screen.getByRole("heading", { name: "Test" })).toBeInTheDocument();

		expect(screen.getByText("Price: $1,999.99")).toBeInTheDocument();
		expect(screen.getByText("Rating: 4.9")).toBeInTheDocument();

		const image = screen.getByAltText("Test");
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute("src", "https://example.com/thumbnail.jpg");

		const link = screen.getByLabelText("View details for Test");
		expect(link).toHaveAttribute("href", `/product/${mockProduct.id}`);
	});
});
