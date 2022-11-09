import { propVarFactory } from "../Styles/propVarFactory"

const { makePropVar, makePropVarM } = propVarFactory("grid")

export const [bgColorVar, bgBox] = makePropVar("backgroundColor")
export const [fgColorVar, fgBox] = makePropVar("color")

export const [plVar, plBox] = makePropVar("paddingLeft")
export const [prVar, prBox] = makePropVar("paddingRight")
export const [ptVar, ptBox] = makePropVar("paddingTop")
export const [pbVar, pbBox] = makePropVar("paddingBottom")
export const [plMVar, plMBox] = makePropVarM("paddingLeft")
export const [prMVar, prMBox] = makePropVarM("paddingRight")
export const [ptMVar, ptMBox] = makePropVarM("paddingTop")
export const [pbMVar, pbMBox] = makePropVarM("paddingBottom")

export const [brVar, brBox] = makePropVar("borderRadius")
