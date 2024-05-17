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

type PostContent = Root
interface Root {
  readonly children: readonly Descendant[]
}
interface Text {
  readonly text: string
}
interface Paragraph {
  readonly children: readonly Descendant[]
}
interface Picture {
  readonly pictureId: Id<"picture">
}
type Descendant = Text | Paragraph | Picture
