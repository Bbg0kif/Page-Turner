import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        
        const myBooksQuery = query(collection(db, "books"), where("userId", "==", user.uid));
        const mySnapshot = await getDocs(myBooksQuery);
        setMyBooks(mySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const favQuery = query(collection(db, "favorites"), where("userId", "==", user.uid));
        const favSnapshot = await getDocs(favQuery);
        const favIds = favSnapshot.docs.map(doc => doc.data().bookId);

        if (favIds.length > 0) {
          const allBooksSnapshot = await getDocs(collection(db, "books"));
          const allBooks = allBooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFavoriteBooks(allBooks.filter(book => favIds.includes(book.id)));
        }

        setLoading(false);
      } catch (e) {
        console.error("Помилка профілю:", e);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) return <div className="container"><h2>Будь ласка, увійдіть в аккаунт</h2></div>;

  return (
    <div className="container">

      <div className="profile-header">
        <div className="profile-avatar">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.email.split('@')[0]}</h1>
          <p>{user.email}</p>
          <div className="profile-stats">
            <span><b>{myBooks.length}</b> доданих</span>
            <span><b>{favoriteBooks.length}</b> у вибраному</span>
          </div>
        </div>
      </div>

      <hr className="profile-divider" />

      <section className="profile-section">
        <h2>Мої книги</h2>
        {myBooks.length === 0 ? <p>Ви ще не додали жодної книги.</p> : (
          <div className="books-grid">
            {myBooks.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-content">
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                  <Link to={`/edit/${book.id}`} className="read-more-btn">Редагувати</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section" style={{marginTop: '40px'}}>
        <h2>Вибране</h2>
        {favoriteBooks.length === 0 ? <p>У вас поки немає вибраних книг.</p> : (
          <div className="books-grid">
            {favoriteBooks.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-content">
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                  <Link to="/" className="read-more-btn">Переглянути в каталозі</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;