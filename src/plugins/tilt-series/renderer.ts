import {
	BitmapCoordinatesRenderingScope,
	CanvasRenderingTarget2D,
} from 'fancy-canvas';
import {
	ICustomSeriesPaneRenderer,
	PaneRendererCustomData,
	PriceToCoordinateConverter,
	Time,
} from 'lightweight-charts';
import { TiltData } from './data';
import { TiltSeriesOptions } from './options';

interface TiltBarItem {
	x: number;
    highLine: number;
    middleLine: number;
    lowLine: number;
}

export class TiltSeriesRenderer<TData extends TiltData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: TiltSeriesOptions | null = null;

	draw(
		target: CanvasRenderingTarget2D,
		priceConverter: PriceToCoordinateConverter
	): void {
		target.useBitmapCoordinateSpace(scope =>
			this._drawImpl(scope, priceConverter)
		);
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: TiltSeriesOptions
	): void {
		this._data = data;
		this._options = options;
	}

	_drawImpl(
		renderingScope: BitmapCoordinatesRenderingScope,
		priceToCoordinate: PriceToCoordinateConverter
	): void {
		if (
			this._data === null ||
			this._data.bars.length === 0 ||
			this._data.visibleRange === null ||
			this._options === null
		) {
			return;
		}
		const options = this._options;
		const bars: TiltBarItem[] = this._data.bars.map(bar => {
			const biasEffect = (bar.originalData.bias / 10) * options.bandScale;
    		return {
				x: bar.x * renderingScope.horizontalPixelRatio,
				highLine: priceToCoordinate(bar.originalData.avgPrice + biasEffect)! * renderingScope.verticalPixelRatio,
				middleLine: priceToCoordinate(bar.originalData.avgPrice)! * renderingScope.verticalPixelRatio,
				lowLine: priceToCoordinate(bar.originalData.avgPrice - biasEffect)! * renderingScope.verticalPixelRatio				
			};
		});

		const ctx = renderingScope.context;
		ctx.beginPath();
		const lowLine = new Path2D();
		const highLine = new Path2D();
		const middleLine = new Path2D();

		const firstBar = bars[this._data.visibleRange.from];

		highLine.moveTo(firstBar.x, firstBar.highLine);
		middleLine.moveTo(firstBar.x, firstBar.middleLine);

		for (
			let i = this._data.visibleRange.from + 1;
			i < this._data.visibleRange.to;
			i++
		) {
			const bar = bars[i];
			highLine.lineTo(bar.x, bar.highLine);
			middleLine.lineTo(bar.x, bar.middleLine);
		}

		// We draw the close line in reverse so that it is
		// to reuse the Path2D to create the filled areas.
		const lastBar = bars[this._data.visibleRange.to - 1];
		lowLine.moveTo(lastBar.x, lastBar.lowLine);
		for (
			let i = this._data.visibleRange.to - 2;
			i >= this._data.visibleRange.from;
			i--
		) {
			const bar = bars[i];
			lowLine.lineTo(bar.x, bar.lowLine);
		}

		const topArea = new Path2D(highLine);
		topArea.lineTo(lastBar.x, lastBar.lowLine);
		topArea.addPath(lowLine);
		topArea.lineTo(firstBar.x, firstBar.highLine);
		topArea.closePath();
		ctx.fillStyle = options.areaColor;
		ctx.fill(topArea);

		ctx.lineJoin = 'round';		

		ctx.setLineDash([5, 5]);
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(highLine);

		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(lowLine);
		ctx.setLineDash([]);		

		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(middleLine);
	}
}