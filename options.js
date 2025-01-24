function saveOptions() {
    const instanceUrl = document.getElementById('instanceUrl').value;

    if (!instanceUrl.startsWith('https://') || !instanceUrl.endsWith('/') || instanceUrl.substring(8).indexOf('/') === 0) {
        const status = document.getElementById('status');
        status.textContent = chrome.i18n.getMessage("urlErrorMessage");
        status.style.color = 'red';
        status.classList.add('visible');
        setTimeout(() => {
            status.classList.remove('visible');
        }, 5000);
        return;
    }

    chrome.storage.sync.set({ instanceUrl }, () => {
        const status = document.getElementById('status');
        status.textContent = chrome.i18n.getMessage("settingsSaved");
        status.style.color = '#28a745';
        status.classList.add('visible');
        setTimeout(() => {
            status.classList.remove('visible');
        }, 750);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({ instanceUrl: 'https://fedigo.de/', language: 'system' }, (items) => {
        document.getElementById('instanceUrl').value = items.instanceUrl;
        document.getElementById('languageSelect').value = items.language;
        // Sprache erkennen bevor applyLocalization ausgeführt wird
        let lang = items.language;
        if (lang === 'system') {
            lang = chrome.i18n.getUILanguage();
        }
        lang = lang.startsWith('de') ? 'de' : 'en';
        // applyLocalization erst ausführen nachdem die Sprache da ist
        applyLocalization(lang);
        checkUrlStatus(items.instanceUrl);
    });
}

function checkUrlStatus(url) {
    const statusContainer = document.getElementById('urlStatus');
    statusContainer.innerHTML = '';

    const httpsStatus = document.createElement('div');
    httpsStatus.classList.add('status-item');

    const httpsIcon = document.createElement('div');
    httpsIcon.classList.add('status-icon');

    const httpsText = document.createElement('div');
    httpsText.classList.add('status-text');

    if (url.startsWith('https://')) {
        httpsIcon.innerHTML = '<i class="fas fa-check-circle status-ok"></i>';
        httpsText.textContent = chrome.i18n.getMessage("urlHttpsOk");
        httpsStatus.classList.add('status-ok');
    } else {
        httpsIcon.innerHTML = '<i class="fas fa-times-circle status-error"></i>';
        httpsText.textContent = chrome.i18n.getMessage("urlHttpsError");
        httpsStatus.classList.add('status-error');
    }

    httpsStatus.appendChild(httpsIcon);
    httpsStatus.appendChild(httpsText);
    statusContainer.appendChild(httpsStatus);

    const slashStatus = document.createElement('div');
    slashStatus.classList.add('status-item');

    const slashIcon = document.createElement('div');
    slashIcon.classList.add('status-icon');

    const slashText = document.createElement('div');
    slashText.classList.add('status-text');

    if (url.endsWith('/')) {
        slashIcon.innerHTML = '<i class="fas fa-check-circle status-ok"></i>';
        slashText.textContent = chrome.i18n.getMessage("urlSlashOk");
        slashStatus.classList.add('status-ok');
    } else {
        slashIcon.innerHTML = '<i class="fas fa-times-circle status-error"></i>';
        slashText.textContent = chrome.i18n.getMessage("urlSlashError");
        slashStatus.classList.add('status-error');
    }

    slashStatus.appendChild(slashIcon);
    slashStatus.appendChild(slashText);
    statusContainer.appendChild(slashStatus);

    const hostnameStatus = document.createElement('div');
    hostnameStatus.classList.add('status-item');

    const hostnameIcon = document.createElement('div');
    hostnameIcon.classList.add('status-icon');

    const hostnameText = document.createElement('div');
    hostnameText.classList.add('status-text');

    if (url.startsWith('https://') && url.substring(8).indexOf('/') === 0) {
        hostnameIcon.innerHTML = '<i class="fas fa-times-circle status-error"></i>';
        hostnameText.textContent = chrome.i18n.getMessage("urlHostnameError");
        hostnameStatus.classList.add('status-error');
    } else if(url.startsWith('https://') && url.endsWith('/')) {
        hostnameIcon.innerHTML = '<i class="fas fa-check-circle status-ok"></i>';
        hostnameText.textContent = chrome.i18n.getMessage("urlHostnameOk");
        hostnameStatus.classList.add('status-ok');
    }

    hostnameStatus.appendChild(hostnameIcon);
    hostnameStatus.appendChild(hostnameText);
    statusContainer.appendChild(hostnameStatus);
}

function testInstance() {
    const instanceUrl = document.getElementById('instanceUrl').value;
    const searchText = 'frend@fedigo.de';
    const searchUrl = instanceUrl + 'search?q=' + encodeURIComponent(searchText);
    chrome.tabs.create({ url: searchUrl, active: true });
}

// Funktion applyLocalization nutzt jetzt parameter (sprache)
function applyLocalization(lang) {
    fetch(`_locales/${lang}/messages.json`)
        .then(response => response.json())
        .then(messages => {
            document.getElementById('settingsTitle').textContent = getMessage(messages, "settingsTitle");
            document.getElementById('instanceUrlLabel').textContent = getMessage(messages, "instanceUrlLabel");
            document.getElementById('instanceUrlHint').innerHTML = getMessage(messages, "instanceUrlHint");
            document.getElementById('languageSelectLabel').textContent = getMessage(messages, "languageSelectLabel");
            document.getElementById('optionSystem').textContent = getMessage(messages, "optionSystem");
            document.getElementById('optionGerman').textContent = getMessage(messages, "optionGerman");
            document.getElementById('optionEnglish').textContent = getMessage(messages, "optionEnglish");
            document.getElementById('save').textContent = getMessage(messages, "saveButton");
            document.getElementById('test').textContent = getMessage(messages, "testButton");
            document.getElementById('status').textContent = getMessage(messages, "status");
            checkUrlStatus(document.getElementById('instanceUrl').value);
        });
}

function getMessage(messages, key) {
    return messages[key]?.message || chrome.i18n.getMessage(key);
}

function onLanguageChanged() {
    const language = document.getElementById('languageSelect').value;
    chrome.storage.sync.set({ language }, () => {
        // Hier jetzt die ausgewählte Sprache aus dem Dropdown verwenden
        const lang = language;
        // applyLocalization erst ausführen nachdem die Sprache da ist
        applyLocalization(lang);
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('test').addEventListener('click', testInstance);
document.getElementById('instanceUrl').addEventListener('input', () => {
    checkUrlStatus(document.getElementById('instanceUrl').value);
});
document.getElementById('languageSelect').addEventListener('change', onLanguageChanged);