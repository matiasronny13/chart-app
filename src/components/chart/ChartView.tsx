import { forwardRef, MutableRefObject, useImperativeHandle, useRef } from "react"
import useChart, { IChartService } from "../../hooks/useChart"
import TopOverlay, { ITopOverlay } from "./TopOverlay"
import { Box } from "@mui/material"
import AlertDialog, { TAlertDialogRef } from "../AlertDialog"
import { TDataConfig } from "../../shared/types"
import ShadowOrderDialog, { TShadowOrderDialogRef } from "./ShadowOrderDialog"

export type TChartViewProps = {
    onStateChanged: (state: TDataConfig) => void
}

const ChartView = forwardRef<IChartService, TChartViewProps>((props, ref) => {
    const chartContainer = useRef() as MutableRefObject<HTMLDivElement>
    const topOverlayContainer = useRef<ITopOverlay>(null);
    const alertDialogRef = useRef<TAlertDialogRef>(null)
    const shadowOrderDialogRef = useRef<TShadowOrderDialogRef>(null)
    
    const onAlertUpdated = (id: string, price: number) => {
        chartService.updateAlert(id, price)
    }
    
    const onShadowOrderUpdated = (size: number, stop: number) => {
        chartService.updateShadowOrder(size, stop)
    }

    const openAlertDetail = (event:Event) => {
        alertDialogRef.current!.onOpenAlertDetail(event)
    }

    const chartService = useChart({...props, 
        chartContainer: chartContainer, 
        topOverlayContainer:topOverlayContainer, 
        openAlertDetail: openAlertDetail,
        shadowOrderDialogRef: shadowOrderDialogRef
    })
    useImperativeHandle(ref, () => chartService);

    return (<Box position={'relative'}>
        <TopOverlay ref={topOverlayContainer}></TopOverlay>
        <AlertDialog ref={alertDialogRef} onAlertUpdated={onAlertUpdated}></AlertDialog>
        <ShadowOrderDialog ref={shadowOrderDialogRef} onShadowOrderUpdated={onShadowOrderUpdated}></ShadowOrderDialog>
        <div ref={chartContainer}></div>
    </Box>)
})

export default ChartView