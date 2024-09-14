import { CandlestickSeriesPartialOptions, ColorType, HistogramSeriesPartialOptions, LineStyle } from "lightweight-charts"

export const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: ColorType.VerticalGradient, topColor:"#39393B", bottomColor:"#2a292f"}
    },
    crosshair: {
        mode: 0, // CrosshairMode.Normal
    },
    grid: {
        vertLines: {
            color: 'rgba(240, 243, 250, 0.05)',
            style: LineStyle.Solid, // Set vertical lines to dotted
        },
        horzLines: {
            color: 'rgba(240, 243, 250, 0.05)',
            style: LineStyle.Solid, // Set horizontal lines to dotted
        },
    },
    timeScale: {
      rightOffset: 4,
      barSpacing: 8,
      timeVisible: true, // Show the time on the x-axis
      secondsVisible: true, // Optionally show seconds (if needed)      
    }
}

export const candlestickOptions: CandlestickSeriesPartialOptions = {
    upColor: '#e6f0ff', downColor: '#0080ff', borderVisible: false,
    wickUpColor: '#e6f0ff', wickDownColor: '#0080ff',
}

export const volumeOptions: HistogramSeriesPartialOptions = {                    
    priceFormat: {
        type: 'volume',
    },
    priceScaleId: '' // set as an overlay by setting a blank priceScaleId                    
}