"use client";

import type { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";

export const CategorySelect: FC = () => {
	const { categories, loading, error } = useCategories();
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentCategory = searchParams.get("category");

	const handleCategoryChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const selectedValue = event.target.value;
		const params = new URLSearchParams(searchParams.toString());

		if (selectedValue === "") {
			params.delete("category");
		} else {
			params.set("category", selectedValue);
		}
		params.delete("page");

		router.push(`?${params.toString()}`);
	};

	if (error) {
		return <p className="text-red-500">Error: {error}</p>;
	}

	if (loading) {
		return (
			<select
				className="rounded border px-2 text-black dark:text-white dark:bg-zinc-950"
				disabled
			>
				<option>Loading categories...</option>
			</select>
		);
	}

	return (
		<select
			aria-label="Categories"
			value={currentCategory ?? ""}
			onChange={handleCategoryChange}
			className="rounded border px-2 py-1 text-black dark:text-white dark:bg-zinc-950"
		>
			<option value="" disabled={!currentCategory}>
				All categories
			</option>
			{categories.map((category) => (
				<option key={category.slug} value={category.slug}>
					{category.name}
				</option>
			))}
		</select>
	);
};
