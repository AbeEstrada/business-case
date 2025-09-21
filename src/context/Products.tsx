"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";

import type { ProductInterface } from "@/interfaces/Products";
import { useProducts } from "@/hooks/useProduct";

interface ProductsContextType {
	products: ProductInterface[];
	loading: boolean;
	error: string | null;
	hasLoaded: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
	undefined,
);

export const ProductsProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const searchParams = useSearchParams();
	const q = searchParams.get("q");
	const category = searchParams.get("category");
	const page = searchParams.get("page");
	const sort = searchParams.get("sort");
	const order = searchParams.get("order");
	const limit = searchParams.get("limit");
	const delay = searchParams.get("delay");

	const { products, loading, error, hasLoaded } = useProducts({
		q,
		category,
		page,
		sort,
		order,
		limit,
		delay,
	});

	const value: ProductsContextType = {
		products,
		loading,
		error,
		hasLoaded,
	};

	return (
		<ProductsContext.Provider value={value}>
			{children}
		</ProductsContext.Provider>
	);
};

export const useProductsContext = (): ProductsContextType => {
	const context = useContext(ProductsContext);
	if (context === undefined) {
		throw new Error(
			"useProductsContext must be used within a ProductsProvider",
		);
	}
	return context;
};
