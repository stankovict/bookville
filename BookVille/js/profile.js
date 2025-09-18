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


const addressPattern = /^[\p{L}\s]+\s\d+,\s[\p{L}\s]+,\s\d{5}$/u;
const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\- ]+$/;


function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function initTogglePassword() {
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = icon.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      }
    });
  });
}


function loadUserProfile() {
  const id = getUserIdFromURL();
  if (!id) return;

  db.ref(`korisnici/${id}`).once('value').then(snapshot => {
    const user = snapshot.val();
    if (!user) return;

    document.getElementById('profileUsername').value = user.korisnickoIme;
    document.getElementById('profilePassword').value = user.lozinka;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profileFirstName').value = user.ime;
    document.getElementById('profileLastName').value = user.prezime;
    document.getElementById('profileBirthdate').value = user.datumRodjenja;
    document.getElementById('profileAddress').value = user.adresa;
    document.getElementById('profilePhone').value = user.telefon;
    document.getElementById('profileOccupation').value = user.zanimanje;
  });
}


function saveUserProfile(e) {
  e.preventDefault();
  const id = getUserIdFromURL();
  if (!id) return;

  const updates = {
    korisnickoIme: document.getElementById('profileUsername').value.trim(),
    lozinka: document.getElementById('profilePassword').value.trim(),
    email: document.getElementById('profileEmail').value.trim(),
    ime: document.getElementById('profileFirstName').value.trim(),
    prezime: document.getElementById('profileLastName').value.trim(),
    datumRodjenja: document.getElementById('profileBirthdate').value,
    adresa: document.getElementById('profileAddress').value.trim(),
    telefon: document.getElementById('profilePhone').value.trim(),
    zanimanje: document.getElementById('profileOccupation').value.trim()
  };

  if (!pwPattern.test(updates.lozinka)) {
    alert('Лозинка није исправна. Мора имати минимум 8 карактера, велико слово и број.');
    return;
  }
  if (!emailPattern.test(updates.email)) {
    alert('Емаил није исправан.');
    return;
  }
  if (!addressPattern.test(updates.adresa)) {
    alert('Адреса није у исправном формату.');
    return;
  }
  if (!phonePattern.test(updates.telefon)) {
    alert('Телефон није исправан.');
    return;
  }

  db.ref('korisnici').once('value').then(snapshot => {
    const users = snapshot.val() || {};
    const currentUser = users[id];

    for (const otherId in users) {
      if (otherId === id) continue;


      if (users[otherId].email === updates.email && updates.email !== currentUser.email) {
        alert('Емаил је већ регистрован.');
        return;
      }


      if (users[otherId].korisnickoIme === updates.korisnickoIme && 
          updates.korisnickoIme !== currentUser.korisnickoIme) {
        alert('Корисничко име је већ заузето.');
        return;
      }
    }


    db.ref(`korisnici/${id}`).update(updates).then(() => {
      document.getElementById('profileMessage').innerText = 'Промене су сачуване!';


      const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
      if (loggedUser && loggedUser.id === id) {
        localStorage.setItem('loggedUser', JSON.stringify({ ...loggedUser, ...updates }));
      }
    });
  });
}

function deleteUserProfile() {
  const id = getUserIdFromURL();
  if (!id) return;

  if (confirm("Да ли сте сигурни да желите да обришете профил? Ова акција је неповратна.")) {
    db.ref(`korisnici/${id}`).remove().then(() => {

      const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
      if (loggedUser && loggedUser.id === id) {
        localStorage.removeItem('loggedUser');
      }

      alert("Профил је успешно обрисан.");
      window.location.href = "index.html";
    });
  }
}
document.addEventListener('DOMContentLoaded', () => {
  initTogglePassword();
  loadUserProfile();

  const form = document.getElementById('profileForm');
  if (form) form.addEventListener('submit', saveUserProfile);


  const deleteBtn = document.getElementById('deleteProfileBtn');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteUserProfile);

  const navItem = document.querySelector('.nav-item.dropdown.me-2 a');
  const dropdownMenu = navItem ? navItem.nextElementSibling : null;
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

  if (loggedUser && navItem && dropdownMenu) {
    navItem.innerHTML = `Здраво, ${loggedUser.ime || loggedUser.korisnickoIme} <i class="fa-solid"></i>`;
    dropdownMenu.innerHTML = `
      <li><a class="dropdown-item" href="profile.html?id=${loggedUser.id}">Измена профила</a></li>
      <li><a class="dropdown-item" href="#" onclick="logout()">Одјава</a></li>
    `;
  }
});
