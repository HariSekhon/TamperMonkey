//  vim:ts=4:sts=4:sw=4:et
//
//  Author: Hari Sekhon
//  Date: 2024-11-19 16:40:30 +0400 (Tue, 19 Nov 2024)
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
// @name         Autofill Jira Ticket Description
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Insert editable text in Jira's description area without CPU overload
// @author       Hari Sekhon
// @match        https://*.atlassian.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // XXX: Edit text to suit your template preference
    const editableText = `### Summary of Work
Add details here

### Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3`;

    let textInserted = false;

    function fillJiraDescription() {

        if (textInserted) {
            console.log('Text already inserted, skipping...');
            return
        }

        console.log('Attempting to find the description area...');

        // Locate the description editor div
        const editorArea = document.querySelector('div#ak-editor-textarea');

        if (editorArea) {
            console.log('Found the description editor:', editorArea);

            // Get the existing placeholder text (if it exists)
            const placeholder = editorArea.querySelector('span[data-testid="placeholder-test-id"]');
            // If placeholder exists, remove it
            if (placeholder) {
                placeholder.remove();
            }

            // Create a new <p> element with the editable content
            const editableParagraph = document.createElement('p');
            editableParagraph.contentEditable = true;
            editableParagraph.innerHTML = editableText.replace(/\n/g, '<br>'); // Convert newlines to <br>

            // Insert the new content into the editor
            editorArea.innerHTML = ''; // Clear existing content
            editorArea.appendChild(editableParagraph); // Add the editable paragraph

            // Set the flag to true so it won't insert again
            textInserted = true;

            console.log('Editable text inserted successfully!');
        } else {
            console.log('Description editor not found');
        }
    }

    // Monitor the DOM for dynamic changes
    const observer = new MutationObserver(() => {
        fillJiraDescription(); // Retry inserting the editable text when the DOM changes
    });

    // Observe the entire body for changes
    observer.observe(document.body, { childList: true, subtree: true } );

    fillJiraDescription();
})();
