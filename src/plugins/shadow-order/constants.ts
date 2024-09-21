import { LineStyle } from "lightweight-charts";

export const centreLabelHeight = 25;
export const labelWidth = 120;
export const centreLabelInlinePadding = 9;
export const fontSize = 14;
export const removeButtonWidth = 37;
export const renderSettings = {
	actualOrder: {
		labelXOffset: 0,
		lineStyle: LineStyle.Solid,
		lineWidth: 1,
        colorPositive: '#00ff00',    
	    colorNegative: '#ff0000'
	},
	shadowOrder: {
		labelXOffset: 120,
		lineStyle: LineStyle.Dashed,
		lineWidth: 1,
        colorPositive: '#0aad02',    
	    colorNegative: '#ad020d'
	}
}