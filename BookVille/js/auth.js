const loginModalEl = document.getElementById('loginModal');
const loginModal = new bootstrap.Modal(loginModalEl);

const registerModalEl = document.getElementById('registerModal');
const registerModal = new bootstrap.Modal(registerModalEl);


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


function showLogin() { loginModal.show(); }
function showRegister() { registerModal.show(); }


function updateNavbar() {
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  const navItem = document.querySelector('.nav-item.dropdown.me-2 a');
  const dropdownMenu = navItem ? navItem.nextElementSibling : null;

  if (!loggedUser || !navItem || !dropdownMenu) return;

  navItem.innerHTML = `Здраво, ${loggedUser.ime || loggedUser.korisnickoIme} <i class="fa-solid"></i>`;

  dropdownMenu.innerHTML = `
    <li><a class="dropdown-item" href="profile.html?id=${loggedUser.id}">Измена профила</a></li>
    <li><a class="dropdown-item" href="#" onclick="logout()">Одјава</a></li>
  `;
}


  const dropdownMenu = navItem.nextElementSibling;
  if (dropdownMenu) {
    dropdownMenu.innerHTML = `
      <li><a class="dropdown-item" href="#" onclick="logout()">Одјава</a></li>
    `;
  }



function initLogin(db) {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const usernameOrEmail = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerText = '';

    if (!usernameOrEmail || !password) {
      errorDiv.innerText = 'Морате попунити сва поља!';
      return;
    }

    db.ref('korisnici').once('value').then(snapshot => {
      const users = snapshot.val();
      let found = false;

      for (const id in users) {
        const user = users[id];
        if ((user.korisnickoIme === usernameOrEmail || user.email === usernameOrEmail) && user.lozinka === password) {
          found = true;

          const loggedUser = { ...user, id };
          localStorage.setItem('loggedUser', JSON.stringify(loggedUser));

          alert(`Добродошли, ${user.ime || user.korisnickoIme}!`);
          loginModal.hide();
          updateNavbar();
          break;
        }
      }

      if (!found) errorDiv.innerText = 'Погрешно корисничко име/емаил или лозинка.';
    });
  });
}


function logout() {
  localStorage.removeItem('loggedUser');
  location.reload();
}


function initRegister(db) {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const addressPattern = /^[\p{L}\s]+\s\d+,\s[\p{L}\s]+,\s\d{5}$/u;
  const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\- ]+$/;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const birthdate = document.getElementById('regBirthdate').value;
    const address = document.getElementById('regAddress').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const occupation = document.getElementById('regOccupation').value.trim();

    let valid = true;
    document.querySelectorAll('#registerForm span.text-danger').forEach(span => span.innerText = '');

    if (!username) { document.getElementById('errorUsername').innerText = 'Обавезно корисничко име.'; valid=false; }
    if (!password || !pwPattern.test(password)) { document.getElementById('errorPassword').innerText = 'Лозинка мора садржати бар 8 карактера (мало/велико слово и број).'; valid=false; }
    if (!email || !emailPattern.test(email)) { document.getElementById('errorEmail').innerText = 'Е-маил није исправан (name@example.com).'; valid=false; }
    if (!firstName) { document.getElementById('errorFirstName').innerText = 'Обавезно име.'; valid=false; }
    if (!lastName) { document.getElementById('errorLastName').innerText = 'Обавезно презиме.'; valid=false; }
    if (!birthdate) { document.getElementById('errorBirthdate').innerText = 'Обавезан датум.'; valid=false; }
    if (!address || !addressPattern.test(address)) { document.getElementById('errorAddress').innerText = 'Адреса није у исправном формату. (Улица и број, место, поштански број)'; valid=false; }
    if (!phone || !phonePattern.test(phone)) { document.getElementById('errorPhone').innerText = 'Телефон није исправан.'; valid=false; }
    if (!occupation) { document.getElementById('errorOccupation').innerText = 'Обавезно занимање.'; valid=false; }

    if (!valid) return;

    db.ref('korisnici').once('value').then(snapshot => {
      const users = snapshot.val() || {};
      for (const id in users) {
        if (users[id].korisnickoIme === username) { document.getElementById('errorUsername').innerText = 'Корисничко име је већ заузето.'; return; }
        if (users[id].email === email) { document.getElementById('errorEmail').innerText = 'Емаил је већ регистрован.'; return; }
      }

      const newUser = { korisnickoIme: username, lozinka: password, email, ime:firstName, prezime:lastName, datumRodjenja:birthdate, adresa:address, telefon:phone, zanimanje:occupation };
      db.ref('korisnici').push(newUser).then(() => {
        alert('Регистрација успешна!');
        registerModal.hide();
        form.reset();
      });
    });
  });
}


function initAuthApp(db) {
  initTogglePassword();
  initLogin(db);
  initRegister(db);
  updateNavbar();
}
