"use client";

import type { FC } from "react";
import { useProductsContext } from "@/context/Products";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

const Pagination: FC = () => {
	const { data, loading, error, hasLoaded } = useProductsContext();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

	if (loading || error || !hasLoaded) return null;

	const lastPage = Math.ceil(data.total / data.limit);

	const createPageURL = (pageNumber: number | string) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", pageNumber.toString());
		return `${pathname}?${params.toString()}`;
	};

	const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

	const renderPageNumbers = () => {
		let pages: (number | string)[] = [];
		const maxPagesToShow = 5;
		const ellipsis = "...";

		if (lastPage <= maxPagesToShow) {
			pages = pageNumbers;
		} else {
			if (currentPage <= 3) {
				pages = [...pageNumbers.slice(0, 4), ellipsis, lastPage];
			} else if (currentPage > lastPage - 3) {
				pages = [1, ellipsis, ...pageNumbers.slice(lastPage - 4, lastPage)];
			} else {
				pages = [
					1,
					ellipsis,
					currentPage - 1,
					currentPage,
					currentPage + 1,
					ellipsis,
					lastPage,
				];
			}
		}

		return pages.map((page, i) => {
			if (page === ellipsis) {
				return <span key={i}>{ellipsis}</span>;
			}
			const isCurrentPage = page === currentPage;
			const itemClasses = isCurrentPage ? "text-red-500" : "hover:text-red-500";

			return (
				<li key={i}>
					<Link href={createPageURL(page)} className={`${itemClasses}`}>
						{page}
					</Link>
				</li>
			);
		});
	};

	return (
		<nav className="my-12">
			<ul className="flex justify-center gap-4 [&_li_a]:p-4">
				<li>
					<Link
						href={createPageURL(currentPage - 1)}
						className={`${currentPage === 1 ? "pointer-events-none" : "hover:text-red-500"}`}
					>
						Previous
					</Link>
				</li>
				{renderPageNumbers()}
				<li>
					<Link
						href={createPageURL(currentPage + 1)}
						className={`${currentPage === lastPage ? "pointer-events-none" : "hover:text-red-500"}`}
					>
						Next
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
