import { useState, useEffect } from "react";
import type { ProductInterface } from "@/interfaces/Products";
import { getCachedProduct } from "./useProduct";

export const useProductById = (id: string) => {
	const [product, setProduct] = useState<ProductInterface | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				setError(null);

				const cachedProduct = getCachedProduct(id);
				if (cachedProduct) {
					setProduct(cachedProduct);
					setLoading(false);
					return;
				}

				const response = await fetch(`/api/product/${id}`);

				if (!response.ok) throw new Error("Failed to fetch product");

				const productData = await response.json();
				setProduct(productData);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred",
				);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchProduct();
		}
	}, [id]);

	return { product, loading, error };
};
