import { renderHook, waitFor } from "@testing-library/react";
import { useCategories, cache } from "@/hooks/useCategories";
import type { CategoryInterface } from "@/interfaces/Category";

const mockCategories: CategoryInterface[] = [
	{ slug: "beauty", name: "Beauty", url: "/category/beauty" },
	{ slug: "fragrances", name: "Fragrances", url: "/category/fragrances" },
];

beforeAll(() => {
	global.fetch = jest.fn();
});

afterEach(() => {
	cache.clear();
	jest.clearAllMocks();
});

describe("useCategories", () => {
	it("should fetch categories and set state correctly on success", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockCategories),
		});

		const { result } = renderHook(() => useCategories());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.categories).toEqual(mockCategories);
			expect(result.current.error).toBeNull();
		});

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith("/api/categories");
	});

	it("should set the error state on fetch failure", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
		});

		const { result } = renderHook(() => useCategories());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe("Failed to fetch categories.");
			expect(result.current.categories).toEqual([]);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("should return cached data on a second call", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockCategories),
		});

		const { result: firstRenderResult } = renderHook(() => useCategories());

		await waitFor(() => {
			expect(firstRenderResult.current.loading).toBe(false);
		});
		expect(fetch).toHaveBeenCalledTimes(1);

		const { result: secondRenderResult } = renderHook(() => useCategories());

		await waitFor(() => {
			expect(secondRenderResult.current.loading).toBe(false);
			expect(secondRenderResult.current.categories).toEqual(mockCategories);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
	});
});
