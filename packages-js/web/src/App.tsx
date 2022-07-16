import {
  Component,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  Show,
  Suspense,
  VoidComponent,
} from "solid-js"
import { Router } from "solid-app-router"
import { apiGenJwt } from "./api"
import { Stack } from "./components/Stack/Stack"
import { StylesProvider } from "./components/Styles/StylesProvider"
import { TextInput } from "./components/TextInput/TextInput"
import { KnownUser, user } from "./providers/Identity"
import { AppRoutes } from "./components/Routes"

interface Book {
  name: string
  author: string
}
const initBookList: Book[] = [
  { name: "The Hobbit", author: "J.R.R. Tolkien" },
  { name: "Living a Feminist Life", author: "Sarah Ahmed" },
]
const Bookshelf: VoidComponent = () => {
  const [books, setBooks] = createSignal<Book[]>(initBookList)
  return (
    <>
      <AddBook onAddBook={b => setBooks(books => [...books, b])} />
      <BookList books={books()} />
    </>
  )
}

const BookList: VoidComponent<{ books: Book[] }> = p => {
  return (
    <ul>
      <For each={p.books}>
        {book => (
          <li>
            {book.name} ({book.author})
          </li>
        )}
      </For>
    </ul>
  )
}

const emptyBook: Book = { author: "", name: "" }
const AddBook: VoidComponent<{ onAddBook: (book: Book) => void }> = p => {
  const [book, setBook] = createSignal<Book>(emptyBook)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (!book().name || !book().author) return
        p.onAddBook(book())
        setBook(emptyBook)
      }}
    >
      <Stack d="v" dist="s" style=" color : blue;">
        <Stack dist="xs" style={{ "background-color": "red" }}>
          <label for="name">Name</label>
          <span>:</span>
        </Stack>
        <TextInput
          id="name"
          value={book().name}
          onInput={e => setBook(b => ({ ...b, name: e.currentTarget.value }))}
        />
      </Stack>

      <label for="author">Author</label>
      <TextInput
        id="author"
        value={book().author}
        onInput={e => setBook(b => ({ ...b, author: e.currentTarget.value }))}
      />

      <button type="submit">Add</button>
    </form>
  )
}

const UnkownUserName = () => {
  return <div>Unknown user</div>
}
const KnownUserName: VoidComponent<{ user: KnownUser }> = p => {
  return (
    <div>
      Name: <em>{p.user.jwt.name}</em>
    </div>
  )
}
const Name = () => (
  <Show when={user().type === "known"} fallback={<UnkownUserName />}>
    <KnownUserName user={user() as KnownUser} />
  </Show>
)

const GenJwt: VoidComponent = () => {
  const [res] = createResource(apiGenJwt)
  return <div>{res()}</div>
}

const App: Component = () => {
  return (
    <StylesProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary fallback={<div>An error occured</div>}>
            <AppRoutes />
          </ErrorBoundary>
        </Suspense>
      </Router>
    </StylesProvider>
  )
}

export default App
