import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

jest.mock("@/context/Products", () => ({
	ProductsProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="products-provider-mock">{children}</div>
	),
}));

jest.mock("@/components/ProductsList", () => {
	return () => <div data-testid="products-list-mock" />;
});
jest.mock("@/components/SearchInput", () => {
	return () => <div data-testid="search-input-mock" />;
});
jest.mock("@/components/CategoriesSelect", () => ({
	CategorySelect: () => <div data-testid="category-select-mock" />,
}));
jest.mock("@/components/SortSelect", () => ({
	SortSelect: () => <div data-testid="sort-select-mock" />,
}));
jest.mock("@/components/OrderSelect", () => ({
	OrderSelect: () => <div data-testid="order-select-mock" />,
}));
jest.mock("@/components/Pagination", () => {
	return () => <div data-testid="pagination-mock" />;
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
