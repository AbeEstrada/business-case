import type { FC } from "react";
import type { ProductInterface } from "@/interfaces/Products";
import Link from "next/link";

interface ProductCardProps {
	product?: ProductInterface;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
	if (!product) {
		return (
			<div
				className="border rounded bg-zinc-800/80 h-72 animate-pulse"
				role="presentation"
				aria-hidden="true"
			/>
		);
	}

	const localPrice = new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	}).format(product.price ?? 0);

	return (
		<article className="group relative mx-auto">
			<Link
				href={{
					pathname: `/product/${product.id}`,
					query: { product: JSON.stringify(product) },
				}}
				as={`/product/${product.id}`}
				className="group inline-block h-full p-4 rounded border box-border hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:border-2 focus:outline-hidden active:outline-hidden"
				tabIndex={0}
				aria-label={`View details for ${product.title}`}
			>
				<h3>{product.title}</h3>
				<p>Price: {localPrice}</p>
				<p>Rating: {product.rating}</p>
				<p>
					<img src={product.thumbnail} loading="lazy" alt={product.title} />
				</p>
			</Link>
		</article>
	);
};

export default ProductCard;
