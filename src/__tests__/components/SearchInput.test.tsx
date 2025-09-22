import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchInput } from "@/components/SearchInput";

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

jest.mock("@/hooks/useDebouncedSearch", () => ({
	useDebouncedSearch: jest.fn((value) => value),
}));

describe("SearchInput", () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the input with the correct initial value from URL", () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		mockSearchGet.mockReturnValue("initial query");

		render(<SearchInput />);

		const inputElement = screen.getByRole("searchbox");
		expect(inputElement).toBeInTheDocument();
		expect(inputElement).toHaveValue("initial query");

		consoleSpy.mockRestore();
	});

	it("updates the URL after the debounce period when a user types", () => {
		mockSearchGet.mockReturnValue(null);
		render(<SearchInput />);

		const inputElement = screen.getByRole("searchbox");
		fireEvent.change(inputElement, { target: { value: "test" } });

		act(() => {
			jest.advanceTimersByTime(500);
		});

		expect(mockRouterPush).toHaveBeenCalledWith("/?q=test");
	});

	it("removes the 'q' param from the URL when the search is cleared", () => {
		mockSearchGet.mockReturnValue("test query");
		render(<SearchInput />);

		const inputElement = screen.getByRole("searchbox");
		fireEvent.change(inputElement, { target: { value: "" } });

		act(() => {
			jest.advanceTimersByTime(500);
		});

		expect(mockRouterPush).toHaveBeenCalledWith("/");
	});
});
