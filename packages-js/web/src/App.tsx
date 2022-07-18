import { Component, ErrorBoundary, Suspense } from "solid-js"
import { Router } from "solid-app-router"
import { AppRoutes } from "./components/Routes"

const App: Component = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>An error occured</div>}>
        <AppRoutes />
      </ErrorBoundary>
    </Suspense>
  </Router>
)

export default App
