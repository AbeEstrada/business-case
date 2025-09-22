import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductsList from "@/components/ProductsList";
import { useProductsContext } from "@/context/Products";
import type { ProductsInterface } from "@/interfaces/Products";

jest.mock("@/components/ProductCard", () => {
	const Card = ({ product }: { product?: { title: string } }) => (
		<div data-testid="product-card">
			{product ? product.title : "Loading Skeleton"}
		</div>
	);
	Card.displayName = "ProductCard";
	return Card;
});

jest.mock("@/context/Products", () => ({
	useProductsContext: jest.fn(),
}));

describe("ProductsList", () => {
	it("renders skeletons while loading", () => {
		(useProductsContext as jest.Mock).mockReturnValue({
			loading: true,
			hasLoaded: false,
			data: {} as ProductsInterface,
			error: null,
		});

		render(<ProductsList />);

		const skeletons = screen.getAllByText("Loading Skeleton");
		expect(skeletons).toHaveLength(12);
	});

	it("renders an error message when an error occurs", () => {
		const errorMessage = "Failed to fetch products";
		(useProductsContext as jest.Mock).mockReturnValue({
			loading: false,
			hasLoaded: true,
			data: {} as ProductsInterface,
			error: errorMessage,
		});

		render(<ProductsList />);

		expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
	});

	it('renders "No products found" when the products array is empty', () => {
		(useProductsContext as jest.Mock).mockReturnValue({
			loading: false,
			hasLoaded: true,
			data: {
				products: [],
				total: 0,
				skip: 0,
				limit: 10,
			} as ProductsInterface,
			error: null,
		});

		render(<ProductsList />);

		expect(screen.getByText("No products found.")).toBeInTheDocument();
	});

	it("renders the list of products when data is available", () => {
		const mockData = {
			products: [
				{ id: 1, title: "Test" },
				{ id: 2, title: "Product" },
			],
			total: 1,
			skip: 0,
			limit: 10,
		};
		(useProductsContext as jest.Mock).mockReturnValue({
			loading: false,
			hasLoaded: true,
			data: mockData,
			error: null,
		});

		render(<ProductsList />);

		expect(screen.getAllByTestId("product-card")).toHaveLength(2);
		expect(screen.getByText("Test")).toBeInTheDocument();
		expect(screen.getByText("Product")).toBeInTheDocument();
	});
});
