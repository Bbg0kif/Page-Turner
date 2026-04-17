import React from 'react';
import { Link } from 'react-router-dom';

const FANDOMS = ["Original", "Harry Potter", "Marvel", "DC", "The Witcher", "Anime", "Інше"];

const Fandoms = () => {
  return (
    <div className="container">
      <h1>Оберіть фандом для спілкування</h1>
      <div className="fandoms-grid">
        {FANDOMS.map(f => (
          <Link to={`/fandom/${f}`} key={f} className="fandom-card-link">
            <div className="fandom-lobby-card">
              <h2>{f}</h2>
              <p>Зайти в чат та обговорити книги</p>
              <span className="join-btn">Увійти →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Fandoms;