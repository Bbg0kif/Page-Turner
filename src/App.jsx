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

const Home = ({ user }) => {
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
      console.error("Помилка при завантаженні книг: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const toggleFavorite = async (bookId) => {
    if (!user) {
      alert("Увійдіть, щоб додавати книги у вибране!");
      return;
    }

    try {
      const q = query(
        collection(db, "favorites"), 
        where("userId", "==", user.uid), 
        where("bookId", "==", bookId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(db, "favorites"), {
          userId: user.uid,
          bookId: bookId
        });
        alert("Додано у вибране!");
      } else {
        const favoriteDocId = snapshot.docs[0].id;
        await deleteDoc(doc(db, "favorites", favoriteDocId));
        alert("Видалено з вибраного.");
      }
    } catch (error) {
      console.error("Помилка з вибраним:", error);
    }
  };

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

            const canEdit = user && (
              book.userId === user.uid || 
              (!book.userId && user.email === "b.oleksandra200@gmail.com") 
            );

            return (
              <div key={book.id} className={`book-card ${isOfficial ? 'has-excerpts' : ''}`}>

                <button 
                  onClick={() => toggleFavorite(book.id)} 
                  className="favorite-btn"
                  title="Додати у вибране"
                >
                  ❤️
                </button>

                {isOfficial && <span className="admin-badge">Офіційно</span>}

                <div className="book-content">
                  <h2>{book.title}</h2>
                  <h3>Автор: {book.author}</h3>
                  <p>{book.description}</p>
                </div>
                
                {isOfficial && (
                  <div className="excerpts">
                    <p><i>"{book.excerpts[0]}"</i></p>
                  </div>
                )}

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Ви вийшли з аккаунту");
    } catch (error) {
      alert("Помилка при виході");
    }
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
              <Link to="/add" className="nav-link" style={{ color: '#3498db', fontWeight: 'bold' }}>+ Додати</Link>
              <Link to="/profile" className="nav-link">Мій кабінет</Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Вийти ({user.email.split('@')[0]})
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Увіййти</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/edit/:id" element={<EditBook />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fandoms" element={<div className="container"><h1>Фандоми</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;