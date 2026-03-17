import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Home = () => (
  <div className="container">
    <h1>Головна: Каталог книг</h1>
    <p>Тут незабаром з'являться твої книги з Firebase.</p>
  </div>
);

const Fandoms = () => (
  <div className="container">
    <h1>Фандоми та чати</h1>
    <p>Розділ для обговорення улюблених творів.</p>
  </div>
);

const Login = () => (
  <div className="container">
    <h1>Вхід у систему</h1>
    <p>Сторінка авторизації користувача.</p>
  </div>
);

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">Page-Turner</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Каталог</Link>
          <Link to="/fandoms" className="nav-link">Фандоми</Link>
          <Link to="/login" className="nav-link">Увійти</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fandoms" element={<Fandoms />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;