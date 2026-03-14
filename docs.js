import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

/**
 * Script de Documentación Sua-BCV
 * Maneja el testing de endpoints y la generación de API Keys.
 */
document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'https://api-bcv-sua.vercel.app';
    
    // La API KEY del entorno siempre está disponible para pruebas locales
    const ENV_API_KEY = process.env.VITE_API_KEY || '';

    // --- Endpoint Testing Logic ---
    const tryButtons = document.querySelectorAll('.btn-try');
    
    tryButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const path = btn.getAttribute('data-path');
            const fullUrl = `${BASE_URL}${path}`;
            const item = btn.closest('.endpoint-item');
            const responseArea = item.querySelector('.response-area');
            
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
                    // Siempre usamos la KEY del .env para las pruebas como solicitado
                    if (!ENV_API_KEY) {
                        responseArea.innerHTML = `<div class="response-body" style="color: #f59e0b;">Error: VITE_API_KEY no encontrada en el entorno.</div>`;
                        return;
                    }
                    headers['x-api-key'] = ENV_API_KEY;
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
    function handleCopy(text, btn) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            const originalHtml = btn.innerHTML;
            const isMaterialIcon = btn.classList.contains('material-symbols-outlined');
            
            if (isMaterialIcon) {
                btn.innerHTML = 'done';
            } else {
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">done</span> Copiado';
            }
            
            setTimeout(() => {
                btn.innerHTML = originalHtml;
            }, 2000);
        });
    }

    const copyBtns = document.querySelectorAll('.copy-btn, .copy-code-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let text = '';
            if (btn.classList.contains('copy-btn')) {
                text = btn.getAttribute('data-copy');
            } else {
                const snippet = btn.closest('.snippet-window');
                if (snippet) {
                    text = snippet.querySelector('pre').innerText;
                }
            }
            handleCopy(text, btn);
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('api-key-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const modalKeyDisplay = document.getElementById('modal-api-key');
    const modalCopyBtn = document.getElementById('modal-copy-btn');

    if (modal) {
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => modal.close());
        });

        modalCopyBtn.addEventListener('click', () => {
            handleCopy(modalKeyDisplay.innerText, modalCopyBtn);
        });
    }

    // --- API Key Generation ---
    const genKeyBtn = document.getElementById('generate-key-btn');

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
            // Loading state
            const originalContent = genKeyBtn.innerHTML;
            genKeyBtn.disabled = true;
            genKeyBtn.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
                        <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
                        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
                    </svg>
                    Generando Credenciales...
                </div>
            `;

            try {
                const db = createClient({
                    url: process.env.VITE_DATABASE_URL,
                    authToken: process.env.VITE_DATABASE_AUTH_TOKEN,
                });

                const newKey = generateKeyString(32);
                const name = `Web User ${new Date().toLocaleDateString()}`;
                
                const expiresAt = new Date();
                expiresAt.setMonth(expiresAt.getMonth() + 1);

                await db.execute({
                    sql: 'INSERT INTO api_keys (name, key, expires_at) VALUES (?, ?, ?)',
                    args: [name, newKey, expiresAt.toISOString()]
                });

                // Show modal
                modalKeyDisplay.innerText = newKey;
                modal.showModal();

            } catch (error) {
                console.error('Error db:', error);
                alert('No se pudo conectar con la base de datos. Verifica tu conexión.');
            } finally {
                // Reset button
                genKeyBtn.disabled = false;
                genKeyBtn.innerHTML = originalContent;
            }
        });
    }

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
});


