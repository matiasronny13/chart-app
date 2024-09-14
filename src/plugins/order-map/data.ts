import { CustomData } from 'lightweight-charts';

export enum OrderType {
	BUY,
	SELL
}

/**
 * Order Map Series Data
 */
export interface OrderMapData extends CustomData {
	price: number;
	volume: number;
	type: OrderType;
}
