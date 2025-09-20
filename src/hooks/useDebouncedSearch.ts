import { useState, useEffect } from "react";

export const useDebouncedSearch = (value: string, ms: number): string => {
	const [debouncedValue, setDebouncedValue] = useState<string>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, ms);

		return () => {
			clearTimeout(handler);
		};
	}, [value, ms]);

	return debouncedValue;
};
