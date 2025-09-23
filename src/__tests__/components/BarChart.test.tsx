import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BarChart from "@/components/BarChart";

jest.mock("react", () => ({
	...jest.requireActual("react"),
	useId: () => "mock-id",
}));

describe("BarChart", () => {
	it("should render a bar chart with given data", () => {
		const testData = [10, 20, 30];
		const testTitle = "Test Bar Chart";
		const localPrice = new Intl.NumberFormat("es-MX", {
			style: "currency",
			currency: "MXN",
		});

		render(<BarChart data={testData} title={testTitle} />);

		const figure = screen.getByRole("figure", { name: testTitle });
		expect(figure).toBeInTheDocument();

		const svg = screen.getByRole("img", { name: testTitle });
		expect(svg).toBeInTheDocument();

		const titleElement = screen.getByText(testTitle, { selector: "title" });
		expect(titleElement).toBeInTheDocument();

		testData.forEach((value, index) => {
			const formattedValue = localPrice.format(value);
			const barTitle = screen.getByText(`Bar ${index + 1}: ${value}`, {
				selector: "title",
			});
			expect(barTitle).toBeInTheDocument();

			const textLabel = screen.getByText(formattedValue);
			expect(textLabel).toBeInTheDocument();
		});

		const barTitles = screen.getAllByText(/Bar \d+: \d+/, {
			selector: "title",
		});
		expect(barTitles.length).toBe(testData.length);
	});

	it('displays "No data to display." when data is empty or invalid', () => {
		const { rerender } = render(<BarChart data={[]} />);
		expect(screen.getByText("No data to display.")).toBeInTheDocument();

		rerender(<BarChart data={null} />);
		expect(screen.getByText("No data to display.")).toBeInTheDocument();
	});

	it("renders a chart with the default title when no title is provided", () => {
		const data = [10, 20];
		render(<BarChart data={data} />);

		expect(screen.getByText("Bar Chart")).toBeInTheDocument();
	});

	it("renders a chart with the default height when no height is provided", () => {
		const data = [10, 20];
		render(<BarChart data={data} />);

		expect(screen.getByRole("figure")).toHaveStyle("height: 300px");
	});

	it("renders a chart with the specified height", () => {
		const data = [10, 20];
		const height = 500;
		render(<BarChart data={data} height={height} />);

		expect(screen.getByRole("figure")).toHaveStyle(`height: ${height}px`);
	});
});
