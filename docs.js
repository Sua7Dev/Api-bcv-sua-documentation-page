document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'https://api-bcv-sua.vercel.app';
    
    // NOTA DE SEGURIDAD: La API KEY no debe estar en el código frontend.
    // Para probar localmente, puedes usar window.API_KEY en la consola o un campo de entrada.
    // En producción, lo ideal es un proxy serverless para no exponer el secreto.
    let TEST_API_KEY = window.API_KEY || ''; 

    // --- Endpoint Testing Logic (Screenshot Style) ---
    const tryButtons = document.querySelectorAll('.btn-try');
    
    tryButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const path = btn.getAttribute('data-path');
            const fullUrl = `${BASE_URL}${path}`;
            const item = btn.closest('.endpoint-item');
            const responseArea = item.querySelector('.response-area');
            
            // Show area and set loading state
            responseArea.style.display = 'block';
            responseArea.innerHTML = `
                <div class="response-header">
                    <div class="response-title">
                        <span class="material-symbols-outlined" style="font-size: 16px;">expand_more</span>
                        Respuesta
                    </div>
                </div>
                <div class="response-body">Cargando...</div>
            `;
            
            const startTime = performance.now();
            
            try {
                const headers = { 'Accept': 'application/json' };
                if (path.startsWith('/v1/')) {
                    const savedKey = sessionStorage.getItem('api_key') || TEST_API_KEY;
                    if (!savedKey) {
                        responseArea.innerHTML = `<div class="response-body" style="color: #f59e0b;">Error: Se requiere una API KEY. Ingrésala en la sección de Autenticación.</div>`;
                        return;
                    }
                    headers['x-api-key'] = savedKey;
                }
                
                const response = await fetch(fullUrl, { headers });
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                
                const data = await response.json();
                const formattedJson = JSON.stringify(data, null, 2);
                
                responseArea.innerHTML = `
                    <div class="response-header">
                        <div class="response-title">
                            <span class="material-symbols-outlined" style="font-size: 16px;">expand_more</span>
                            Respuesta
                        </div>
                        <div class="response-meta">
                            <span class="status-badge">${response.status}</span>
                            <span class="time-badge">Tiempo de respuesta: ${duration}ms</span>
                        </div>
                    </div>
                    <div class="response-body">${formattedJson}</div>
                `;
            } catch (error) {
                responseArea.innerHTML = `
                    <div class="response-header">
                        <div class="response-title">Respuesta</div>
                    </div>
                    <div class="response-body" style="color: #f87171;">Error: ${error.message}</div>
                `;
            }
        });
    });

    // --- Copy Logic ---
    const copyBtns = document.querySelectorAll('.copy-btn, .copy-code-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let text = '';
            if (btn.classList.contains('copy-btn')) {
                text = btn.getAttribute('data-copy');
            } else {
                const pre = btn.closest('.snippet-window').querySelector('pre');
                text = pre.innerText;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = btn.classList.contains('copy-btn') 
                    ? 'done' 
                    : '<span class="material-symbols-outlined" style="font-size: 16px;">done</span> Copiado';
                
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                }, 2000);
            });
        });
    });

    // --- Active State Observers ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .toc-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));

    // --- API Key Management ---
    const keyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');

    if (saveKeyBtn) {
        saveKeyBtn.addEventListener('click', () => {
            const key = keyInput.value.trim();
            if (key) {
                sessionStorage.setItem('api_key', key);
                alert('API Key guardada localmente para esta sesión.');
                keyInput.value = '';
            }
        });
    }
});
