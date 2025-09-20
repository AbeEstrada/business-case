"use client";

import type { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
	{
		label: "Sort by Title",
		value: "title",
	},
	{
		label: "Sort by Price",
		value: "price",
	},
	{
		label: "Sort by Rating",
		value: "rating",
	},
	{
		label: "Sort by Stock",
		value: "stock",
	},
	{
		label: "Sort by Category",
		value: "category",
	},
];

export const SortSelect: FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort");

	const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = event.target.value;
		const params = new URLSearchParams(searchParams.toString());

		if (selectedValue === "") {
			params.delete("sort");
		} else {
			params.set("sort", selectedValue);
		}

		router.push(`?${params.toString()}`);
	};

	return (
		<select
			value={currentSort ?? ""}
			onChange={handleSortChange}
			className="rounded border px-2 py-1 text-black dark:text-white dark:bg-zinc-950"
		>
			<option value="">No Sorting</option>
			{sortOptions.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};
