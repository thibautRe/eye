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

export type PostContent = Root
export interface Root {
  readonly children: readonly Descendant[]
}
export interface Text {
  readonly type: "text"
  readonly text: string
}
export interface Paragraph {
  readonly type: "paragraph"
  readonly children: readonly Descendant[]
}
export interface Picture {
  readonly type: "picture"
  readonly pictureId: Id<"picture">
}
export type Descendant = Text | Paragraph | Picture
