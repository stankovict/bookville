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

function showLogin() {
  new bootstrap.Modal(document.getElementById('loginModal')).show();
}
function showRegister() {
  new bootstrap.Modal(document.getElementById('registerModal')).show();
}

db.ref('knjizare').once('value').then(snapshot => {
  const data = snapshot.val();
  const container = document.getElementById('bookstore-list');
  container.innerHTML = '';

  Object.keys(data).forEach(id => {
    const k = data[id];
    k.id = id;
    const card = document.createElement('div');
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100">
        <img src="${k.logo}" class="card-img-top" alt="${k.naziv}">
        <div class="card-body">
          <h5 class="card-title">${k.naziv}</h5>
          <p class="card-text">Адреса: ${k.adresa}</p>
          <p class="card-text">Контакт телефон: ${k.kontaktTelefon || ''}</p>
          <a href="bookstore.html?id=${k.id}" class="btn custom-btn">Погледај књиге</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}).catch(err => console.error(err));

document.getElementById('searchInput').addEventListener('input', () => {
  const filter = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('#bookstore-list .col-md-4').forEach(card => {
    const title = card.querySelector('.card-title').innerText.toLowerCase();
    card.style.display = title.includes(filter) ? '' : 'none';
  });
});