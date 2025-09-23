"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { ProductInterface } from "@/interfaces/Products";
import BarChart from "./BarChart";
import ImageGallery from "./ImageGallery";

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
			const multiplier = 0.5 + Math.random() * 1.5;
			return basePrice * multiplier;
		});
		setChartData([finalProduct.price ?? 0, ...generatedData]);
	}, [finalProduct.price]);

	const localPrice = new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	}).format(finalProduct.price ?? 0);

	const rating: number = Math.round(finalProduct.rating ?? 0);
	const ratingStars = Array.from({ length: 5 }, (_, i) =>
		i < rating ? "★" : "☆",
	);

	return (
		<main className="m-4">
			<section className="grid md:grid-cols-2">
				<div className="px-12 mb-12">
					<ImageGallery images={finalProduct.images ?? []} />
				</div>
				<div className="[&_*]:mb-2">
					<h1 className="text-2xl">{finalProduct.title}</h1>
					<div className="text-xl font-semibold">{localPrice}</div>
					<div className="flex gap-x-2">
						<cite className="not-italic text-sm font-bold rounded-lg py-1 px-2 bg-zinc-300 text-zinc-900">
							{finalProduct.brand}
						</cite>
						<cite className="not-italic text-sm rounded-lg py-1 px-2 bg-zinc-700 text-zinc-200">
							{finalProduct.category}
						</cite>
						<cite>
							{ratingStars.map((s, i) => (
								<span key={i} className="text-yellow-500 dark:text-yellow-400">
									{s}
								</span>
							))}
						</cite>
					</div>
					<p className="mt-4">{finalProduct.description}</p>
					<p>
						{finalProduct.stock} units ({finalProduct.availabilityStatus})
					</p>
				</div>
			</section>
			{chartData ? (
				<div className="md:w-1/3 my-4 mx-auto">
					<BarChart data={chartData} title="Weekly Price Trends" />
					<p className="text-center text-sm m-1">Historical Prices</p>
				</div>
			) : null}
		</main>
	);
};

export default ProductClient;
