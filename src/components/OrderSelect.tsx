"use client";

import type { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const orderOptions = [
	{
		label: "Order ↑",
		value: "asc",
	},
	{
		label: "Order ↓",
		value: "desc",
	},
];

export const OrderSelect: FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentOrder = searchParams.get("order");

	const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = event.target.value;
		const params = new URLSearchParams(searchParams.toString());

		if (selectedValue === "") {
			params.delete("order");
		} else {
			params.set("order", selectedValue);
		}

		router.push(`?${params.toString()}`);
	};

	return (
		<select
			value={currentOrder ?? ""}
			onChange={handleOrderChange}
			className="rounded border px-2 py-1 text-black dark:text-white dark:bg-zinc-950"
		>
			{orderOptions.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};
