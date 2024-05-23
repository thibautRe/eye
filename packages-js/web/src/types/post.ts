import { Id } from "./id"
import { PictureApi, parsePicture } from "./picture"

export interface PostApi {
  readonly id: Id<"post">
  readonly slug: string
  readonly content: PostContent

  readonly includedPictures: readonly PictureApi[]
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const parsePost = (post: PostApi): PostApi => ({
  ...post,
  createdAt: new Date(post.createdAt),
  updatedAt: new Date(post.updatedAt),
  includedPictures: post.includedPictures.map(parsePicture),
})

interface Node {
  readonly children: readonly Descendant[]
}

export type PostContent = Root
export interface Root extends Node {}
export interface Text {
  readonly type: "text"
  readonly text: string
  readonly bold?: boolean | null
  readonly italic?: boolean | null
}
export interface Header extends Node {
  readonly type: "header"
  readonly level: number
}
export interface Paragraph extends Node {
  readonly type: "paragraph"
}
export interface Picture {
  readonly type: "picture"
  readonly pictureId: Id<"picture">
}
export type Descendant = Text | Paragraph | Picture | Header
