import type { ProductsInterface } from "@/interfaces/Products";

const cache = new Map<string, { data: ProductsInterface; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function getProducts({
	q,
	category,
	sort,
	order,
	page = 1,
	limit = 10,
}: {
	q?: string;
	category?: string;
	sort?: "asc" | "desc";
	order?: "title" | "price" | "rating" | "stock" | "discountPercentage";
	page?: number;
	limit?: number;
} = {}): Promise<ProductsInterface> {
	const cacheKey = JSON.stringify({ q, category, sort, order, page, limit });

	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	const url = new URL("https://dummyjson.com/products");
	url.searchParams.set("limit", String(limit));
	url.searchParams.set("skip", String((page - 1) * limit));

	if (q) url.searchParams.set("q", q);
	if (category) url.searchParams.set("category", category);
	if (sort) url.searchParams.set("order", sort);
	if (order) url.searchParams.set("sortBy", order);

	try {
		const res = await fetch(url.toString());
		if (!res.ok) throw new Error("Failed to fetch products");

		const data: ProductsInterface = await res.json();

		cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		return data;
	} catch (error) {
		if (cached) return cached.data;
		throw error;
	}
}

export function __clearProductsCache() {
	cache.clear();
}
