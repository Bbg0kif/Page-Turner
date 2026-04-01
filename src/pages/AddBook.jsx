import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Ви повинні увійти, щоб додати книгу");
      return;
    }

    try {
      await addDoc(collection(db, "books"), {
        title: title,
        author: author,
        description: description,
        excerpts: [],
        userId: auth.currentUser.uid
      });
      alert("Книгу додано!");
      navigate('/'); 
    } catch (error) {
      console.error("Помилка додавання: ", error);
    }
  };

  return (
    <div className="container">
      <h1>+Додати нову книгу</h1>
      <form onSubmit={handleSubmit} className="add-form">
        <label>Назва книги</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
        <label>Автор</label>
        <input 
          type="text" 
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required 
        />
        <label>Опис</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required 
        />
        <button type="submit" className="btn-submit">Зберегти книгу</button>
      </form>
    </div>
  );
};

export default AddBook;