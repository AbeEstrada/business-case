import { renderHook, waitFor, act } from "@testing-library/react";
import {
	useProducts,
	getCachedProduct,
	getCacheItem,
} from "@/hooks/useProduct";
import type { ProductsInterface } from "@/interfaces/Products";

const mockSessionStorage: Record<string, string> = {};

const sessionStorageMock = {
	getItem: jest.fn((key) => mockSessionStorage[key] || null),
	setItem: jest.fn((key, value) => {
		mockSessionStorage[key] = String(value);
	}),
	removeItem: jest.fn((key) => {
		delete mockSessionStorage[key];
	}),
	clear: jest.fn(() => {
		Object.keys(mockSessionStorage).forEach((key) => {
			delete mockSessionStorage[key];
		});
	}),
	key: jest.fn((index) => Object.keys(mockSessionStorage)[index] || null),
	get length() {
		return Object.keys(mockSessionStorage).length;
	},
};

Object.defineProperty(window, "sessionStorage", {
	value: sessionStorageMock,
	writable: true,
});

const mockData: ProductsInterface = {
	products: [
		{ id: 1, title: "Product 1", price: 100 },
		{ id: 2, title: "Product 2", price: 50 },
	],
	total: 2,
	skip: 0,
	limit: 10,
};

beforeAll(() => {
	global.fetch = jest.fn();
});

beforeEach(() => {
	jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
	mockSessionStorageMock.clear();
	jest.clearAllMocks();
	jest.restoreAllMocks();
});

const mockSessionStorageMock = {
	clear: () => {
		Object.keys(mockSessionStorage).forEach((key) => {
			delete mockSessionStorage[key];
		});
		sessionStorageMock.getItem.mockClear();
		sessionStorageMock.setItem.mockClear();
		sessionStorageMock.removeItem.mockClear();
		sessionStorageMock.key.mockClear();
	},
};

jest.mock("@/lib/constants", () => ({
	CACHE_DURATION: 3600000, // 1 hour in ms
}));

describe("getCacheItem", () => {
	const mockProducts: ProductsInterface = {
		products: [{ id: 1, title: "Cached Product", price: 99 }],
		total: 1,
		skip: 0,
		limit: 10,
	};

	afterEach(() => {
		mockSessionStorageMock.clear();
	});

	it("should return cached data when item exists and is not expired", () => {
		const key = "test-key";
		const cacheEntry = {
			data: mockProducts,
			timestamp: Date.now(),
		};
		sessionStorage.setItem(`products_cache_${key}`, JSON.stringify(cacheEntry));

		const result = getCacheItem(key);
		expect(result).toEqual(mockProducts);
	});

	it("should return null when no item exists for the key", () => {
		const result = getCacheItem("non-existent-key");
		expect(result).toBeNull();
		// Ensure nothing was removed (optional)
		expect(sessionStorage.removeItem).not.toHaveBeenCalled();
	});

	it("should return null and remove item when cache is expired", () => {
		const key = "expired-key";
		const expiredTimestamp = Date.now() - 3600000 - 1000; // 1 hour + 1s ago
		const cacheEntry = {
			data: mockProducts,
			timestamp: expiredTimestamp,
		};
		sessionStorage.setItem(`products_cache_${key}`, JSON.stringify(cacheEntry));

		const result = getCacheItem(key);
		expect(result).toBeNull();
		expect(sessionStorage.removeItem).toHaveBeenCalledWith(
			`products_cache_${key}`,
		);
	});

	it("should return null and remove item when cache data is malformed (JSON parse error)", () => {
		const key = "malformed-key";
		sessionStorage.setItem(`products_cache_${key}`, "not-valid-json");

		const result = getCacheItem(key);
		expect(result).toBeNull();
		expect(sessionStorage.removeItem).toHaveBeenCalledWith(
			`products_cache_${key}`,
		);
	});

	it("should return null and remove item when cache structure is invalid (missing data/timestamp)", () => {
		const key = "invalid-structure-key";
		// Missing timestamp
		sessionStorage.setItem(
			`products_cache_${key}`,
			JSON.stringify({ data: mockProducts }),
		);

		const result = getCacheItem(key);
		expect(result).toBeNull();
		expect(sessionStorage.removeItem).toHaveBeenCalledWith(
			`products_cache_${key}`,
		);
	});
});

