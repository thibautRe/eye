import { JSX, mergeProps, ParentComponent, VoidComponent } from "solid-js"

export interface SvgProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  size: 16 | 24
}
export const Svg: ParentComponent<SvgProps> = p => {
  const props = mergeProps({ width: p.size, height: p.size }, p)
  return <svg {...props}>{p.children}</svg>
}

export type IconComponent = VoidComponent<Omit<SvgProps, "viewBox">>
