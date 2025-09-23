import { useRef } from "react";

interface ImageGalleryProps {
	images: string[];
	title?: string;
}

const ImageGallery = ({ images, title = "Product" }: ImageGalleryProps) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollLeft = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({
				left: -scrollRef.current.clientWidth,
				behavior: "smooth",
			});
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({
				left: scrollRef.current.clientWidth,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto">
			<div
				ref={scrollRef}
				className="flex overflow-x-scroll snap-x snap-mandatory scroll-smooth mb-4 bg-zinc-700"
				style={{
					scrollSnapType: "x mandatory",
					WebkitOverflowScrolling: "touch",
				}}
			>
				<ul className="flex w-full h-64 sm:h-80 md:h-96">
					{images.map((image, i) => (
						<li
							key={image}
							className="flex-shrink-0 w-full h-full snap-start flex items-center justify-center"
						>
							<img
								src={image}
								alt={`${title} - Image ${i + 1}`}
								loading="lazy"
								className="object-contain w-full h-full px-2 py-4"
							/>
						</li>
					))}
				</ul>
			</div>

			<div className="flex justify-center gap-6">
				<button
					type="button"
					onClick={scrollLeft}
					disabled={images.length === 0}
					aria-label="Previous image"
				>
					Previous
				</button>
				<button
					type="button"
					onClick={scrollRight}
					disabled={images.length === 0}
					aria-label="Next image"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default ImageGallery;
