let currentPhotoIndex = 0;
let allPhotos = [];
let isRandomMode = false;
let viewedPhotos = new Set();
let loadedGalleries = [];

// Список файлов для загрузки
const GALLERY_FILES = [
  "vk_json/300948505.json",
  "vk_json/300948519.json",
  "vk_json/300948642.json",
  "vk_json/300954508.json",
  "vk_json/300981842.json",
  "vk_json/301279335.json",
  "vk_json/302320260.json",
  "vk_json/302320264.json",
  "vk_json/302320281.json",
  "vk_json/302320284.json",
  "vk_json/302320286.json",
  "vk_json/302320294.json",
  "vk_json/302320311.json",
  "vk_json/302320347.json",
  "vk_json/302489777.json",
  "vk_json/302553761.json",
  "vk_json/302555857.json",
  "vk_json/302564376.json",
];

async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Loaded from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    return null;
  }
}

async function loadAllGalleries() {
  console.log(`🔄 Загружаю ${GALLERY_FILES.length} галерей...`);

  const loadingElement = document.getElementById("loading");
  loadingElement.textContent = "Загрузка галерей...";

  let totalPhotos = 0;
  let successfulLoads = 0;

  for (let i = 0; i < GALLERY_FILES.length; i++) {
    const file = GALLERY_FILES[i];
    const galleryName = file.split("/").pop().replace(".json", "");

    loadingElement.textContent = `Загрузка ${galleryName} (${i + 1}/${
      GALLERY_FILES.length
    })...`;

    try {
      const data = await loadJSON(file);

      if (
        data &&
        data.response &&
        data.response.items &&
        data.response.items.length > 0
      ) {
        const items = data.response.items;

        // Добавляем метаданные к каждому элементу
        items.forEach((item) => {
          item.source_gallery = galleryName;
          item.source_file = file;
        });

        allPhotos.push(...items);
        totalPhotos += items.length;
        successfulLoads++;

        loadedGalleries.push({
          name: galleryName,
          file: file,
          count: items.length,
          items: items,
        });

        console.log(`✅ ${galleryName}: ${items.length} фотографий`);
      } else {
        console.warn(
          `⚠️ ${galleryName}: неправильная структура или пустой файл`
        );
      }
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${galleryName}:`, error);
    }
  }

  loadingElement.style.display = "none";

  if (allPhotos.length > 0) {
    console.log(
      `🎉 Загружено ${totalPhotos} фотографий из ${successfulLoads} галерей`
    );

    // Показываем статистику
    showGalleryStats();

    // Показываем первую фотографию
    displayPhoto(0);

    // Показываем элементы управления
    document.getElementById("image-container").style.display = "inline-block";
    document.getElementById("photo-info").style.display = "block";
    document.getElementById("mode-indicator").style.display = "block";
    document.getElementById("controls").style.display = "block";
    document.getElementById("gallery-selector").style.display = "block";

    // Настраиваем навигацию
    setupNavigation();
    setupGallerySelector();
  } else {
    loadingElement.style.display = "block";
    loadingElement.textContent = "Не удалось загрузить ни одной фотографии";
  }
}

function showGalleryStats() {
  console.log("📊 Статистика галерей:");
  loadedGalleries.forEach((gallery) => {
    console.log(`  - ${gallery.name}: ${gallery.count} фото`);
  });
}

function setupGallerySelector() {
  const selector = document.getElementById("gallery-select");

  // Очищаем селектор
  selector.innerHTML = '<option value="all">Все галереи</option>';

  // Добавляем опции для каждой галереи
  loadedGalleries.forEach((gallery) => {
    const option = document.createElement("option");
    option.value = gallery.name;
    option.textContent = `${gallery.name} (${gallery.count})`;
    selector.appendChild(option);
  });

  // Обработчик изменения селектора
  selector.addEventListener("change", (event) => {
    filterByGallery(event.target.value);
  });
}

function filterByGallery(galleryName) {
  if (galleryName === "all") {
    // Показываем все фотографии
    allPhotos = [];
    loadedGalleries.forEach((gallery) => {
      allPhotos.push(...gallery.items);
    });
  } else {
    // Показываем только выбранную галерею
    const selectedGallery = loadedGalleries.find((g) => g.name === galleryName);
    if (selectedGallery) {
      allPhotos = [...selectedGallery.items];
    }
  }

  // Сбрасываем состояние
  currentPhotoIndex = 0;
  viewedPhotos.clear();

  // Показываем первую фотографию
  if (allPhotos.length > 0) {
    displayPhoto(0);
  }

  console.log(
    `Отображаю ${allPhotos.length} фотографий из ${
      galleryName === "all" ? "всех галерей" : galleryName
    }`
  );
}

function displayPhoto(index) {
  if (index >= 0 && index < allPhotos.length) {
    const photo = allPhotos[index];

    const largestSize = photo.sizes[photo.sizes.length - 1];

    const mainImage = document.getElementById("main-image");
    mainImage.src = largestSize.url;
    mainImage.alt = `Фото ${index + 1} из ${allPhotos.length}`;

    const photoInfo = document.getElementById("photo-info");
    const modeText = isRandomMode ? " (случайный режим)" : "";
    const galleryText = photo.source_gallery
      ? ` | ${photo.source_gallery}`
      : "";
    photoInfo.textContent = `Фото ${index + 1} из ${allPhotos.length} (${
      largestSize.width
    }×${largestSize.height})${modeText}${galleryText}`;

    viewedPhotos.add(index);

    // Обновляем tooltip
    updateTooltip(photo);

    currentPhotoIndex = index;
    updateButtons();
  }
}

function updateTooltip(photo) {
  const tooltip = document.getElementById("tooltip");

  console.log("Обновление tooltip:", photo.text); // Для отладки

  if (photo.text && photo.text.trim() !== "") {
    tooltip.textContent = photo.text;

    if (photo.text.length > 50) {
      tooltip.classList.add("long-text");
    } else {
      tooltip.classList.remove("long-text");
    }
  } else {
    tooltip.textContent = "Описание отсутствует";
    tooltip.classList.remove("long-text");
  }
}

function getRandomPhotoIndex() {
  if (allPhotos.length <= 1) return 0;

  if (viewedPhotos.size >= allPhotos.length) {
    viewedPhotos.clear();
    viewedPhotos.add(currentPhotoIndex);
  }

  let randomIndex;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    randomIndex = Math.floor(Math.random() * allPhotos.length);
    attempts++;
  } while (viewedPhotos.has(randomIndex) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    randomIndex = Math.floor(Math.random() * allPhotos.length);
  }

  return randomIndex;
}

function goToNextPhoto() {
  if (isRandomMode) {
    const randomIndex = getRandomPhotoIndex();
    displayPhoto(randomIndex);
  } else {
    if (currentPhotoIndex < allPhotos.length - 1) {
      displayPhoto(currentPhotoIndex + 1);
    } else {
      displayPhoto(0);
    }
  }
}

function goToPrevPhoto() {
  if (isRandomMode) {
    const randomIndex = getRandomPhotoIndex();
    displayPhoto(randomIndex);
  } else {
    if (currentPhotoIndex > 0) {
      displayPhoto(currentPhotoIndex - 1);
    } else {
      displayPhoto(allPhotos.length - 1);
    }
  }
}

function toggleMode() {
  isRandomMode = !isRandomMode;
  viewedPhotos.clear();
  viewedPhotos.add(currentPhotoIndex);

  const modeIndicator = document.getElementById("mode-indicator");
  const toggleBtn = document.getElementById("toggle-mode-btn");

  if (isRandomMode) {
    modeIndicator.textContent = "Режим: Случайный";
    modeIndicator.className = "mode-indicator mode-random";
    toggleBtn.textContent = "Режим: Последовательный";
  } else {
    modeIndicator.textContent = "Режим: Последовательный";
    modeIndicator.className = "mode-indicator mode-sequential";
    toggleBtn.textContent = "Режим: Случайный";
  }

  updateButtons();
  displayPhoto(currentPhotoIndex);
}

function setupNavigation() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const randomBtn = document.getElementById("random-btn");
  const toggleModeBtn = document.getElementById("toggle-mode-btn");

  prevBtn.addEventListener("click", goToPrevPhoto);
  nextBtn.addEventListener("click", goToNextPhoto);

  randomBtn.addEventListener("click", () => {
    const randomIndex = getRandomPhotoIndex();
    displayPhoto(randomIndex);
  });

  toggleModeBtn.addEventListener("click", toggleMode);

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        goToPrevPhoto();
        break;
      case "ArrowRight":
      case "d":
      case "D":
        goToNextPhoto();
        break;
      case " ":
        event.preventDefault();
        const randomIndex = getRandomPhotoIndex();
        displayPhoto(randomIndex);
        break;
      case "r":
      case "R":
        const randomIndex2 = getRandomPhotoIndex();
        displayPhoto(randomIndex2);
        break;
      case "m":
      case "M":
        toggleMode();
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        // Быстрое переключение между галереями по цифрам
        const galleryIndex = parseInt(event.key) - 1;
        if (galleryIndex < loadedGalleries.length) {
          const selector = document.getElementById("gallery-select");
          selector.value = loadedGalleries[galleryIndex].name;
          filterByGallery(loadedGalleries[galleryIndex].name);
        } else if (event.key === "1") {
          // Цифра 1 - показать все галереи
          const selector = document.getElementById("gallery-select");
          selector.value = "all";
          filterByGallery("all");
        }
        break;
    }
  });

  const mainImage = document.getElementById("main-image");
  mainImage.addEventListener("click", toggleFullscreen);
}

function updateButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (isRandomMode) {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    prevBtn.textContent = "🎲 Случайная";
    nextBtn.textContent = "🎲 Случайная";
  } else {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    prevBtn.textContent = "← Предыдущая";
    nextBtn.textContent = "Следующая →";
  }
}

function toggleFullscreen() {
  const mainImage = document.getElementById("main-image");

  if (!document.fullscreenElement) {
    mainImage.requestFullscreen().catch((err) => {
      console.log(`Ошибка полноэкранного режима: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

// Функция для динамического добавления галерей
function addGallery(filePath) {
  if (!GALLERY_FILES.includes(filePath)) {
    GALLERY_FILES.push(filePath);
    console.log(`Добавлена галерея: ${filePath}`);
  }
}

// Функция для загрузки одной дополнительной галереи
async function loadAdditionalGallery(filePath) {
  const galleryName = filePath.split("/").pop().replace(".json", "");

  try {
    const data = await loadJSON(filePath);

    if (
      data &&
      data.response &&
      data.response.items &&
      data.response.items.length > 0
    ) {
      const items = data.response.items;

      // Добавляем метаданные
      items.forEach((item) => {
        item.source_gallery = galleryName;
        item.source_file = filePath;
      });

      // Добавляем в общий список (если показываем все галереи)
      const currentSelection = document.getElementById("gallery-select").value;
      if (currentSelection === "all") {
        allPhotos.push(...items);
      }

      // Добавляем в список загруженных галерей
      loadedGalleries.push({
        name: galleryName,
        file: filePath,
        count: items.length,
        items: items,
      });

      // Обновляем селектор
      setupGallerySelector();

      console.log(
        `✅ Дополнительно загружена галерея ${galleryName}: ${items.length} фотографий`
      );

      return true;
    }
  } catch (error) {
    console.error(
      `❌ Ошибка загрузки дополнительной галереи ${galleryName}:`,
      error
    );
  }

  return false;
}

// Запускаем загрузку всех галерей
loadAllGalleries();
