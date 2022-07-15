export const apiClientHeaders: { Authorization?: string } = {}

export const setApiClientJwt = (jwt: string | undefined) => {
  apiClientHeaders.Authorization = jwt
}
