// ----------------------------------------------------
//                COEFFICIENTS S2
// ----------------------------------------------------
const coefficients = {
  A21: { UE1:21, UE5:3, UE6:4 },
  C21: { UE1:6, UE3:3, UE5:9, UE6:11 },
  D21: { UE4:30 },
  E21: { UE6:17 },
  G21: { UE4:6, UE5:15 },
  G22: { UE4:6, UE5:15 },
  L21: { UE3:6, UE4:6, UE5:6, UE6:17 },
  M21: { UE2:12 },
  M22: { UE4:12 },
  M23: { UE2:21, UE5:6 },
  P21: { UE1:21, UE2:15 },
  P22: { UE1:12, UE5:6 },
  S21: { UE2:12, UE3:36 },
  S22: { UE3:15 },
  PPP: { UE6:11 },
  SAE21: { UE1:40},
  SAE22: { UE2:40},
  SAE23: { UE3:40},
  SAE24: { UE4:40},
  SAE25: { UE5:40},
  SAE26: { UE6:40},
};

// ----------------------------------------------------
//          1. Génération des inputs
// ----------------------------------------------------
const table = document.getElementById("notesTable");

Object.keys(coefficients).forEach(mod => {
  const row = table.insertRow();
  row.insertCell(0).textContent = mod;

  const input = document.createElement("input");
  input.placeholder = "ex: 12, 14, 9";
  input.dataset.module = mod;

  row.insertCell(1).appendChild(input);
});

// ----------------------------------------------------
//              2. SAUVEGARDE AUTO
// ----------------------------------------------------
function saveNotes() {
  const data = {};

  document.querySelectorAll("input").forEach(input => {
    if (input.value.trim() !== "") {
      data[input.dataset.module] = input.value;
    }
  });

  localStorage.setItem("notes_S2", JSON.stringify(data));
}

function loadNotes() {
  const saved = JSON.parse(localStorage.getItem("notes_S2")) || {};

  document.querySelectorAll("input").forEach(input => {
    const mod = input.dataset.module;
    if (saved[mod]) {
      input.value = saved[mod];
    }
  });
}

// Charger les notes au lancement
loadNotes();

// Sauvegarde en temps réel
document.addEventListener("input", saveNotes);

// ----------------------------------------------------
//              3. CALCUL + RESULTATS
// ----------------------------------------------------
let chart;

document.getElementById("calculate").addEventListener("click", () => {

  const ue = {
    UE1:{s:0,c:0}, UE2:{s:0,c:0}, UE3:{s:0,c:0},
    UE4:{s:0,c:0}, UE5:{s:0,c:0}, UE6:{s:0,c:0}
  };

  document.querySelectorAll("input").forEach(input => {
    const notes = input.value.split(",")
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));

    if(notes.length === 0) return;

    const avg = notes.reduce((a,b)=>a+b,0)/notes.length;
    const mod = input.dataset.module;

    for(const u in coefficients[mod]){
      const coef = coefficients[mod][u];
      ue[u].s += avg * coef;
      ue[u].c += coef;
    }
  });

  const resDiv = document.getElementById("results");
  resDiv.innerHTML = "";

  const labels = [];
  const data = [];

  for(const u in ue){
    const p = document.createElement("p");

    if(ue[u].c > 0){
      const m = ue[u].s / ue[u].c;
      p.textContent = `${u} : ${m.toFixed(2)} / 20`;

      // Couleurs
      if(m < 8) p.style.background = "#ffb3b3";
      else if(m < 10) p.style.background = "#ffd9b3";
      else p.style.background = "#b3ffb3";

      labels.push(u);
      data.push(m.toFixed(2));
    } else {
      p.textContent = `${u} : aucune donnée`;
      p.style.background = "#e6e6e6";
    }

    resDiv.appendChild(p);
  }

  // ----------------------------------------------------
  //              4. GRAPHIQUE RADAR
  // ----------------------------------------------------
  const ctx = document.getElementById("radarChart");

  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Moyennes UE",
        data,
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 20,
          ticks: { stepSize: 5 }
        }
      }
    }
  });
});

// ----------------------------------------------------
//              5. RESET
// ----------------------------------------------------
document.getElementById("reset").addEventListener("click", () => {
  localStorage.removeItem("notes_S2");
  document.querySelectorAll("input").forEach(input => input.value = "");
});
