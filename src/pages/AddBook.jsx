import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "books"), {
        title: title,
        author: author,
        description: description,
        excerpts: []
      });
      alert("Книгу додано!");
      navigate('/');
    } catch (error) {
      console.error("Помилка додавання: ", error);
    }
  };

  return (
    <div className="container">
      <h1>Додати нову книгу</h1>
      <form onSubmit={handleSubmit} className="add-form">
        <input 
          type="text" 
          placeholder="Назва книги" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
        <input 
          type="text" 
          placeholder="Автор" 
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required 
        />
        <textarea 
          placeholder="Короткий опис" 
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