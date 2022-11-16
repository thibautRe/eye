const HTTP_ERROR_NAME = "HttpError"
export class HttpError extends Error {
  constructor(public response: Response) {
    super(`${response.status} (${response.statusText})`)
    this.name = HTTP_ERROR_NAME
  }
}

export const isHttpError = (err: any): err is HttpError => {
  return err?.name === HTTP_ERROR_NAME
}
