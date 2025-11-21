// ============================================
// SERVER EARLY WAKE-UP SCRIPT
// This loads FIRST to wake Render server immediately
// Place this in <head> or as first <script> in <body>
// ============================================

(function() {
    'use strict';
    
    const API_URL = 'https://parapharmacie-gaher.onrender.com/api';
    
    console.log('🚀 [Early Wake] Pinging server immediately...');
    
    // Fire the wake-up request instantly
    fetch(API_URL + '/health', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(function(response) {
        if (response.ok) {
            console.log('✅ [Early Wake] Server is awake!');
        } else {
            console.log('⏰ [Early Wake] Server starting... (HTTP ' + response.status + ')');
        }
    })
    .catch(function(error) {
        console.log('⏰ [Early Wake] Server cold start initiated');
    });
})();
