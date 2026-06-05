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
  [-6.280565131187231, 106.66227924919247],
  14
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

// =========================
// MARKER CABANG BSD
// =========================
const cabangIcon = L.divIcon({
  className: "custom-cabang-marker",
  html: `
    <div style="
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-bottom: 22px solid #125EFA;
      // filter: drop-shadow(0 0 6px rgba(230,57,70,0.7));
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [14, 14]
});

const cabangMarker = L.marker(
  [-6.280565131187, 106.662279249],
  {
    icon: cabangIcon
  }
).addTo(map);

cabangMarker.bindPopup(`
  <div style="min-width:200px;">
    
    <h3 style="
      margin:0 0 10px 0;
      color:#000000f;
    ">
      🏦 KC Bumi Serpong Damai
    </h3>

    <div>
      Kantor Cabang Utama
    </div>

  </div>
`);

// =========================
// MARKER KCP
// =========================

const kcpIcon = L.divIcon({
  className: "custom-kcp-marker",
  html: `
    <div style="
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 18px solid #38BDF8;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 18]
});

function addKCP(name, lat, lng) {

  const marker = L.marker(
    [lat, lng],
    { icon: kcpIcon }
  ).addTo(map);

  marker.bindPopup(`
    <div style="min-width:200px;">

      <h3 style="
        margin:0 0 10px 0;
        color:#38BDF8;
      ">
        🏦 ${name}
      </h3>

      <div>
        Kantor Cabang Pembantu
      </div>

    </div>
  `);

}

// =========================
// DATA KCP
// =========================

addKCP(
  "KCP MUNCUL",
  -6.347782244004288,
  106.67426257405234
);

addKCP(
  "KCP MELATI MAS",
  -6.268853688569031,
  106.65486042122218
);

addKCP(
  "KCP GRAHA RAYA",
  -6.232740019224546,
  106.68080428618055
);

addKCP(
  "KCP GADING SERPONG",
  -6.232302341080241,
  106.63338648040667
);

addKCP(
  "KCP SEKTOR 1.1",
  -6.305826966299265,
  106.68047500478252
);

addKCP(
  "KCP CISAUK",
  -6.334566306773266,
  106.63867189720561
);

addKCP(
  "KCP ALAM SUTERA",
  -6.2429191503806925,
  106.65395690987083
);



// =========================
// CATEGORY LABEL
// =========================

function getCategoryColor(category) {

  const colors = {
    "Apotek": "#E91E63",                // pink
    "Bengkel": "#607D8B",               // blue grey
    "Cafe & Resto": "#ff5900",          // biru
    "Commercial": "#9C27B0",            // ungu
    "Dealer": "#f7997d",                // deep orange
    "Developer": "#795548",             // coklat
    "Education": "#ff0000",             // indigo
    "Fashion": "#FF4081",               // pink terang
    "Furniture": "#8D6E63",             // brown muda
    "Hiburan": "#673AB7",               // deep purple
    "Hobby": "#ca8cc9",                 // cyan

    "Tempat Ibadah": "#1a3b59",         // blue
    "Toko Bangunan": "#A1887F",         // brown
    "Toko Elektronik": "#3949AB",       // indigo tua

    "Klinik & Rumah Sakit": "#F44336",  // merah
    "Lainnya": "#546E7A",               // slate
    "Laundry": "#fed81c",               // cyan terang
    "Mall": "#AB47BC",                  // purple terang
    "Petshop": "#FF7043",               // orange coral
    "Printing & Stationary": "#5C6BC0", // indigo muda
    "Rent": "#8E24AA",                  // violet
    "Salon & Beauty": "#EC407A",        // rose
    "Service": "#7E57C2",               // lavender
    "SPBU": "#D32F2F",                  // merah tua
    "Supermarket & Grosir": "#c6f053"   // biru tua
  };

  return colors[category] || "#ffffff";
}

