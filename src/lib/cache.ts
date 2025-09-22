import type {
	ProductInterface,
	ProductsInterface,
} from "@/interfaces/Products";
import type { CategoriesInterface } from "@/interfaces/Category";
import { DUMMY_URL, CACHE_DURATION } from "@/lib/constants";

const cache = new Map<
	string,
	{
		data: ProductsInterface | ProductInterface | CategoriesInterface;
		timestamp: number;
	}
>();

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
	sort?: string;
	order?: "asc" | "desc";
	page?: number;
	limit?: number;
} = {}): Promise<ProductsInterface> {
	const cacheKey = JSON.stringify({ q, category, sort, order, page, limit });

	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data as ProductsInterface;
	}

	// Select if there is a search or retrieve all the category
	const endpoint =
		category && !q ? `/category/${category}` : q ? "/search" : "/";
	const url = new URL(`${DUMMY_URL}/products${endpoint}`);

	url.searchParams.set("limit", String(limit));
	url.searchParams.set("skip", String((page - 1) * limit));

	if (q) url.searchParams.set("q", q);
	if (category) url.searchParams.set("category", category);
	if (order) url.searchParams.set("order", order);
	if (sort) url.searchParams.set("sortBy", sort);

	try {
		const res = await fetch(url.toString());

		if (!res.ok) throw new Error("Failed to fetch products");

		const data: ProductsInterface = await res.json();

		// Filter products only if there is a query and category parameters
		// if not, return all the products in the category
		if (category && data.products && !endpoint.includes("/category/")) {
			const filteredProducts = data.products.filter(
				(product) => product.category?.toLowerCase() === category.toLowerCase(),
			);

			data.products = filteredProducts;
			data.total = filteredProducts.length;

			data.skip = (page - 1) * limit;
			data.limit = limit;
		}

		cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		return data;
	} catch (error) {
		if (cached) return cached.data as ProductsInterface;
		throw error;
	}
}

export async function getCategories(): Promise<CategoriesInterface> {
	const cacheKey = "categories";

	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data as CategoriesInterface;
	}

	const url = `${DUMMY_URL}/products/categories`;

	try {
		const res = await fetch(url);

		if (!res.ok) throw new Error("Failed to fetch categories");

		const data: CategoriesInterface = await res.json();

		cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		return data;
	} catch (error) {
		if (cached) return cached.data as CategoriesInterface;
		throw error;
	}
}

export async function getProductById(id: string): Promise<ProductInterface> {
	const cacheKey = `product${id}`;

	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data as ProductInterface;
	}

	const url = `${DUMMY_URL}/products/${id}`;

	try {
		const res = await fetch(url);

		if (!res.ok) throw new Error("Failed to fetch product");

		const data: ProductInterface = await res.json();

		cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		return data;
	} catch (error) {
		if (cached) return cached.data as ProductInterface;
		throw error;
	}
}

// Export for tests
export function __clearProductsCache() {
	cache.clear();
}
