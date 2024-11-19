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
// @name         Jira Description Autofill
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Insert editable text in Jira's description field
// @author       Hari Sekhon
// @match        https://*.atlassian.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const script_name = 'TamperMonkey: Jira Description Autofill';

    console.log('${script_name}!: Initializing...');

    // XXX: Edit text to suit your template preference
    const editableText = `### Summary of Work
Add details here

### Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3`;

    // prevent excessive executions
    let isProcessing = false;
    //let textInserted = false;

    function fillJiraDescription() {

        // If closing and re-opening or opening more than Jira ticket in the same tab,
        // this fails to insert the description into the new Jira ticket
        //if (textInserted) {
        //    console.log('Text already inserted, skipping...');
        //    return
        //}

        // Prevent function from running if it's already processing
        if (isProcessing) {
            return;
        }

        console.log('${script_name}!: searching for description area...');

        const editorArea = document.querySelector('div#ak-editor-textarea');

        if (editorArea) {
            console.log('${script_name}!: found the description editor:', editorArea);

            const placeholder = editorArea.querySelector('span[data-testid="placeholder-test-id"]');
            if (placeholder) {
                placeholder.remove();
            }

            const editableParagraph = document.createElement('p');
            editableParagraph.contentEditable = true;
            editableParagraph.innerHTML = editableText.replace(/\n/g, '<br>'); // Convert newlines to <br>

            editorArea.innerHTML = ''; // Clear existing content
            editorArea.appendChild(editableParagraph); // Add the editable paragraph

            //textInserted = true;

            console.log('${script_name}!: added Jira Description');
        } else {
            console.log('${script_name}!: Jira Description editor not found');
        }
        // Reset the processing flag after a short delay
        setTimeout(() => {
            isProcessing = false;
        }, 1000); // 1 second delay before the function can run again
    }

    // Monitor the DOM for dynamic changes
    const observer = new MutationObserver(() => {
        // Only trigger the function if the description area is not yet populated
        const editorArea = document.querySelector('div#ak-editor-textarea');
        if (editorArea && !editorArea.querySelector('p[contenteditable="true"]')) {
            fillJiraDescription();
        }
    });

    // Observe the entire body for changes
    observer.observe(document.body, { childList: true, subtree: true } );

    // initial call to fill the description if possible
    fillJiraDescription();
})();
