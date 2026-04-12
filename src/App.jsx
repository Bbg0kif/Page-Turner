import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, query, where } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import './App.css';

const FANDOMS_LIST = ["Всі", "Original", "Harry Potter", "Marvel", "DC", "The Witcher", "Anime", "Інше"];

const Home = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFandom, setActiveFandom] = useState("Всі");

  const fetchBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "books"));
      const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
      setFilteredBooks(booksData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const filterByFandom = (fandomName) => {
    setActiveFandom(fandomName);
    if (fandomName === "Всі") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter(b => b.fandom === fandomName));
    }
  };

  const toggleFavorite = async (bookId) => {
    if (!user) { alert("Увійдіть у систему!"); return; }
    try {
      const q = query(collection(db, "favorites"), where("userId", "==", user.uid), where("bookId", "==", bookId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "favorites"), { userId: user.uid, bookId });
        alert("Додано у вибране");
      } else {
        await deleteDoc(doc(db, "favorites", snapshot.docs[0].id));
        alert("Видалено");
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Видалити?")) {
      await deleteDoc(doc(db, "books", id));
      setBooks(books.filter(b => b.id !== id));
      setFilteredBooks(filteredBooks.filter(b => b.id !== id));
    }
  };

  return (
    <div className="container">
      <h1>Каталог книг</h1>

      <div className="filter-bar">
        {FANDOMS_LIST.map(f => (
          <button 
            key={f} 
            className={`filter-btn ${activeFandom === f ? 'active' : ''}`}
            onClick={() => filterByFandom(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <p>Завантаження...</p> : (
        <div className="books-grid">
          {filteredBooks.map(book => {
            const canEdit = user && (book.userId === user.uid || user.email === "b.oleksandra200@gmail.com");
            return (
              <div key={book.id} className="book-card">
                <button onClick={() => toggleFavorite(book.id)} className="favorite-btn">❤️</button>
                
                <div className="book-content">
                  <span className="fandom-tag">{book.fandom || "Без фандому"}</span>
                  <h2>{book.title}</h2>
                  <h3>{book.author}</h3>
                  <p>{book.description}</p>
                </div>

                {canEdit && (
                  <div className="admin-controls">
                    <Link to={`/edit/${book.id}`} className="control-btn edit">✏️</Link>
                    <button onClick={() => handleDelete(book.id)} className="control-btn delete">🗑️</button>
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
  const [user, setUser] = useState(null);
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">Page-Turner</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Каталог</Link>
          {user ? (
            <>
              <Link to="/add" className="nav-link" style={{color: '#3498db', fontWeight: 'bold'}}>+ Додати</Link>
              <Link to="/profile" className="nav-link">Мій кабінет</Link>
              <button onClick={() => signOut(auth)} className="nav-link logout-btn">Вийти</button>
            </>
          ) : <Link to="/login" className="nav-link">Увійти</Link>}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/edit/:id" element={<EditBook />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;