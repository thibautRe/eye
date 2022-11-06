import {
  Component,
  ErrorBoundary,
  lazy,
  ParentComponent,
  Suspense,
  VoidComponent,
} from "solid-js"
import { Router } from "solid-app-router"
import {
  AppRoutes,
  MaintenanceRoute,
  NotFoundRoute,
  UnauthorizedRoute,
} from "./components/Routes"
import { HttpError, isHttpError } from "./utils/errors"
import { I18nProvider } from "./providers/I18n"
import { StoredAdminFenceOptional } from "./components/AuthFence"

const AppProviders: ParentComponent = p => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary
        fallback={(err, onRetry) => (
          <ErrorBoundaryFallback error={err} onRetry={onRetry} />
        )}
      >
        <I18nProvider>{p.children}</I18nProvider>
      </ErrorBoundary>
    </Suspense>
    <Suspense>
      <StoredAdminFenceOptional>
        <LazyAdminToobar />
      </StoredAdminFenceOptional>
    </Suspense>
  </Router>
)

const LazyAdminToobar = lazy(
  () => import("./components/Admin/AdminToolbar/AdminToolbar"),
)

const App: Component = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
)

interface ErrorBoundaryFallbackProps {
  error: any
  onRetry: () => void
}
const ErrorBoundaryFallback: VoidComponent<ErrorBoundaryFallbackProps> = ({
  error,
  onRetry,
}) => {
  if (isHttpError(error)) {
    return <HttpErrorFallback error={error} onRetry={onRetry} />
  }

  return <UnexpectedError />
}

const UnexpectedError = () => <div>An error occured</div>

const HttpErrorFallback: VoidComponent<{
  error: HttpError
  onRetry: () => void
}> = ({ error, onRetry }) => {
  switch (error.response.status) {
    case 401:
    case 403:
      return <UnauthorizedRoute />
    case 404:
      return <NotFoundRoute />
    case 502:
      return <MaintenanceRoute />
    default:
      return <UnexpectedError />
  }
}

export default App
