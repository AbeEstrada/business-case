"use client";

import type { FC } from "react";
import { useProductsContext } from "@/context/Products";
import ProductCard from "./ProductCard";

const ProductsList: FC = () => {
	const { products, loading, error, hasLoaded } = useProductsContext();
	if (error) {
		return <p className="m-4 text-red-500">Error: {error}</p>;
	}

	if (loading || !hasLoaded) {
		return (
			<section className="grid grid-cols-1 md:grid-cols-4 gap-4 m-4">
				{Array.from({ length: 12 }, (_, i) => i).map((value) => (
					<ProductCard key={value} />
				))}
			</section>
		);
	}

	if (products.length === 0) {
		return (
			<section className="m-4">
				<p>No products found.</p>
			</section>
		);
	}

	return (
		<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 m-4">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</section>
	);
};

export default ProductsList;
