document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Switching ---
    const tabs = document.querySelectorAll('.tab-btn');
    const codeDisplay = document.querySelector('#code-display pre');

    const snippets = {
        js: `<span style="color: #c084fc;">const</span> response = <span style="color: #c084fc;">await</span> <span style="color: #60a5fa;">fetch</span>(<span style="color: #4ade80;">'https://api-sua-bcv.io/v1/usd'</span>, {
  <span style="color: #fb923c;">headers</span>: {
    <span style="color: #4ade80;">'x-api-key'</span>: <span style="color: #4ade80;">'TU_API_KEY'</span>,
    <span style="color: #4ade80;">'Accept'</span>: <span style="color: #4ade80;">'application/json'</span>
  }
});

<span style="color: #c084fc;">const</span> data = <span style="color: #c084fc;">await</span> response.<span style="color: #60a5fa;">json</span>();
<span style="color: #60a5fa;">console</span>.<span style="color: #60a5fa;">log</span>(data);`,
        
        dart: `<span style="color: #c084fc;">import</span> <span style="color: #4ade80;">'package:http/http.dart'</span> <span style="color: #c084fc;">as</span> http;

<span style="color: #c084fc;">void</span> <span style="color: #60a5fa;">fetchRates</span>() <span style="color: #c084fc;">async</span> {
  <span style="color: #c084fc;">final</span> url = Uri.<span style="color: #60a5fa;">parse</span>(<span style="color: #4ade80;">'https://api-sua-bcv.io/v1/usd'</span>);
  <span style="color: #c084fc;">final</span> response = <span style="color: #c084fc;">await</span> http.<span style="color: #60a5fa;">get</span>(url, headers: {
    <span style="color: #4ade80;">'x-api-key'</span>: <span style="color: #4ade80;">'TU_API_KEY'</span>,
  });

  <span style="color: #c084fc;">if</span> (response.statusCode == <span style="color: #fb923c;">200</span>) {
    <span style="color: #60a5fa;">print</span>(response.body);
  }
}`,
        
        python: `<span style="color: #c084fc;">import</span> requests

url = <span style="color: #4ade80;">"https://api-sua-bcv.io/v1/usd"</span>
headers = {
    <span style="color: #4ade80;">"x-api-key"</span>: <span style="color: #4ade80;">"TU_API_KEY"</span>
}

response = requests.<span style="color: #60a5fa;">get</span>(url, headers=headers)
<span style="color: #60a5fa;">print</span>(response.<span style="color: #60a5fa;">json</span>())`
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            // Add to clicked
            tab.classList.add('active');
            
            // Update code
            const lang = tab.getAttribute('data-lang');
            codeDisplay.innerHTML = snippets[lang];
        });
    });

    // --- Sidebar & TOC Scroll Logic ---
    const navLinks = document.querySelectorAll('.nav-link, .toc-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                // Could implement active state handling here if needed
                // But browsers handle fragment scrolling natively
            }
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
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
});
