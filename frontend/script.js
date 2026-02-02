// script.js – Handles mobile navigation toggle, smooth scrolling, and section reveal animations

document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');

    navToggle.addEventListener('click', function () {
        nav.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked (useful on small screens)
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
            }
        });
    });

    // Section reveal on scroll using IntersectionObserver
    const sections = document.querySelectorAll('.section');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => {
        revealObserver.observe(section);
    });

    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});