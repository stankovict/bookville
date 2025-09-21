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

const bookstoreListDiv = document.getElementById('bookstore-list');
const loadingDiv = document.getElementById('loading');


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

function loadBookstores() {
  db.ref('knjizare').once('value').then(snapshot => {
    loadingDiv.classList.add('d-none');
    bookstoreListDiv.innerHTML = '';
    const bookstores = snapshot.val();
    if (!bookstores) {
      bookstoreListDiv.innerHTML = '<div class="alert alert-info">Нема књижара у систему.</div>';
      return;
    }

    for (const id in bookstores) {
      const store = bookstores[id];
      const card = document.createElement('div');
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${store.naziv || 'Неименована књижара'}</h5>
          <p><strong>Адреса:</strong> ${store.adresa || ''}</p>
          <p><strong>Телефон:</strong> ${store.kontaktTelefon || ''}</p>
          <p><strong>Емаил:</strong> ${store.email || ''}</p>
          <p><strong>Година оснивања:</strong> ${store.godinaOsnivanja || ''}</p>
          <button class="btn btn-primary btn-sm me-2" onclick="editBookstore('${id}')">Измени</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBookstore('${id}')">Обриши</button>
        </div>
      `;
      bookstoreListDiv.appendChild(card);
    }
  });
}

function deleteBookstore(id) {
  if (confirm('Да ли сте сигурни да желите да обришете ову књижару?')) {
    db.ref('knjizare/' + id).remove().then(() => {
      alert('Књижара је обрисана');
      loadBookstores();
    });
  }
}


function editBookstore(id) {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style = "";

  db.ref('knjizare/' + id).once('value').then(snapshot => {
    const store = snapshot.val();
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = store.naziv || '';
    document.getElementById('editAddress').value = store.adresa || '';
    document.getElementById('editPhone').value = store.kontaktTelefon || '';
    document.getElementById('editEmail').value = store.email || '';
    document.getElementById('editYear').value = store.godinaOsnivanja || '';
    document.getElementById('editLogo').value = store.logo || '';

    const booksContainer = document.getElementById('booksContainer');
    booksContainer.innerHTML = '';

    if (store.knjige) {
      db.ref('knjige').once('value').then(bookSnap => {
        const allBooks = bookSnap.val();
        const booksGroup = findBooks(allBooks, store.knjige);
        if (booksGroup) {
          for (const key in booksGroup) {
            const book = booksGroup[key];
            const div = document.createElement('div');
            div.className = 'border p-2 mb-2';
            div.innerHTML = `
              <strong>${book.naziv}</strong> - ${book.autor || 'Непознат аутор'}
              <button type="button" class="btn btn-sm btn-danger float-end" onclick="deleteBook('${store.knjige}', '${key}')">Обриши</button>
            `;
            booksContainer.appendChild(div);
          }
        }
      });
    }

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
  });
}

window.deleteBook = function(knjigeId, bookId) {
  if (confirm('Да ли сте сигурни да желите да обришете ову књигу?')) {
    db.ref('knjige/' + knjigeId + '/' + bookId).remove().then(() => {
      editBookstore(document.getElementById('editId').value);
    });
  }
};

document.getElementById('editForm').addEventListener('submit', e => {
  e.preventDefault();

  document.querySelectorAll('#editForm small.text-danger').forEach(s => s.textContent = '');

  const id = document.getElementById('editId').value.trim();
  const name = document.getElementById('editName').value.trim();
  const address = document.getElementById('editAddress').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const year = document.getElementById('editYear').value.trim();
  const logo = document.getElementById('editLogo').value.trim();


  const addressPattern = /^[\p{L}\s]+\s\d+,\s[\p{L}\s]+,\s\d{5}$/u;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-/ ]+$/;
  const urlPattern = /^(https?:\/\/[^\s]+)$/;

  let valid = true;

 
  if (!name) {
    showError('editName', 'Назив је обавезан.');
    valid = false;
  }

  if (!address || !addressPattern.test(address)) {
    showError('editAddress', 'Адреса није у исправном формату (Улица и број, место, поштански број).');
    valid = false;
  }

  if (!phone || !phonePattern.test(phone)) {
    showError('editPhone', 'Телефон није исправан.');
    valid = false;
  }

  if (!email || !emailPattern.test(email)) {
    showError('editEmail', 'Емаил није исправан.');
    valid = false;
  }

  if (!year || isNaN(year) || parseInt(year) < 1800 || parseInt(year) > new Date().getFullYear()) {
    showError('editYear', 'Година мора бити број између 1800 и текуће године.');
    valid = false;
  }

if (!logo) {
  showError('editLogo', 'Лого је обавезан.');
  valid = false;
}
  if (!valid) return;


  const updates = {
    naziv: name,
    adresa: address,
    kontaktTelefon: phone,
    email: email,
    godinaOsnivanja: year,
    logo: logo
  };

  const modalEl = document.getElementById('editModal');
  const editModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  editModal.hide();

  db.ref('knjizare/' + id).update(updates).then(() => {
    alert('Измене су сачуване успешно.');
    loadBookstores();
  }).catch(err => {
    console.error(err);
    alert('Грешка при чувању измена.');
  });
});

function showError(inputId, message) {
  const input = document.getElementById(inputId);
  let small = input.nextElementSibling;
  if (!small || !small.classList.contains('text-danger')) {
    small = document.createElement('small');
    small.className = 'text-danger';
    input.parentNode.appendChild(small);
  }
  small.textContent = message;
}


document.getElementById('addBookBtn').addEventListener('click', () => {
  const id = document.getElementById('editId').value;

  const newBook = {
    naziv: document.getElementById('newBookTitle').value,
    autor: document.getElementById('newBookAuthor').value,
    zanr: document.getElementById('newBookGenre').value,
    format: document.getElementById('newBookFormat').value,
    cena: document.getElementById('newBookPrice').value,
    brojStrana: document.getElementById('newBookPages').value,
    opis: document.getElementById('newBookDesc').value,
    slike: document.getElementById('newBookImages').value
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)

  };

  db.ref('knjizare/' + id).once('value').then(snap => {
    const store = snap.val();
    let knjigeKey = store.knjige;

    if (!knjigeKey) {
      knjigeKey = db.ref('knjige').push().key;
      db.ref('knjizare/' + id).update({ knjige: knjigeKey });
    }

    db.ref('knjige/' + knjigeKey).push(newBook).then(() => {
      document.getElementById('newBookTitle').value = '';
      document.getElementById('newBookAuthor').value = '';
      document.getElementById('newBookGenre').value = '';
      document.getElementById('newBookFormat').value = '';
      document.getElementById('newBookPrice').value = '';
      document.getElementById('newBookPages').value = '';
      document.getElementById('newBookImages').value = '';
      document.getElementById('newBookDesc').value = '';
      editBookstore(id);
    });
  });
});

loadBookstores();

function showLogin() {
  new bootstrap.Modal(document.getElementById('loginModal')).show();
}
function showRegister() {
  new bootstrap.Modal(document.getElementById('registerModal')).show();
}


