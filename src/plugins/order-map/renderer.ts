import {
	BitmapCoordinatesRenderingScope,
	CanvasRenderingTarget2D,
} from 'fancy-canvas';
import {
	Coordinate,
	ICustomSeriesPaneRenderer,
	PaneRendererCustomData,
	PriceToCoordinateConverter,
	Time,
} from 'lightweight-charts';
import { OrderMapData, OrderType } from './data';
import { OrderMapSeriesOptions } from './options';

interface OrderMapItem {
	x: number;
	y: Coordinate | number;
	radius: number;
	color: string;
}

export class OrderMapSeriesRenderer<TData extends OrderMapData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: OrderMapSeriesOptions | null = null;

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
		options: OrderMapSeriesOptions
	): void {
		this._data = data;
		this._options = options;
	}

	_draw3DCircle(ctx:CanvasRenderingContext2D, item:OrderMapItem) {
        const gradient = ctx.createRadialGradient(item.x, item.y, item.radius * 0.3, item.x, item.y, item.radius);
        gradient.addColorStop(0, "red"); // Lightest part
        gradient.addColorStop(1, "blue"); // Darkest part

        ctx.fillStyle = item.color;		
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
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
		//const options = this._options;
		const bubbles: OrderMapItem[] = this._data.bars.map(item => {
			return {
				x: item.x,
				y: priceToCoordinate(item.originalData.price) ?? 0,
				radius: item.originalData.volume / 2,
				color: item.originalData.type == OrderType.BUY ? 'rgba(10, 255, 55, 0.6)' : 'rgba(255, 14, 10, 0.6)'
			};
		});

		for (
			let i = this._data.visibleRange.from;
			i < this._data.visibleRange.to;
			i++
		) {
			const item = bubbles[i];
			this._draw3DCircle(renderingScope.context, item)
		}
	}
}
