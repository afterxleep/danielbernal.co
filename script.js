// Theme Switcher
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (!prefersDark) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    if (newTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    localStorage.setItem('theme', newTheme);
}

// Initialize theme before page renders
initTheme();

// Theme toggle button
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Statement Loading
async function loadStatements() {
    try {
        const response = await fetch('https://stakeholdertherapy.com/statements.json');
        const statements = await response.json();
        displayRandomStatement(statements);
    } catch (error) {
        console.error('Error loading statements:', error);
    }
}

function displayRandomStatement(statements) {
    const statement = statements[Math.floor(Math.random() * statements.length)];
    const container = document.getElementById('statement');

    container.innerHTML = `
        <h1>${statement.title}</h1>
        <p>${statement.text}</p>
        <a href="${statement.link}" target="_blank">${statement.linkText}</a>
    `;
}

loadStatements();
