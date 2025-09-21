import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SortSelect } from "@/components/SortSelect";

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

describe("SortSelect", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the select component with all options", () => {
		mockSearchGet.mockReturnValue(null);
		render(<SortSelect />);

		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(screen.getByText("No Sorting")).toBeInTheDocument();
		expect(screen.getByText("Sort by Price")).toBeInTheDocument();
		expect(screen.getByText("Sort by Rating")).toBeInTheDocument();
	});

	it("selects the correct option based on the URL search param", () => {
		mockSearchGet.mockReturnValue("title");
		render(<SortSelect />);

		const selectElement = screen.getByRole("combobox");
		expect(selectElement).toHaveValue("title");
	});

	it("calls router.push with the new search param on change", () => {
		mockSearchGet.mockReturnValue(null);
		render(<SortSelect />);

		const selectElement = screen.getByRole("combobox");
		fireEvent.change(selectElement, { target: { value: "price" } });

		expect(mockRouterPush).toHaveBeenCalledWith("?sort=price");
	});

	it("removes the 'sort' param when 'No Sorting' is selected", () => {
		mockSearchGet.mockReturnValue("rating");
		render(<SortSelect />);

		const selectElement = screen.getByRole("combobox");
		fireEvent.change(selectElement, { target: { value: "" } });

		expect(mockRouterPush).toHaveBeenCalledWith("?");
	});
});
