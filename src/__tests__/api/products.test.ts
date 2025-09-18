/**
 * @jest-environment node
 */

import { GET } from "@/app/api/products/route";
import { getProducts } from "@/lib/cache";
import type { ProductsInterface } from "@/interfaces/Products";
import type { NextRequest } from "next/server";

jest.mock("@/lib/cache");

describe("/api/products", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return data with status 200", async () => {
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

		const mockRequest = {
			nextUrl: {
				searchParams: new URLSearchParams(),
			},
		} as NextRequest;

		const response = await GET(mockRequest);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json?.products?.length).toBeGreaterThan(0);
	});

	it("should handle delay query parameter", async () => {
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

		const mockRequest = {
			nextUrl: {
				searchParams: new URLSearchParams("delay=10"),
			},
		} as NextRequest;

		const startTime = Date.now();
		const response = await GET(mockRequest);
		const endTime = Date.now();
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json?.products?.length).toBeGreaterThan(0);
		expect(endTime - startTime).toBeGreaterThanOrEqual(5);
	});

	it("should return 500 if getProducts throws an error", async () => {
		(getProducts as jest.Mock).mockRejectedValueOnce(
			new Error("Database connection failed"),
		);

		const mockRequest = {
			nextUrl: {
				searchParams: new URLSearchParams(),
			},
		} as NextRequest;

		const response = await GET(mockRequest);
		const json = await response.json();

		expect(response.status).toBe(500);
		expect(json).toHaveProperty("error");
	});
});
