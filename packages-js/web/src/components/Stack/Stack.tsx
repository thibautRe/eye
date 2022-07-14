import { JSX, mergeProps, ParentComponent } from 'solid-js'
import { classList } from 'solid-js/web'
import { mergeStyle } from '../../utils/mergeStyle'
import { ThemeSpaceKey, vars } from '../Styles/theme.css'
import { stackD, varDistName } from './Stack.css'

export interface StackOwnProps {
  d?: 'h' | 'v'
  dist?: ThemeSpaceKey
  a?: 'start' | 'center' | 'end'
}
export interface StackProps
  extends StackOwnProps,
    JSX.HTMLAttributes<HTMLDivElement> {}
export const Stack: ParentComponent<StackProps> = (p) => {
  const props = mergeProps({ d: 'h', dist: '0' } as const, p)
  return (
    <div
      {...p}
      classList={{ [stackD[props.d]]: true, ...classList }}
      style={mergeStyle(p.style, { [varDistName]: vars.space[props.dist] })}
    >
      {p.children}
    </div>
  )
}
