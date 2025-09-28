import { getCategories } from "@/lib/cache";

export async function GET() {
	try {
		const data = await getCategories();
		return Response.json(data, {
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
