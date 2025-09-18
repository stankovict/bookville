    const firebaseConfig = {
      apiKey: "AIzaSyDOs79RE2Ef16Ng4iUSoC6K3LzbNDtuRmQ",
      authDomain: "wd-sv8.firebaseapp.com",
      databaseURL: "https://wd-sv8-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "wd-sv8",
      storageBucket: "wd-sv8.firebasestorage.app",
      messagingSenderId: "971427918489",
      appId: "1:971427918489:web:39f1f56392a2576f42fe08"
    };

    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const params = new URLSearchParams(window.location.search);
    const bookstoreId = params.get('id');

    const infoDiv = document.getElementById('bookstore-info');
    const bookListDiv = document.getElementById('book-list');
    const loadingDiv = document.getElementById('loading');
    const noBooksDiv = document.getElementById('no-books');

    let booksGroup = null;

    if (!bookstoreId) {
      infoDiv.innerHTML = `<div class="alert alert-danger">Није изабрана књижара.</div>`;
      loadingDiv.classList.add('d-none');
    } else {
      db.ref('knjizare/' + bookstoreId).once('value').then(snap => {
        const bookstore = snap.val();

        if (!bookstore) {
          infoDiv.innerHTML = `<div class="alert alert-danger">Књижара није пронађена.</div>`;
          loadingDiv.classList.add('d-none');
          return;
        }

        infoDiv.innerHTML = `
          <h2>${bookstore.naziv || 'Неименована књижара'}</h2>
          <p><strong>Адреса:</strong> ${bookstore.adresa || 'Непозната адреса'}</p>
          <p><strong>Контакт телефон:</strong> ${bookstore.kontaktTelefon || 'Непознат телефон'}</p>
          <p><strong>E-mail адреса:</strong> ${bookstore.email || 'Непознат емаил'}</p>
          <p><strong>Година оснивања:</strong> ${bookstore.godinaOsnivanja ? bookstore.godinaOsnivanja + '.' : 'Непозната година'}</p>
        `;

        const bookMainId = bookstore.knjige;
        if (!bookMainId) {
          loadingDiv.classList.add('d-none');
          noBooksDiv.classList.remove('d-none');
          return;
        }

        function findBooks(obj, targetId) {
          for (const key in obj) {
            if (key === targetId) return obj[key];
            if (obj[key] && typeof obj[key] === 'object') {
              const result = findBooks(obj[key], targetId);
              if (result) return result;
            }
          }
          return null;
        }

        function displayBooks(bookObj) {
          for (const key in bookObj) {
            const item = bookObj[key];
            if (item && typeof item === 'object') {
              if (item.naziv) {
                const col = document.createElement('div');
                col.className = "col-md-4 col-lg-3 mb-4";

                const imageUrl = (item.slike && item.slike.length > 0) 
                  ? item.slike[0] 
                  : 'https://via.placeholder.com/200x250?text=Nema+slike';

col.innerHTML = `
  <div class="card h-100">
    <img src="${imageUrl}" class="card-img-top book-image" alt="${item.naziv}">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">${item.naziv}</h5>
      <p class="card-text"><strong>Аутор:</strong> ${item.autor || 'Непознат аутор'}</p>
      <p class="card-text"><strong>Цена:</strong> ${item.cena || '0'} дин.</p>
      <a href="book.html?book=${key}" class="btn btn-primary mt-auto">Прикажи више</a>
    </div>
  </div>
`;

                bookListDiv.appendChild(col);
              } else {
                displayBooks(item);
              }
            }
          }
        }

        db.ref('knjige').once('value').then(bookSnap => {
          const allBooks = bookSnap.val();
          loadingDiv.classList.add('d-none');
          bookListDiv.innerHTML = "";

          if (!allBooks) {
            noBooksDiv.classList.remove('d-none');
            return;
          }

          booksGroup = findBooks(allBooks, bookMainId); 

          if (!booksGroup) {
            noBooksDiv.classList.remove('d-none');
            return;
          }

          displayBooks(booksGroup);

          if (bookListDiv.childElementCount === 0) {
            noBooksDiv.classList.remove('d-none');
          }
        }).catch(error => {
          console.error('Грешка при учитавању књига:', error);
          loadingDiv.classList.add('d-none');
          bookListDiv.innerHTML = `
            <div class="col-12">
              <div class="alert alert-danger">Дошло је до грешке при учитавању књига.</div>
            </div>
          `;
        });

      }).catch(error => {
        console.error('Грешка при учитавању књижаре:', error);
        loadingDiv.classList.add('d-none');
        infoDiv.innerHTML = `<div class="alert alert-danger">Дошло је до грешке при учитавању књижаре.</div>`;
      });
    }

function highlightKeyword(text, keywords) {
  if (!keywords || keywords.length === 0) return text;
  keywords.forEach(kw => {
    if (kw.trim() !== '') {
      const regex = new RegExp(`(${kw})`, 'gi');
      text = text.replace(regex, '<span class="highlight">$1</span>');
    }
  });
  return text;
}

function displayBooksFiltered(bookObj, searchFilter) {
  bookListDiv.innerHTML = '';
  noBooksDiv.classList.add('d-none');

  const keywords = searchFilter.toLowerCase().trim().split(/\s+/);
  let count = 0;

  for (const key in bookObj) {
    const item = bookObj[key];
    if (item && typeof item === 'object' && item.naziv) {

      const match = keywords.some(kw => 
        item.naziv.toLowerCase().includes(kw) ||
        (item.autor && item.autor.toLowerCase().includes(kw)) ||
        (item.zanr && item.zanr.toLowerCase().includes(kw))
      );

      if (match) {
        const col = document.createElement('div');
        col.className = "col-md-4 col-lg-3 mb-4";

        const imageUrl = (item.slike && item.slike.length > 0) 
          ? item.slike[0] 
          : 'https://via.placeholder.com/200x250?text=Nema+slike';

        col.innerHTML = `
          <div class="card h-100">
            <img src="${imageUrl}" class="card-img-top book-image" alt="${item.naziv}">
            <div class="card-body">
              <h5 class="card-title">${highlightKeyword(item.naziv, keywords)}</h5>
              <p class="card-text"><strong>Аутор:</strong> ${highlightKeyword(item.autor || 'Непознат аутор', keywords)}</p>
              <p class="card-text"><strong>Жанр:</strong> ${highlightKeyword(item.zanr || 'Непознат жанр', keywords)}</p>
              <p class="card-text"><strong>Цена:</strong> ${item.cena || '0'} дин.</p>
              <p class="card-text"><small>${item.brojStrana || '0'} страна</small></p>
              <a href="book.html?book=${key}" class="btn btn-primary mt-2">Прикажи више</a>
            </div>
          </div>
        `;
        bookListDiv.appendChild(col);
        count++;
      }
    }
  }

  if (count === 0) noBooksDiv.classList.remove('d-none');
}


document.getElementById('searchAll').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const searchValue = document.getElementById('searchAll').value;
    if (booksGroup) displayBooksFiltered(booksGroup, searchValue);
  }
});

document.getElementById('searchButton').addEventListener('click', () => {
  const searchValue = document.getElementById('searchAll').value;
  if (booksGroup) {
    displayBooksFiltered(booksGroup, searchValue);
  }
});

function showLogin() {
  new bootstrap.Modal(document.getElementById('loginModal')).show();
}
function showRegister() {
  new bootstrap.Modal(document.getElementById('registerModal')).show();
}
