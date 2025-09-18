import { getProducts } from "@/lib/cache";

export async function GET() {
	try {
		const data = await getProducts();
		return Response.json(data);
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
