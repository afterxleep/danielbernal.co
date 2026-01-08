async function loadLatestPost() {
    try {
        // Fetch the latest post HTML
        const response = await fetch('/writing/so-many-things-at-once.html');
        const html = await response.text();

        // Parse the HTML to extract meta tags
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const excerpt = doc.querySelector('meta[name="excerpt"]')?.content || '';
        const quote = doc.querySelector('meta[name="quote"]')?.content || '';
        const url = '/writing/so-many-things-at-once.html';

        displayStatement({ title: excerpt, text: quote, link: url });
    } catch (error) {
        console.error('Error loading latest post:', error);
    }
}

function displayStatement(statement) {
    const container = document.getElementById('statement');

    container.innerHTML = `
        <h1>${statement.title}</h1>
        <p>${statement.text}</p>
        <a href="${statement.link}">→</a>
    `;
}

loadLatestPost();
