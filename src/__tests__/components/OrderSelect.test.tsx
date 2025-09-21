import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OrderSelect } from "@/components/OrderSelect";

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

describe("OrderSelect", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the select component with default options", () => {
		mockSearchGet.mockReturnValue(null);

		render(<OrderSelect />);

		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(screen.getByText("Order ↑")).toBeInTheDocument();
		expect(screen.getByText("Order ↓")).toBeInTheDocument();
	});

	it("selects the correct option based on the URL search param", () => {
		mockSearchGet.mockReturnValue("desc");

		render(<OrderSelect />);

		const selectElement = screen.getByRole("combobox");
		expect(selectElement).toHaveValue("desc");
	});

	it("calls router.push with the new search param on change", () => {
		mockSearchGet.mockReturnValue(null);

		render(<OrderSelect />);

		const selectElement = screen.getByRole("combobox");
		fireEvent.change(selectElement, { target: { value: "asc" } });

		expect(mockRouterPush).toHaveBeenCalledWith("?order=asc");
	});

	it("removes the 'order' search param when an empty value is selected", () => {
		mockSearchGet.mockReturnValue("desc");

		render(<OrderSelect />);

		const selectElement = screen.getByRole("combobox");
		fireEvent.change(selectElement, { target: { value: "" } });

		expect(mockRouterPush).toHaveBeenCalledWith("?");
	});
});
