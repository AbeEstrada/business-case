"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { ProductInterface } from "@/interfaces/Products";
import BarChart from "./BarChart";

interface ProductClientProps {
	product: ProductInterface;
}

const ProductClient: FC<ProductClientProps> = ({ product }) => {
	const searchParams = useSearchParams();
	const stateProductParam = searchParams.get("product");

	let finalProduct = product;

	if (stateProductParam) {
		try {
			const parsed = JSON.parse(decodeURIComponent(stateProductParam));
			if (parsed && typeof parsed === "object") {
				finalProduct = parsed;
			}
		} catch (e) {
			console.warn("Failed to parse product from search param", e);
		}
	}

	// Prevents mismatch data between server and client
	const [chartData, setChartData] = useState<number[]>([]);
	useEffect(() => {
		const generatedData = Array.from({ length: 6 }, () => {
			const basePrice = finalProduct.price ?? 0;
			const randomVariation = (Math.random() - 0.5) * 200;
			return Math.max(1, basePrice + randomVariation);
		});
		setChartData([finalProduct.price ?? 0, ...generatedData]);
	}, [finalProduct.price]);

	const localPrice = new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	}).format(finalProduct.price ?? 0);

	return (
		<main className="m-4">
			<h1>Title: {finalProduct.title}</h1>
			<p>Category: {finalProduct.category}</p>
			<p>Description: {finalProduct.description}</p>
			<p>Price: {localPrice}</p>
			<p>Discount: {finalProduct.discountPercentage}%</p>
			<p>Rating: {finalProduct.rating} / 5</p>
			<p>
				Stock: {finalProduct.stock} units ({finalProduct.availabilityStatus})
			</p>
			<p>Brand: {finalProduct.brand}</p>
			{chartData ? (
				<div className="md:w-1/3 my-4">
					<BarChart data={chartData} title="Weekly Price Trends" />{" "}
				</div>
			) : null}
			<ul className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{finalProduct.images?.map((image, i) => (
					<li key={image}>
						<img
							src={image}
							loading="lazy"
							alt={`${finalProduct.title} - Product ${i + 1}`}
							className="block"
						/>
					</li>
				))}
			</ul>
		</main>
	);
};

export default ProductClient;
