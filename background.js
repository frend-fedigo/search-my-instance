chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        // Wird ausgeführt, wenn das Addon zum ersten Mal installiert wird.
        chrome.runtime.openOptionsPage();
    } else if (details.reason == "update") {
        // Wird ausgeführt, wenn das Addon aktualisiert wird.
        // Optional: Hier kannst du prüfen, ob die neue Version eine bestimmte ist,
        // bevor die Optionsseite geöffnet wird.
        // Zum Beispiel:
        // var thisVersion = chrome.runtime.getManifest().version;
        // if (thisVersion == "1.1.0") {
        //     chrome.runtime.openOptionsPage();
        // }
    }
});

chrome.contextMenus.create({
    id: 'open-in-instance',
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ['selection', 'link']
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'open-in-instance') {
        let searchText = info.selectionText || info.linkUrl;

        chrome.storage.sync.get({
            instanceUrl: 'https://fedigo.de',
            language: 'system'
        }, (items) => {
            let instanceUrl = items.instanceUrl;
            let lang = items.language;

            if (lang === 'system') {
                lang = chrome.i18n.getUILanguage();
            }

            lang = lang.startsWith('de') ? 'de' : 'en';

            if (!instanceUrl.endsWith('/')) {
                instanceUrl += '/';
            }

            let searchUrl = instanceUrl + 'search?l=' + lang + '&q=' + encodeURIComponent(searchText);

            chrome.tabs.create({ url: searchUrl, active: false });
        });
    }
});