import { getProducts } from "@/lib/cache";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	const delay = searchParams.get("delay");
	if (delay && !Number.isNaN(Number(delay))) {
		const delayMs = parseInt(delay, 10);
		await new Promise<void>((res) => setTimeout(res, delayMs));
	}

	try {
		const data = await getProducts();
		return Response.json(data);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		return Response.json({ error: errorMessage }, { status: 500 });
	}
}
