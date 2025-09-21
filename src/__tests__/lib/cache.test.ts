import type {
	ProductInterface,
	ProductsInterface,
} from "@/interfaces/Products";
import type { CategoriesInterface } from "@/interfaces/Category";
import { DUMMY_URL } from "@/lib/constants";
import {
	getProducts,
	getCategories,
	getProductById,
	__clearProductsCache,
} from "@/lib/cache";

const mockProductsData: ProductsInterface = {
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

const mockCategoriesData: CategoriesInterface = [
	{
		slug: "smartphones",
		name: "Smartphones",
		url: `${DUMMY_URL}/products/category/smartphones`,
	},
	{
		slug: "laptops",
		name: "Laptops",
		url: `${DUMMY_URL}/products/category/laptops`,
	},
	{
		slug: "fragrances",
		name: "Fragrances",
		url: `${DUMMY_URL}/products/category/fragrances`,
	},
];

const mockProductData: ProductInterface = {
	id: 1,
	title: "Test Product",
	description: "This is a test product.",
	price: 100,
	discountPercentage: 10,
	rating: 4.5,
	stock: 50,
	brand: "TestBrand",
	category: "TestCategory",
	thumbnail: `${DUMMY_URL}/image.jpg`,
	images: [`${DUMMY_URL}/image1.jpg`, `${DUMMY_URL}/image2.jpg`],
};

function createCachedFetchTest<T>({
	fetchFn,
	url,
	mockData,
	errorMessage,
}: {
	fetchFn: () => Promise<T>;
	url: string;
	mockData: T;
	errorMessage: string;
}) {
	beforeEach(() => {
		global.fetch = jest.fn();
		__clearProductsCache();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should fetch default data successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const result = await fetchFn();

		expect(result).toEqual(mockData);
		expect(global.fetch).toHaveBeenCalledWith(url);
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should throw an error when fetch fails", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		});

		await expect(fetchFn()).rejects.toThrow(errorMessage);
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should return cached data when not expired", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const result1 = await fetchFn();
		const result2 = await fetchFn();

		expect(result2).toBe(result1);
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should fetch fresh data when cache is expired", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		await fetchFn();

		const originalNow = Date.now;
		Date.now = jest.fn(() => originalNow() + 6 * 60 * 1000); // 6 minutes

		const freshData = Array.isArray(mockData)
			? [{ slug: "new", name: "New", url: "https://new" }]
			: { products: [], total: 0, skip: 0, limit: 0 };

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => freshData,
		});

		const result = await fetchFn();

		expect(result).toEqual(freshData);
		expect(global.fetch).toHaveBeenCalledTimes(2);

		Date.now = originalNow;
	});

	it("should return cached data on fetch failure if cache exists", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const result1 = await fetchFn();
		expect(result1).toEqual(mockData);

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 500,
		});

		const result2 = await fetchFn();
		expect(result2).toEqual(mockData);
	});
}

describe("getProducts", () => {
	createCachedFetchTest({
		fetchFn: getProducts,
		url: `${DUMMY_URL}/products/?limit=10&skip=0`,
		mockData: mockProductsData,
		errorMessage: "Failed to fetch products",
	});
});

describe("getCategories", () => {
	createCachedFetchTest({
		fetchFn: getCategories,
		url: `${DUMMY_URL}/products/categories`,
		mockData: mockCategoriesData,
		errorMessage: "Failed to fetch categories",
	});
});

describe("getProductById", () => {
	createCachedFetchTest({
		fetchFn: () => getProductById("1"),
		url: `${DUMMY_URL}/products/1`,
		mockData: mockProductData,
		errorMessage: "Failed to fetch product",
	});
});
