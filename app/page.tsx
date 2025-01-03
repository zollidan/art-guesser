"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  // Указываем начальное значение для state
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState({ loading: true });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error(response.statusText); // Проверка статуса ответа
      const categories = await response.json();
      setData(categories);
    } catch (error) {
      console.error("Failed to fetch categories!", error);
    } finally {
      setIsLoading({ loading: false }); // Устанавливаем состояние загрузки в false
    }
  };

  useEffect(() => {
    fetchCategories(); // Вызываем функцию при монтировании компонента
  }, []); // Пустой массив зависимостей означает, что эффект выполнится только один раз

  if (isLoading.loading) {
    return <div>Загрузка...</div>; // Отображаем индикатор загрузки
  }

  return (
    <div className="flex flex-col items-center my-10">
      {data.length > 0 ? (
        data.map((category) => (
          <Link
            className="my-4 cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg
          border-blue-600
          border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
          active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            href={`/${category.id}`}
          >
            {category.name}
          </Link>
        ))
      ) : (
        <p>Нет категорий</p>
      )}
    </div>
  );
}
