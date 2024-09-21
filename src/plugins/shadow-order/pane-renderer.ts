import { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas';
import { Coordinate, ISeriesPrimitivePaneRenderer, LineStyle } from 'lightweight-charts';
import { positionsLine } from '../helpers/dimensions/positions';
import { centreLabelHeight, centreLabelInlinePadding, fontSize, labelWidth, removeButtonWidth } from './constants';

export enum OrderPositionType {
    AvgCost,
    StopLoss,
    TakeProfit
}

export interface RendererPosition {
    y: Coordinate
	xOffset: number
    size: string
	sizeTextColor: string
	sizeLabelColor: string
	pnl: string
	pnlTextColor: string
	pnlLabelColor: string
	lineWidth: number
	lineStyle: LineStyle
}

export interface ShadowOrderRendererData {
	actualPositions: Map<OrderPositionType, RendererPosition>;
	shadowPositions: Map<OrderPositionType, RendererPosition>;
}

export class ShadowOrderPaneRenderer implements ISeriesPrimitivePaneRenderer {
    private _data: ShadowOrderRendererData;
    constructor(data: ShadowOrderRendererData) {
		this._data = data;
	}

    drawBackground?(target: CanvasRenderingTarget2D): {}
	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace(scope => {
            if (!this._data) return;

			this._data.shadowPositions.forEach((orderPosition:RendererPosition, _:OrderPositionType) => {
				this._drawHorizontalLine(scope, orderPosition);
				this._drawLabel(scope, orderPosition);
			});

			this._data.actualPositions.forEach((orderPosition:RendererPosition, _:OrderPositionType) => {
				this._drawHorizontalLine(scope, orderPosition);
				this._drawLabel(scope, orderPosition);
			});
		});
	}

    //#region Drawing Methods
	_drawHorizontalLine(scope: BitmapCoordinatesRenderingScope, data: RendererPosition) {
		const ctx = scope.context;

		ctx.save();
		try {
			const yPos = positionsLine(
				data.y,
				scope.verticalPixelRatio,
				data.lineWidth
			);
			const yCentre = yPos.position + yPos.length / 2;

			ctx.beginPath();
			ctx.lineWidth = data.lineWidth;
			ctx.strokeStyle = data.pnlLabelColor;
			const dash = 4 * scope.horizontalPixelRatio;
			ctx.setLineDash(data.lineStyle === LineStyle.Dashed ? [dash, dash] : []);
			ctx.moveTo(0, yCentre);
			ctx.lineTo(scope.bitmapSize.width * scope.horizontalPixelRatio, yCentre);
			ctx.stroke();
		} 
		finally {
			ctx.restore();
		}
	}

	_drawLabel(scope: BitmapCoordinatesRenderingScope, data: RendererPosition) {
		if (!this._data) return;
		const ctx = scope.context;

		const labelXDimensions = positionsLine(
			(scope.mediaSize.width / 2) + data.xOffset,
			scope.horizontalPixelRatio,
			labelWidth
		);
		const yDimensions = positionsLine(
			data.y,
			scope.verticalPixelRatio,
			centreLabelHeight
		);

		ctx.save();
		try {
			const radius = 4 * scope.horizontalPixelRatio;
			// draw main body background of label
			ctx.beginPath();
			ctx.roundRect(
				labelXDimensions.position,
				yDimensions.position,
				labelXDimensions.length,
				yDimensions.length,
				radius
			);
			ctx.fillStyle = data.pnlLabelColor;
			ctx.fill();

			const removeButtonStartX =
				labelXDimensions.position +
				labelXDimensions.length -
				removeButtonWidth * scope.horizontalPixelRatio;

			// draw hover background for remove button
			ctx.beginPath();
			ctx.roundRect(
				removeButtonStartX,
				yDimensions.position,
				removeButtonWidth * scope.horizontalPixelRatio,
				yDimensions.length,
				[0, radius, radius, 0]
			);
			ctx.fillStyle = data.sizeLabelColor;
			ctx.fill();
			
			// draw button divider
			ctx.beginPath();
			const dividerDimensions = positionsLine(
				removeButtonStartX / scope.horizontalPixelRatio,
				scope.horizontalPixelRatio,
				1
			);
			ctx.fillStyle = '#000000';
			ctx.fillRect(
				dividerDimensions.position,
				yDimensions.position,
				dividerDimensions.length,
				yDimensions.length
			);

			// draw stroke for main body
			ctx.beginPath();
			ctx.roundRect(
				labelXDimensions.position,
				yDimensions.position,
				labelXDimensions.length,
				yDimensions.length,
				radius
			);
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 1 * scope.horizontalPixelRatio;
			ctx.stroke();

			// write text
			ctx.beginPath();
			ctx.fillStyle = data.pnlTextColor;
			ctx.textBaseline = 'middle';
			ctx.font = `${Math.round(fontSize * scope.verticalPixelRatio)}px sans-serif`;
			ctx.fillText(
				`$ ${data.pnl}`,
				labelXDimensions.position +	centreLabelInlinePadding * scope.horizontalPixelRatio,
				data.y * scope.verticalPixelRatio
			);

			// draw button icon
			ctx.beginPath();
			
			ctx.fillStyle = data.sizeTextColor;
			ctx.textBaseline = 'middle';
			ctx.font = `${Math.round(fontSize * scope.verticalPixelRatio)}px sans-serif`;
			ctx.fillText(
				data.size,
				removeButtonStartX + centreLabelInlinePadding * scope.horizontalPixelRatio,
				data.y * scope.verticalPixelRatio
			);
		} finally {
			ctx.restore();
		}
	}
    
    _myRenderingFunction(scope: BitmapCoordinatesRenderingScope) {
        const ctx = scope.context;

        ctx.save();    
        try {
            scope.context.beginPath();
            scope.context.rect(0, 0, scope.bitmapSize.width, scope.bitmapSize.height);
            scope.context.fillStyle = 'rgba(100, 200, 50, 0.5)';
            scope.context.fill();
        } finally {
            ctx.restore();
        }
    }
    //#endregion
}