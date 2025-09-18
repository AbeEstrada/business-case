import type { ProductsInterface } from "@/interfaces/Products";
import { getProducts, __clearProductsCache } from "@/lib/cache";

const data: ProductsInterface = {
	products: [],
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
			json: async () => ({ products: data.products }),
		});

		const result = await getProducts();

		expect(result).toEqual({ products: data.products });
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should throw and error when fetch fails", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		});

		await expect(getProducts()).rejects.toThrow("Failed to fetch products");
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should fetch fresh data when cache is expired", async () => {
		const oldTime = Date.now() - 6 * 60 * 1000; // 6 mins ago
		const module = require("../lib/cache");
		module.cachedProducts = data;
		module.cacheTime = oldTime;

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				products: [
					{ id: 1, title: "Product" },
					{ id: 2, title: "Test" },
				],
				total: 2,
				skip: 0,
				limit: 2,
			}),
		});

		const result = await getProducts();

		expect(result).not.toBe(data);
		expect(global.fetch).toHaveBeenCalledTimes(1);
		expect(result?.products?.length).toBeGreaterThan(1);
	});
});
