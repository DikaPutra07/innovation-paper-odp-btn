const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6tFK2BQkjWzqp2Ot__bZiDWRCuCFHpXqTC8xKM00KJKDGEyctEUisS8VfoZykvBiUrrzSrc-11-CE/pub?output=csv";

const ITEMS_PER_PAGE = 25;

let allPlaces = [];
let filteredPlaces = [];
let currentPage = 1;

// =========================
// MAP
// =========================
const map = L.map('map').setView(
  [-6.9147, 107.6098],
  14
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

// =========================
// CATEGORY LABEL
// =========================
const categoryMap = {
  cafe: "Kafe",
  car_repair: "Bengkel",
  clinic: "Klinik",
  convenience: "Minimarket",
  electronics: "Toko Elektronik",
  hardware: "Toko Perkakas",
  hospital: "Rumah Sakit",
  laundry: "Laundry",
  pharmacy: "Toko Obat",
  restaurant: "Restoran",
  supermarket: "Supermarket"
};

// =========================
// COLOR
// =========================
function getColor(status) {

  if (!status) return "blue";

  status = status.toLowerCase().trim();

  if (status.includes("belum")) return "gray";
  if (status.includes("dikunjungi")) return "orange";
  if (status.includes("closing")) return "green";

  return "blue";
}

// =========================
// LOAD DATA
// =========================
Papa.parse(SHEET_URL, {

  download: true,
  header: true,

  complete: function(results) {

    results.data.forEach(row => {

      if (!row.lat || !row.lng) return;

      const lat = parseFloat(row.lat);
      const lng = parseFloat(row.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      const color = getColor(row.status);

      const marker = L.circleMarker([lat, lng], {

        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8

      }).addTo(map);

        marker.bindPopup(`

        <div style="min-width:200px;">

            <h3 style="margin:0 0 10px 0;">
            ${row.nama}
            </h3>

            <div>
            <b>Status:</b> ${row.status}
            </div>

            <div>
            <b>Category:</b> ${row.category}
            </div>

            <div>
            <b>Cabang:</b> ${row.cabang}
            </div>

            <br>

            <!-- BUTTON NOTES -->
            <button 
              onclick="
                const notesDiv = document.getElementById('notes-${row.nama.replace(/[^a-zA-Z0-9]/g, '_')}');
                if(notesDiv.style.display === 'none') {
                  notesDiv.style.display = 'block';
                  this.textContent = '📝 Sembunyikan Notes';
                } else {
                  notesDiv.style.display = 'none';
                  this.textContent = '📝 Lihat Notes';
                }
              "
              style="
                display:inline-block;
                padding:8px;
                background:#34A853;
                color:white;
                border:none;
                border-radius:8px;
                font-size:14px;
                cursor:pointer;
                // margin-bottom:10px;
                // width:100%;
              "
            >
              📝 Lihat Notes
            </button>

            <!-- NOTES CONTENT (HIDDEN BY DEFAULT) -->
            <div 
              id="notes-${row.nama.replace(/[^a-zA-Z0-9]/g, '_')}"
              style="
                display:none;
                background:#f9f9f9;
                padding:8px;
                border-radius:8px;
                margin-bottom:10px;
                border-left:4px solid #34A853;
                max-width:300px;
                word-wrap:break-word;
                white-space:pre-wrap;
              "
            >${row.notes || 'Tidak ada notes'}
            </div>

            <a
            href="https://www.google.com/maps/dir/?api=1&destination=${row.lat},${row.lng}"
            target="_blank"
            style="
                display:inline-block;
                padding:8px;
                background:#4285F4;
                color:white;
                text-decoration:none;
                border-radius:8px;
                font-size:14px;
            "
            >
            📍 Google Maps
            </a>

        </div>

        `);

      allPlaces.push({
        ...row,
        lat,
        lng,
        marker
      });

    });

    filteredPlaces = allPlaces;

    renderSidebar();

  }
});

// =========================
// RENDER SIDEBAR
// =========================
function renderSidebar() {

  const placeList =
    document.getElementById("place-list");

  placeList.innerHTML = "";

  const start =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const end =
    start + ITEMS_PER_PAGE;

  const pageItems =
    filteredPlaces.slice(start, end);

  pageItems.forEach(place => {

    const card =
      document.createElement("div");

    card.className = "place-card";

    card.innerHTML = `
      <div class="place-title">
        ${place.nama}
      </div>

      <div class="place-category">
        ${categoryMap[place.category] || place.category}
      </div>

      <div class="place-status status-${place.status}">
        ${place.status}
      </div>
    `;

    card.addEventListener("click", () => {

      // AUTO CLOSE SIDEBAR DULU
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.getElementById('toggleSidebarBtn');
      
      if (!sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
        toggleBtn.classList.add('show');
      }

      // FLY TO LOCATION setelah animasi sidebar selesai
      setTimeout(() => {
        map.flyTo(
          [place.lat, place.lng],
          18,
          { duration: 1.5 }
        );

        place.marker.openPopup();

        // Trigger map resize setelah sidebar ketutup
        map.invalidateSize();
      }, 400); // Delay 400ms = durasi animasi sidebar

    });

    placeList.appendChild(card);

  });

  renderPagination();
}

// =========================
// FILTER
// =========================
function applyFilter() {

  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const status =
    document
      .getElementById("statusFilter")
      .value;

  const category =
    document
      .getElementById("categoryFilter")
      .value;
  
  const cabang = 
    document  
      .getElementById("cabangFilter")
      .value;

  filteredPlaces = allPlaces.filter(place => {

    const matchSearch =
      place.nama?.toLowerCase().includes(search);

    const matchStatus =
      !status ||
      place.status === status;

    const matchCategory =
      !category ||
      place.category === category;

    const matchCabang = 
      !cabang ||
      place.cabang === cabang;

    return (
      matchSearch &&
      matchStatus &&
      matchCategory &&
      matchCabang
    );

  });

  currentPage = 1;

  renderSidebar();
}

// =========================
// PAGINATION
// =========================
function renderPagination() {

  const totalPages =
    Math.ceil(
      filteredPlaces.length /
      ITEMS_PER_PAGE
    );

  const pagination =
    document.getElementById("pagination");

  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {

    const btn =
      document.createElement("button");

    btn.innerText = i;

    if (i === currentPage) {
      btn.style.fontWeight = "bold";
    }

    btn.addEventListener("click", () => {

      currentPage = i;

      renderSidebar();

    });

    pagination.appendChild(btn);

  }
}

// =========================
// EVENT LISTENER
// =========================
document
  .getElementById("searchInput")
  .addEventListener("input", applyFilter);

document
  .getElementById("statusFilter")
  .addEventListener("change", applyFilter);

document
  .getElementById("categoryFilter")
  .addEventListener("change", applyFilter);

document
  .getElementById("cabangFilter")
  .addEventListener("change", applyFilter);

// ... semua kode lu yang sebelumnya ...

// =========================
// TOGGLE SIDEBAR
// =========================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleSidebarBtn');
  
  sidebar.classList.toggle('hidden');
  
  // Show/hide toggle button di map
  if (sidebar.classList.contains('hidden')) {
    toggleBtn.classList.add('show');
    // Trigger map resize setelah animasi selesai
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  } else {
    toggleBtn.classList.remove('show');
    // Trigger map resize
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }
}

// Keyboard shortcut: tekan 'H' untuk hide/show sidebar
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    // Cek kalo user nggak lagi ngetik di input
    if (document.activeElement.tagName !== 'INPUT') {
      toggleSidebar();
    }
  }
});


// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// (async () => {
//   while(true){
//   allPlaces = [];
//   // Hapus semua marker dari map
//   map.eachLayer((layer) => {
//     if (layer instanceof L.CircleMarker) {
//       map.removeLayer(layer);
//     }
//   });
  
//   // Fetch ulang data
//   Papa.parse(SHEET_URL, {
//     download: true,
//     header: true,
//     complete: function(results) {
//       results.data.forEach(row => {
//         if (row.nama == "Radja Ketjil" || row.nama == "Alfamidi"){
//             console.log(`state ${row.nama}: ${row.status}`)
//         }
//         if (!row.lat || !row.lng) return;
        
//         const lat = parseFloat(row.lat);
//         const lng = parseFloat(row.lng);
        
//         if (isNaN(lat) || isNaN(lng)) return;
        
//         const color = getColor(row.status);
        
//         const marker = L.circleMarker([lat, lng], {
//           radius: 8,
//           color,
//           fillColor: color,
//           fillOpacity: 0.8
//         }).addTo(map);
        
//         // Copy popup yang sama kayak sebelumnya
//         marker.bindPopup(`
//           <div style="min-width:200px;">
//             <h3 style="margin:0 0 10px 0;">${row.nama}</h3>
//             <div><b>Status:</b> ${row.status}</div>
//             <div><b>Category:</b> ${row.category}</div>
//             <div><b>Cabang:</b> ${row.cabang}</div>
//             <br>
//             <button onclick="
//               const notesDiv = document.getElementById('notes-${row.nama.replace(/[^a-zA-Z0-9]/g, '_')}');
//               if(notesDiv.style.display === 'none') {
//                 notesDiv.style.display = 'block';
//                 this.textContent = '📝 Sembunyikan Notes';
//               } else {
//                 notesDiv.style.display = 'none';
//                 this.textContent = '📝 Lihat Notes';
//               }
//             " style="display:inline-block;padding:8px 12px;background:#34A853;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;margin-bottom:10px;width:100%;">
//               📝 Lihat Notes
//             </button>
//             <div id="notes-${row.nama.replace(/[^a-zA-Z0-9]/g, '_')}" style="display:none;background:#f9f9f9;padding:10px;border-radius:8px;margin-bottom:10px;border-left:4px solid #34A853;max-width:300px;word-wrap:break-word;white-space:pre-wrap;">
//               ${row.notes || 'Tidak ada notes'}
//             </div>
//             <a href="https://www.google.com/maps/dir/?api=1&destination=${row.lat},${row.lng}" target="_blank" style="display:inline-block;padding:8px 12px;background:#4285F4;color:white;text-decoration:none;border-radius:8px;font-size:14px;">
//               📍 Navigasi Google Maps
//             </a>
//           </div>
//         `);
        
//         allPlaces.push({ ...row, lat, lng, marker });
//       });
      
//       filteredPlaces = allPlaces;
//       currentPage = Math.min(currentPage, Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE));
//       renderSidebar();
//       console.log('✅ Data updated:', new Date().toLocaleTimeString());
//     }
//   });
//     await sleep(10000); 
//   }
// })();