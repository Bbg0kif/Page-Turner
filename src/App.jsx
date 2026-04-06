import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore'; 
import AddBook from './pages/AddBook';
import './App.css';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBooks(booksData);
        setLoading(false);
      } catch (error) {
        console.error("Помилка при завантаженні книг: ", error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="container">
      <h1>Каталог книг</h1>
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <div className="books-grid">
          {books.length > 0 ? (
            books.map(book => (
              <div key={book.id} className="book-card">
                <h2>{book.title}</h2>
                <h3>Автор: {book.author}</h3>
                <p>{book.description}</p>
                {book.excerpts && book.excerpts.length > 0 && (
                  <div className="excerpts">
                    <p><i>"{book.excerpts[0]}"</i></p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Книг поки немає. Додай першу!</p>
          )}
        </div>
      )}
    </div>
  );
};

const Fandoms = () => <div className="container"><h1>Фандоми та чати</h1><p>Цей розділ у розробці.</p></div>;
const Login = () => <div className="container"><h1>Вхід у систему</h1><p>Сторінка авторизації.</p></div>;

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">Page-Turner</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Каталог</Link>
          <Link to="/add" className="nav-link" style={{ color: '#3498db', fontWeight: 'bold' }}>+ Додати книгу</Link>
          <Link to="/fandoms" className="nav-link">Фандоми</Link>
          <Link to="/login" className="nav-link">Увійти</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/fandoms" element={<Fandoms />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;