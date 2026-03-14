import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'https://api-bcv-sua.vercel.app';
    
    // Prioridad: 1. sessionStorage (usuario manual), 2. .env (VITE_API_KEY), 3. vacio
    const ENV_API_KEY = process.env.VITE_API_KEY || '';
    let TEST_API_KEY = sessionStorage.getItem('api_key') || ENV_API_KEY; 

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
                    // Re-verificar key guardada en cada click
                    const currentKey = sessionStorage.getItem('api_key') || ENV_API_KEY;
                    if (!currentKey) {
                        responseArea.innerHTML = `<div class="response-body" style="color: #f59e0b;">Error: Se requiere una API KEY. Ingrésala en la sección de Autenticación o genérala.</div>`;
                        return;
                    }
                    headers['x-api-key'] = currentKey;
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
            } else if (btn.id === 'copy-new-key-btn') {
                text = document.getElementById('new-api-key').innerText;
            } else {
                const snippet = btn.closest('.snippet-window');
                if (snippet) {
                    const pre = snippet.querySelector('pre');
                    text = pre.innerText;
                }
            }
            
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    const originalHtml = btn.innerHTML;
                    if (btn.id === 'copy-new-key-btn') {
                        btn.innerHTML = 'done';
                    } else {
                        btn.innerHTML = btn.classList.contains('copy-btn') 
                            ? 'done' 
                            : '<span class="material-symbols-outlined" style="font-size: 16px;">done</span> Copiado';
                    }
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                    }, 2000);
                });
            }
        });
    });

    // --- Active State Observers ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .toc-link');
    
    if (sections.length > 0) {
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
    }

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

    // --- API Key Generation ---
    const genKeyBtn = document.getElementById('generate-key-btn');
    const genResultArea = document.getElementById('generated-key-result');
    const newKeyDisplay = document.getElementById('new-api-key');
    const copyNewKeyBtn = document.getElementById('copy-new-key-btn');

    if (genKeyBtn) {
        function generateKeyString(length = 32) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$&';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        genKeyBtn.addEventListener('click', async () => {
            genKeyBtn.disabled = true;
            genKeyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px; animation: spin 1s linear infinite;">sync</span> Generando...';

            const db = createClient({
                url: process.env.VITE_DATABASE_URL,
                authToken: process.env.VITE_DATABASE_AUTH_TOKEN,
            });

            const newKey = generateKeyString(32);
            const name = `Web User ${new Date().toLocaleDateString()}`;
            
            // Expiración: 1 mes
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            try {
                await db.execute({
                    sql: 'INSERT INTO api_keys (name, key, expires_at) VALUES (?, ?, ?)',
                    args: [name, newKey, expiresAt.toISOString()]
                });

                // Mostrar resultado
                newKeyDisplay.innerText = newKey;
                genResultArea.style.display = 'block';
                document.getElementById('gen-key-container').style.display = 'none';
                
                // Guardar en session por conveniencia
                sessionStorage.setItem('api_key', newKey);

            } catch (error) {
                console.error('Error db:', error);
                alert('Error al generar la clave: ' + error.message);
                genKeyBtn.disabled = false;
                genKeyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">bolt</span> Generar Key (1 Mes)';
            }
        });

        if (copyNewKeyBtn) {
            copyNewKeyBtn.addEventListener('click', () => {
                const text = newKeyDisplay.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = copyNewKeyBtn.innerText;
                    copyNewKeyBtn.innerText = 'done';
                    setTimeout(() => copyNewKeyBtn.innerText = originalText, 2000);
                });
            });
        }
    }
});

