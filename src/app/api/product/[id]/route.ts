import { getProductById } from "@/lib/cache";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) return Response.json({ error: "Invalid product ID" }, { status: 400 });

    const product = await getProductById(id);
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

    return Response.json(product, {
			headers: {
				"Cache-Control": "public, max-age=300",
			},
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		return Response.json(
			{ error: errorMessage },
			{
				status: 500,
				headers: {
					"Cache-Control": "no-store",
				},
			},
		);
	}
}
