async function loadQuotes() {
    try {
        const response = await fetch('/quotes.json');
        const quotes = await response.json();
        displayRandomQuote(quotes);
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
}

function displayRandomQuote(quotes) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const container = document.getElementById('statement');

    container.innerHTML = `
        <h1>${quote.title}</h1>
        <p>${quote.text}</p>
        <a href="${quote.link}">${quote.linkText}</a>
    `;
}

loadQuotes();
