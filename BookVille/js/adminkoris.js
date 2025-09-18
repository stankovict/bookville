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

const userListDiv = document.getElementById('user-list');
const loadingDiv = document.getElementById('loading');


function loadUsers() {
  db.ref('korisnici').once('value').then(snapshot => {
    loadingDiv.classList.add('d-none');
    userListDiv.innerHTML = '';
    const users = snapshot.val();
    if (!users) {
      userListDiv.innerHTML = '<div class="alert alert-info">Нема регистрованих корисника.</div>';
      return;
    }

    for (const id in users) {
      const user = users[id];
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${user.ime || ''} ${user.prezime || ''} (${user.korisnickoIme})</h5>
          <p><strong>Емаил:</strong> ${user.email || ''}</p>
          <p><strong>Телефон:</strong> ${user.telefon || ''}</p>
          <p><strong>Адреса:</strong> ${user.adresa || ''}</p>
          <p><strong>Датум рођења:</strong> ${user.datumRodjenja || ''}</p>
          <p><strong>Занимање:</strong> ${user.zanimanje || ''}</p>
          <button class="btn btn-primary btn-sm me-2" onclick="editUser('${id}')">Измени</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${id}')">Обриши</button>
        </div>
      `;
      userListDiv.appendChild(card);
    }
  });
}

function deleteUser(id) {
  if (confirm('Да ли сте сигурни да желите да обришете овог корисника?')) {
    db.ref('korisnici/' + id).remove().then(() => {
      alert('Корисник је обрисан');
      loadUsers();
    });
  }
}

function editUser(id) {
  db.ref('korisnici/' + id).once('value').then(snapshot => {
    const user = snapshot.val();
    document.getElementById('editId').value = id;
    document.getElementById('editUsername').value = user.korisnickoIme || '';
    document.getElementById('editPassword').value = user.lozinka || '';
    document.getElementById('editFirstName').value = user.ime || '';
    document.getElementById('editLastName').value = user.prezime || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editDOB').value = user.datumRodjenja || '';
    document.getElementById('editAddress').value = user.adresa || '';
    document.getElementById('editPhone').value = user.telefon || '';
    document.getElementById('editOccupation').value = user.zanimanje || '';

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
  });
}


document.getElementById('editForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const updates = {
    korisnickoIme: document.getElementById('editUsername').value,
    lozinka: document.getElementById('editPassword').value,
    ime: document.getElementById('editFirstName').value,
    prezime: document.getElementById('editLastName').value,
    email: document.getElementById('editEmail').value,
    datumRodjenja: document.getElementById('editDOB').value,
    adresa: document.getElementById('editAddress').value,
    telefon: document.getElementById('editPhone').value,
    zanimanje: document.getElementById('editOccupation').value
  };
  db.ref('korisnici/' + id).update(updates).then(() => {
    alert('Измене су сачуване');
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    editModal.hide();
    loadUsers();
  });
});


loadUsers();

function showLogin() {
  new bootstrap.Modal(document.getElementById('loginModal')).show();
}
function showRegister() {
  new bootstrap.Modal(document.getElementById('registerModal')).show();
}
