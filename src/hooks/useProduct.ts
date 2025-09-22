import { useState, useCallback, useEffect } from "react";
import type {
	ProductsInterface,
	ProductInterface,
} from "@/interfaces/Products";
import { CACHE_DURATION } from "@/lib/constants";

export const cache = new Map<
	string,
	{ data: ProductsInterface; timestamp: number }
>();

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
			const now = Date.now();
			const cachedData = cache.get(cacheKey);

			if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
				setData(cachedData.data);
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
				cache.set(cacheKey, { data: json, timestamp: now });

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
		const abortController = new AbortController();
		fetchProducts(abortController.signal);

		return () => {
			abortController.abort();
		};
	}, [fetchProducts]);

	return { data, loading, error, hasLoaded };
};

export const getCachedProduct = (id: string): ProductInterface | null => {
	const now = Date.now();

	const cacheEntries = Array.from(cache.entries());

	for (const [, cachedData] of cacheEntries) {
		if (now - cachedData.timestamp < CACHE_DURATION) {
			const product = cachedData.data.products?.find(
				(p: ProductInterface) => p.id === parseInt(id, 10),
			);
			if (product) {
				return product;
			}
		}
	}

	return null;
};
