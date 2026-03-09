// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Глобальные константы и данные ---
    const sourceDescs = {
        "Оригинальные образы Windows (MSDN & VLSC)": "Самые последние официальные, оригинальные сборки, созданные Microsoft. Сборки MSDN обновляются каждый 3-й вторник месяца, VLSC – каждый 4-й понедельник месяца.",
        "Windows by UUP dump": "Скрипт, позволяющий скачивать оригинальные файлы с серверов обновления Windows и преобразовывать их в готовый (.iso) образ. Здесь представлены уже готовые образы. Обновления выходят каждый 2-й вторник месяца (Вторник патчей), также иногда выпускаются внеплановые накопительные обновления после Вторника патчей, которые не интегрируются в оригинальные образы от Microsoft, хоть и выходят позже. Cписок редакций в образе значительно больше. Это точно такие же оригинальные образы, просто собранные по-другому.",
        "Windows by rgadguard": "Сборки на основе оригинальных образов MSDN с последующей интеграцией последних обновлений. В них нет никаких косметических изменений и ничего не вырезано. Системы не были в режиме аудита. Присутствует самое большое количество редакций в одном .iso образе. В Windows 11 уже отключены проверки: TPM, Security boot, CPU, Storage и RAM-память. В Windows 10 & 11 также отключён автоматический BitLocker.",
        "Windows by NTDEV + tiny11builder & nano11builder": "Облегчённые сборки, не имеющие никакого отношения к оригинальным. Добавлены исключительно ради тестирования и веселья (ну, кому как). Ни в коем случае не устанавливать в качестве основной системы!",
        "Запись образа Windows на USB-накопитель": "Различные инструменты для записи ISO-образов Windows на USB-накопитель. Вы можете выбрать любой из имеющихся инструментов для дальнейшей работы. Представлено нескольких вариантов, однако это не обязывает вас скачивать их все – это просто список на выбор. Rufus – самая простая программа в использовании, рекомендуется для разовой записи одного образа. Flashr – нужна, если вы не хотите заморачиваться с выбором между MBR, GPT и не понимаете, что это. Ventoy – позволяет хранить на USB-накопителе сразу несколько различных образов, подойдёт для мультизагрузочных носителей. FlashBoot Pro – подойдёт в случае, если у вас возникают проблемы с отсутствующими драйверами при установке Windows 7.",
        "Чистая установка Windows 10 и 11": "1) Зачем это нужно? autounattend.xml или Файл ответов позволяет устанавливать Windows в полуавтоматическом режиме. Подробнее: <a href='https://schneegans.de/windows/unattend-generator' target='_blank' rel='noopener noreferrer'>schneegans.de</a>",
        "Ratiborus с автообновлениями (Рекомендуется)": "Утилиты для автоматической загрузки, установки и активации Office. Позволяют гибко настроить компоненты (Word, Excel и т.д.) и редакцию перед установкой. В чём разница? <b>Volume</b> – для корпораций. Только обновления безопасности. <b>Retail</b> – для частных лиц. Включает и обновления безопасности, и новые функции.",
        "Office by rgadguard": "Готовые iso образы Office с интегрированными последними обновлениями. В чём разница? <b>Volume</b> – для корпораций. <b>Retail</b> – для частных лиц."
    };
    const bitnessDesc = "Разрядность или Архитектура операционной системы. Устанавливать ARM64 – только при наличии процессора на архитектуре ARM, например, от Apple или Qualcomm. 32-bit – если ОЗУ < 4 ГБ.";
    const editionDesc = "Если нужна редакция «Домашняя (Home / HSL)», то выбираем «Consumer Edition», если – «Корпоративная (Enterprise)» – «Business Edition». Для редакции «Профессиональная (Pro)» разницы как таковой нет. В любом случае, проблем с активацией не будет ни у одной из сборок.";
    const usbDesc = "Различные инструменты для записи ISO-образов Windows на USB-накопитель. Rufus – самая простая программа, рекомендуется для разовой записи. Ventoy – позволяет хранить на USB-накопителе сразу несколько различных образов.";

    // --- 1. Глобальные переменные для DOM ---
    const main = document.getElementById('main');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');

    function initApp(data) {
        buildNext(main, data, [], true);
        initSearch(main, searchInput, noResults, data);
    }

    // Пробуем загрузить файл
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Файл data.json не найден, используем демо-режим');
            return response.json();
        })
        .then(data => {
            console.log("Данные загружены из data.json");
            initApp(data);
        })
        .catch(err => {
            console.warn("Ошибка загрузки data.json (используется демо-режим):", err);
            // Демо-данные на случай проблем с сетью
            const demoData = {
                "Windows": {
                    "Windows 11": {
                        "24H2": {
                            "64-bit": {
                                "Windows 11 24H2 [64-bit] [Русский]": "https://disk.yandex.ru/d/T7Ws4_w7GeGpaw"
                            }
                        }
                    },
                    "Windows 10 22H2": {
                        "64-bit": {
                            "Windows 10 22H2 [64-bit] [Русский]": "https://disk.yandex.ru/d/uevi48MMz57RWA"
                        }
                    }
                },
                "Office": {
                    "Ratiborus с автообновлениями (Рекомендуется)": {
                        "Office Installer+": "https://disk.yandex.ru/d/blcb37yzdscGcw"
                    }
                },
                "Активировать Windows и/или Office": {
                    "Microsoft Activation Scripts (MAS)": "https://disk.yandex.ru/d/4bT-qC8MkT5h6w"
                }
            };
            initApp(demoData);
        });

    // --- 2. Глобальная функция экранирования HTML (критически важна!) ---
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // --- 2. Логика поиска ---
    function initSearch(container, inputElem, noResultsElem, dataObj) {
        const searchAliases = {
            "win": "windows", "winxp": "windows xp", "win7": "windows 7",
            "win8": "windows 8", "win8.1": "windows 8.1", "win10": "windows 10",
            "win11": "windows 11", "uup": "uup dump", "rg": "rgadguard",
            "rat": "ratiborus", "64": "64-bit", "x64": "64-bit", "32": "32-bit",
            "x86": "32-bit", "arm": "arm64", "pro": "professional",
            "ent": "enterprise", "vl": "volume", "of": "office", "офис": "office"
        };

        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function highlightText(text, tokens) {
            let result = text;
            tokens.forEach(token => {
                if (token.length < 2) return;
                const regex = new RegExp(`(${escapeRegExp(token)})`, 'gi');
                result = result.replace(regex, '<span style="background-color: #fff6c5; font-weight: bold;">$1</span>');
            });
            return result;
        }

        let searchTimeout;

        inputElem.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const rawQuery = e.target.value.toLowerCase().trim();

            searchTimeout = setTimeout(() => {
                container.innerHTML = '';
                noResultsElem.style.display = 'none';

                if (!rawQuery) {
                    buildNext(container, dataObj, [], true);
                    return;
                }

                const tokens = rawQuery.split(/\s+/).map(token => {
                    return searchAliases[token] || token;
                });

                const tokenRegexes = tokens.map(token => {
                    return new RegExp('(^|[\\s\\[\\]\\(\\)\\-_,])' + escapeRegExp(token), 'i');
                });

                const results = [];

                function searchTree(obj, currentPath) {
                    for (const key in obj) {
                        const value = obj[key];
                        const newPath = [...currentPath, key];

                        if (typeof value === 'string') {
                            const fullPathString = newPath.join(' ').toLowerCase();
                            const isMatch = tokenRegexes.every(regex => regex.test(fullPathString));

                            if (isMatch) {
                                results.push({
                                    path: newPath,
                                    url: value
                                });
                            }
                        } else {
                            searchTree(value, newPath);
                        }
                    }
                }

                searchTree(dataObj, []);

                if (results.length > 0) {
                    results.forEach(res => {
                        createResultItem(container, res, tokens);
                    });
                } else {
                    noResultsElem.style.display = 'block';
                }
            }, 250);
        });
    }

    function createResultItem(container, res, tokens) {
        const item = document.createElement('div');
        item.className = 'search-result-item';

        const breadcrumbs = res.path.slice(0, -1).join(' ➔ ');
        const fileName = res.path[res.path.length - 1];

        const highlightedBreadcrumbs = highlightText(breadcrumbs, tokens);
        const highlightedFileName = highlightText(fileName, tokens);

        item.innerHTML = `
            <div class="search-result-path">${highlightedBreadcrumbs}</div>
            <div class="search-result-header">
                <span class="search-result-title">${highlightedFileName}</span>
                <div class="action-buttons-container">
                    <button class="search-result-btn btn-copy" data-url="${escapeHtml(res.url)}">Скопировать ссылку</button>
                    <a href="${escapeHtml(res.url)}" target="_blank" class="search-result-btn">Скачать / Перейти</a>
                </div>
            </div>
        `;
        container.appendChild(item);

        item.querySelector('.btn-copy').addEventListener('click', function() {
            navigator.clipboard.writeText(res.url).then(() => {
                const initialText = this.innerText;
                this.innerText = 'Скопировано!';
                setTimeout(() => this.innerText = initialText, 2000);
            });
        });
    }

    function appendUsbSuggestion(container, path) {
        if (path.length === 0 || path[0] !== 'Windows') return;

        let toolUrl = '';
        let toolName = '';

        const fullPath = path.join(' ');

        if (fullPath.includes('Windows XP')) {
            toolUrl = 'https://disk.yandex.ru/d/XLyO70kcB3hXGw';
            toolName = 'Запись образа на USB-накопитель (XP)';
        } else if (fullPath.includes('Windows 7')) {
            toolUrl = 'https://disk.yandex.ru/d/AMAtqtojBumDoA';
            toolName = 'Запись образа на USB-накопитель (Win7)';
        } else if (fullPath.includes('Windows 10') || fullPath.includes('Windows 11')) {
            toolUrl = 'https://disk.yandex.ru/d/z97KEl-7laHO5Q';
            toolName = 'Запись образа на USB-накопитель (Win10/11)';
        }

        if (toolUrl) {
            const card = document.createElement('div');
            card.className = 'search-result-item';
            card.style.marginTop = '15px';
            card.style.borderLeft = '4px solid #107c41';
            card.innerHTML = `
                <div class="search-result-header">
                    <span class="search-result-title" style="display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 15C8.55 15 9 15.45 9 16C9 16.55 8.55 17 8 17C7.45 17 7 16.55 7 16C7 15.45 7.45 15 8 15M15.07 4.69L16.5 6.1L15.07 7.5L13.66 6.1L15.07 4.69M17.9 7.5L19.31 8.93L17.9 10.34L16.5 8.93L17.9 7.5M8 13C6.34 13 5 14.34 5 16C5 17.66 6.34 19 8 19C9.66 19 11 17.66 11 16C11 14.34 9.66 13 8 13M9.77 4.33L10.5 5.08L14.29 1.29C14.47 1.11 14.72 1 15 1C15.28 1 15.53 1.11 15.71 1.29L22.78 8.36L22.78 8.37C22.92 8.54 23 8.76 23 9C23 9.3 22.87 9.57 22.66 9.76L22.66 9.76L18.93 13.5L19.67 14.23L12.95 20.95C11.68 22.22 9.93 23 8 23C4.13 23 1 19.87 1 16C1 14.07 1.78 12.32 3.05 11.05L9.77 4.33M20.59 9L15 3.41L11.93 6.5L17.5 12.08L20.59 9Z" /></svg>
                        ${toolName}
                    </span>
                    <div class="action-buttons-container">
                        <a href="${escapeHtml(toolUrl)}" target="_blank" class="search-result-btn btn-green">Скачать утилиту</a>
                    </div>
                </div>
                <div class="usb-desc-text">${usbDesc}</div>
            `;
            container.appendChild(card);
        }
    }

    function createDownloadCard(title, url, hideTitle = false) {
        const card = document.createElement('div');
        card.className = 'search-result-item';
        card.style.marginTop = '20px';

        if (hideTitle) {
            card.innerHTML = `
                <div class="search-result-header" style="justify-content: center;">
                    <div class="action-buttons-container">
                        <button class="search-result-btn btn-copy" data-url="${escapeHtml(url)}">Скопировать ссылку</button>
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="search-result-btn">Скачать / Перейти</a>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="search-result-header">
                    <span class="search-result-title">${title}</span>
                    <div class="action-buttons-container">
                        <button class="search-result-btn btn-copy" data-url="${escapeHtml(url)}">Скопировать ссылку</button>
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="search-result-btn">Скачать / Перейти</a>
                    </div>
                </div>
            `;
        }
        return card;
    }

    function buildNext(container, currentObj, path, isRoot = false) {
        if (!currentObj) return;

        if (typeof currentObj === 'string') {
            const title = path.length > 0 ? path[path.length - 1] : "Перейти по ссылке";
            container.appendChild(createDownloadCard(title, currentObj, true));
            appendUsbSuggestion(container, path);
            return;
        }

        const keys = Object.keys(currentObj);
        if (keys.length === 0) return;

        const isEndNode = keys.every(k => typeof currentObj[k] === 'string');

        if (isEndNode) {
            if (keys.length === 1) {
                const fileName = keys[0];
                const url = currentObj[fileName];
                container.appendChild(createDownloadCard(fileName, url));
                appendUsbSuggestion(container, path);
                return;
            }

            const select = document.createElement('select');
            select.innerHTML = '<option value="">Выберите файл</option>' + keys.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');
            container.appendChild(select);

            const resultContainer = document.createElement('div');
            container.appendChild(resultContainer);

            select.onchange = function() {
                const val = this.value;
                resultContainer.innerHTML = '';
                if (val) {
                    const url = currentObj[val];
                    resultContainer.appendChild(createDownloadCard(val, url, true));
                    appendUsbSuggestion(resultContainer, path);
                }
            };
            return;
        }

        const wrapper = document.createElement('div');

        const select = document.createElement('select');
        let defaultOptionText = "Выберите";
        if (isRoot) defaultOptionText = "Выберите, что хотите скачать или сделать";

        select.innerHTML = `<option value="">${defaultOptionText}</option>` + keys.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');
        wrapper.appendChild(select);

        const isBitness = keys.some(k => k.includes('-bit') || k === 'ARM64');
        const isEdition = keys.some(k => k.includes('Consumer Edition') || k.includes('Business Edition'));

        const staticDescDiv = document.createElement('div');
        staticDescDiv.className = 'desc';
        if (isBitness && path.length > 0 && path[0] === 'Windows') {
            staticDescDiv.innerHTML = bitnessDesc;
            staticDescDiv.style.display = 'block';
        } else if (isEdition) {
            staticDescDiv.innerHTML = editionDesc;
            staticDescDiv.style.display = 'block';
        }
        wrapper.appendChild(staticDescDiv);

        const selectionDescDiv = document.createElement('div');
        selectionDescDiv.className = 'desc';
        wrapper.appendChild(selectionDescDiv);

        const nextLevelContainer = document.createElement('div');
        wrapper.appendChild(nextLevelContainer);

        container.appendChild(wrapper);

        select.onchange = function() {
            const val = this.value;
            nextLevelContainer.innerHTML = '';
            selectionDescDiv.style.display = 'none';
            selectionDescDiv.innerHTML = '';

            if (val) {
                if (sourceDescs[val]) {
                    selectionDescDiv.innerHTML = sourceDescs[val];
                    selectionDescDiv.style.display = 'block';
                }
                buildNext(nextLevelContainer, currentObj[val], [...path, val]);
            }
        };
    }

    // --- 3. Логика переключения темы ---
    const toggleButton = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function updateThemeIcon() {
        const isDark = document.body.classList.contains('dark-mode');
        const sunIcon = document.getElementById('icon-sun');
        const moonIcon = document.getElementById('icon-moon');
        if (sunIcon) sunIcon.style.display = isDark ? 'block' : 'none';
        if (moonIcon) moonIcon.style.display = isDark ? 'none' : 'block';
    }

    if (storedTheme === 'dark' || (!storedTheme && systemDark)) {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();

    if (toggleButton) {
        toggleButton.onclick = function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            updateThemeIcon();
        };
    }
});
