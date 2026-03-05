const translations = {
    ru: {
        traps: "ловушек",
        play: "Получить сигнал",
    },
    en: {
        traps: "traps",
        play: "Get signal",
    },
    az: {
        traps: "tələ",
        play: "Siqnal alın",
    },
    uz: {
        traps: "tuzoq",
        play: "Signalni oling",
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');

    if (!languageSelect) {
        console.error('Элемент выпадающего списка языков не найден!');
        return;
    }

    const flags = Object.fromEntries(
        Object.keys(translations).map(lang => [lang, `./img/${lang}.svg`]) // Относительный путь
    );

    // Функция для обновления флага
    function updateFlag() {
        const selectedValue = languageSelect.value;
        const flagUrl = flags[selectedValue] || '';

        if (flagUrl) {
            // Устанавливаем флаг как фоновое изображение слева
            languageSelect.style.backgroundImage = `url('${flagUrl}')`;
            languageSelect.style.backgroundPosition = 'left center';
            languageSelect.style.backgroundRepeat = 'no-repeat';
            languageSelect.style.backgroundSize = '20px 20px'; // Размер флага
            languageSelect.style.paddingLeft = '30px'; // Отступ для флага
        } else {
            // Если флаг не найден, очищаем фон
            languageSelect.style.backgroundImage = '';
            languageSelect.style.paddingLeft = '12px'; // Возвращаем исходный отступ
        }
    }

    // Инициализация при загрузке страницы
    const savedLanguage = localStorage.getItem('language') || 'ru';
    languageSelect.value = savedLanguage;
    updateFlag();

    // Обработчик события изменения выбора
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        updateFlag();
        // Дополнительная логика для смены языка
        localStorage.setItem('language', selectedLanguage);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');

    if (!languageSelect) {
        console.error('Элемент выпадающего списка языков не найден!');
        return;
    }

    // Функция для обновления текста на странице
    function updateLanguage(lang) {
        if (!translations[lang]) {
            console.error(`Переводы для языка "${lang}" не найдены.`);
            return;
        }

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key] !== undefined) {
                element.textContent = translations[lang][key];
            } else {
                console.warn(`Ключ перевода "${key}" не найден для языка "${lang}".`);
            }
        });

        // Обновление атрибута lang у html для SEO и доступности
        document.documentElement.lang = lang;

        // Обновление заголовка страницы
        const titleElement = document.querySelector('title[data-i18n="title"]');
        if (titleElement && translations[lang]['title']) {
            titleElement.textContent = translations[lang]['title'];
        }
    }

    // Проверяем, есть ли сохранённый язык в localStorage
    const savedLanguage = localStorage.getItem('language') || 'ru';
    languageSelect.value = savedLanguage;
    updateLanguage(savedLanguage);

    // Обработчик изменения языка
    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        updateLanguage(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
    });
});
