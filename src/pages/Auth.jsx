import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Реєстрація успішна!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Ви увійшли!");
      }
      navigate('/');
    } catch (error) {
      alert("Помилка: " + error.message);
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h1>{isRegistering ? "Реєстрація" : "Вхід"}</h1>
        <form onSubmit={handleAuth} className="add-form">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit" className="btn-submit">
            {isRegistering ? "Створити аккаунт" : "Увійти"}
          </button>
        </form>
        
        <p style={{ marginTop: '15px', cursor: 'pointer', color: '#3498db' }} 
           onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Вже є аккаунт? Увійти" : "Немає аккаунту? Зареєструватися"}
        </p>
      </div>
    </div>
  );
};

export default Auth;