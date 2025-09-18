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
const bookId = params.get('book');

if (!bookId) {
  document.getElementById('loading').innerHTML = `<div class="alert alert-danger">Није изабрана књига.</div>`;
} else {
  function findBookById(obj, id) {
    for (const key in obj) {
      if (key === id && obj[key].naziv) return obj[key];
      if (typeof obj[key] === 'object') {
        const found = findBookById(obj[key], id);
        if (found) return found;
      }
    }
    return null;
  }

db.ref('knjige').once('value').then(snapshot => {
  const allBooks = snapshot.val();
  const book = findBookById(allBooks, bookId);

  document.getElementById('loading').classList.add('d-none');

  if (!book) {
    document.getElementById('loading').innerHTML = `<div class="alert alert-danger">Књига није пронађена.</div>`;
    return;
  }

  document.getElementById('book-details').classList.remove('d-none');
  document.getElementById('book-title').textContent = book.naziv;
  document.getElementById('book-author').textContent = book.autor || 'Непознат аутор';
  document.getElementById('book-genre').textContent = book.zanr || 'Непознат жанр';
  document.getElementById('book-format').textContent = book.format || 'Непознат формат';
  document.getElementById('book-price').textContent = book.cena + " дин."|| '0';
  document.getElementById('book-pages').textContent = book.brojStrana || '0';
  document.getElementById('book-description').textContent = book.opis || '';

  const carouselInner = document.getElementById('carousel-inner');
  carouselInner.innerHTML = '';

  const images = book.slike && book.slike.length ? book.slike : ['https://via.placeholder.com/300x400?text=Nema+slike'];
  images.forEach((src, index) => {
    const div = document.createElement('div');
    div.className = `carousel-item${index === 0 ? ' active' : ''}`;
    div.innerHTML = `<img src="${src}" class="d-block book-image" alt="${book.naziv}">`;
    carouselInner.appendChild(div);
  });

  const carouselEl = document.getElementById('book-carousel');
  const oldCarousel = bootstrap.Carousel.getInstance(carouselEl);
  if (oldCarousel) oldCarousel.dispose();
  new bootstrap.Carousel(carouselEl, {interval: 5000, ride: 'carousel'});


db.ref('knjizare').once('value').then(storeSnap => {
  const allStores = storeSnap.val() || {};
  let foundStoreBooksId = null;


  for (const storeId in allStores) {
    const storeBookCollectionId = allStores[storeId].knjige;
    const storeBooks = allBooks[storeBookCollectionId];
    if (storeBooks && storeBooks[bookId]) {
      foundStoreBooksId = storeBookCollectionId;
      break;
    }
  }

  if (foundStoreBooksId) {
    const otherBooksDiv = document.getElementById('other-books-list');
    otherBooksDiv.innerHTML = '';

    const storeBooks = allBooks[foundStoreBooksId];
    for (const key in storeBooks) {
      if (key === bookId) continue; 
      const otherBook = storeBooks[key];
      const div = document.createElement('div');
      div.className = 'other-book-item';
      div.innerHTML = `
        <img src="${otherBook.slike && otherBook.slike[0] ? otherBook.slike[0] : 'https://via.placeholder.com/50x70?text=Nema+slike'}" alt="${otherBook.naziv}">
        <a href="book.html?book=${key}">${otherBook.naziv}</a>
      `;
      otherBooksDiv.appendChild(div);
    }
  }
}).catch(err => console.error(err));
  document.getElementById('loading').innerHTML = `<div class="alert alert-danger">Грешка при учитавању књиге.</div>`;
});

}

