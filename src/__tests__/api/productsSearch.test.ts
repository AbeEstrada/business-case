/**
 * @jest-environment node
 */

import { GET } from "@/app/api/products/search/route";
import { getProducts } from "@/lib/cache";
import type { ProductsInterface } from "@/interfaces/Products";

jest.mock("@/lib/cache");

describe("/api/products/search", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 400 if query parameter 'q' is missing", async () => {
		const request = new Request("http://localhost:3000/api/products"); // no ?q=

		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({ error: "Query parameter 'q' is required" });
	});

	it("should return 400 if query parameter 'q' is empty", async () => {
		const request = new Request("http://localhost:3000/api/products?q=");

		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({ error: "Query parameter 'q' is required" });
	});

	it("should return filtered products matching title", async () => {
		const data: ProductsInterface = {
			products: [
				{
					id: 1,
					title: "Product",
					description: "The quick brown fox jumps over the lazy dog",
				},
				{
					id: 2,
					title: "Test",
					description: "The five boxing wizards jump quickly",
				},
			],
			total: 2,
			skip: 0,
			limit: 2,
		};

		(getProducts as jest.Mock).mockResolvedValueOnce(data);

		const request = new Request("http://localhost:3000/api/products?q=product");

		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.products.length).toBe(1);
		expect(json.products[0].title).toContain("Product");
		expect(json.total).toBe(1);
	});

	it("should return empty list if no matches found", async () => {
		const data: ProductsInterface = {
			products: [
				{
					id: 1,
					title: "Product",
					description: "The quick brown fox jumps over the lazy dog",
				},
			],
			total: 1,
			skip: 0,
			limit: 1,
		};

		(getProducts as jest.Mock).mockResolvedValueOnce(data);

		const request = new Request("http://localhost:3000/api/products?q=fail");

		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.products).toEqual([]);
		expect(json.total).toBe(0);
	});

	it("should return 500 if getProducts throws an error", async () => {
		(getProducts as jest.Mock).mockRejectedValueOnce(
			new Error("Network failure"),
		);

		const request = new Request("http://localhost:3000/api/products?q=test");

		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(500);
		expect(json).toHaveProperty("error");
	});
});
