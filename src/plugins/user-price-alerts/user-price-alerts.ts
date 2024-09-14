import {
	IChartApi,
	ISeriesApi,
	ISeriesPrimitive,
	ISeriesPrimitivePaneView,
	PrimitiveHoveredItem,
	SeriesAttachedParameter,
	SeriesType,
	Time,
} from 'lightweight-charts';
import {
	averageWidthPerCharacter,
	buttonWidth,
	centreLabelHeight,
	centreLabelInlinePadding,
	clockIconPaths,
	clockPlusIconPaths,
	removeButtonWidth,
	showCentreLabelDistance,
} from './constants';
import { AlertRendererData, IRendererData } from './irenderer-data';
import { MouseHandlers, MousePosition } from './mouse';
import { UserAlertPricePaneView } from './pane-view';
import { UserAlertInfo, UserAlertsState } from './state';

export class UserPriceAlerts
	extends UserAlertsState
	implements ISeriesPrimitive<Time>
{
	private _chart: IChartApi | undefined = undefined;
	private _series: ISeriesApi<SeriesType> | undefined = undefined;
	private _mouseHandlers: MouseHandlers;

	private _paneViews: UserAlertPricePaneView[] = [];
	private _pricePaneViews: UserAlertPricePaneView[] = [];

	private _lastMouseUpdate: MousePosition | null = null;
	private _currentCursor: string | null = null;

	private _symbolName: string = '';
	private _currentHoverButton:string = ''

	constructor() {
		super();
		this._mouseHandlers = new MouseHandlers();
	}

	attached({ chart, series, requestUpdate }: SeriesAttachedParameter<Time>) {
		this._chart = chart;
		this._series = series;
		this._paneViews = [new UserAlertPricePaneView(false)];
		this._pricePaneViews = [new UserAlertPricePaneView(true)];
		this._mouseHandlers.attached(chart, series);
		this._mouseHandlers.mouseMoved().subscribe(mouseUpdate => {
			this._lastMouseUpdate = mouseUpdate;
			requestUpdate();
		}, this);
		this._mouseHandlers.clicked().subscribe(mousePosition => {
			if (mousePosition && this._series) {
				if (this._isHovering(mousePosition)) {
					const price = this._series.coordinateToPrice(mousePosition.y);
					if (price) {
						this.addAlert(price);
						requestUpdate();
					}
				}
				if (this._hoveringID) {
					if(this._currentHoverButton == 'remove') {
						this.removeAlert(this._hoveringID);
						requestUpdate();
					}
					else if(this._currentHoverButton == 'edit') {
						const hoveredAlert = this.alerts().find(a => a.id == this._hoveringID)
						chart.chartElement().dispatchEvent(new CustomEvent('OPEN_ALERT', {detail: hoveredAlert}))
					}
				}
			}
		}, this);
	}

	detached() {
		this._mouseHandlers.mouseMoved().unsubscribeAll(this);
		this._mouseHandlers.clicked().unsubscribeAll(this);
		this._mouseHandlers.detached();
		this._series = undefined;
	}

	paneViews(): readonly ISeriesPrimitivePaneView[] {
		return this._paneViews;
	}

	priceAxisPaneViews(): readonly ISeriesPrimitivePaneView[] {
		return this._pricePaneViews;
	}

	updateAllViews(): void {
		const alerts = this.alerts();
		const rendererData = this._calculateRendererData(
			alerts,
			this._lastMouseUpdate
		);
		this._currentCursor = null;
		if (
			rendererData?.button?.hovering ||
			rendererData?.alerts.some(alert => alert.showHover && (alert.hoverRemove || alert.hoverEdit))
		) {
			this._currentCursor = 'pointer';
		}
		this._paneViews.forEach(pv => pv.update(rendererData));
		this._pricePaneViews.forEach(pv => pv.update(rendererData));
	}

	hitTest(): PrimitiveHoveredItem | null {
		if (!this._currentCursor) return null;
		return {
			cursorStyle: this._currentCursor,
			externalId: 'user-alerts-primitive',
			zOrder: 'top',
		};
	}

	setSymbolName(name: string) {
		this._symbolName = name;
	}

	getSymbolName(): string {
		return this._symbolName;
	}

	_isHovering(mousePosition: MousePosition | null): boolean {
		return Boolean(
			mousePosition &&
				mousePosition.xPositionRelativeToPriceScale >= 1 &&
				mousePosition.xPositionRelativeToPriceScale < buttonWidth
		);
	}

	_isHoveringEditButton(
		mousePosition: MousePosition | null,
		timescaleWidth: number,
		alertY: number,
		textLength: number
	): boolean {
		if (!mousePosition || !timescaleWidth) return false;
		const distanceY = Math.abs(mousePosition.y - alertY);
		if (distanceY > centreLabelHeight / 2) return false;
		const labelWidth =
			centreLabelInlinePadding * 2 +
			(removeButtonWidth * 2) +
			textLength * averageWidthPerCharacter;
		const buttonCentreX =
			(timescaleWidth + labelWidth - (removeButtonWidth * 2)) * 0.5;
		const distanceX = Math.abs(mousePosition.x - buttonCentreX);
		return distanceX <= (removeButtonWidth * 2) / 2;
	}

	_isHoveringRemoveButton(
		mousePosition: MousePosition | null,
		timescaleWidth: number,
		alertY: number,
		textLength: number
	): boolean {
		if (!mousePosition || !timescaleWidth) return false;
		const distanceY = Math.abs(mousePosition.y - alertY);
		if (distanceY > centreLabelHeight / 2) return false;
		const labelWidth =
			centreLabelInlinePadding * 2 +
			(removeButtonWidth * 2) +
			textLength * averageWidthPerCharacter;
		const buttonCentreX =
			(timescaleWidth + labelWidth - removeButtonWidth) * 0.5;
		const distanceX = Math.abs(mousePosition.x - buttonCentreX);
		return distanceX <= removeButtonWidth / 2;
	}

	private _hoveringID: string = '';

	/**
	 * We are calculating this here instead of within a view
	 * because the data is identical for both Renderers so lets
	 * rather calculate it once here.
	 */
	_calculateRendererData(
		alertsInfo: UserAlertInfo[],
		mousePosition: MousePosition | null
	): IRendererData | null {
		if (!this._series) return null;
		const priceFormatter = this._series.priceFormatter();

		const showCrosshair = mousePosition && !mousePosition.overTimeScale;
		const showButton = showCrosshair;
		const crosshairPrice =
			mousePosition && this._series.coordinateToPrice(mousePosition.y);
		const crosshairPriceText = priceFormatter.format(crosshairPrice ?? -100);

		let closestDistance = Infinity;
		let closestIndex: number = -1;

		const alerts: (AlertRendererData & { price: number; id: string })[] =
			alertsInfo.map((alertInfo, index) => {
				const y = this._series!.priceToCoordinate(alertInfo.price) ?? -100;
				if (mousePosition?.y && y >= 0) {
					const distance = Math.abs(mousePosition.y - y);
					if (distance < closestDistance) {
						closestIndex = index;
						closestDistance = distance;
					}
				}
				return {
					y,
					showHover: false,
					price: alertInfo.price,
					id: alertInfo.id,
				};
			});
		this._hoveringID = '';
		if (closestIndex >= 0 && closestDistance < showCentreLabelDistance) {
			const timescaleWidth = this._chart?.timeScale().width() ?? 0;
			const a = alerts[closestIndex];
			const text = `${this._symbolName} crossing ${this._series
				.priceFormatter()
				.format(a.price)}`;
			const hoverRemove = this._isHoveringRemoveButton(
				mousePosition,
				timescaleWidth,
				a.y,
				text.length
			);
			let hoverEdit = false
			if(!hoverRemove) {
				hoverEdit = this._isHoveringEditButton(
					mousePosition,
					timescaleWidth,
					a.y,
					text.length
				);
			}
			alerts[closestIndex] = {
				...alerts[closestIndex],
				showHover: true,
				text,
				hoverRemove,
				hoverEdit
			};
			if (hoverRemove || hoverEdit) this._hoveringID = a.id;
			if (hoverEdit) 
				this._currentHoverButton = 'edit'
			else if (hoverRemove)
				this._currentHoverButton = 'remove'
			else 
				this._currentHoverButton = ''
		}
		return {
			alertIcon: clockIconPaths,
			alerts,
			button: showButton
				? {
						hovering: this._isHovering(mousePosition),
						hoverColor: '#50535E',
						crosshairLabelIcon: clockPlusIconPaths,
				  }
				: null,
			color: '#131722',
			crosshair: showCrosshair
				? {
						y: mousePosition.y,
						text: crosshairPriceText,
				  }
				: null,
		};
	}
}
