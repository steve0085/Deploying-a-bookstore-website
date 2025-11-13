document.getElementById("loadBooks").addEventListener("click", fetchBooks);

async function fetchBooks() {
  const booksDiv = document.getElementById("books");
  booksDiv.innerHTML = "<p>Loading books...</p>";

  try {
    const response = await fetch("http://YOUR-API-ENDPOINT/books");
    if (!response.ok) throw new Error("Failed to fetch books");

    const data = await response.json();

    if (data.length === 0) {
      booksDiv.innerHTML = "<p>No books found.</p>";
      return;
    }

    booksDiv.innerHTML = data
      .map(
        (book) => `
        <div class="book">
          <h3>${book.title}</h3>
          <p><em>${book.author}</em></p>
        </div>
      `
      )
      .join("");
  } catch (error) {
    booksDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}