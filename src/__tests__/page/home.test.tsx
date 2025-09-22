import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

jest.mock("@/context/Products", () => ({
	ProductsProvider: ({ children }: { children: React.ReactNode }) => {
		return <div data-testid="products-provider-mock">{children}</div>;
	},
}));

jest.mock("@/components/ProductsList", () => {
	const ProductsList = () => <div data-testid="products-list-mock" />;
	ProductsList.displayName = "ProductsList";
	return ProductsList;
});

jest.mock("@/components/SearchInput", () => {
	const SearchInput = () => <div data-testid="search-input-mock" />;
	SearchInput.displayName = "SearchInput";
	return SearchInput;
});

jest.mock("@/components/CategoriesSelect", () => {
	const CategorySelect = () => <div data-testid="category-select-mock" />;
	CategorySelect.displayName = "CategorySelect";
	return { CategorySelect };
});

jest.mock("@/components/SortSelect", () => {
	const SortSelect = () => <div data-testid="sort-select-mock" />;
	SortSelect.displayName = "SortSelect";
	return { SortSelect };
});

jest.mock("@/components/OrderSelect", () => {
	const OrderSelect = () => <div data-testid="order-select-mock" />;
	OrderSelect.displayName = "OrderSelect";
	return { OrderSelect };
});

jest.mock("@/components/Pagination", () => {
	const Pagination = () => <div data-testid="pagination-mock" />;
	Pagination.displayName = "Pagination";
	return Pagination;
});

describe("Home Page", () => {
	it("renders all necessary components and layout elements", () => {
		render(<Home />);

		const mainElement = screen.getByRole("main");
		expect(mainElement).toBeInTheDocument();

		expect(screen.getByTestId("products-provider-mock")).toBeInTheDocument();
		expect(screen.getByTestId("products-list-mock")).toBeInTheDocument();
		expect(screen.getByTestId("search-input-mock")).toBeInTheDocument();
		expect(screen.getByTestId("category-select-mock")).toBeInTheDocument();
		expect(screen.getByTestId("sort-select-mock")).toBeInTheDocument();
		expect(screen.getByTestId("order-select-mock")).toBeInTheDocument();
		expect(screen.getByTestId("pagination-mock")).toBeInTheDocument();

		expect(mainElement).toHaveClass("max-w-5xl mx-auto");
	});
});
