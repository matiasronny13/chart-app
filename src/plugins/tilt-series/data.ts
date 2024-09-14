import { CustomData } from 'lightweight-charts';

/**
 * Tilt Series Data
 */
export interface TiltData extends CustomData {
	bias: number;
    avgPrice: number;
}