// =========================
// COLOR
// =========================
function getStatusColor(status) {

  if (!status) return "blue";

  status = status.toLowerCase().trim();

  if (status.includes("belum")) return "gray";
  if (status.includes("dikunjungi")) return "orange";
  if (status.includes("closing")) return "green";

  return "blue";
}

function populateCategoryFilter() {

  const categoryFilter =
    document.getElementById("categoryFilter");

  categoryFilter.innerHTML =
    `<option value="">Semua Kategori</option>`;

  const categories = [
    ...new Set(
      allPlaces
        .map(x => x.category)
        .filter(Boolean)
    )
  ].sort();

  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.appendChild(option);

  });

}

function populateCabangFilter() {

  const cabangFilter =
    document.getElementById("cabangFilter");

  cabangFilter.innerHTML =
    `<option value="">Semua Cabang</option>`;

  const cabangs = [
    ...new Set(
      allPlaces
        .map(x => x.cabang)
        .filter(Boolean)
    )
  ].sort();

  cabangs.forEach(cabang => {

    const option =
      document.createElement("option");

    option.value = cabang;
    option.textContent = cabang;

    cabangFilter.appendChild(option);

  });

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

      const statusColor = getStatusColor(row.status);
      const categoryColor = getCategoryColor(row.category);

      const marker = L.circleMarker([lat, lng], {

        radius: 8,
        color: statusColor,
        fillColor: categoryColor,
        fillOpacity: 1,
        weight: 5

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

    populateCategoryFilter();
    populateCabangFilter();

    renderSidebar();

  }
});

// =========================
// RENDER SIDEBAR
// =========================
function renderSidebar() {

  const placeList = document.getElementById("place-list");
  placeList.innerHTML = "";

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  const pageItems = filteredPlaces.slice(start, end);

  pageItems.forEach(place => {

    const card = document.createElement("div");

    card.className = "place-card";

    card.innerHTML = `
      <div class="place-title">
        ${place.nama}
      </div>

      <div class="place-category">
        ${place.category}
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

  const search = document.getElementById("searchInput").value.toLowerCase();

  const status = document.getElementById("statusFilter").value;

  const category = document.getElementById("categoryFilter").value;
  
  const cabang =  document.getElementById("cabangFilter").value;

  filteredPlaces = allPlaces.filter(place => {

    const matchSearch = place.nama?.toLowerCase().includes(search);

    const matchStatus = !status || place.status === status;

    const matchCategory = !category || place.category === category;

    const matchCabang = !cabang || place.cabang === cabang;

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

  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);

  const pagination = document.getElementById("pagination");

  pagination.innerHTML = `

    <button id="prevPage">
      ←
    </button>

    <div class="page-jump">

      <input
        id="pageInput"
        type="text"
        value="${currentPage}"
      />

      <span>/ ${totalPages}</span>

    </div>

    <button id="nextPage">
      →
    </button>

  `;

  // PREV
  document.getElementById("prevPage")
    .onclick = () => {

      if(currentPage > 1){

        currentPage--;

        renderSidebar();

      }

    };

  // NEXT
  document.getElementById("nextPage")
    .onclick = () => {

      if(currentPage < totalPages){

        currentPage++;

        renderSidebar();

      }

    };

  // INPUT PAGE
  const pageInput = document.getElementById("pageInput");

  pageInput.addEventListener(
    "keydown",
    (e) => {

      if(e.key !== "Enter")
        return;

      const value =
        pageInput.value.trim();

      // VALIDASI ANGKA
      if(!/^\d+$/.test(value)){

        alert(
          "Page harus berupa angka"
        );

        pageInput.value =
          currentPage;

        return;

      }

      const page =
        parseInt(value);

      if(
        page < 1 ||
        page > totalPages
      ){

        alert(
          `Page harus antara 1 - ${totalPages}`
        );

        pageInput.value =
          currentPage;

        return;

      }

      currentPage = page;

      renderSidebar();
    }
  );
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