describe("useProducts", () => {
	it("should fetch products successfully without any parameters", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() => useProducts({}));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toEqual(mockData);
			expect(result.current.error).toBeNull();
			expect(result.current.hasLoaded).toBe(true);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith("/api/products", expect.any(Object));
	});

	it("should build the correct search URL when parameters are provided", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() =>
			useProducts({ q: "red", category: "beauty" }),
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			"/api/products/search?q=red&category=beauty",
			expect.any(Object),
		);
	});

	it("should set an error state after exhausting all retries on failure", async () => {
		const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

		(global.fetch as jest.Mock).mockResolvedValue({
			ok: false,
		});

		const { result } = renderHook(() => useProducts({}));

		await waitFor(
			() => {
				expect(result.current.error).not.toBeNull();
			},
			{ timeout: 5000 },
		);

		expect(result.current.loading).toBe(false);
		expect(result.current.data).toBe(undefined);
		expect(result.current.error).toBe("Failed to fetch products.");
		expect(fetch).toHaveBeenCalledTimes(4);

		consoleSpy.mockRestore();
	});

	it("should return cached data when called again with the same parameters", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const params = { q: "test" };

		const { result: firstRender } = renderHook(() => useProducts(params));

		await waitFor(() => {
			expect(firstRender.current.loading).toBe(false);
		});
		expect(fetch).toHaveBeenCalledTimes(1);

		const { result: secondRender } = renderHook(() => useProducts(params));

		await waitFor(() => {
			expect(secondRender.current.loading).toBe(false);
			expect(secondRender.current.data).toEqual(mockData);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("should apply a delay before fetching data if 'delay' parameter is provided", async () => {
		jest.useFakeTimers();

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() => useProducts({ delay: "500" }));

		expect(result.current.loading).toBe(true);
		expect(fetch).not.toHaveBeenCalled();

		await act(async () => {
			jest.advanceTimersByTime(500);
			await Promise.resolve();
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toEqual(mockData);
		});

		expect(fetch).toHaveBeenCalledTimes(1);

		jest.useRealTimers();
	});

	it("should ignore invalid delay values (non-numeric)", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() => useProducts({ delay: "abc" }));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toEqual(mockData);
		});

		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("should use /api/products (not /search) when only page/limit are provided", async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockData),
		});

		const { result } = renderHook(() =>
			useProducts({ page: "2", limit: "20" }),
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(fetch).toHaveBeenCalledWith(
			"/api/products?page=2&limit=20",
			expect.any(Object),
		);
	});

	it("should return a specific product from cache when available", () => {
		const cacheKey = JSON.stringify({
			q: null,
			category: null,
			page: null,
			sort: null,
			order: null,
			limit: null,
		});
		const cachedItem = {
			timestamp: Date.now(),
			data: mockData,
		};
		sessionStorage.setItem(
			`products_cache_${cacheKey}`,
			JSON.stringify(cachedItem),
		);

		const product = getCachedProduct("2");
		expect(product).toEqual({ id: 2, title: "Product 2", price: 50 });
	});

	it("should return null if the product is not found in the cache", () => {
		const cacheKey = JSON.stringify({});
		const cachedItem = {
			timestamp: Date.now(),
			data: mockData,
		};
		sessionStorage.setItem(
			`products_cache_${cacheKey}`,
			JSON.stringify(cachedItem),
		);

		const product = getCachedProduct("99");
		expect(product).toBeNull();
	});

	it("should return null if the cache has expired", () => {
		const expiredTimestamp = Date.now() - 60 * 60 * 1000 - 1; // 1 hour + 1ms ago
		const cacheKey = JSON.stringify({});
		const cachedItem = {
			timestamp: expiredTimestamp,
			data: {
				products: [{ id: 1, title: "Product 1", price: 100 }],
				total: 1,
				skip: 0,
				limit: 10,
			},
		};
		sessionStorage.setItem(
			`products_cache_${cacheKey}`,
			JSON.stringify(cachedItem),
		);

		const product = getCachedProduct("1");
		expect(product).toBeNull();
		expect(sessionStorage.getItem(`products_cache_${cacheKey}`)).toBeNull();
	});

	it("should return null if cache is empty", () => {
		mockSessionStorageMock.clear();
		const product = getCachedProduct("1");
		expect(product).toBeNull();
	});

	it("should return null for non-numeric product ID", () => {
		const product = getCachedProduct("abc");
		expect(product).toBeNull();
	});
});
