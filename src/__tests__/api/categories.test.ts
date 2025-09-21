/**
 * @jest-environment node
 */
import { GET } from "@/app/api/categories/route";
import { getCategories } from "@/lib/cache";
import type { CategoriesInterface } from "@/interfaces/Category";

jest.mock("@/lib/cache");

describe("/api/categories", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return a list of categories with status 200", async () => {
		const mockCategories: CategoriesInterface = [
			{ slug: "beauty", name: "Beauty", url: "/category/beauty" },
			{ slug: "fragrances", name: "Fragrances", url: "/category/fragrances" },
			{ slug: "furniture", name: "Furniture", url: "/category/furniture" },
		];

		(getCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toEqual(mockCategories);
		expect(json?.length).toBeGreaterThan(0);
	});

	it("should return 500 if getCategories throws an error", async () => {
		const errorMessage = "Failed to fetch categories";

		(getCategories as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(500);
		expect(json).toEqual({ error: errorMessage });
		expect(json).toHaveProperty("error");
	});
});
