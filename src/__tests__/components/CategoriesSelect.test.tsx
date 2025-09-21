jest.mock("@/hooks/useCategories", () => ({
	useCategories: jest.fn(),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useCategories } from "@/hooks/useCategories";
import { CategorySelect } from "@/components/CategoriesSelect";

const mockRouterPush = jest.fn();
const mockSearchGet = jest.fn();
const mockSearchParams = {
	get: mockSearchGet,
	toString: () => "",
};

jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockRouterPush,
	}),
	useSearchParams: () => mockSearchParams,
}));

const mockCategories = [
	{ slug: "beauty", name: "Beauty", url: "" },
	{ slug: "fragrances", name: "Fragrances", url: "" },
	{ slug: "furniture", name: "Furniture", url: "" },
];

describe("CategorySelect", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders loading state correctly", () => {
		jest
			.mocked(useCategories)
			.mockReturnValue({ categories: [], loading: true, error: null });

		render(<CategorySelect />);

		expect(screen.getByText("Loading categories...")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("renders an error message when there is an error", () => {
		jest.mocked(useCategories).mockReturnValue({
			categories: [],
			loading: false,
			error: "Failed to fetch categories",
		});

		render(<CategorySelect />);

		expect(
			screen.getByText(/Error: Failed to fetch categories/i),
		).toBeInTheDocument();
	});

	it("renders the select component with all category options", () => {
		jest.mocked(useCategories).mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
		});
		mockSearchGet.mockReturnValue(null);

		render(<CategorySelect />);

		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(screen.getByText("All categories")).toBeInTheDocument();
		expect(screen.getByText("Beauty")).toBeInTheDocument();
		expect(screen.getByText("Fragrances")).toBeInTheDocument();
		expect(screen.getByText("Furniture")).toBeInTheDocument();
	});

	it("selects the correct option based on the URL search param", () => {
		jest.mocked(useCategories).mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
		});
		mockSearchGet.mockReturnValue("beauty");
		render(<CategorySelect />);

		const selectElement = screen.getByRole("combobox");
		expect(selectElement).toHaveValue("beauty");
	});

	it("calls router.push with the new search param on change", () => {
		jest.mocked(useCategories).mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
		});
		mockSearchGet.mockReturnValue(null);
		render(<CategorySelect />);

		const selectElement = screen.getByRole("combobox");
		fireEvent.change(selectElement, { target: { value: "beauty" } });

		expect(mockRouterPush).toHaveBeenCalledWith("?category=beauty");
	});

	it("removes the 'category' param when 'All categories' is selected", () => {
		jest.mocked(useCategories).mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
		});
		mockSearchGet.mockReturnValue("beauty");
		render(<CategorySelect />);

		const selectElement = screen.getByRole("combobox");
		fireEvent.change(selectElement, { target: { value: "" } });

		expect(mockRouterPush).toHaveBeenCalledWith("?");
	});
});
