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
// @require  https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js
// ==/UserScript==

// Tested on Chrome

(function () {
    'use strict';

    const script_name = 'TamperMonkey: Jira Description Autofill';

    console.log(`${script_name}: Initializing...`);

    // XXX: Edit to suit your template preference - the reason to make this HTML is this is how the Jira UI does it
    //      so you can edit it normally, otherwise you'll have weird behaviour in the editor
    const descriptionHTML = `
<h3>Description</h3>
<p>As a platform engineer, I want …</p>
<h3>Acceptance Criteria</h3>
<ul class="ak-ul" data-indent-level="1">
<li><p>one</p></li>
<li><p>two</p></li>
</ul>
<h3>Engineering References / Notes</h3>
<p>Put links and notes here</p></div>
    `;

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

        if (isProcessing) {
            console.log(`${script_name}: processing semaphore is set, skipping execution...`);
            return;
        }

        console.log(`${script_name}: setting semaphore to prevent re-running function concurrently`);
        isProcessing = true;

        console.log(`${script_name}: searching for description area...`);

        const editorArea = document.querySelector('div#ak-editor-textarea');

        if (editorArea) {
            console.log(`${script_name}: found the description editor:`, editorArea);

            const placeholder = editorArea.querySelector('span[data-testid="placeholder-test-id"]');
            if (placeholder) {
                placeholder.remove();

                //const editableParagraph = document.createElement('p');
                //editableParagraph.contentEditable = true;
                //editableParagraph.innerHTML = description.trim() //.replace(/\n/g, '<br>'); // Convert newlines to <br>;

                //editorArea.innerHTML = ''; // Clear existing content
                //editorArea.appendChild(editableParagraph); // Add the editable paragraph

                const template = document.createElement('template');
                // Trim to avoid extra text nodes leading to whitespace at top of description
                const descriptionHTMLtrimmed = descriptionHTML.trim();
                const sanitizedHTML = DOMPurify.sanitize(descriptionHTMLtrimmed);
                template.innerHTML = sanitizedHTML;

                // clear all existing children to remove trailingBreak and other placeholders
                // which cause prepended space to the top of the description box
                while (editorArea.firstChild) {
                    editorArea.removeChild(editorArea.firstChild);
                }

                // append the native elements directly to the editor
                while (template.content.firstChild) {
                    editorArea.appendChild(template.content.firstChild);
                }

                //textInserted = true;

                console.log(`${script_name}: added Jira Description`);
            }
        } else {
            console.log(`${script_name}: Jira Description editor not found`);
        }

        console.log(`${script_name}: setting timeout of 2000ms before resetting the processing flag`);
        setTimeout(() => {
            isProcessing = false;
        }, 2000); // 2 second delay before the function can run again
    }

    console.log(`${script_name}: starting MutationObserver to monitor dynamic DOM changes`);
    const observer = new MutationObserver(() => {
        // Only trigger the function if the description area is not yet populated
        const editorArea = document.querySelector('div#ak-editor-textarea');
        if (editorArea && !editorArea.querySelector('p[contenteditable="true"]')) {
            fillJiraDescription();
        }
    });

    // Observe the entire body for changes
    observer.observe(document.body, { childList: true, subtree: true } );

    console.log(`${script_name}: initial call to autofill description if already present`);
    fillJiraDescription();

    //function sleep(ms) {
    //    return new Promise(resolve => setTimeout(resolve, ms));
    //}
})();
