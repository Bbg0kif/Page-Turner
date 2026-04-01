import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Profile = () => {
  const [myBooks, setMyBooks] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchMyBooks = async () => {
      if (user) {
        const q = query(collection(db, "books"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setMyBooks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchMyBooks();
  }, [user]);

  return (
    <div className="container">
      <h1>Мої книги</h1>
      <div className="books-grid">
        {myBooks.length > 0 ? (
          myBooks.map(book => (
            <div key={book.id} className="book-card">
              <h2>{book.title}</h2>
              <p>{book.description}</p>
            </div>
          ))
        ) : <p>Ви ще не додали жодної книги.</p>}
      </div>
    </div>
  );
};

export default Profile;