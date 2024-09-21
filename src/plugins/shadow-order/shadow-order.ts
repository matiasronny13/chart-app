import { CandlestickData, DataChangedScope, Logical, MismatchDirection, Time } from "lightweight-charts";
import { PluginBase } from "../plugin-base";
import { defaultOptions, ShadowOrderOptions } from "./options";
import { ShadowOrderPaneView } from "./pane-view";
import { ensureDefined } from "../helpers/assertions";

export interface ShadowOrderPosition {
    positionSize: number
    averagePrice: number
    profitAndLoss: number
    stopLoss: number
    risk: number
    takeProfit: number
    toMake: number
}

export interface ShadowOrderData {
    actualPosition: ShadowOrderPosition
    shadowPosition: ShadowOrderPosition
	contractCost: number
}

export default class ShadowOrder extends PluginBase {
    private _data: ShadowOrderData;
    private _options: ShadowOrderOptions;
	private _paneViews: ShadowOrderPaneView[];

    constructor(data: ShadowOrderData, options: Partial<ShadowOrderOptions> = {}) {
        super();
		this._paneViews = [new ShadowOrderPaneView(this)];
        this._data = data;
        this._options = {
			...defaultOptions,
			...options,
		};
    }

	updateAllViews() {
		this._paneViews.forEach(pw => pw.update());
	}

	paneViews() {
		return this._paneViews;
	}

	//use this method to provide autoscale information if your primitive
	_timeCurrentlyVisible(time: Time, startTimePoint: Logical, endTimePoint: Logical): boolean {
		const ts = this.chart.timeScale();
		const coordinate = ts.timeToCoordinate(time);
		if (coordinate === null) return false;
		const logical = ts.coordinateToLogical(coordinate);
		if (logical === null) return false;
		return logical <= endTimePoint && logical >= startTimePoint;
	}
	
	dataUpdated(scope: DataChangedScope): void {
		//* This method will be called by PluginBase when the data on the
		//* series has changed.
		if(scope === 'update') {
			this.recalculatePositions();
		}
	}

	public get data(): ShadowOrderData {
		return this._data;
	}

	public get options(): ShadowOrderOptions {
		return ensureDefined(this._options);
	}

	applyOptions(options: Partial<ShadowOrderOptions>) {
		this._options = { ...this._options, ...options };
		this.requestUpdate();
	}

	//#region Custom Methods
	recalculatePositions() {
		const lastBar = this.series.dataByIndex(1000, MismatchDirection.NearestLeft) as CandlestickData<Time>;
		if (!lastBar) return;
		this.data.actualPosition.profitAndLoss = ((lastBar.close - this.data.actualPosition.averagePrice) * this.data.contractCost) * this.data.actualPosition.positionSize;

		//recalculate shadow position
		const actualAbsSize = Math.abs(this.data.actualPosition.positionSize);
		const shadowAbsSize = Math.abs(this.data.shadowPosition.positionSize);
		const additionalAbsSize = Math.abs(shadowAbsSize - actualAbsSize);
		
		const actualCost = this.data.actualPosition.averagePrice * actualAbsSize;
		const shadowCost = lastBar.close * additionalAbsSize
		this.data.shadowPosition.averagePrice = (actualCost + shadowCost) / shadowAbsSize
		this.data.shadowPosition.profitAndLoss = this.data.actualPosition.profitAndLoss

		this.data.shadowPosition.stopLoss = this.data.shadowPosition.averagePrice - (this.data.shadowPosition.risk / this.data.shadowPosition.positionSize)
	}

	updateShadowOrder(size: number, stop: number) {
		this._data.shadowPosition.positionSize = size
		this._data.shadowPosition.risk = stop
		this.recalculatePositions();
		this.requestUpdate();
	}

	forceUpdate() {
		this.requestUpdate();
	}

	increaseAveragePrice() {
		this._data.actualPosition.averagePrice += 1;
		this.requestUpdate();
	}
	//#endregion
}