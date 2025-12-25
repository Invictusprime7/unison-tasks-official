
      // Simple year script
      document.getElementById('year').textContent = new Date().getFullYear();

      // Mobile menu toggle functionality
      const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
      const navLinks = document.querySelector('.nav-links');

      if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
          navLinks.classList.toggle('mobile-open');
        });

        // Close mobile menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            if (navLinks.classList.contains('mobile-open')) {
              navLinks.classList.remove('mobile-open');
            }
          });
        });
      }

      // Theme Toggle Logic
      const themeToggle = document.getElementById('theme-toggle');
      const sunIcon = themeToggle.querySelector('.sun-icon');
      const moonIcon = themeToggle.querySelector('.moon-icon');

      // Function to set the theme
      function setTheme(theme) {
        if (theme === 'dark') {
          document.documentElement.classList.remove('theme-light');
          document.documentElement.classList.add('theme-dark'); // Optional: explicitly add dark class
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        } else {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark');
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
        }
        localStorage.setItem('theme', theme);
      }

      // Function to get the theme preference
      function getPreferredTheme() {
        if (localStorage.getItem('theme')) {
          return localStorage.getItem('theme');
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      // Set theme on initial load
      document.addEventListener('DOMContentLoaded', () => {
        setTheme(getPreferredTheme());
      });

      // Toggle theme on button click
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.classList.contains('theme-light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });
    