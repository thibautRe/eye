import { createVar, CSSProperties, style } from "@vanilla-extract/css"
import { resp } from "./theme.css"

type CSSProp = keyof CSSProperties
export const propVarFactory = (namespace: string) => ({
  makePropVar<T extends CSSProp>(prop: T) {
    const v = createVar(`grid-${prop}`)
    return [v, style({ [prop]: v })] as const
  },
  makePropVarM<T extends CSSProp>(prop: T) {
    const v = createVar(`grid-${prop}-M`)
    return [v, style({ "@media": { [resp.m]: { [prop]: v } } })] as const
  },
})
