import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { withLogging, memoize, colorGenerator } from './utils';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Fandoms from './pages/Fandoms';
import FandomChat from './pages/FandomChat';
import './App.css';

const FANDOMS_LIST = ["Всі", "Original", "Harry Potter", "Marvel", "DC", "The Witcher", "Anime", "Інше"];
const GENRES_LIST = ["Всі жанри", "Роман", "Фентезі", "Детектив", "Трилер", "Пригоди", "Драма", "Жахи", "Інше"];

const gen = colorGenerator();
const FANDOM_COLORS = FANDOMS_LIST.reduce((acc, fandom) => {
  acc[fandom] = gen.next().value;
  return acc;
}, {});

const calculateAverage = (scores) => {
  if (!scores || scores.length === 0) return "0.0";
  const sum = scores.reduce((a, b) => a + b, 0);
  return (sum / scores.length).toFixed(1);
};
const memoizedAvg = memoize(calculateAverage, { maxSize: 30 });

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

  const handleAddCommentLogged = withLogging(async (bookId, text) => {
    await addDoc(collection(db, "comments"), {
      bookId, text: text.trim(), userId: user.uid,
      userName: user.email.split('@')[0], createdAt: new Date()
    });
  }, "INFO");

  const handleRateLogged = withLogging(async (bookId, stars) => {
    await addDoc(collection(db, "ratings"), {
      bookId, userId: user.uid, stars, createdAt: new Date()
    });
  }, "INFO");

  const fetchBooksAndMeta = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "books"));
      const rawBooks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const processedBooks = await Promise.all(rawBooks.map(async (book) => {
        return { ...book, loadedAt: Date.now() }; 
      }));

      setBooks(processedBooks);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchRatings = async () => {
    const querySnapshot = await getDocs(collection(db, "ratings"));
    const allRatings = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!allRatings[data.bookId]) allRatings[data.bookId] = [];
      allRatings[data.bookId].push(data.stars);
    });

    const averages = {};
    for (const bookId in allRatings) {
      averages[bookId] = memoizedAvg(allRatings[bookId]);
    }
    setRatings(averages);
  };

  useEffect(() => { 
    fetchBooksAndMeta(); 
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
    if (!user) return alert("Увійдіть!");
    await handleRateLogged(bookId, stars);
    fetchRatings();
  };

  const handleAddComment = async (bookId) => {
    const text = commentInputs[bookId];
    if (!user || !text?.trim()) return;
    await handleAddCommentLogged(bookId, text);
    setCommentInputs(p => ({ ...p, [bookId]: "" }));
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFandom = activeFandom === "Всі" || book.fandom === activeFandom;
    const matchesGenre = selectedGenre === "Всі жанри" || book.genre === selectedGenre;
    return matchesSearch && matchesFandom && matchesGenre;
  });

  return (
    <div className="container">
      <h1>Каталог книг</h1>
      <div className="search-bar">
        <input type="text" placeholder="Пошук..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="genre-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
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

      <div className="books-grid">
        {filteredBooks.map(book => {
          const avgRating = ratings[book.id] || "0.0";
          return (
            <div key={book.id} className="book-card">
              <div className="book-content">
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span 
                    className="fandom-tag" 
                    style={{ backgroundColor: FANDOM_COLORS[book.fandom] || '#2c3e50' }}
                  >
                    {book.fandom}
                  </span>
                  <span className="genre-tag">{book.genre}</span>
                </div>
                <h2>{book.title}</h2>
                <div className="rating-area">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="star" onClick={() => handleRate(book.id, s)}>
                        {s <= Math.round(avgRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="rating-value">{avgRating}</span>
                </div>
                <p className="book-card-text">
                  {expandedBooks[book.id] ? book.description : `${book.description?.substring(0, 150)}...`}
                  <button className="read-more-btn" onClick={() => setExpandedBooks(p => ({...p, [book.id]: !p[book.id]}))}>
                    {expandedBooks[book.id] ? " Згорнути" : " Читати далі"}
                  </button>
                </p>
                <button className="toggle-comments-btn" onClick={() => setShowComments(p => ({...p, [book.id]: !p[book.id]}))}>
                  Коментарі ({comments[book.id]?.length || 0})
                </button>
                {showComments[book.id] && (
                  <div className="comments-box">
                    <div className="comments-list">
                      {(comments[book.id] || []).map(c => <div key={c.id} className="comment-item"><strong>{c.userName}:</strong> {c.text}</div>)}
                    </div>
                    {user && (
                      <div className="comment-input-area">
                        <input value={commentInputs[book.id] || ""} onChange={(e) => setCommentInputs(p => ({...p, [book.id]: e.target.value}))} placeholder="Ваш коментар..." />
                        <button onClick={() => handleAddComment(book.id)}>OK</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">Page-Turner</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Каталог</Link>
          <Link to="/fandoms" className="nav-link">Фандоми</Link>
          {user ? (
            <>
              <Link to="/add" className="nav-link">+ Додати</Link>
              <Link to="/profile" className="nav-link">Профіль</Link>
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
        <Route path="/fandoms" element={<Fandoms />} />
        <Route path="/fandom/:id" element={<FandomChat />} />
      </Routes>
    </Router>
  );
}

export default App;