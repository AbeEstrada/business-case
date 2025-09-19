import { getProducts } from "@/lib/cache";

export async function GET() {
	try {
		const data = await getProducts();
		return Response.json(data);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		return Response.json({ error: errorMessage }, { status: 500 });
	}
}
