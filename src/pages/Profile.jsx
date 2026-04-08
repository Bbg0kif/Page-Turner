import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const Profile = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [favBooks, setFavBooks] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const myQ = query(collection(db, "books"), where("userId", "==", user.uid));
      const mySnapshot = await getDocs(myQ);
      setMyBooks(mySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      const favQ = query(collection(db, "favorites"), where("userId", "==", user.uid));
      const favSnapshot = await getDocs(favQ);
      
      const bookPromises = favSnapshot.docs.map(async (favDoc) => {
        const bookRef = doc(db, "books", favDoc.data().bookId);
        const bookSnap = await getDoc(bookRef);
        return { id: bookSnap.id, ...bookSnap.data() };
      });

      const resolvedBooks = await Promise.all(bookPromises);
      setFavBooks(resolvedBooks);
    };

    fetchData();
  }, [user]);

  return (
    <div className="container">
      <h1>Мій кабінет</h1>
      
      <section>
        <h2>Мої додані книги</h2>
        <div className="books-grid">
          {myBooks.map(book => <div key={book.id} className="book-card"><h3>{book.title}</h3></div>)}
        </div>
      </section>

      <section style={{marginTop: '40px'}}>
        <h2>Вибране (Хочу прочитати)</h2>
        <div className="books-grid">
          {favBooks.map(book => <div key={book.id} className="book-card"><h3>{book.title}</h3></div>)}
        </div>
      </section>
    </div>
  );
};

export default Profile;