import type { FC } from "react";
import type { ProductInterface } from "@/interfaces/Products";

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
			<a
				href={`/product/${product.id}`}
				className="group inline-block h-full p-4 rounded border box-border hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:border-2 focus:outline-hidden active:outline-hidden"
				tabIndex={0}
				aria-label={`View details for ${product.title}`}
			>
				<h3 style={{ viewTransitionName: `product-title-${product.id}` }}>
					{product.title}
				</h3>
				<p style={{ viewTransitionName: `product-price-${product.id}` }}>
					Price: {localPrice}
				</p>
				<p>Rating: {product.rating}</p>
				<p style={{ viewTransitionName: `product-image-${product.id}` }}>
					<img src={product.thumbnail} loading="lazy" alt={product.title} />
				</p>
			</a>
		</article>
	);
};

export default ProductCard;
