import {
  Component,
  For,
  JSXElement,
  ParentComponent,
  VoidComponent,
} from "solid-js"
import { Descendant, Header, Text } from "../../types/post"
import { PictureApi } from "../../types/picture"
import { AspectRatioPicture } from "../Picture/AspectRatio"
import { Picture } from "../Picture"
import { Dynamic } from "solid-js/web"

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
              <p>
                <PostContentDescendants {...p} children={item.children} />
              </p>
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

const HeaderComponent: ParentComponent<{ header: Header }> = p => {
  return <Dynamic component={`h${p.header.level}`} children={p.children} />
}

export default PostContentDescendants
