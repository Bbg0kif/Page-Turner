import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Home = () => <div style={{ padding: '20px' }}><h1>Головна: Каталог Page-Turner</h1></div>;
const Fandoms = () => <div style={{ padding: '20px' }}><h1>Фандоми та чати</h1></div>;
const Login = () => <div style={{ padding: '20px' }}><h1>Вхід у систему</h1></div>;

function App() {
  return (
    <Router>
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', gap: '15px' }}>
        <Link to="/">Каталог</Link>
        <Link to="/fandoms">Фандоми</Link>
        <Link to="/login">Увійти</Link>
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