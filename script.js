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
