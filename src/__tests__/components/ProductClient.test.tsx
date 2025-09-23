import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductClient from "@/components/ProductClient";

jest.mock("@/components/BarChart", () => {
	const BarChartMock = () => <div data-testid="bar-chart-mock"></div>;
	BarChartMock.displayName = "BarChart";
	return BarChartMock;
});

const mockUseSearchParams = jest.fn();
jest.mock("next/navigation", () => ({
	useSearchParams: () => mockUseSearchParams(),
}));

const mockProduct = {
	id: 1,
	title: "Test Product",
	category: "Electronics",
	price: 1000,
	images: ["image1.jpg", "image2.jpg"],
};

describe("ProductClient", () => {
	beforeEach(() => {
		mockUseSearchParams.mockReturnValue(new URLSearchParams());
		jest.spyOn(Math, "random").mockReturnValue(0.5);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should render the component with the initial product from props", () => {
		render(<ProductClient product={mockProduct} />);

		expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
		expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
		expect(screen.getByText("$1,000.00")).toBeInTheDocument();
	});

	it("should use product data from the search parameter if it exists and is valid", () => {
		const updatedProduct = {
			...mockProduct,
			title: "New Product",
			price: 1500,
		};

		mockUseSearchParams.mockReturnValue(
			new URLSearchParams({
				product: encodeURIComponent(JSON.stringify(updatedProduct)),
			}),
		);

		const { rerender } = render(<ProductClient product={mockProduct} />);

		act(() => {
			rerender(<ProductClient product={mockProduct} />);
		});

		expect(screen.getByText("New Product")).toBeInTheDocument();
		expect(screen.getByText("$1,500.00")).toBeInTheDocument();
	});

	it("should fall back to props if the search parameter is invalid JSON", () => {
		const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

		mockUseSearchParams.mockReturnValue(
			new URLSearchParams({ product: "invalid-json" }),
		);

		render(<ProductClient product={mockProduct} />);

		expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
		expect(screen.getByText("$1,000.00")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	it("should render the correct number of product images", () => {
		render(<ProductClient product={mockProduct} />);

		const images = screen.getAllByRole("img");
		expect(images).toHaveLength(mockProduct.images.length);
	});

	it("should render the BarChart component", () => {
		render(<ProductClient product={mockProduct} />);

		expect(screen.getByTestId("bar-chart-mock")).toBeInTheDocument();
	});
});
