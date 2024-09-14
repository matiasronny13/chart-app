import {
	CustomSeriesPricePlotValues,
	ICustomSeriesPaneView,
	PaneRendererCustomData,
	WhitespaceData,
	Time,
} from 'lightweight-charts';
import { TiltSeriesOptions, defaultOptions } from './options';
import { TiltSeriesRenderer } from './renderer';
import { TiltData } from './data';

export class TiltSeries<TData extends TiltData>	implements ICustomSeriesPaneView<Time, TData, TiltSeriesOptions>
{
	_renderer: TiltSeriesRenderer<TData>;

	constructor() {
		this._renderer = new TiltSeriesRenderer();
	}

	get symbol(): string {
		return "ds";
	}

	priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
		return [plotRow.avgPrice, plotRow.avgPrice];
	}

	isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
		return (data as Partial<TData>) === undefined;
	}

	renderer(): TiltSeriesRenderer<TData> {
		return this._renderer;
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: TiltSeriesOptions
	): void {
		this._renderer.update(data, options);
	}

	defaultOptions() {
		return defaultOptions;
	}
}
