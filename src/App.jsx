import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; 
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import './App.css';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Помилка: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю книгу?")) {
      try {
        await deleteDoc(doc(db, "books", id));
        setBooks(books.filter(book => book.id !== id));
      } catch (error) {
        alert("Помилка при видаленні");
      }
    }
  };

  return (
    <div className="container">
      <h1>Каталог книг</h1>
      {loading ? <p>Завантаження...</p> : (
        <div className="books-grid">
          {books.map(book => {
            const isOfficial = book.excerpts && book.excerpts.length > 0;
            return (
              <div key={book.id} className={`book-card ${isOfficial ? 'has-excerpts' : ''}`}>
                {isOfficial && <span className="admin-badge">Офіційно</span>}
                
                <div className="card-actions">
                  <Link title="Редагувати" to={`/edit/${book.id}`} className="action-btn edit">✏️</Link>
                  <button title="Видалити" onClick={() => handleDelete(book.id)} className="action-btn delete">🗑️</button>
                </div>

                <h2>{book.title}</h2>
                <h3>Автор: {book.author}</h3>
                <p>{book.description}</p>
                
                {isOfficial && (
                  <div className="excerpts">
                    <p><i>"{book.excerpts[0]}"</i></p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">Page-Turner</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Каталог</Link>
          <Link to="/add" className="nav-link" style={{ color: '#3498db', fontWeight: 'bold' }}>+ Додати</Link>
          <Link to="/fandoms" className="nav-link">Фандоми</Link>
          <Link to="/login" className="nav-link">Увійти</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/edit/:id" element={<EditBook />} />
        <Route path="/fandoms" element={<Fandoms />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

const Fandoms = () => <div className="container"><h1>Фандоми</h1></div>;
const Login = () => <div className="container"><h1>Вхід</h1></div>;

export default App;