import { useEffect, useRef } from "react"
import Toolbar, { IToolbarRef } from "../components/Toolbar"
import { IChartService } from "../hooks/useChart"
import { TDataConfig, TLevelDetail } from "../shared/types"
import ChartView from "../components/chart/ChartView"
import AppContextProvider from "../contexts/AppContextProvider"
import UserContextProvider from "../contexts/UserContextProvider"
import ChartContextProvider from "../contexts/ChartContextProvider"

function Chart() {
  const toolbarRef = useRef<IToolbarRef>(null)
  const chartRef = useRef<IChartService>(null)

  const toolbarEventHandlers = {
    onStateChanged: (toolbarState: TDataConfig) => {
      chartRef.current?.updateState(toolbarState)
    },

    onRealtimePriceLineChanged: (isEnabled: boolean, distance: number) => {
      chartRef.current?.toogleRealtimePriceLine(isEnabled, distance)
    },

    onTradeReportChanged: (accountId: number, isChecked: boolean) => {
      chartRef.current?.toogleTradeReport(accountId, isChecked)
    },

    onTiltChanged: (isChecked: boolean) => {
      chartRef.current?.toogleTilt(isChecked)
    },

    onLevelSubmitted: (selectedValues: Map<string, TLevelDetail>) => {
      chartRef.current?.updateLevels(selectedValues)
    },

    onShadowOrderChanged: (isChecked: boolean) => {
      chartRef.current?.toogleShadowOrder(isChecked)
    }
  }

  const chartStateChanged = (toolbarState: TDataConfig) => {
    toolbarRef.current?.updateState(toolbarState)
  }

  useEffect(() => {
    const temp = chartRef.current
    temp?.initializeChart()

    return () => {
      temp?.disposeChart()
    }
  }, [])

  return (
    <UserContextProvider>
      <Toolbar ref={toolbarRef} eventHandlers={toolbarEventHandlers}></Toolbar>
      <AppContextProvider>
        <ChartContextProvider>
          <ChartView ref={chartRef} onStateChanged={chartStateChanged}></ChartView>
        </ChartContextProvider>        
      </AppContextProvider>
    </UserContextProvider>
  )
}

export default Chart
