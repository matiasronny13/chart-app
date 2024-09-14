import OrderMapView from "../components/chart/OrderMapView"
import ChartContextProvider from "../contexts/ChartContextProvider"

const OrderMap = () => {
    return (
        <ChartContextProvider>
            <OrderMapView></OrderMapView>
        </ChartContextProvider>
    )
}

export default OrderMap