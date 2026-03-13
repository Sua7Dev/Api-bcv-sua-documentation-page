document.addEventListener('DOMContentLoaded', () => {
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
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(11, 18, 21, 0.95)';
            header.style.padding = '10px 0';
        } else {
            header.style.backgroundColor = 'rgba(11, 18, 21, 0.8)';
            header.style.padding = '20px 0';
        }
    });
});
