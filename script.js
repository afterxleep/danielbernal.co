async function loadStatement() {
    try {
        const response = await fetch('/statements.json');
        const statements = await response.json();
        displayStatement(statements[0]);
    } catch (error) {
        console.error('Error loading statement:', error);
    }
}

function displayStatement(statement) {
    const container = document.getElementById('statement');

    container.innerHTML = `
        <h1>${statement.title}</h1>
        <p>${statement.text}</p>
        <a href="${statement.link}">${statement.linkText}</a>
    `;
}

loadStatement();
