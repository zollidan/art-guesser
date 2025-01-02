"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [data, setData] = useState();
  const [imgNum, setImgNum] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);

  const fetchCatalog = async () => {
    try {
      const response = await fetch("/api");
      const data = await response.json();
      console.log(data);

      setData(data);
    } catch (error) {
      console.error("Failed to fetch images!", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  function handleClick() {
    setImgNum((prevImgNum) => (prevImgNum + 1) % data.length); // Зацикливание
    setIsVisible(false);
  }

  function showAuthor() {
    setIsVisible(true);
  }

  return (
    <div className="flex flex-col items-center my-10">
      <div>
        {imgNum + 1}/{data && data.length}
      </div>

      {data ? (
        <div className="mb-4">
          <Image
            src={data && data[imgNum].url} // URL изображения
            alt={`Image ${imgNum}`}
            width={600}
            height={400}
            className="rounded shadow-lg"
          />

          {isVisible && <p>{data && data[imgNum].name}</p>}
        </div>
      ) : (
        <div>Изображение недоступно</div>
      )}

      <div>
        <button
          onClick={handleClick}
          className="mx-1 bg-blue-500 hover:bg-blue-700 rounded text-white font-bold px-4 py-2"
        >
          Следующее изображение
        </button>
        <button
          onClick={showAuthor}
          className="bg-blue-500 hover:bg-blue-700 rounded text-white font-bold px-4 py-2"
        >
          Показать автора
        </button>
      </div>
    </div>
  );
}
