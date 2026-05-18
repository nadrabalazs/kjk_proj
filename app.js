const k6 = () => Math.floor(Math.random() * 6) + 1;

const fejezetek = {
  0: {
    szoveg: "A Tűzhegy barlangja előtt állsz. A sötét folyosó hív.",
    valasztasok: [{ felirat: "Belépek a barlangba", hova: 1 }],
  },
  1: {
    szoveg: "Az elágazásnál egy goblin ugrik eléd rozsdás tőrrel!",
    szorny: { nev: "Goblin", ugyesseg: 5, eletero: 5, kovetkezo: 2 },
  },
  2: {
    szoveg: "A goblin mögött kis kamra. Egy láda és egy ajtó.",
    valasztasok: [
      { felirat: "Kinyitom a ládát", hova: 3 },
      { felirat: "Az ajtón megyek", hova: 4 },
    ],
  },
  3: { szoveg: "Arany! 10 érmét találsz. A kaland véget ér.", vege: "nyertel" },
  4: {
    szoveg: "Egy óriás patkány támad rád!",
    szorny: { nev: "Óriáspatkány", ugyesseg: 4, eletero: 4, kovetkezo: 3 },
  },
};

const jatekos = { ugyesseg: 0, maxHp: 0, hp: 0, fejezetId: 0, szornyHp: 0 };

function naplozo(uzenet) {
  const li = document.createElement("li");
  li.textContent = "· " + uzenet;
  document.getElementById("log").prepend(li);
}

function frissitKepernyo() {
  const akt = fejezetek[jatekos.fejezetId];
  document.getElementById("skill").textContent = jatekos.ugyesseg;
  document.getElementById("hp").textContent = Math.max(0, jatekos.hp);
  document.getElementById("maxhp").textContent = jatekos.maxHp;

  const sztoriDiv = document.getElementById("story");
  sztoriDiv.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = akt.szoveg;
  sztoriDiv.appendChild(p);
  
  if (akt.szorny && jatekos.szornyHp > 0 && jatekos.hp > 0) {
    const e = document.createElement("p");
    e.className = "enemy";
    e.textContent = `${akt.szorny.nev} — Ügyesség ${akt.szorny.ugyesseg}, Életerő ${Math.max(0, jatekos.szornyHp)}`;
    sztoriDiv.appendChild(e);
  }

  const gombokDiv = document.getElementById("actions");
  gombokDiv.innerHTML = "";

  if (jatekos.hp <= 0) {
    gombokDiv.innerHTML = '<div class="end"><p class="lose">Elhullottál a harcban.</p></div>';
    gombLetrehozas(gombokDiv, "Újra", ujJatek);
    return;
  }
  if (akt.vege === "nyertel") {
    gombokDiv.innerHTML = '<div class="end"><p class="win">Győzelem!</p></div>';
    gombLetrehozas(gombokDiv, "Újra", ujJatek);
    return;
  }

  if (akt.szorny && jatekos.szornyHp > 0) {
    const b = gombLetrehozas(gombokDiv, "🎲 Támadok (2d6 + Ügyesség)", harcol);
    b.className = "fight";
    return;
  }

  (akt.valasztasok || []).forEach((v) => gombLetrehozas(gombokDiv, "→ " + v.felirat, () => lepes(v.hova)));
}

function gombLetrehozas(szulo, felirat, akcio) {
  const b = document.createElement("button");
  b.textContent = felirat;
  b.onclick = akcio;
  szulo.appendChild(b);
  return b;
}

function lepes(id) {
  jatekos.fejezetId = id;
  jatekos.szornyHp = fejezetek[id].szorny ? fejezetek[id].szorny.eletero : 0;
  frissitKepernyo();
}

function harcol() {
  const akt = fejezetek[jatekos.fejezetId];
  const enDobas = k6() + k6() + jatekos.ugyesseg;
  const szornyDobas = k6() + k6() + akt.szorny.ugyesseg;
  
  if (enDobas > szornyDobas) {
    jatekos.szornyHp -= 2;
    naplozo(`Te ${enDobas} vs ${szornyDobas} → eltaláltad!`);
    if (jatekos.szornyHp <= 0) {
      naplozo(`Legyőzted: ${akt.szorny.nev}!`);
      frissitKepernyo(); 
      setTimeout(() => lepes(akt.szorny.kovetkezo), 400);
      return;
    }
  } else if (szornyDobas > enDobas) {
    jatekos.hp -= 2;
    naplozo(`Te ${enDobas} vs ${szornyDobas} → megsebzett!`);
  } else {
    naplozo(`Te ${enDobas} vs ${szornyDobas} → kivédted.`);
  }
  frissitKepernyo();
}

function ujJatek() {
  jatekos.ugyesseg = k6() + 6;
  jatekos.maxHp = k6() + k6() + 12;
  jatekos.hp = jatekos.maxHp;
  jatekos.fejezetId = 0;
  jatekos.szornyHp = 0;
  document.getElementById("log").innerHTML = "";
  naplozo("Kalandod elkezdődik.");
  frissitKepernyo();
}

window.onload = ujJatek;