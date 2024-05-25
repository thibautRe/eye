import { JSX, ParentComponent, createUniqueId } from "solid-js"
import { Button } from "./Button"
import * as s from "./FileUploadButton.css"

export interface FileUploadButtonProps
  extends Omit<
    JSX.InputHTMLAttributes<HTMLInputElement>,
    "type" | "id" | "class"
  > {}

const FileUploadButton: ParentComponent<FileUploadButtonProps> = p => {
  const id = createUniqueId()
  return (
    <Button>
      {bs => (
        <>
          <input type="file" id={id} class={s.input} {...p} />
          <label for={id} class={s.label} {...bs}>
            {p.children}
          </label>
        </>
      )}
    </Button>
  )
}

export default FileUploadButton
