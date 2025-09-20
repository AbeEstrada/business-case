import { renderHook, waitFor } from "@testing-library/react";
import { useProductById } from "@/hooks/useProductById";
import { getCachedProduct } from "@/hooks/useProduct";
import type { ProductInterface } from "@/interfaces/Products";

const mockProduct: ProductInterface = { id: 1, title: "Product 1", price: 100 };

jest.mock("@/hooks/useProduct", () => ({
	getCachedProduct: jest.fn(),
}));

beforeAll(() => {
	global.fetch = jest.fn();
});

afterEach(() => {
	jest.clearAllMocks();
});

describe("useProductById", () => {
	it("should fetch a product successfully when it's not in the cache", async () => {
		(getCachedProduct as jest.Mock).mockReturnValue(null);
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockProduct),
		});

		const { result } = renderHook(() => useProductById("1"));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.product).toEqual(mockProduct);
			expect(result.current.error).toBeNull();
		});

		expect(getCachedProduct).toHaveBeenCalledWith("1");
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith("/api/product/1");
	});

	it("should return a cached product without making a fetch call", async () => {
		(getCachedProduct as jest.Mock).mockReturnValue(mockProduct);

		const { result } = renderHook(() => useProductById("1"));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.product).toEqual(mockProduct);
		expect(result.current.error).toBeNull();

		expect(getCachedProduct).toHaveBeenCalledWith("1");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("should set an error state if the fetch fails", async () => {
		(getCachedProduct as jest.Mock).mockReturnValue(null);
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
		});

		const { result } = renderHook(() => useProductById("1"));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe("Failed to fetch product");
			expect(result.current.product).toBeNull();
		});

		expect(fetch).toHaveBeenCalledTimes(1);
	});
});
