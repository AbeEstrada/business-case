import { getProducts } from "@/lib/cache";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q");

	if (!query || typeof query !== "string") {
		return Response.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 },
		);
	}

	try {
		const data = await getProducts();

		const filtered = data?.products?.filter(
			(product) =>
				product.title.toLowerCase().includes(query.toLowerCase()) ||
				product?.description?.toLowerCase().includes(query.toLowerCase()),
		);

		return Response.json({
			products: filtered ?? {},
			total: filtered?.length ?? 0,
		});
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
