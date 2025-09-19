/**
 * @jest-environment node
 */

import { GET } from "@/app/api/products/route";
import { getProducts } from "@/lib/cache";
import type { ProductsInterface } from "@/interfaces/Products";

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

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json?.products?.length).toBeGreaterThan(0);
	});

	it("should return 500 if getProducts throws an error", async () => {
		(getProducts as jest.Mock).mockRejectedValueOnce(
			new Error("Database connection failed"),
		);

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(500);
		expect(json).toHaveProperty("error");
	});
});
