// ==UserScript==
// @name         Drag.io - Drag It!
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a "Drag It!" button to send page URL to Drag.io app
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const BTN_ID = 'drag-io-float-btn';
    if (document.getElementById(BTN_ID)) return;

    const button = document.createElement('button');
    button.id = BTN_ID;
    button.innerText = 'Drag It!';
    Object.assign(button.style, {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: '999999',
        padding: '10px 20px', backgroundColor: '#000000', color: '#ffffff',
        border: '2px solid #ffffff', borderRadius: '8px', cursor: 'pointer',
        fontWeight: 'bold', fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.1s ease',
        pointerEvents: 'auto'
    });

    button.onmouseover = () => button.style.transform = 'scale(1.05)';
    button.onmouseout = () => button.style.transform = 'scale(1)';
    
    button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentUrl = window.location.href;
        window.location.href = `dragio://open?url=${encodeURIComponent(currentUrl)}`;
    };

    document.body.appendChild(button);
})();
