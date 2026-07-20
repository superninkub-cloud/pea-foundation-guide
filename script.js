document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cardContainer = document.getElementById('cardContainer');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.getElementById('filterPills');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeBtn = document.getElementById('closeBtn');
  const themeToggle = document.getElementById('themeToggle');
  const htmlDoc = document.documentElement;

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Calculator Elements
  const selectModel = document.getElementById('selectModel');
  const selectVary = document.getElementById('selectVary');
  const inputQuantity = document.getElementById('inputQuantity');
  const resTotalCost = document.getElementById('resTotalCost');
  const resMaterialCost = document.getElementById('resMaterialCost');
  const resLaborCost = document.getElementById('resLaborCost');
  const resConcreteVol = document.getElementById('resConcreteVol');
  const resRebarWeight = document.getElementById('resRebarWeight');
  const resSandVol = document.getElementById('resSandVol');
  const resDrawingNo = document.getElementById('resDrawingNo');

  let currentFilter = 'all';

  // --- TAB NAVIGATION ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  // --- RENDER KNOWLEDGEBASE CARDS ---
  function renderCards() {
    cardContainer.innerHTML = '';
    const query = searchInput.value.toLowerCase().trim();

    const filtered = foundationData.filter(item => {
      const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
      const matchesQuery = query === '' || 
        item.title.toLowerCase().includes(query) || 
        item.summary.toLowerCase().includes(query) ||
        item.details.some(d => d.toLowerCase().includes(query)) ||
        (item.drawingNo && item.drawingNo.toLowerCase().includes(query));
      
      return matchesCategory && matchesQuery;
    });

    if (filtered.length === 0) {
      cardContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.7;">
          <p style="font-size: 1.2rem;">ไม่พบข้อมูลที่ตรงกับคำค้นหา "${query}"</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <span class="card-tag">${item.categoryName}</span>
        <div class="card-icon">${item.icon}</div>
        <h3>${item.title}</h3>
        <p class="summary">${item.summary}</p>
        <div class="card-footer">
          <span>แบบอ้างอิง: ${item.drawingNo}</span>
          <span>อ่านเพิ่ม ➔</span>
        </div>
      `;

      card.addEventListener('click', () => openModal(item));
      cardContainer.appendChild(card);
    });
  }

  // --- FILTER PILLS ---
  if (filterPills) {
    filterPills.addEventListener('click', (e) => {
      if (e.target.classList.contains('pill')) {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderCards();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderCards);
  }

  // --- RENDER SPECS TABLE ---
  function renderSpecsTable() {
    const specsBody = document.getElementById('specsTableBody');
    if (!specsBody) return;

    specsBody.innerHTML = foundationTypes.map(item => `
      <tr>
        <td><strong>${item.code}</strong></td>
        <td>${item.name}</td>
        <td><span class="card-tag">${item.type}</span></td>
        <td>${item.dimensions}</td>
        <td>${item.concreteVol}</td>
        <td>${item.rebarWeight}</td>
        <td>${item.bearingCapacity}</td>
        <td><code>${item.drawingNo}</code></td>
      </tr>
    `).join('');
  }

  // --- CALCULATOR FUNCTIONALITY ---
  function initCalculator() {
    if (!selectModel) return;

    // Populate select options
    selectModel.innerHTML = priceEstimatorSpecs.map(spec => `
      <option value="${spec.id}">${spec.name} (${spec.drawingNo})</option>
    `).join('');

    function calculate() {
      const specId = selectModel.value;
      const varyFactor = parseFloat(selectVary.value) || 0;
      const qty = parseInt(inputQuantity.value) || 1;

      const spec = priceEstimatorSpecs.find(s => s.id === specId);
      if (!spec) return;

      // Adjustment factor for VARY depth (increases concrete, rebar, formwork & cost proportional to depth)
      const depthMultiplier = 1 + (varyFactor * 0.15); // ~15% increase per meter of VARY depth

      const matCostSingle = spec.baseMaterialCost * depthMultiplier;
      const labCostSingle = spec.baseLaborCost * depthMultiplier;
      
      const totalMat = Math.round(matCostSingle * qty);
      const totalLab = Math.round(labCostSingle * qty);
      const totalCost = totalMat + totalLab;

      const concreteVol = (spec.concreteUnitVol * depthMultiplier * qty).toFixed(2);
      const rebarWeight = Math.round(spec.rebarUnitWeight * depthMultiplier * qty);
      const sandVol = (spec.sandUnitVol * depthMultiplier * qty).toFixed(2);

      resTotalCost.textContent = `${totalCost.toLocaleString('th-TH')} บาท`;
      resMaterialCost.textContent = `${totalMat.toLocaleString('th-TH')} บาท`;
      resLaborCost.textContent = `${totalLab.toLocaleString('th-TH')} บาท`;
      resConcreteVol.textContent = `${concreteVol} ลบ.ม.`;
      resRebarWeight.textContent = `${rebarWeight.toLocaleString('th-TH')} กก.`;
      resSandVol.textContent = `${sandVol} ลบ.ม.`;
      resDrawingNo.textContent = spec.drawingNo;
    }

    selectModel.addEventListener('change', calculate);
    selectVary.addEventListener('change', calculate);
    inputQuantity.addEventListener('input', calculate);

    calculate(); // Initial calculation
  }

  // --- MODAL FUNCTIONS ---
  function openModal(data) {
    modalTitle.innerHTML = `${data.icon} ${data.title}`;
    
    const detailsHtml = data.details.map(detail => `<li>${detail}</li>`).join('');
    modalContent.innerHTML = `
      <div style="margin-bottom: 1rem; font-weight: 600; color: var(--primary-color);">
        📌 เลขที่แบบมาตรฐานอ้างอิง: ${data.drawingNo}
      </div>
      <ul>${detailsHtml}</ul>
    `;
    
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // --- THEME TOGGLE ---
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlDoc.getAttribute('data-theme');
    if (currentTheme === 'light') {
      htmlDoc.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      htmlDoc.setAttribute('data-theme', 'light');
      themeToggle.textContent = '🌙';
    }
  });

  // Initializations
  renderCards();
  renderSpecsTable();
  initCalculator();
});
