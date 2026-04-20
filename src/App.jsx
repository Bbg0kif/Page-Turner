import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, query, where } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Fandoms from './pages/Fandoms';
import FandomChat from './pages/FandomChat';
import './App.css';

const FANDOMS_LIST = ["Всі", "Original", "Harry Potter", "Marvel", "DC", "The Witcher", "Anime", "Інше"];
const GENRES_LIST = ["Всі жанри", "Роман", "Фентезі", "Детектив", "Трилер", "Пригоди", "Драма", "Жахи", "Інше"];

const Home = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFandom, setActiveFandom] = useState("Всі");
  const [selectedGenre, setSelectedGenre] = useState("Всі жанри");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBooks, setExpandedBooks] = useState({});

  const fetchBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "books"));
      const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
      setLoading(false);
    } catch (error) {
      console.error("Помилка завантаження книг:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const toggleReadMore = (id) => {
    setExpandedBooks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFandom = activeFandom === "Всі" || book.fandom === activeFandom;
    const matchesGenre = selectedGenre === "Всі жанри" || book.genre === selectedGenre;
    return matchesSearch && matchesFandom && matchesGenre;
  });

  const toggleFavorite = async (bookId) => {
    if (!user) { alert("Увійдіть у систему!"); return; }
    try {
      const q = query(collection(db, "favorites"), where("userId", "==", user.uid), where("bookId", "==", bookId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "favorites"), { userId: user.uid, bookId });
        alert("Книгу додано у вибране");
      } else {
        await deleteDoc(doc(db, "favorites", snapshot.docs[0].id));
        alert("Книгу видалено з вибраного");
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю книгу?")) {
      try {
        await deleteDoc(doc(db, "books", id));
        setBooks(books.filter(b => b.id !== id));
      } catch (e) { alert("Помилка при видаленні"); }
    }
  };

  return (
    <div className="container">
      <h1>Каталог книг</h1>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Пошук за назвою..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="genre-select" 
          value={selectedGenre} 
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          {GENRES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="filter-bar">
        {FANDOMS_LIST.map(f => (
          <button 
            key={f} 
            className={`filter-btn ${activeFandom === f ? 'active' : ''}`}
            onClick={() => setActiveFandom(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <p>Завантаження...</p> : (
        <div className="books-grid">
          {filteredBooks.map(book => {
            const canEdit = user && (book.userId === user.uid || user.email === "b.oleksandra200@gmail.com");
            const isExpanded = expandedBooks[book.id];
            const textLimit = 150; // Межа символів
            const isLongText = book.description && book.description.length > textLimit;

            return (
              <div key={book.id} className="book-card">
                <button onClick={() => toggleFavorite(book.id)} className="favorite-btn" title="Додати у вибране">❤️</button>
                
                <div className="book-content">
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <span className="fandom-tag">{book.fandom || "Без фандому"}</span>
                    <span className="genre-tag">{book.genre || "Без жанру"}</span>
                  </div>
                  <h2>{book.title}</h2>
                  <h3>{book.author}</h3>
                  
                  <p className="book-card-text">
                    {isLongText && !isExpanded 
                      ? `${book.description.substring(0, textLimit)}...` 
                      : book.description}
                    
                    {isLongText && (
                      <button 
                        className="read-more-btn" 
                        onClick={() => toggleReadMore(book.id)}
                      >
                        {isExpanded ? " Згорнути" : " Читати далі"}
                      </button>
                    )}
                  </p>
                </div>

                {canEdit && (
                  <div className="admin-controls">
                    <Link title="Редагувати" to={`/edit/${book.id}`} className="control-btn edit">✏️</Link>
                    <button title="Видалити" onClick={() => handleDelete(book.id)} className="control-btn delete">🗑️</button>
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
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await signOut(auth);
    alert("Ви вийшли з аккаунту");
  };

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">Page-Turner</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Каталог</Link>
          <Link to="/fandoms" className="nav-link">Фандоми</Link>
          {user ? (
            <>
              <Link to="/add" className="nav-link" style={{color: '#3498db', fontWeight: 'bold'}}>+ Додати</Link>
              <Link to="/profile" className="nav-link">Мій кабінет</Link>
              <button onClick={handleLogout} className="nav-link logout-btn" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                Вийти ({user.email.split('@')[0]})
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Увійти</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/edit/:id" element={<EditBook />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fandoms" element={<Fandoms />} />
        <Route path="/fandom/:id" element={<FandomChat />} />
      </Routes>
    </Router>
  );
}

export default App;