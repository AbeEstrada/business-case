import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/cache";
import ProductClient from "@/components/ProductClient";
import type { ProductInterface } from "@/interfaces/Products";
import { BASE_URL } from "@/lib/constants";

export async function generateMetadata({
	params,
}: {
	params: { id: string };
}): Promise<Metadata> {
	try {
		const product = await getProductById(params.id);

		if (!product) {
			return {
				title: "Product Not Found",
				description: "The requested product could not be found.",
			};
		}

		const imageUrl = product.thumbnail || product.images?.[0];
		const canonicalUrl = `${BASE_URL}/products/${params.id}`;

		return {
			title: product.title,
			description: product.description,
			openGraph: {
				title: product.title,
				description: product.description,
				images: imageUrl ? [imageUrl] : [],
				url: canonicalUrl,
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title: product.title,
				description: product.description,
				images: imageUrl ? [imageUrl] : [],
			},
			alternates: {
				canonical: canonicalUrl,
			},
		};
	} catch (error) {
		console.error("Failed to generate metadata:", error);
		return {
			title: "Product Not Found",
			description: "The requested product could not be found.",
		};
	}
}

export default async function ProductPage({
	params,
}: {
	params: { id: string };
}) {
	let product: ProductInterface;

	try {
		product = await getProductById(params.id);
	} catch (error) {
		console.error("Error loading product:", error);
		return <div className="m-4">Product not available.</div>;
	}

	if (!product) {
		return notFound();
	}

	return <ProductClient product={product} />;
}
