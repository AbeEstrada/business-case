import { useState, useCallback, useEffect } from "react";
import type {
	ProductsInterface,
	ProductInterface,
} from "@/interfaces/Products";
import { CACHE_DURATION } from "@/lib/constants";

export const setCacheItem = (key: string, data: ProductsInterface): void => {
	try {
		const item = {
			data,
			timestamp: Date.now(),
		};
		sessionStorage.setItem(`products_cache_${key}`, JSON.stringify(item));
	} catch (e) {
		console.warn("Failed to write to sessionStorage", e);
	}
};

export const getCacheItem = (key: string): ProductsInterface | null => {
	try {
		const itemStr = sessionStorage.getItem(`products_cache_${key}`);
		if (!itemStr) return null;

		const item = JSON.parse(itemStr);
		if (Date.now() - item.timestamp < CACHE_DURATION) {
			return item.data;
		} else {
			// Expired
			sessionStorage.removeItem(`products_cache_${key}`);
		}
	} catch (e) {
		console.warn("Failed to read from sessionStorage", e);
		sessionStorage.removeItem(`products_cache_${key}`);
	}
	return null;
};

export const cleanupExpiredCache = (): void => {
	try {
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key?.startsWith("products_cache_")) {
				const itemStr = sessionStorage.getItem(key);
				if (itemStr) {
					const item = JSON.parse(itemStr);
					if (Date.now() - item.timestamp >= CACHE_DURATION) {
						sessionStorage.removeItem(key);
					}
				}
			}
		}
	} catch (e) {
		console.warn("Cache cleanup failed", e);
	}
};

interface UseProductsParams {
	q?: string | null;
	category?: string | null;
	page?: string | null;
	sort?: string | null;
	order?: string | null;
	limit?: string | null;
	delay?: string | null;
}

export const useProducts = ({
	q,
	category,
	page,
	sort,
	order,
	limit,
	delay,
}: UseProductsParams) => {
	const [data, setData] = useState<ProductsInterface | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [hasLoaded, setHasLoaded] = useState<boolean>(false);

	const cacheKey = JSON.stringify({ q, category, page, sort, order, limit });

	const fetchProducts = useCallback(
		async (signal: AbortSignal, retries = 3) => {
			const cachedData = getCacheItem(cacheKey);
			if (cachedData) {
				setData(cachedData);
				setLoading(false);
				setHasLoaded(true);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams();
				if (q) params.append("q", q);
				if (category) params.append("category", category);
				if (sort) params.append("sort", sort);
				if (order) params.append("order", order);
				if (delay) params.append("delay", delay);
				if (page && parseInt(page, 10) > 0) params.append("page", page);
				if (limit && parseInt(limit, 10) > 0) params.append("limit", limit);

				const hasSearchParams = Boolean(q || category || sort || order);
				const hasBasicParams = Boolean(page || limit);
				const url = hasSearchParams
					? `/api/products/search?${params.toString()}`
					: hasBasicParams
						? `/api/products?${params.toString()}`
						: "/api/products";

				if (delay) {
					const delayMs = parseInt(delay, 10);
					if (!Number.isNaN(delayMs) && delayMs > 0) {
						await new Promise((resolve) => setTimeout(resolve, delayMs));
					}
				}

				const response = await fetch(url, { signal });
				if (!response.ok) {
					if (response.status === 429) {
						throw new Error("Too many requests. Please try again later.");
					}
					throw new Error("Failed to fetch products.");
				}

				const json = await response.json();
				setCacheItem(cacheKey, json);
				setData(json);
				setHasLoaded(true);
			} catch (err) {
				if (signal.aborted) {
					console.log("Fetch aborted");
					return;
				}
				if (retries > 0) {
					console.warn(`Fetch failed, retrying... (${retries} attempts left)`);
					await new Promise((resolve) => setTimeout(resolve, 1000));
					await fetchProducts(signal, retries - 1);
				} else {
					setError(
						err instanceof Error ? err.message : "An unknown error occurred.",
					);
					setHasLoaded(true);
				}
			} finally {
				setLoading(false);
			}
		},
		[cacheKey, q, category, page, sort, order, limit, delay],
	);

	useEffect(() => {
		cleanupExpiredCache();

		const abortController = new AbortController();
		fetchProducts(abortController.signal);
		return () => {
			abortController.abort();
		};
	}, [fetchProducts]);

	return { data, loading, error, hasLoaded };
};

export const getCachedProduct = (id: string): ProductInterface | null => {
	const idNum = parseInt(id, 10);
	if (Number.isNaN(idNum)) return null;
	try {
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key?.startsWith("products_cache_")) {
				const itemStr = sessionStorage.getItem(key);
				if (!itemStr) continue;

				const item = JSON.parse(itemStr);
				if (Date.now() - item.timestamp < CACHE_DURATION) {
					const products = item.data?.products as
						| ProductInterface[]
						| undefined;
					if (Array.isArray(products)) {
						const product = products.find((p) => p.id === idNum);
						if (product) {
							return product;
						}
					}
				} else {
					// Expired entry
					sessionStorage.removeItem(key);
				}
			}
		}
	} catch (e) {
		console.warn("Error reading product from cache", e);
	}

	return null;
};
