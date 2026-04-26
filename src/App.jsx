import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore'; 
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
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [ratings, setRatings] = useState({});

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

  const fetchRatings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ratings"));
      const allRatings = {};
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!allRatings[data.bookId]) allRatings[data.bookId] = [];
        allRatings[data.bookId].push(data.stars);
      });

      const averages = {};
      for (const bookId in allRatings) {
        const sum = allRatings[bookId].reduce((a, b) => a + b, 0);
        averages[bookId] = (sum / allRatings[bookId].length).toFixed(1);
      }
      setRatings(averages);
    } catch (e) {
      console.error("Помилка завантаження рейтингів:", e);
    }
  };

  useEffect(() => { 
    fetchBooks(); 
    fetchRatings();
    
    const q = query(collection(db, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!allComments[data.bookId]) allComments[data.bookId] = [];
        allComments[data.bookId].push({ id: doc.id, ...data });
      });
      setComments(allComments);
    });

    return () => unsubscribe();
  }, []);

  const handleRate = async (bookId, stars) => {
    if (!user) { alert("Увійдіть, щоб оцінити!"); return; }
    try {
      await addDoc(collection(db, "ratings"), {
        bookId,
        userId: user.uid,
        stars,
        createdAt: new Date()
      });
      fetchRatings();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleReadMore = (id) => {
    setExpandedBooks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComments = (id) => {
    setShowComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = async (bookId) => {
    const text = commentInputs[bookId];
    if (!user || !text?.trim()) return;
    try {
      await addDoc(collection(db, "comments"), {
        bookId,
        text: text.trim(),
        userId: user.uid,
        userName: user.email.split('@')[0],
        createdAt: new Date()
      });
      setCommentInputs(prev => ({ ...prev, [bookId]: "" }));
    } catch (e) { console.error(e); }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFandom = activeFandom === "Всі" || book.fandom === activeFandom;
    const matchesGenre = selectedGenre === "Всі жанри" || book.genre === selectedGenre;
    return matchesSearch && matchesFandom && matchesGenre;
  });

  const toggleFavorite = async (bookId) => {
    if (!user) { alert("Увійдіть!"); return; }
    try {
      const q = query(collection(db, "favorites"), where("userId", "==", user.uid), where("bookId", "==", bookId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "favorites"), { userId: user.uid, bookId });
      } else {
        await deleteDoc(doc(db, "favorites", snapshot.docs[0].id));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="container">
      <h1>Каталог книг</h1>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Пошук..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="genre-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          {GENRES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="filter-bar">
        {FANDOMS_LIST.map(f => (
          <button key={f} className={`filter-btn ${activeFandom === f ? 'active' : ''}`} onClick={() => setActiveFandom(f)}>{f}</button>
        ))}
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => {
          const canEdit = user && (book.userId === user.uid || user.email === "b.oleksandra200@gmail.com");
          const isExpanded = expandedBooks[book.id];
          const isCommentsOpen = showComments[book.id];
          const bookComments = comments[book.id] || [];
          const avgRating = ratings[book.id] || "0.0";

          return (
            <div key={book.id} className="book-card">
              <button onClick={() => toggleFavorite(book.id)} className="favorite-btn">❤️</button>
              
              <div className="book-content">
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span className="fandom-tag">{book.fandom}</span>
                  <span className="genre-tag">{book.genre}</span>
                </div>
                
                <h2>{book.title}</h2>
                <h3>{book.author}</h3>

                <div className="rating-area">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="star" onClick={() => handleRate(book.id, star)}>
                        {star <= Math.round(avgRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="rating-value">{avgRating}</span>
                </div>
                
                <p className="book-card-text">
                  {book.description?.length > 150 && !isExpanded 
                    ? `${book.description.substring(0, 150)}...` 
                    : book.description}
                  {book.description?.length > 150 && (
                    <button className="read-more-btn" onClick={() => toggleReadMore(book.id)}>
                      {isExpanded ? " Згорнути" : " Читати далі"}
                    </button>
                  )}
                </p>

                <button className="toggle-comments-btn" onClick={() => toggleComments(book.id)}>
                  Коментарі ({bookComments.length})
                </button>

                {isCommentsOpen && (
                  <div className="comments-box">
                    <div className="comments-list">
                      {bookComments.map(c => (
                        <div key={c.id} className="comment-item">
                          <strong>{c.userName}:</strong> {c.text}
                        </div>
                      ))}
                    </div>
                    {user && (
                      <div className="comment-input-area">
                        <input 
                          type="text" 
                          placeholder="Ваш коментар..." 
                          value={commentInputs[book.id] || ""}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [book.id]: e.target.value }))}
                        />
                        <button onClick={() => handleAddComment(book.id)}>OK</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="admin-controls">
                  <Link to={`/edit/${book.id}`} className="control-btn">✏️</Link>
                  <button onClick={() => deleteDoc(doc(db, "books", book.id))} className="control-btn delete">🗑️</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
              <button onClick={handleLogout} className="nav-link logout-btn">
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