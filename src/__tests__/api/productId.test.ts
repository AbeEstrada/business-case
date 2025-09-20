/**
 * @jest-environment node
 */
import { GET } from "@/app/api/product/[id]/route";
import { getProductById } from "@/lib/cache";
import { NextRequest } from "next/server";

jest.mock("@/lib/cache");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

describe("/api/product/[id]", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return product by ID", async () => {
		const mockProduct = { id: "1", name: "Test Product", price: 100 };
		(getProductById as jest.Mock).mockResolvedValueOnce(mockProduct);

		const params = { id: "1" };
		const response = await GET(new NextRequest(`${BASE_URL}/api/product/1`), {
			params,
		});
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toEqual(mockProduct);
		expect(getProductById).toHaveBeenCalledWith("1");
	});

	it("should return 400 for invalid (empty) ID", async () => {
		const params = { id: "" };
		const response = await GET(new NextRequest(`${BASE_URL}/api/product/`), {
			params,
		});
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({ error: "Invalid product ID" });
	});

	it("should return 404 if product not found", async () => {
		(getProductById as jest.Mock).mockResolvedValueOnce(null);

		const params = { id: "999" };
		const response = await GET(new NextRequest(`${BASE_URL}/api/product/999`), {
			params,
		});
		const json = await response.json();

		expect(response.status).toBe(404);
		expect(json).toEqual({ error: "Product not found" });
	});

	it("should return 500 on internal server error", async () => {
		(getProductById as jest.Mock).mockRejectedValueOnce(
			new Error("Network failure"),
		);

		const params = { id: "1" };
		const response = await GET(new NextRequest(`${BASE_URL}/api/product/1`), {
			params,
		});
		const json = await response.json();

		expect(response.status).toBe(500);
		expect(json).toHaveProperty("error", "Internal Server Error");
	});
});
