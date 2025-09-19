import type { ProductsInterface } from "@/interfaces/Products";
import { getProducts, __clearProductsCache } from "@/lib/cache";

const mockData: ProductsInterface = {
	products: [
		{
			id: 1,
			title: "Test Product",
			price: 100,
			rating: 4.5,
			stock: 50,
			discountPercentage: 10,
		},
	],
	total: 1,
	skip: 0,
	limit: 1,
};

describe("getProducts", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
		__clearProductsCache();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should fetch products successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const result = await getProducts();

		expect(result).toEqual(mockData);
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should throw an error when fetch fails", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		});

		await expect(getProducts()).rejects.toThrow("Failed to fetch products");
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should fetch fresh data when cache is expired", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		await getProducts();

		const originalNow = Date.now;
		Date.now = jest.fn(() => originalNow() + 6 * 60 * 1000); // 6 mins later

		const freshData: ProductsInterface = {
			products: [
				{ id: 1, title: "Product 1" },
				{ id: 2, title: "Product 2" },
			],
			total: 2,
			skip: 0,
			limit: 2,
		};

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => freshData,
		});

		const result = await getProducts();

		expect(result).not.toEqual(mockData);
		expect(global.fetch).toHaveBeenCalledTimes(2);
		expect(result.products?.length).toBe(2);

		Date.now = originalNow;
	});

	it("should return cached data when available and not expired", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const result1 = await getProducts();

		const result2 = await getProducts();

		expect(result2).toEqual(mockData);
		expect(global.fetch).toHaveBeenCalledTimes(1);
		expect(result2).toBe(result1);
	});
});
