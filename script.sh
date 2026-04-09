#!/bin/bash


OUTPUT_FILE="project_files.txt"

# Очищаем выходной файл
> "$OUTPUT_FILE"

# Находим все файлы, исключая node_modules и dist
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./dist/*" \
    -not -path "./.git/*" \
    -not -path "./project_files.txt" \
    -not -path "./script.sh" \
    -not -path "./.gitignore" \
    -not -path "./.github/workflows/deploy.yml" \
    | sed 's|^\./||' \
    | sort | while IFS= read -r file; do
    
    # Записываем имя файла
    echo "$file" >> "$OUTPUT_FILE"
    
    # Записываем содержимое файла
    if [ -f "$file" ]; then
        cat "$file" >> "$OUTPUT_FILE"
    else
        echo "[Файл не найден]" >> "$OUTPUT_FILE"
    fi
    
    # Добавляем пустую строку для разделения
    echo "" >> "$OUTPUT_FILE"
    
done

echo "Готово! Результат сохранен в $OUTPUT_FILE"