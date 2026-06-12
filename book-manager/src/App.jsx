import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<BooksPage />} />
        
        <Route
          path="/books/new"
          element={
            <ProtectedRoute>
              <BookCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id"
          element={<BookDetailPage />}
        />
        <Route
          path="/books/:id/edit"
          element={
            <ProtectedRoute>
              <BookEditPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
