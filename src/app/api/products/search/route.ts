import { getProducts } from "@/lib/cache";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	const query = searchParams.get("q");
	const category = searchParams.get("category");
	const sort = searchParams.get("sort");
	const order = searchParams.get("order") as "asc" | "desc" | null;
	const page = searchParams.get("page");
	const limit = searchParams.get("limit");

	try {
		const pageNumber = page ? parseInt(page, 10) : 1;
		const limitNumber = limit ? parseInt(limit, 10) : 30;

		if (Number.isNaN(pageNumber) || pageNumber < 1) {
			return Response.json(
				{ error: "Page parameter must be a positive integer" },
				{ status: 400 },
			);
		}

		if (Number.isNaN(limitNumber) || limitNumber < 1) {
			return Response.json(
				{ error: "Limit parameter must be a positive integer" },
				{ status: 400 },
			);
		}

		const data = await getProducts({
			q: query ?? undefined,
			category: category ?? undefined,
			sort: sort ?? undefined,
			order: order ?? undefined,
			page: pageNumber,
			limit: limitNumber,
		});

		return Response.json({
			products: data.products ?? [],
			total: data.total ?? 0,
			skip: data.skip ?? 0,
			limit: data.limit ?? limitNumber,
		});
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
