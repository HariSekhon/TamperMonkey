//  vim:ts=4:sts=4:sw=4:et
//
//  Author: Hari Sekhon
//  Date: 2026-04-12 08:04:43 +0200 (Sun, 12 Apr 2026)
//
//  https///github.com/HariSekhon/TamperMonkey
//
//  License: see accompanying Hari Sekhon LICENSE file
//
//  If you're using my code you're welcome to connect with me on LinkedIn
//  and optionally send me feedback
//
//  https://www.linkedin.com/in/HariSekhon
//

// ==UserScript==
// @name         Auto Close Adblock Popup
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically clicks "OK, I understand"
// @match        *://*/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/HariSekhon/TamperMonkey/refs/heads/main/auto-close-adblock-popup.js
// @updateURL    https://raw.githubusercontent.com/HariSekhon/TamperMonkey/refs/heads/main/auto-close-adblock-popup.js
// ==/UserScript==

// Not Properly Tested on Chrome yet

(function () {
    'use strict';

    function closePopup() {
        var btn = document.querySelector('#js-adblock-close');
        if (btn) {
            btn.click();
            console.log('Popup closed');
        }
    }

    // Run immediately
    closePopup();

    // Observe DOM changes for dynamically loaded popups
    var observer = new MutationObserver(function () {
        closePopup();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
