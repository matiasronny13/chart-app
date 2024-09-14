import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Chart = lazy(() => import("./pages/Chart"));
const OrderMap = lazy(() => import("./pages/OrderMap"))

function App() {
  const router = createBrowserRouter([
    { path: "/", element: (<Suspense fallback={<>Loading...</>}><Chart /></Suspense>) },
    { path: "/order", element: (<Suspense fallback={<>Loading...</>}><OrderMap /></Suspense>) }
  ], { basename: import.meta.env.BASE_URL });

  return <RouterProvider router={router} />;
}

export default App
