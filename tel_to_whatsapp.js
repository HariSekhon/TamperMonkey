//  vim:ts=4:sts=4:sw=4:et
//
//  Author: Hari Sekhon
//  Date: 2025-09-26 17:31:22 +0300 (Fri, 26 Sep 2025)
//
//  https///github.com/HariSekhon/TamperMonkey
//
//  License: see accompanying Hari Sekhon LICENSE file
//
//  If you're using my code you're welcome to connect with me on LinkedIn and optionally send me feedback to help steer this or other code I publish
//
//  https://www.linkedin.com/in/HariSekhon
//

// ==UserScript==
// @name         Tel-to-Whatsapp
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Replace tel:+... links with WhatsApp wa.me links (preserves original href in data-original-href). Uses MutationObserver for dynamic pages.
// @author       Hari Sekhon
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const script_name = 'TamperMonkey: Tel to WhatsApp';

  // you'll need to enable Verbose level logging to see this debug logging I've added throughout the code
  console.log(`${script_name}: Initializing at ${new Date().toISOString()`);

  // Convert a tel: value or raw phone string into a wa.me-friendly digits-only string.
  // Accepts formats like tel:+1-234-567-8900, +12345678900, 0012345678900, (123) 456-7890, etc.
  function normalizePhone(raw) {
    console.log(`${script_name}: normalizePhone(${raw})`);
    if (!raw) return null;
    console.log(`${script_name}: normalizing phone number: ${raw}`);
    // strip tel: prefix and whitespace
    let s = raw.toString().trim().replace(/^tel:/i, '');
    // if it starts with "tel:", remove again defensively
    s = s.replace(/^tel:/i, '');

    // If it contains a pause/w extension like ;ext= or , or x, remove everything after punctuation
    s = s.split(/[;,xext\#]/i)[0];

    // convert international 00 prefix to nothing (00 -> international dialing prefix)
    s = s.replace(/^00/, '');

    // remove everything that's not a digit or plus
    // keep leading + for now so we can remove it and keep digits
    s = s.replace(/[^\d+]/g, '');

    // remove leading plus
    if (s.startsWith('+')) s = s.slice(1);

    // final sanity: must be at least 5 digits for a phone number — otherwise ignore
    if (s.length < 5) return null;

    console.log(`${script_name}: normalized phone number: ${s}`);
    return s;
  }

  // Replace a single anchor element's href if it starts with tel:
  function replaceTelLink(a) {
    console.log(`${script_name}: replaceTelLink(${a})`);
    try {
      if (!(a && a.tagName && a.tagName.toLowerCase() === 'a')) return;
      const href = a.getAttribute('href');
      if (!href) return;
      // only replace if href begins with tel:
      if (!/^tel:/i.test(href)) return;

      // avoid replacing if we've already stored original
      if (a.dataset && a.dataset.originalHref) return;

      const normalized = normalizePhone(href);
      if (!normalized) return;

      console.log(`${script_name}: replacing href: ${href}`);

      // store original href so user can revert if needed
      a.dataset.originalHref = href;

      // create wa.me link (no '+' and only digits)
      const waHref = 'https://wa.me/' + normalized;

      console.log(`${script_name}: replacing tel href with whatapp href: ${waHref}`);

      // set the new href and open in new tab (optional)
      a.setAttribute('href', waHref);
      a.setAttribute('rel', 'noopener noreferrer');

      // optional: open whatsapp web in new tab instead of replacing current page
      // remove the next line if you don't want target="_blank"
      a.setAttribute('target', '_blank');

      // add a visual hint (optional) — comment out if you prefer no change to link text/style
      // a.title = (a.title ? a.title + ' — ' : '') + 'Opened in WhatsApp (wa.me)';
    } catch (e) {
      // fail silently
      console.error(`${script_name}: replace failed`, e);
    }
  }

  // Process all matching anchors currently in the document
  function processAll() {
    console.log(`${script_name}: processAll()`);
    const anchors = document.querySelectorAll('a[href^="tel:" i]');
    anchors.forEach(replaceTelLink);
  }

  // Observe dynamic additions to the DOM (SPA pages, lazy loading)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          // if a node or its descendants contain tel: anchors, process them
          if (node.matches && node.matches('a[href^="tel:" i]')) {
            replaceTelLink(node);
          }
          node.querySelectorAll && node.querySelectorAll('a[href^="tel:" i]').forEach(replaceTelLink);
        });
      } else if (m.type === 'attributes' && m.target && m.target.matches && m.target.matches('a[href^="tel:" i]')) {
        replaceTelLink(m.target);
      }
    }
  });

  // start observing the document body
  function startObserver() {
    console.log(`${script_name}: startObserver()`);
    if (!document.body) {
      // if body not yet present, wait until DOMContentLoaded
      window.addEventListener('DOMContentLoaded', () => {
        processAll();
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
      }, { once: true });
    } else {
      processAll();
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    }
  }

  // public helper to revert changes on the page (for debugging or temporary toggle)
  window.__telToWhatsappRevert = function revertAll() {
    document.querySelectorAll('a[data-original-href]').forEach((a) => {
      try {
        a.setAttribute('href', a.dataset.originalHref);
        a.removeAttribute('target');
        a.removeAttribute('rel');
        delete a.dataset.originalHref;
      } catch (e) { /* ignore */ }
    });
  };

  startObserver();
})();
