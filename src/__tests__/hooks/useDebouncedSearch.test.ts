import { renderHook, act } from "@testing-library/react";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

describe("useDebouncedSearch", () => {
	jest.useFakeTimers();

	it("should return the initial value immediately", () => {
		const { result } = renderHook(() => useDebouncedSearch("initial", 500));
		expect(result.current).toBe("initial");
	});

	it("should not update the value before the timeout", () => {
		const { result, rerender } = renderHook(
			({ value, ms }) => useDebouncedSearch(value, ms),
			{
				initialProps: { value: "initial", ms: 500 },
			},
		);

		rerender({ value: "updated", ms: 500 });
		expect(result.current).toBe("initial");

		act(() => {
			jest.advanceTimersByTime(499);
		});
		expect(result.current).toBe("initial");
	});

	it("should update the value after the specified delay", () => {
		const { result, rerender } = renderHook(
			({ value, ms }) => useDebouncedSearch(value, ms),
			{
				initialProps: { value: "initial", ms: 500 },
			},
		);

		rerender({ value: "updated", ms: 500 });

		act(() => {
			jest.advanceTimersByTime(500);
		});

		expect(result.current).toBe("updated");
	});

	it("should cancel the previous timeout if the value changes again", () => {
		const { result, rerender } = renderHook(
			({ value, ms }) => useDebouncedSearch(value, ms),
			{
				initialProps: { value: "initial", ms: 500 },
			},
		);

		rerender({ value: "first update", ms: 500 });
		act(() => {
			jest.advanceTimersByTime(250);
		});
		expect(result.current).toBe("initial");

		rerender({ value: "second update", ms: 500 });
		act(() => {
			jest.advanceTimersByTime(250);
		});
		expect(result.current).toBe("initial");

		act(() => {
			jest.advanceTimersByTime(500);
		});
		expect(result.current).toBe("second update");
	});
});
