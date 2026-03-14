/**
 * Script de Documentación Sua-BCV
 * Maneja el testing de endpoints y la generación de API Keys.
 */

// Utilidad para escapar HTML y evitar XSS al inyectar respuestas en el DOM
const escapeHtml = (str) => {
    if (typeof str !== 'string') str = String(str);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

const init = async () => {
    // Asegurar que window.process existe
    if (typeof window.process === 'undefined') window.process = { env: {} };

    const BASE_URL = 'https://api-bcv-sua.vercel.app';
    const PROXY_BASE = '/api/proxy'; // Evita CORS: la petición autenticada sale del servidor
    
    // Cargar API key desde el servidor (donde está la variable de entorno VITE_API_KEY)
    try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
            const config = await configRes.json();
            if (config.VITE_API_KEY) {
                window.process.env.VITE_API_KEY = config.VITE_API_KEY;
                console.info(`✅ API Key cargada desde /api/config (${config.VITE_API_KEY.length} caracteres).`);
            } else {
                console.warn('⚠️ /api/config respondió OK pero VITE_API_KEY está vacía. Verifica la variable de entorno en Vercel.');
            }
        } else {
            console.warn(`⚠️ /api/config respondió con status ${configRes.status}. Sin API key del servidor.`);
        }
    } catch (e) {
        console.warn('⚠️ No se pudo contactar /api/config:', e.message);
    }

    // Obtener la API KEY
    const getEnvApiKey = () => window.process?.env?.VITE_API_KEY || '';

    // --- Authentication & Session Logic ---
    const checkAuth = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || localStorage.getItem('session_token');

        if (token) {
            try {
                // Clear token from URL for a clean look
                if (urlParams.has('token')) {
                    localStorage.setItem('session_token', token);
                    const newUrl = window.location.pathname + window.location.hash;
                    window.history.replaceState({}, document.title, newUrl);
                }

                // Decode JWT payload (base64)
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // Update UI state
                const authRequired = document.getElementById('auth-required-ui');
                const authSuccess = document.getElementById('auth-success-ui');
                const userProfile = document.getElementById('user-profile');
                
                if (authRequired) authRequired.style.display = 'none';
                if (authSuccess) authSuccess.style.display = 'block';
                if (userProfile) {
                    userProfile.style.display = 'block';
                    document.getElementById('user-name').innerText = payload.name;
                    document.getElementById('user-avatar').src = payload.avatar_url;
                }

                return token;
            } catch (e) {
                console.error('Sesión inválida:', e);
                localStorage.removeItem('session_token');
            }
        }
        return null;
    };

    const sessionToken = checkAuth();

    // Logout logic
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('session_token');
        window.location.reload();
    });

    // --- Mobile Navigation ---
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const toggleMobileMenu = () => {
        sidebar?.classList.toggle('active');
        overlay?.classList.toggle('active');
        document.body.style.overflow = sidebar?.classList.contains('active') ? 'hidden' : '';
    };

    mobileToggle?.addEventListener('click', toggleMobileMenu);
    overlay?.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking links on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) toggleMobileMenu();
        });
    });

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
                let fetchUrl;
                const fetchHeaders = { 'Accept': 'application/json' };

                if (path.startsWith('/v1/')) {
                    // Usar el proxy server-side para evitar CORS y manejar la x-api-key de forma segura
                    fetchUrl = `${PROXY_BASE}?path=${encodeURIComponent(path)}`;
                    console.info(`🚀 Enviando petición a través del proxy: ${fetchUrl}`);
                } else {
                    // Rutas públicas: llamada directa
                    fetchUrl = `${BASE_URL}${path}`;
                    console.info(`🚀 Enviando petición directa: ${fetchUrl}`);
                }

                const response = await fetch(fetchUrl, { headers: fetchHeaders });
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                
                let responseData = null;
                let responseContent = '';
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json();
                    responseContent = escapeHtml(JSON.stringify(responseData, null, 2));
                } else {
                    responseContent = escapeHtml(await response.text());
                }
                
                if (!response.ok) {
                    const statusColor = response.status === 401 ? '#fef2f2' : '#fef2f2';
                    const statusLabel = response.status === 401
                        ? `${response.status} Unauthorized — API Key inválida o no enviada`
                        : `${response.status} ${response.statusText}`;
                    responseArea.innerHTML = `
                        <div class="response-header">
                            <div class="response-title">Error HTTP ${response.status}</div>
                            <div class="response-meta">
                                <span class="status-badge" style="background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2;">${statusLabel}</span>
                                <span class="time-badge">${duration}ms</span>
                            </div>
                        </div>
                        <div class="response-body" style="color: #f87171;">${responseContent || escapeHtml(response.statusText)}</div>
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
                            <span class="status-badge" style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; font-weight: 600;">${response.status} OK</span>
                            <span class="time-badge">Tiempo: ${duration}ms</span>
                        </div>
                    </div>
                    <div class="response-body">${responseContent}</div>
                `;
            } catch (error) {
                const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
                const friendlyMsg = isNetworkError
                    ? `No se pudo conectar a la API. Verifica tu conexión o que la URL <code>${escapeHtml(fullUrl)}</code> sea accesible.`
                    : escapeHtml(error.message);
                responseArea.innerHTML = `
                    <div class="response-header">
                        <div class="response-title">Error de Red</div>
                    </div>
                    <div class="response-body" style="color: #f87171;">${friendlyMsg}</div>
                `;
                console.error('❌ Error en la petición:', error);
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
                const token = localStorage.getItem('session_token');
                const response = await fetch('/api/generate-key', { 
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
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
                
                if (error.message.includes('Authentication')) {
                    alert('Tu sesión ha expirado o es inválida. Por favor inicia sesión de nuevo.');
                    localStorage.removeItem('session_token');
                    window.location.reload();
                } else {
                    alert('No se pudo generar la API Key. Detalles: ' + error.message);
                }
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


