import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const FandomChat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("fandom", "==", id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      fandom: id,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.email.split('@')[0],
      createdAt: serverTimestamp()
    });
    setNewMessage("");
  };

  return (
    <div className="container chat-container">
      <h1>Чат фандому: {id}</h1>
      <div className="chat-box">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.uid === auth.currentUser?.uid ? 'my-msg' : ''}`}>
            <span className="msg-author">{msg.displayName}</span>
            <p className="msg-text">{msg.text}</p>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <form onSubmit={sendMessage} className="chat-input-area">
        <input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Напишіть щось..."
        />
        <button type="submit">Відправити</button>
      </form>
    </div>
  );
};

export default FandomChat;