import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <h1 className="text-xl font-bold">Тепловая карта инцидентов</h1>
      <nav className="space-x-4">
        <a href="/" className="hover:underline">Главная</a>
        <a href="/about" className="hover:underline">О проекте</a>
        <a href="/contact" className="hover:underline">Контакты</a>
      </nav>
    </header>
  );
};

export default Header;
