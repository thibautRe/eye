const HTTP_ERROR_NAME = "HttpError"
export class HttpError extends Error {
  public response: Response
  constructor(response: Response) {
    super(`${HTTP_ERROR_NAME}: ${response.status} (${response.statusText})`)
    this.name = HTTP_ERROR_NAME
    this.response = response
  }
}

export const isHttpError = (err: any): err is HttpError => {
  return err?.name === HTTP_ERROR_NAME
}
