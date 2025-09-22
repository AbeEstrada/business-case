"use client";

import type { FC } from "react";
import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export const SearchInput: FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		inputRef?.current?.focus();
	}, []);

	const initialQuery = searchParams.get("q") ?? "";
	const [searchValue, setSearchValue] = useState<string>(initialQuery);
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	};

	const debouncedSearchValue = useDebouncedSearch(searchValue, 500);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		const query = debouncedSearchValue.trim();

		if (query) {
			newSearchParams.set("q", query);
		} else {
			newSearchParams.delete("q");
		}

		const newUrl = newSearchParams.toString();
		if (newUrl) {
			router.push(`/?${newUrl}`);
		} else {
			router.push("/");
		}
	}, [debouncedSearchValue, router, searchParams]);

	return (
		<search className="w-full" aria-label="Product search">
			<input
				ref={inputRef}
				className="rounded border w-full px-2 py-1 text-black dark:text-white dark:bg-zinc-950"
				type="search"
				placeholder="Search Product"
				aria-label="Search products"
				tabIndex={0}
				onChange={handleSearchChange}
				value={searchValue}
			/>
		</search>
	);
};
