document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'https://api-bcv-sua.vercel.app';
    const TEST_API_KEY = 'TU_CLAVE'; // This will be handled by .env/logic later

    // --- Tab Switching ---
    const tabs = document.querySelectorAll('.tab-btn');
    const codeDisplay = document.querySelector('#code-display pre');

    const snippets = {
        js: `<span style="color: #c084fc;">const</span> response = <span style="color: #c084fc;">await</span> <span style="color: #60a5fa;">fetch</span>(<span style="color: #4ade80;">'${BASE_URL}/v1/usd'</span>, {
  <span style="color: #fb923c;">headers</span>: {
    <span style="color: #4ade80;">'x-api-key'</span>: <span style="color: #4ade80;">'TU_API_KEY'</span>,
    <span style="color: #4ade80;">'Accept'</span>: <span style="color: #4ade80;">'application/json'</span>
  }
});

<span style="color: #c084fc;">const</span> data = <span style="color: #c084fc;">await</span> response.<span style="color: #60a5fa;">json</span>();
<span style="color: #60a5fa;">console</span>.<span style="color: #60a5fa;">log</span>(data);`,
        
        dart: `<span style="color: #c084fc;">import</span> <span style="color: #4ade80;">'package:http/http.dart'</span> <span style="color: #c084fc;">as</span> http;

<span style="color: #c084fc;">void</span> <span style="color: #60a5fa;">fetchRates</span>() <span style="color: #c084fc;">async</span> {
  <span style="color: #c084fc;">final</span> url = Uri.<span style="color: #60a5fa;">parse</span>(<span style="color: #4ade80;">'${BASE_URL}/v1/usd'</span>);
  <span style="color: #c084fc;">final</span> response = <span style="color: #c084fc;">await</span> http.<span style="color: #60a5fa;">get</span>(url, headers: {
    <span style="color: #4ade80;">'x-api-key'</span>: <span style="color: #4ade80;">'TU_API_KEY'</span>,
  });

  <span style="color: #c084fc;">if</span> (response.statusCode == <span style="color: #fb923c;">200</span>) {
    <span style="color: #60a5fa;">print</span>(response.body);
  }
}`,
        
        python: `<span style="color: #c084fc;">import</span> requests

url = <span style="color: #4ade80;">"${BASE_URL}/v1/usd"</span>
headers = {
    <span style="color: #4ade80;">"x-api-key"</span>: <span style="color: #4ade80;">"TU_API_KEY"</span>
}

response = requests.<span style="color: #60a5fa;">get</span>(url, headers=headers)
<span style="color: #60a5fa;">print</span>(response.<span style="color: #60a5fa;">json</span>())`
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const lang = tab.getAttribute('data-lang');
            codeDisplay.innerHTML = snippets[lang];
        });
    });

    // --- Endpoint Testing Logic ---
    const tryButtons = document.querySelectorAll('.btn-try');
    
    tryButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const path = btn.getAttribute('data-path');
            const fullUrl = `${BASE_URL}${path}`;
            
            // Scroll to code display to show result
            document.querySelector('#javascript').scrollIntoView({ behavior: 'smooth' });
            
            codeDisplay.innerHTML = `<span style="color: #c084fc;">// Cargando datos de ${path}...</span>`;
            
            try {
                const headers = { 'Accept': 'application/json' };
                if (path.startsWith('/v1/')) {
                    headers['x-api-key'] = TEST_API_KEY;
                }
                
                const response = await fetch(fullUrl, { headers });
                const data = await response.json();
                
                // Format JSON for display
                const formattedJson = JSON.stringify(data, null, 2);
                codeDisplay.innerHTML = `<span style="color: #64748b;">// Respuesta de ${fullUrl}</span>\n<span style="color: #4ade80;">${formattedJson}</span>`;
            } catch (error) {
                codeDisplay.innerHTML = `<span style="color: #f87171;">// Error al conectar con la API: ${error.message}</span>`;
            }
        });
    });

    // --- Copy to Clipboard ---
    const copyBtns = document.querySelectorAll('.copy-btn, .copy-code-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let text = '';
            if (btn.classList.contains('copy-btn')) {
                text = btn.getAttribute('data-copy');
            } else {
                text = codeDisplay.innerText;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                const originalContent = btn.innerHTML;
                btn.innerHTML = btn.classList.contains('copy-btn') 
                    ? 'done' 
                    : '<span class="material-symbols-outlined" style="font-size: 16px;">done</span> Copiado';
                
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                }, 2000);
            });
        });
    });

    // --- Intersection Observer for Active TOC ---
    const sections = document.querySelectorAll('section');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    const observerOptions = {
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                // Also update sidebar active state
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
});
