const $ = id => document.getElementById(id);

let gender = 'male';
let person = null;
let count = 0;
let recent = [];

async function fetchPerson() {
    const params = new URLSearchParams({
        inc: 'gender,name,location,login,dob,phone,id,nat'
    });
    if (gender) params.set('gender', gender);
    if ($('nat').value) params.set('nat', $('nat').value);

    const res = await fetch('https://randomuser.me/api/?' + params);
    if (!res.ok) throw new Error('Request failed');

    const u = (await res.json()).results[0];
    const l = u.location;

    return {
        fullName: `${u.name.title} ${u.name.first} ${u.name.last}`,
        gender: u.gender,
        age: u.dob.age,
        dob: new Date(u.dob.date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        }),
        phone: u.phone,
        id: u.id.value ? `${u.id.name}: ${u.id.value}` : 'Not available',
        country: l.country,
        city: l.city,
        address: `${l.street.number} ${l.street.name}, ${l.city}, ${l.state}, ${l.postcode}, ${l.country}`,
        username: u.login.username,
        password: u.login.password
    };
}

function show(p) {
    person = p;

    document.querySelectorAll('[data-f]').forEach(el => {
        el.textContent = p[el.dataset.f];
    });

    const body = $('body');
    body.classList.remove('fade');
    void body.offsetWidth;
    body.classList.add('fade');

    drawRecent();
}

function drawRecent() {
    $('recent').innerHTML = '';
    recent.forEach(p => {
        const btn = document.createElement('button');
        btn.textContent = p.fullName.split(' ').slice(1).join(' ');
        btn.className = p === person ? 'on' : '';
        btn.onclick = () => show(p);
        $('recent').append(btn);
    });
}

async function generate() {
    const btn = $('generate');
    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
        const p = await fetchPerson();
        count++;
        $('counter').textContent = 'No. ' + String(count).padStart(2, '0');
        recent = [p, ...recent].slice(0, 4);
        show(p);
    } catch {
        document.querySelector('[data-f="fullName"]').textContent = 'Could not load';
    }

    btn.disabled = false;
    btn.textContent = 'Generate new';
}

async function copyJson() {
    if (!person) return;
    await navigator.clipboard.writeText(JSON.stringify(person, null, 2));
    $('copy').textContent = 'Copied';
    setTimeout(() => $('copy').textContent = 'Copy JSON', 1200);
}

$('seg').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#seg button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    gender = btn.dataset.g;
    generate();
});

$('nat').addEventListener('change', generate);
$('generate').addEventListener('click', generate);
$('copy').addEventListener('click', copyJson);

document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target.tagName !== 'SELECT' && !$('generate').disabled) {
        e.preventDefault();
        generate();
    }
});

generate();
