import {
  Component,
  For,
  JSXElement,
  ParentComponent,
  Show,
  VoidComponent,
} from "solid-js"
import { Dynamic } from "solid-js/web"
import { Descendant, Header, Text } from "../../types/post"
import { PictureApi } from "../../types/picture"
import { AspectRatioPicture } from "../Picture/AspectRatio"
import { Picture, PictureMetadataInline } from "../Picture"
import * as s from "./PostContentDescendants.css"
import { T } from "../T/T"
import { A } from "@solidjs/router"
import { Stack } from "../Stack/Stack"
import { routes } from "../Routes"
import { Box } from "../Box/Box"
import { vars } from "../Styles/theme.css"

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
            const picture = () => p.includedPictureMap.get(item.pictureId)
            return (
              <Show when={picture()}>
                {picture => (
                  <PictureComponent
                    picture={picture()}
                    metadata={item.metadata ?? false}
                    label={item.label ?? []}
                  />
                )}
              </Show>
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

const HeaderComponent: ParentComponent<{ header: Header }> = p => (
  <Dynamic
    component={`h${p.header.level}`}
    children={p.children}
    class={s.header}
  />
)

const LinkComponent: ParentComponent<{ href: string }> = p => (
  <T fgColor="p10">
    {s => (
      <A href={p.href} {...s}>
        {p.children}
      </A>
    )}
  </T>
)

interface PictureComponentProps {
  picture: PictureApi
  metadata: boolean
  label: readonly Text[]
}
const PictureComponent: VoidComponent<PictureComponentProps> = p => (
  <Stack
    d="v"
    dist="s"
    style={{
      margin: 0,
      "margin-bottom": vars.space.xl,
      "margin-top": vars.space.m,
    }}
  >
    {props => (
      <figure {...props}>
        <Box style={{ "margin-left": "-30px", "margin-right": "-30px" }}>
          {props => (
            <A {...props} href={routes.Picture(p.picture.id)}>
              <AspectRatioPicture picture={p.picture}>
                <Picture picture={p.picture} sizes="650px" />
              </AspectRatioPicture>
            </A>
          )}
        </Box>
        <Show when={p.metadata}>
          <PictureMetadataInline picture={p.picture} />
        </Show>
        <Show when={p.label.length > 0}>
          <T t="m" fgColor="g10">
            {props => (
              <figcaption {...props}>
                <For each={p.label}>
                  {text => <TextComponent text={text} />}
                </For>
              </figcaption>
            )}
          </T>
        </Show>
      </figure>
    )}
  </Stack>
)

export default PostContentDescendants
