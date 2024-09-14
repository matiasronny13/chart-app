import {
	CustomSeriesOptions,
	customSeriesDefaultOptions,
} from 'lightweight-charts';

export interface OrderMapSeriesOptions extends CustomSeriesOptions {
	lineWidth: number;
}

export const defaultOptions: OrderMapSeriesOptions = {
	...customSeriesDefaultOptions,
	lineWidth: 2,
} as const;
