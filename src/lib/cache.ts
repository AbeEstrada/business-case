import type { ProductsInterface } from "@/interfaces/Products";

let cachedProducts: ProductsInterface | null = null;
let cacheTime: number | null = null;

const CACHE_DURATION = 5 * 60 * 1000;

export async function getProducts() {
	const now = Date.now();

	if (cachedProducts && cacheTime && now - cacheTime < CACHE_DURATION) {
		return cachedProducts;
	}

	const res = await fetch("https://dummyjson.com/products", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!res.ok) throw new Error("Failed to fetch products");

	const json = await res.json();
	cachedProducts = json;
	cacheTime = now;

	return cachedProducts;
}

export function __clearProductsCache() {
	cachedProducts = null;
	cacheTime = null;
}
