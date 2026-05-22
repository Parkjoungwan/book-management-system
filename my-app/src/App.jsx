import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/new" element={<BookCreatePage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/books/:id/edit" element={<BookEditPage />} />
      </Routes>
    </>
  )
}

export default App
