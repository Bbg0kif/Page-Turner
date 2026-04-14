import React, { useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const FANDOMS = ["Original", "Harry Potter", "Marvel", "DC", "The Witcher", "Anime", "Інше"];
const GENRES = ["Роман", "Фентезі", "Детектив", "Трилер", "Пригоди", "Драма", "Жахи", "Інше"];

const AddBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [fandom, setFandom] = useState(FANDOMS[0]);
  const [genre, setGenre] = useState(GENRES[0]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, "books"), {
        title,
        author,
        description,
        fandom,
        genre,
        userId: auth.currentUser.uid,
        excerpts: []
      });
      alert("Книгу додано!");
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>+Додати нову книгу</h1>
      <form onSubmit={handleSubmit} className="add-form">
        <label>Назва книги</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <label>Автор</label>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Фандом</label>
            <select value={fandom} onChange={(e) => setFandom(e.target.value)} className="fandom-select">
              {FANDOMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Жанр</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="fandom-select">
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        
        <label>Опис</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        
        <button type="submit" className="btn-submit">Зберегти книгу</button>
      </form>
    </div>
  );
};

export default AddBook;