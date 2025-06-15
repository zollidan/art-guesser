import json
import os
from pathlib import Path
from typing import List, Dict, Any

def merge_json_files(input_folder: str = "images", output_file: str = "merged_gallery.json") -> None:
    """
    Объединяет все JSON файлы из указанной папки в один файл
    
    Args:
        input_folder: Путь к папке с JSON файлами
        output_file: Имя выходного файла
    """
    
    # Проверяем существование папки
    folder_path = Path(input_folder)
    if not folder_path.exists():
        print(f"❌ Папка {input_folder} не найдена!")
        return
    
    # Ищем все JSON файлы в папке
    json_files = list(folder_path.glob("*.json"))
    
    if not json_files:
        print(f"❌ В папке {input_folder} не найдено JSON файлов!")
        return
    
    print(f"🔍 Найдено {len(json_files)} JSON файлов:")
    for file in json_files:
        print(f"  - {file.name}")
    
    # Структура для объединенных данных
    merged_data = {
        "info": {
            "total_files": len(json_files),
            "source_files": [file.name for file in json_files],
            "total_items": 0
        },
        "galleries": {}
    }
    
    total_items = 0
    
    # Обрабатываем каждый JSON файл
    for json_file in sorted(json_files):
        try:
            print(f"📖 Обрабатываю {json_file.name}...")
            
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Извлекаем имя галереи из имени файла (без расширения)
            gallery_name = json_file.stem
            
            # Добавляем данные в объединенную структуру
            if "response" in data and "items" in data["response"]:
                items = data["response"]["items"]
                item_count = len(items)
                total_items += item_count
                
                merged_data["galleries"][gallery_name] = {
                    "count": item_count,
                    "items": items
                }
                
                print(f"  ✅ Добавлено {item_count} элементов из {gallery_name}")
            else:
                print(f"  ⚠️ Неправильная структура в {json_file.name}")
                
        except json.JSONDecodeError as e:
            print(f"  ❌ Ошибка чтения JSON в {json_file.name}: {e}")
        except Exception as e:
            print(f"  ❌ Ошибка обработки {json_file.name}: {e}")
    
    # Обновляем общее количество элементов
    merged_data["info"]["total_items"] = total_items
    
    # Сохраняем объединенный файл
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n🎉 Успешно создан файл {output_file}")
        print(f"📊 Статистика:")
        print(f"  - Обработано файлов: {merged_data['info']['total_files']}")
        print(f"  - Всего элементов: {merged_data['info']['total_items']}")
        print(f"  - Галерей: {len(merged_data['galleries'])}")
        
        # Показываем информацию по каждой галерее
        print(f"\n📋 Галереи:")
        for gallery_name, gallery_data in merged_data["galleries"].items():
            print(f"  - {gallery_name}: {gallery_data['count']} элементов")
            
    except Exception as e:
        print(f"❌ Ошибка сохранения файла {output_file}: {e}")

def create_simple_merged_file(input_folder: str = "images", output_file: str = "simple_merged.json") -> None:
    """
    Создает простой объединенный файл - все элементы в одном массиве
    
    Args:
        input_folder: Путь к папке с JSON файлами
        output_file: Имя выходного файла
    """
    
    folder_path = Path(input_folder)
    if not folder_path.exists():
        print(f"❌ Папка {input_folder} не найдена!")
        return
    
    json_files = list(folder_path.glob("*.json"))
    
    if not json_files:
        print(f"❌ В папке {input_folder} не найдено JSON файлов!")
        return
    
    all_items = []
    
    for json_file in sorted(json_files):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if "response" in data and "items" in data["response"]:
                items = data["response"]["items"]
                # Добавляем информацию об источнике к каждому элементу
                for item in items:
                    item["source_gallery"] = json_file.stem
                
                all_items.extend(items)
                print(f"✅ Добавлено {len(items)} элементов из {json_file.name}")
                
        except Exception as e:
            print(f"❌ Ошибка обработки {json_file.name}: {e}")
    
    # Создаем структуру как в оригинальных файлах
    simple_merged = {
        "response": {
            "count": len(all_items),
            "items": all_items
        }
    }
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(simple_merged, f, ensure_ascii=False, indent=2)
        
        print(f"\n🎉 Создан простой объединенный файл {output_file}")
        print(f"📊 Всего элементов: {len(all_items)}")
        
    except Exception as e:
        print(f"❌ Ошибка сохранения: {e}")

def main():
    """Основная функция"""
    
    print("🎨 Скрипт объединения JSON галерей")
    print("=" * 40)
    
    # Создаем детальный объединенный файл
    print("\n1️⃣ Создание детального объединенного файла...")
    merge_json_files("images", "merged_gallery.json")
    
    print("\n" + "=" * 40)
    
    # Создаем простой объединенный файл
    print("\n2️⃣ Создание простого объединенного файла...")
    create_simple_merged_file("images", "simple_merged.json")
    
    print("\n" + "=" * 40)
    print("✨ Готово! Созданы файлы:")
    print("  - merged_gallery.json (с разделением по галереям)")
    print("  - simple_merged.json (все элементы в одном списке)")

if __name__ == "__main__":
    main()