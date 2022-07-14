import { Accessor, Component, createSignal, For, VoidComponent } from 'solid-js'

import { Stack } from './components/Stack/Stack'
import { StylesProvider } from './components/Styles/StylesProvider'
import { TextInput } from './components/TextInput/TextInput'

interface Book {
  name: string
  author: string
}
const initBookList: Book[] = [
  { name: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { name: 'Living a Feminist Life', author: 'Sarah Ahmed' },
]
const Bookshelf: VoidComponent = () => {
  const [books, setBooks] = createSignal<Book[]>(initBookList)
  return (
    <>
      <AddBook onAddBook={(b) => setBooks((books) => [...books, b])} />
      <BookList books={books()} />
    </>
  )
}

const BookList: VoidComponent<{ books: Book[] }> = (p) => {
  return (
    <ul>
      <For each={p.books}>
        {(book) => (
          <li>
            {book.name} ({book.author})
          </li>
        )}
      </For>
    </ul>
  )
}

const emptyBook: Book = { author: '', name: '' }
const AddBook: VoidComponent<{ onAddBook: (book: Book) => void }> = (p) => {
  const [book, setBook] = createSignal<Book>(emptyBook)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!book().name || !book().author) return
        p.onAddBook(book())
        setBook(emptyBook)
      }}
    >
      <Stack d="v" dist="s" style=" color : blue;">
        <Stack dist="xs" style={{ 'background-color': 'red' }}>
          <label for="name">Name</label>
          <span>:</span>
        </Stack>
        <TextInput
          id="name"
          value={book().name}
          onInput={(e) => {
            setBook((b) => ({ ...b, name: e.currentTarget.value }))
          }}
        />
      </Stack>

      <label for="author">Author</label>
      <TextInput
        id="author"
        value={book().author}
        onInput={(e) => {
          setBook((b) => ({ ...b, author: e.currentTarget.value }))
        }}
      />

      <button type="submit">Add</button>
    </form>
  )
}

const App: Component = () => {
  return (
    <StylesProvider>
      <div style={{ 'max-width': '20rem' }}>
        <Bookshelf />
      </div>
    </StylesProvider>
  )
}

export default App
