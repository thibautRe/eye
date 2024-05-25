import {
  Component,
  For,
  JSXElement,
  ParentComponent,
  VoidComponent,
} from "solid-js"
import { Dynamic } from "solid-js/web"
import { Descendant, Header, Text } from "../../types/post"
import { PictureApi } from "../../types/picture"
import { AspectRatioPicture } from "../Picture/AspectRatio"
import { Picture } from "../Picture"
import * as s from "./PostContentDescendants.css"
import { T } from "../T/T"
import { A } from "@solidjs/router"

const PostContentDescendants: Component<{
  children: readonly Descendant[]
  includedPictureMap: ReadonlyMap<PictureApi["id"], PictureApi>
}> = p => {
  return (
    <For each={p.children}>
      {item => {
        switch (item.type) {
          case "text":
            return <TextComponent text={item} />
          case "paragraph":
            return (
              <ParagraphComponent>
                <PostContentDescendants {...p} children={item.children} />
              </ParagraphComponent>
            )
          case "picture": {
            const picture = p.includedPictureMap.get(item.pictureId)
            if (!picture) return null

            return (
              <AspectRatioPicture picture={picture}>
                <Picture picture={picture} sizes="650px" />
              </AspectRatioPicture>
            )
          }
          case "header":
            return (
              <HeaderComponent header={item}>
                <PostContentDescendants {...p} children={item.children} />
              </HeaderComponent>
            )
          case "link":
            return (
              <LinkComponent href={item.href}>
                <PostContentDescendants {...p} children={item.children} />
              </LinkComponent>
            )
          default:
            return item satisfies never
        }
      }}
    </For>
  )
}

const TextComponent: VoidComponent<{ text: Text }> = p => {
  const content = () => {
    let res: JSXElement = p.text.text
    if (p.text.bold) res = <strong>{res}</strong>
    if (p.text.italic) res = <em>{res}</em>
    return res
  }
  return <>{content()}</>
}

const ParagraphComponent: ParentComponent = p => (
  <T t="l" class={s.paragraph}>
    {props => <p {...props}>{p.children}</p>}
  </T>
)

const HeaderComponent: ParentComponent<{ header: Header }> = p => {
  return (
    <Dynamic
      component={`h${p.header.level}`}
      children={p.children}
      class={s.header}
    />
  )
}

const LinkComponent: ParentComponent<{ href: string }> = p => (
  <T fgColor="p10">
    {s => (
      <A href={p.href} {...s}>
        {p.children}
      </A>
    )}
  </T>
)

export default PostContentDescendants
