import { renderHook } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProduct";
import { ProductsProvider, useProductsContext } from "@/context/Products";
import type { ReadonlyURLSearchParams } from "next/navigation";

jest.mock("next/navigation");
jest.mock("@/hooks/useProduct");

describe("ProductsContext", () => {
	const mockUseSearchParams = useSearchParams as jest.MockedFunction<
		typeof useSearchParams
	>;
	const mockUseProducts = useProducts as jest.MockedFunction<
		typeof useProducts
	>;

	const mockProducts = [{ id: 1, title: "Product 1" }];

	const createMockSearchParams = (
		params: Record<string, string> = {},
	): ReadonlyURLSearchParams => {
		const searchParams = new URLSearchParams(params);
		return {
			get: jest.fn((name: string) => searchParams.get(name)),
			getAll: jest.fn((name: string) => searchParams.getAll(name)),
			has: jest.fn((name: string) => searchParams.has(name)),
			forEach: jest.fn((callback) => searchParams.forEach(callback)),
			entries: jest.fn(() => searchParams.entries()),
			keys: jest.fn(() => searchParams.keys()),
			values: jest.fn(() => searchParams.values()),
			toString: jest.fn(() => searchParams.toString()),
			append: jest.fn(),
			delete: jest.fn(),
			set: jest.fn(),
			sort: jest.fn(),
			size: searchParams.size,
			[Symbol.iterator]: jest.fn(() => searchParams[Symbol.iterator]()),
		};
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockUseProducts.mockReturnValue({
			products: mockProducts,
			loading: false,
			error: null,
			hasLoaded: true,
		});
	});

	it("provides products context values", () => {
		const searchParams = createMockSearchParams({
			q: "red",
			category: "beauty",
			page: "1",
			sort: "price",
			order: "asc",
			limit: "10",
			delay: "100",
		});
		mockUseSearchParams.mockReturnValue(searchParams);

		const { result } = renderHook(() => useProductsContext(), {
			wrapper: ProductsProvider,
		});

		expect(result.current.products).toEqual(mockProducts);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(result.current.hasLoaded).toBe(true);

		expect(mockUseProducts).toHaveBeenCalledWith({
			q: "red",
			category: "beauty",
			page: "1",
			sort: "price",
			order: "asc",
			limit: "10",
			delay: "100",
		});
	});

	it("throws error when used outside provider", () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => {
			renderHook(() => useProductsContext());
		}).toThrow("useProductsContext must be used within a ProductsProvider");

		consoleSpy.mockRestore();
	});
});
