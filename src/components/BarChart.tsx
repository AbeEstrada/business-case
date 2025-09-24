import type { FC } from "react";
import { useId } from "react";

interface BarChartProps {
	data: number[] | null;
	height?: number;
	title?: string;
}

const BarChart: FC<BarChartProps> = ({
	data,
	height = 300,
	title = "Bar Chart",
}) => {
	const titleId = useId();
	const descriptionId = useId();

	if (!Array.isArray(data) || data.length === 0) {
		return <div>No data to display.</div>;
	}

	const localPrice = new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	});

	const validData = data.map((d) => (typeof d === "number" && d >= 0 ? d : 0));
	const maxValue = Math.max(...validData);

	const formattedPrices = validData.map((value) => localPrice.format(value));

	const barSpacing = 10;
	const minBarWidth = 20;
	const maxBarWidth = 50;

	const numBars = validData.length;
	const estimatedWidth = numBars * (maxBarWidth + barSpacing);
	const idealBarWidth = Math.max(
		minBarWidth,
		Math.min(maxBarWidth, estimatedWidth / numBars - barSpacing),
	);

	const totalBarWidth = idealBarWidth + barSpacing;
	const chartWidth = numBars * totalBarWidth;

	const barColors = [
		"orange",
		"rebeccapurple",
		"navy",
		"orchid",
		"teal",
		"steelblue",
		"orangered",
	];

	return (
		<figure
			className="w-full"
			style={{ height: `${height}px` }}
			aria-label={title}
		>
			<svg
				viewBox={`0 0 ${chartWidth} ${height}`}
				preserveAspectRatio="xMidYMid meet"
				className="block w-full h-full"
				aria-labelledby={titleId}
				role="img"
			>
				<title id={titleId}>{title}</title>
				<desc id={descriptionId}>Bar chart showing {numBars} data points.</desc>
				{validData.map((value, i) => {
					const barHeight = maxValue === 0 ? 0 : (value / maxValue) * height;
					const x = i * totalBarWidth;
					const y = height - barHeight;
					const barDescriptionId = `${descriptionId}-bar-${i}`;

					return (
						<g key={`group${i}`} aria-labelledby={barDescriptionId}>
							<title
								id={barDescriptionId}
							>{`Bar ${i + 1}: ${value.toLocaleString()}`}</title>
							<rect
								x={x}
								y={y}
								width={idealBarWidth}
								height={barHeight}
								fill={barColors[i % barColors.length]}
							/>
							<text
								x={x + idealBarWidth / 2}
								y={height - 5}
								textAnchor="middle"
								fontSize="12"
								fill="white"
							>
								{formattedPrices[i]}
							</text>
						</g>
					);
				})}
			</svg>
		</figure>
	);
};

export default BarChart;
