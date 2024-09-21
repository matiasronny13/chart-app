import { Coordinate, ISeriesPrimitivePaneView, SeriesPrimitivePaneViewZOrder } from 'lightweight-charts';
import ShadowOrder, { ShadowOrderPosition } from './shadow-order';
import { RendererPosition, OrderPositionType, ShadowOrderPaneRenderer, ShadowOrderRendererData } from './pane-renderer';
import { renderSettings } from './constants';
import { TRenderSetting } from './types';

export class ShadowOrderPaneView implements ISeriesPrimitivePaneView {
	_source: ShadowOrder;
	_rendererData: ShadowOrderRendererData;

	constructor(source: ShadowOrder) {
		this._source = source;
		this._rendererData = {
			actualPositions: new Map<OrderPositionType, RendererPosition>(),
			shadowPositions: new Map<OrderPositionType, RendererPosition>()
		};
	}

	update() {
		//const series = this._source.series;
		const data = this._source.data;
		//const options = this._source.options;

		// recalculate renderer data based on the new data
		this._recalculateRendererData(
			this._rendererData.actualPositions, 
			data.actualPosition, 
			[OrderPositionType.AvgCost, OrderPositionType.StopLoss, OrderPositionType.TakeProfit],
			renderSettings.actualOrder)

		this._rendererData.shadowPositions.clear()
		if(Math.abs(data.shadowPosition.positionSize) > Math.abs(data.actualPosition.positionSize)) {
			this._recalculateRendererData(
				this._rendererData.shadowPositions,
				data.shadowPosition,
				[OrderPositionType.AvgCost, OrderPositionType.StopLoss],
				renderSettings.shadowOrder)
		}
	}

	renderer() {
		return new ShadowOrderPaneRenderer(this._rendererData);
	}

	zOrder(): SeriesPrimitivePaneViewZOrder {
		return 'normal';
	}

	//#region Private Methods
	_recalculateRendererData(rendererData: Map<OrderPositionType, RendererPosition>, data: ShadowOrderPosition, visiblePositions: OrderPositionType[], options: TRenderSetting) {
		if(visiblePositions.includes(OrderPositionType.StopLoss)) {
			const stopColor = data.risk <= 0 ? options.colorPositive : options.colorNegative
			const stopTextColor = data.risk <= 0 ? "black" : "white"
			rendererData.set(OrderPositionType.StopLoss, {
				y: this._source.series.priceToCoordinate(data.stopLoss) as Coordinate,
				xOffset: options.labelXOffset,
				size: (data.positionSize * -1).toString(), 
				sizeTextColor: stopTextColor,
				sizeLabelColor: stopColor,
				pnl: (data.risk * -1).toFixed(2),
				pnlTextColor: stopTextColor,
				pnlLabelColor: stopColor,
				lineWidth: options.lineWidth,
				lineStyle: options.lineStyle,
			})
		}

		if(visiblePositions.includes(OrderPositionType.TakeProfit)) {
			const takeProfitColor = data.toMake >= 0 ? options.colorPositive : options.colorNegative
			const takeProfitTextColor = data.toMake >= 0 ? "black" : "white"
			rendererData.set(OrderPositionType.TakeProfit, {
				y: this._source.series.priceToCoordinate(data.takeProfit) as Coordinate,
				xOffset: options.labelXOffset,
				size: (data.positionSize * -1).toString(),
				sizeTextColor: takeProfitTextColor,
				sizeLabelColor: takeProfitColor,
				pnl: data.toMake.toFixed(2),
				pnlTextColor: takeProfitTextColor,
				pnlLabelColor: takeProfitColor,
				lineWidth: options.lineWidth,
				lineStyle: options.lineStyle
			})
		}
		
		visiblePositions.includes(OrderPositionType.AvgCost) &&
		rendererData.set(OrderPositionType.AvgCost, {
			y: this._source.series.priceToCoordinate(data.averagePrice) as Coordinate,
			xOffset: options.labelXOffset,
			size: data.positionSize.toString(),
			sizeTextColor: data.positionSize >= 0 ? "black" : "white",
			sizeLabelColor: data.positionSize >= 0 ? options.colorPositive : options.colorNegative,
			pnl: data.profitAndLoss.toFixed(2),
			pnlTextColor: data.profitAndLoss >= 0 ? "black" : "white",
			pnlLabelColor: data.profitAndLoss >= 0 ? options.colorPositive : options.colorNegative,
			lineWidth: options.lineWidth,
			lineStyle: options.lineStyle,
		})
	}
	//#endregion
}
