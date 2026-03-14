document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication & Session Handling ---
    const checkAuth = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || localStorage.getItem('session_token');

        const navLoading = document.getElementById('auth-nav-loading');
        const navGuest = document.getElementById('auth-nav-guest');
        const navUser = document.getElementById('auth-nav-user');

        if (token) {
            try {
                // Clear token from URL
                if (urlParams.has('token')) {
                    localStorage.setItem('session_token', token);
                    const newUrl = window.location.pathname + window.location.hash;
                    window.history.replaceState({}, document.title, newUrl);
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // Update Nav
                if (navLoading) navLoading.style.display = 'none';
                if (navGuest) navGuest.style.display = 'none';
                if (navUser) {
                    navUser.style.display = 'flex';
                    document.getElementById('nav-user-name').innerText = payload.name;
                    document.getElementById('nav-user-avatar').src = payload.avatar_url;
                }
                return true;
            } catch (e) {
                console.error('Session error:', e);
                localStorage.removeItem('session_token');
            }
        }

        // Show guest nav if no token or error
        if (navLoading) navLoading.style.display = 'none';
        if (navGuest) navGuest.style.display = 'block';
        if (navUser) navUser.style.display = 'none';
        return false;
    };

    checkAuth();

    // Logout logic
    document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('session_token');
        window.location.reload();
    });

    // Reveal sections on scroll
    const sections = document.querySelectorAll('section');
    
    const revealOption = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, revealOnScroll) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            entry.target.classList.add('revealed');
            revealOnScroll.unobserve(entry.target);
        });
    }, revealOption);

    sections.forEach(section => {
        section.classList.add('reveal-on-scroll');
        revealOnScroll.observe(section);
    });

    // Header scroll background
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(11, 18, 21, 0.95)';
                header.style.padding = '10px 0';
            } else {
                header.style.backgroundColor = 'rgba(11, 18, 21, 0.8)';
                header.style.padding = '20px 0';
            }
        });
    }
});
