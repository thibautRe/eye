import {
  Component,
  createEffect,
  ErrorBoundary,
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
import { AdminFenceOptional } from "./components/AuthFence"
import { PageLayout } from "./components/Layout/PageLayout"
import { Stack } from "./components/Stack/Stack"
import { T } from "./components/T/T"

const AppProviders: ParentComponent = p => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <I18nProvider>
        <ErrorBoundary
          fallback={(err, onRetry) => (
            <ErrorBoundaryFallback error={err} onRetry={onRetry} />
          )}
        >
          {p.children}
        </ErrorBoundary>
      </I18nProvider>
    </Suspense>
  </Router>
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

  return <UnexpectedError error={error} />
}

const UnexpectedError: VoidComponent<{ error: any }> = p => {
  createEffect(() => console.error(p.error))
  return (
    <PageLayout>
      <Stack d="v" dist="m" a="center">
        <T t="l">{props => <h1 {...props}>An error occured</h1>}</T>
        <AdminFenceOptional>
          <T t="s" fgColor="g11" bgColor="g3" ph="m" pv="s" br="m">
            {p.error.toString?.()}
          </T>
        </AdminFenceOptional>
      </Stack>
    </PageLayout>
  )
}

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
      return <UnexpectedError error={error} />
  }
}

export default App
