import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const getBookData = async () => {
      const docRef = doc(db, "books", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title);
        setAuthor(data.author);
        setDescription(data.description);
      }
    };
    getBookData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "books", id);
      await updateDoc(docRef, {
        title,
        author,
        description
      });
      alert("Оновлено!");
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Редагувати книгу</h1>
      <form onSubmit={handleUpdate} className="add-form">
        <label>Назва</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Автор</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} required />
        <label>Опис</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit" className="btn-submit">Оновити дані</button>
      </form>
    </div>
  );
};

export default EditBook;