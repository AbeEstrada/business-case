import { renderHook, waitFor } from "@testing-library/react";
import { useProducts, cache } from "@/hooks/useProduct";
import type { ProductsInterface } from "@/interfaces/Products";

const mockData: ProductsInterface = {
	products: [
		{ id: 1, title: "Product 1", price: 100 },
		{ id: 2, title: "Product 2", price: 50 },
	],
	total: 1,
	skip: 0,
	limit: 10,
};

beforeAll(() => {
	global.fetch = jest.fn();
});

afterEach(() => {
	cache.clear();
	jest.clearAllMocks();
});

describe("useProducts", () => {
	it("should fetch products successfully without any parameters", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() => useProducts({}));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toEqual(mockData);
			expect(result.current.error).toBeNull();
			expect(result.current.hasLoaded).toBe(true);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith("/api/products", expect.any(Object));
	});

	it("should build the correct search URL when parameters are provided", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() =>
			useProducts({ q: "red", category: "beauty" }),
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			"/api/products/search?q=red&category=beauty",
			expect.any(Object),
		);
	});

	it("should set an error state after exhausting all retries on failure", async () => {
		const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

		(global.fetch as jest.Mock).mockResolvedValue({
			ok: false,
		});

		const { result } = renderHook(() => useProducts({}));

		await waitFor(
			() => {
				expect(result.current.error).not.toBeNull();
			},
			{ timeout: 5000 },
		);

		expect(result.current.loading).toBe(false);
		expect(result.current.data).toBe(undefined);
		expect(result.current.error).toBe("Failed to fetch products.");

		expect(fetch).toHaveBeenCalledTimes(4);

		consoleSpy.mockRestore();
	});

	it("should return cached data when called again with the same parameters", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const params = { q: "test" };

		const { result: firstRender } = renderHook(() => useProducts(params));

		await waitFor(() => {
			expect(firstRender.current.loading).toBe(false);
		});
		expect(fetch).toHaveBeenCalledTimes(1);

		const { result: secondRender } = renderHook(() => useProducts(params));

		await waitFor(() => {
			expect(secondRender.current.loading).toBe(false);
			expect(secondRender.current.data).toEqual(mockData);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
	});
});
