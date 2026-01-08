async function loadLatestPost() {
    try {
        // Fetch the latest post HTML (URL set by Jekyll)
        const postUrl = window.LATEST_POST_URL || '/writing/so-many-things-at-once.html';
        const response = await fetch(postUrl);
        const html = await response.text();

        // Parse the HTML to extract meta tags
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const excerpt = doc.querySelector('meta[name="excerpt"]')?.content || '';
        const quote = doc.querySelector('meta[name="quote"]')?.content || '';
        const postTitle = doc.querySelector('article h1')?.textContent || '';

        displayStatement({ title: excerpt, text: quote, link: postUrl, postTitle: postTitle });
    } catch (error) {
        console.error('Error loading latest post:', error);
    }
}

function displayStatement(statement) {
    const container = document.getElementById('statement');

    container.innerHTML = `
        <h1>${statement.title}</h1>
        <p>${statement.text}</p>
        <a href="${statement.link}">${statement.postTitle} →</a>
    `;
}

loadLatestPost();
