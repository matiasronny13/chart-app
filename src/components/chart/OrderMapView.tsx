import { Box } from "@mui/material";
import { MutableRefObject, useEffect, useRef } from "react";
import useOrderMap from "../../hooks/useOrderMap";

const OrderMapView = () => {
    const orderMapContainer = useRef() as MutableRefObject<HTMLDivElement>
    const {initializeChart, disposeChart} = useOrderMap({chartContainer:orderMapContainer})

    useEffect(() => {
        initializeChart()

        return () => {
            disposeChart()
        }
    }, [])

    return (<Box position={'relative'}>
        <div ref={orderMapContainer}></div>
    </Box>)
}

export default OrderMapView;