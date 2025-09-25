import type { FC } from "react";
import { useRef } from "react";

interface ImageGalleryProps {
	images: string[];
	title?: string;
}

const ImageGallery: FC<ImageGalleryProps> = ({ images, title = "Product" }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	const handleScroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount =
				direction === "left"
					? -scrollRef.current.clientWidth
					: scrollRef.current.clientWidth;
			scrollRef.current.scrollBy({
				left: scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto">
			<div
				ref={scrollRef}
				className="flex overflow-x-scroll snap-x snap-mandatory scroll-smooth mb-4 rounded-lg bg-zinc-400 dark:bg-zinc-700"
			>
				<ul className="flex w-full h-64 sm:h-80 md:h-96">
					{images.map((image, i) => (
						<li
							key={image}
							className="flex-shrink-0 w-full h-full snap-start flex items-center justify-center"
						>
							<img
								src={image}
								alt={`${title} ${i + 1}`}
								loading="lazy"
								className="object-contain w-full h-full px-2 py-4"
							/>
						</li>
					))}
				</ul>
			</div>

			<div className="flex justify-center gap-6 [&_button:disabled]:opacity-30">
				<button
					type="button"
					onClick={() => handleScroll("left")}
					disabled={images.length < 2}
					aria-label="Previous image"
				>
					Previous
				</button>
				<button
					type="button"
					onClick={() => handleScroll("right")}
					disabled={images.length < 2}
					aria-label="Next image"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default ImageGallery;
