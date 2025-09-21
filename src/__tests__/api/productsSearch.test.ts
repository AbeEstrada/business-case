/**
 * @jest-environment node
 */
import { GET } from "@/app/api/products/search/route";
import { getProducts } from "@/lib/cache";
import { BASE_URL } from "@/lib/constants";
import { NextRequest } from "next/server";
import type { ProductsInterface } from "@/interfaces/Products";

jest.mock("@/lib/cache");

describe("/api/products/search", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return products with default pagination", async () => {
		const data: ProductsInterface = {
			products: [{ id: 1, title: "Product", description: "Test" }],
			total: 1,
			skip: 0,
			limit: 10,
		};
		(getProducts as jest.Mock).mockResolvedValueOnce(data);

		const request = new NextRequest(`${BASE_URL}/api/products/search`);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.products).toEqual(data.products);
		expect(json.total).toBe(1);
		expect(getProducts).toHaveBeenCalledWith({
			q: undefined,
			category: undefined,
			sort: undefined,
			order: undefined,
			page: 1,
			limit: 10,
		});
	});

	it("should handle all query parameters", async () => {
		const data: ProductsInterface = {
			products: [],
			total: 0,
			skip: 0,
			limit: 5,
		};
		(getProducts as jest.Mock).mockResolvedValueOnce(data);

		const request = new NextRequest(
			`${BASE_URL}/api/products/search?q=test&category=electronics&sort=asc&order=price&page=2&limit=5`,
		);
		const response = await GET(request);

		expect(response.status).toBe(200);
		expect(getProducts).toHaveBeenCalledWith({
			q: "test",
			category: "electronics",
			sort: "asc",
			order: "price",
			page: 2,
			limit: 5,
		});
	});

	it("should return 400 for invalid page parameter", async () => {
		const request = new NextRequest(
			`${BASE_URL}/api/products/search?page=invalid`,
		);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({
			error: "Page parameter must be a positive integer",
		});
	});

	it("should return 400 for negative page parameter", async () => {
		const request = new NextRequest(`${BASE_URL}/api/products/search?page=-1`);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({
			error: "Page parameter must be a positive integer",
		});
	});

	it("should return 400 for invalid limit parameter", async () => {
		const request = new NextRequest(
			`${BASE_URL}/api/products/search?limit=invalid`,
		);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({
			error: "Limit parameter must be a positive integer",
		});
	});

	it("should return 400 for negative limit parameter", async () => {
		const request = new NextRequest(`${BASE_URL}/api/products/search?limit=0`);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({
			error: "Limit parameter must be a positive integer",
		});
	});

	it("should return 500 if getProducts throws an error", async () => {
		(getProducts as jest.Mock).mockRejectedValueOnce(
			new Error("Network failure"),
		);

		const request = new NextRequest(`${BASE_URL}/api/products/search`);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(500);
		expect(json).toHaveProperty("error");
	});

	it("should handle empty products response", async () => {
		const data: ProductsInterface = {
			products: [],
			total: 0,
			skip: 0,
			limit: 10,
		};
		(getProducts as jest.Mock).mockResolvedValueOnce(data);

		const request = new NextRequest(
			`${BASE_URL}/api/products/search?q=nonexistent`,
		);
		const response = await GET(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.products).toEqual([]);
		expect(json.total).toBe(0);
	});
});
