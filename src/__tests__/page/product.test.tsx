import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { notFound } from "next/navigation";
import ProductPage, { generateMetadata } from "@/app/product/[id]/page";
import { getProductById } from "@/lib/cache";
import type { ProductInterface } from "@/interfaces/Products";

jest.mock("@/lib/cache", () => ({
	getProductById: jest.fn(),
}));

jest.mock("next/navigation", () => ({
	notFound: jest.fn(),
}));

jest.mock("@/components/ProductClient", () => {
	return jest.fn(({ product }) => <div>{product.title}</div>);
});

const mockedGetProductById = getProductById as jest.Mock;
const mockedNotFound = notFound as unknown as jest.Mock;

describe("Product Page", () => {
	const mockProduct: ProductInterface = {
		id: 1,
		title: "Test Product",
		description: "Test Description",
		thumbnail: "/thumbnail.jpg",
	};

	const params = { id: "1" };

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("generateMetadata", () => {
		it("should generate correct metadata when a product is found", async () => {
			mockedGetProductById.mockResolvedValue(mockProduct);

			const metadata = await generateMetadata({ params });

			expect(metadata.title).toBe("Test Product");
			expect(metadata.description).toBe("Test Description");
			expect(metadata.openGraph?.images).toEqual([mockProduct.thumbnail]);
		});

		it('should return "Not Found" metadata when fetching fails', async () => {
			const consoleErrorSpy = jest
				.spyOn(console, "error")
				.mockImplementation(() => {});

			mockedGetProductById.mockRejectedValue(new Error("Network Failure"));

			const metadata = await generateMetadata({ params });

			expect(metadata.title).toBe("Product Not Found");

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Page Component Rendering", () => {
		it("should render the ProductClient when a product is found", async () => {
			mockedGetProductById.mockResolvedValue(mockProduct);

			const Page = await ProductPage({ params });
			render(Page);

			expect(screen.getByText("Test Product")).toBeInTheDocument();
		});

		it("should call notFound() when the product is not returned", async () => {
			mockedGetProductById.mockResolvedValue(null);

			await ProductPage({ params });

			expect(mockedNotFound).toHaveBeenCalledTimes(1);
		});

		it("should render an error message when data fetching throws an error", async () => {
			mockedGetProductById.mockRejectedValue(new Error("Failed to fetch"));

			const Page = await ProductPage({ params });
			render(Page);

			expect(screen.getByText("Product not available.")).toBeInTheDocument();
		});
	});
});
