import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Cargar variables de entorno antes de continuar
await dotenv.config();

/**
 * Script de Documentación Sua-BCV
 * Maneja el testing de endpoints y la generación de API Keys.
 */
const init = async () => {
    // Asegurar que window.process existe
    if (typeof window.process === 'undefined') window.process = { env: {} };

    const BASE_URL = 'https://api-bcv-sua.vercel.app';
    
    // Intentar cargar configuración desde el backend si no estamos local con .env
    try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
            const config = await configRes.json();
            window.process.env.VITE_API_KEY = config.VITE_API_KEY;
        }
    } catch (e) {
        console.warn('No se pudo cargar config desde /api/config, usando fallback local si existe.');
    }

    // Obtener la API KEY
    const getEnvApiKey = () => window.process?.env?.VITE_API_KEY || '';

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
                    const apiKey = getEnvApiKey();
                    if (!apiKey) {
                        responseArea.innerHTML = `
                            <div class="response-header"><div class="response-title">Error</div></div>
                            <div class="response-body" style="color: #f59e0b;">
                                <b>Error:</b> No tienes una Clave de API configurada.<br><br>
                                1. Usa el botón <b>Generar Nueva API Key</b> arriba.<br>
                                2. O asegúrate de que la variable <code>VITE_API_KEY</code> esté configurada en Vercel.
                            </div>`;
                        return;
                    }
                    headers['x-api-key'] = apiKey;
                    console.warn(`🚀 Enviando petición a ${fullUrl} con x-api-key.`);
                }
                
                const response = await fetch(fullUrl, { headers });
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                
                let responseContent;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    responseContent = JSON.stringify(data, null, 2);
                } else {
                    responseContent = await response.text();
                }
                
                if (!response.ok) {
                    responseArea.innerHTML = `
                        <div class="response-header">
                            <div class="response-title">Error HTTP ${response.status}</div>
                            <div class="response-meta">
                                <span class="status-badge" style="background: #f87171;">Error</span>
                                <span class="time-badge">${duration}ms</span>
                            </div>
                        </div>
                        <div class="response-body" style="color: #f87171;">${responseContent || response.statusText}</div>
                    `;
                    return;
                }
                
                responseArea.innerHTML = `
                    <div class="response-header">
                        <div class="response-title">
                            <span class="material-symbols-outlined" style="font-size: 16px;">expand_more</span>
                            Respuesta
                        </div>
                        <div class="response-meta">
                            <span class="status-badge" style="background: #10b981;">${response.status} OK</span>
                            <span class="time-badge">Tiempo: ${duration}ms</span>
                        </div>
                    </div>
                    <div class="response-body">${responseContent}</div>
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

    // --- Utility: Copy Logic ---
    window.handleCopy = (text, element) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            const originalContent = element.innerHTML;
            if (element.classList.contains('material-symbols-outlined')) {
                element.innerText = 'done';
            } else {
                element.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">done</span> Copiado';
            }
            setTimeout(() => {
                if (element.classList.contains('material-symbols-outlined')) {
                    element.innerText = 'content_copy';
                } else {
                    element.innerHTML = originalContent;
                }
            }, 2000);
        });
    };

    // Global copy buttons
    document.querySelectorAll('.copy-btn, .copy-code-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let text = '';
            if (btn.classList.contains('copy-btn')) {
                text = btn.getAttribute('data-copy');
            } else {
                const snippet = btn.closest('.snippet-window');
                if (snippet) text = snippet.querySelector('pre').innerText;
            }
            handleCopy(text, btn);
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('api-key-modal');
    const modalKeyDisplay = document.getElementById('modal-api-key');
    const modalCopyBtn = document.getElementById('modal-copy-btn');

    if (modal) {
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.close());
        });

        modalCopyBtn?.addEventListener('click', () => {
            handleCopy(modalKeyDisplay.innerText, modalCopyBtn);
        });
    }

    // --- API Key Generation ---
    const genKeyBtn = document.getElementById('generate-key-btn');

    if (genKeyBtn) {
        genKeyBtn.addEventListener('click', async () => {
            const originalContent = genKeyBtn.innerHTML;
            
            // Loading state
            genKeyBtn.disabled = true;
            genKeyBtn.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
                        <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
                        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" fill="white" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" fill="white"/>
                    </svg>
                    Generando a través de API...
                </div>
            `;

            try {
                const response = await fetch('/api/generate-key', { method: 'POST' });
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'Error desconocido');

                // Persistir la nueva llave para pruebas inmediatas
                if (typeof window.process === 'undefined') window.process = { env: {} };
                window.process.env.VITE_API_KEY = result.key;
                console.info('Nueva API Key generada y cargada para pruebas.');

                // Mostrar modal y limpiar estado
                modalKeyDisplay.innerText = result.key;
                modal.showModal();

            } catch (error) {
                console.error('Error generation:', error);
                alert('No se pudo generar la API Key. Detalles: ' + error.message);
            } finally {
                // Reset button state
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
};

// Ejecución con manejo de estado de carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


