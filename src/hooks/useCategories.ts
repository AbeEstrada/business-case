import { useState, useCallback, useEffect } from "react";
import type { CategoryInterface } from "@/interfaces/Category";
import { CACHE_DURATION } from "@/lib/constants";

export const cache = new Map<
	string,
	{ data: CategoryInterface[]; timestamp: number }
>();

export const useCategories = () => {
	const [categories, setCategories] = useState<CategoryInterface[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCategories = useCallback(async () => {
		const now = Date.now();
		const url = "/api/categories";
		const cachedData = cache.get(url);

		if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
			setCategories(cachedData.data);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error("Failed to fetch categories.");
			}

			const json: CategoryInterface[] = await response.json();

			cache.set(url, { data: json, timestamp: now });
			setCategories(json);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred.",
			);
			setCategories([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return { categories, loading, error };
};
