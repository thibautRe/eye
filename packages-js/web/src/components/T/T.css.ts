import { style } from "@vanilla-extract/css"

export const sizes = {
  xs: style({ fontSize: "12px", lineHeight: "12px" }),
  s: style({ fontSize: "14px", lineHeight: "14px" }),
  m: style({ fontSize: "16px", lineHeight: "16px" }),
  l: style({ fontSize: "20px", lineHeight: "28px" }),
}

export const weights = {
  normal: style({ fontWeight: "400" }),
  bold: style({ fontWeight: "600" }),
}
