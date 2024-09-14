import {
	CustomSeriesOptions,
	customSeriesDefaultOptions,
} from 'lightweight-charts';

export interface TiltSeriesOptions extends CustomSeriesOptions {
	lineWidth: number;
	lineColor: string;
	areaColor: string;
	bandScale: number;
}

export const defaultOptions: TiltSeriesOptions = {
	...customSeriesDefaultOptions,
	lineWidth: 1,
	lineColor: 'rgba(0, 255, 0, 1)',
	areaColor: 'rgba(0, 255, 0, 0.2)',
	bandScale: 1
} as const;