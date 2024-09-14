import {
	CustomSeriesPricePlotValues,
	ICustomSeriesPaneView,
	PaneRendererCustomData,
	WhitespaceData,
	Time,
} from 'lightweight-charts';
import { OrderMapSeriesOptions, defaultOptions } from './options';
import { OrderMapSeriesRenderer } from './renderer';
import { OrderMapData } from './data';

export class OrderMapSeries<TData extends OrderMapData>
	implements ICustomSeriesPaneView<Time, TData, OrderMapSeriesOptions>
{
	_renderer: OrderMapSeriesRenderer<TData>;

	constructor() {
		this._renderer = new OrderMapSeriesRenderer();
	}

	priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
		// zero at the start because it should draw from zero (like a column)
		return [0, plotRow.price + plotRow.volume]; //TODO: this could require circle radius 
	}

	isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
		return (data as Partial<TData>).price === undefined;
	}

	renderer(): OrderMapSeriesRenderer<TData> {
		return this._renderer;
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: OrderMapSeriesOptions
	): void {
		this._renderer.update(data, options);
	}

	defaultOptions() {
		return defaultOptions;
	}
}
