import { render, screen, fireEvent } from "@testing-library/react";
import ImageGallery from "@/components/ImageGallery"; // Adjust the import path as needed
import "@testing-library/jest-dom";

const mockImages = ["/image1.jpg", "/image2.jpg", "/image3.jpg"];

describe("ImageGallery", () => {
	const scrollByMock = jest.fn();
	beforeAll(() => {
		Object.defineProperty(HTMLElement.prototype, "clientWidth", {
			configurable: true,
			value: 500,
		});
		Object.defineProperty(HTMLElement.prototype, "scrollBy", {
			configurable: true,
			value: scrollByMock,
		});
	});

	beforeEach(() => {
		scrollByMock.mockClear();
	});

	it("should render images and enabled navigation buttons", () => {
		render(<ImageGallery images={mockImages} />);

		const images = screen.getAllByRole("img");
		expect(images).toHaveLength(mockImages.length);

		expect(
			screen.getByRole("button", { name: /previous image/i }),
		).toBeEnabled();
		expect(screen.getByRole("button", { name: /next image/i })).toBeEnabled();
	});

	it("should use the provided title in the alt text for images", () => {
		const customTitle = "My Awesome Product";
		render(<ImageGallery images={mockImages} title={customTitle} />);

		expect(screen.getByAltText(`${customTitle} 1`)).toBeInTheDocument();
	});

	it("should use the default title 'Product' when no title is provided", () => {
		render(<ImageGallery images={mockImages} />);

		expect(screen.getByAltText("Product 1")).toBeInTheDocument();
	});

	it("should render disabled buttons when the images array is empty", () => {
		render(<ImageGallery images={[]} />);

		expect(screen.queryByRole("img")).not.toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: /previous image/i }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: /next image/i })).toBeDisabled();
	});

	it("should call scrollBy with the correct parameters when buttons are clicked", () => {
		render(<ImageGallery images={mockImages} />);
		const clientWidth = 500;

		const nextButton = screen.getByRole("button", { name: /next image/i });
		fireEvent.click(nextButton);
		expect(scrollByMock).toHaveBeenCalledWith({
			left: clientWidth,
			behavior: "smooth",
		});

		const prevButton = screen.getByRole("button", { name: /previous image/i });
		fireEvent.click(prevButton);
		expect(scrollByMock).toHaveBeenCalledWith({
			left: -clientWidth,
			behavior: "smooth",
		});

		expect(scrollByMock).toHaveBeenCalledTimes(2);
	});
});
