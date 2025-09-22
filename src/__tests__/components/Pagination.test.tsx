import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Pagination from "@/components/Pagination";
import { useProductsContext } from "@/context/Products";
import { useSearchParams } from "next/navigation";

jest.mock("@/context/Products", () => ({
	useProductsContext: jest.fn(),
}));

jest.mock("next/navigation", () => ({
	usePathname: jest.fn(),
	useSearchParams: jest.fn(),
}));

jest.mock("next/link", () => {
	const mockLink = ({
		children,
		href,
		className,
	}: {
		children: React.ReactNode;
		href: string;
		className: string;
	}) => {
		return (
			<a href={href} className={className}>
				{children}
			</a>
		);
	};
	return mockLink;
});

describe("Pagination", () => {
	const mockContextData = {
		data: { total: 100, limit: 10, skip: 0 },
		loading: false,
		error: null,
		hasLoaded: true,
	};

	beforeEach(() => {
		(useProductsContext as jest.Mock).mockReturnValue(mockContextData);
		(useSearchParams as jest.Mock).mockReturnValue(
			new URLSearchParams("page=1"),
		);
	});

	it("should not render if not loaded or if there is an error", () => {
		(useProductsContext as jest.Mock).mockReturnValueOnce({
			...mockContextData,
			hasLoaded: false,
		});

		const { container } = render(<Pagination />);

		expect(container).toBeEmptyDOMElement();
	});

	it("should render Previous and Next buttons", () => {
		render(<Pagination />);

		expect(screen.getByText("Previous")).toBeInTheDocument();
		expect(screen.getByText("Next")).toBeInTheDocument();
	});

	it("should render page numbers correctly for a small number of pages", () => {
		(useProductsContext as jest.Mock).mockReturnValue({
			...mockContextData,
			data: { total: 40, limit: 10, skip: 0 },
		});
		(useSearchParams as jest.Mock).mockReturnValue(
			new URLSearchParams("page=1"),
		);

		render(<Pagination />);
		const pageLinks = screen.getAllByRole("link");

		expect(pageLinks).toHaveLength(6);
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText("4")).toBeInTheDocument();
	});

	it("should disable the 'Previous' button on the first page", () => {
		render(<Pagination />);

		const previousButton = screen.getByText("Previous");

		expect(previousButton).toHaveClass("pointer-events-none");
	});

	it("should disable the 'Next' button on the last page", () => {
		(useSearchParams as jest.Mock).mockReturnValue(
			new URLSearchParams("page=10"),
		);

		render(<Pagination />);

		const nextButton = screen.getByText("Next");
		expect(nextButton).toHaveClass("pointer-events-none");
	});
});
