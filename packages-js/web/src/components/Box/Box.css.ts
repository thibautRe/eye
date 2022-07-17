import { createVar, CSSProperties, style } from "@vanilla-extract/css"

function makePropVar<T extends keyof CSSProperties>(prop: T) {
  const v = createVar(`box-${prop}`)
  return [v, style({ [prop]: v })] as const
}

export const [bgColorVar, bgBox] = makePropVar("backgroundColor")
export const [fgColorVar, fgBox] = makePropVar("color")
export const [plVar, plBox] = makePropVar("paddingLeft")
export const [prVar, prBox] = makePropVar("paddingRight")
export const [ptVar, ptBox] = makePropVar("paddingTop")
export const [pbVar, pbBox] = makePropVar("paddingBottom")
export const [brVar, brBox] = makePropVar("borderRadius")
