document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const cardContainer = document.getElementById('cardContainer');
  const pilesGrid = document.getElementById('pilesGrid');
  const toolsGrid = document.getElementById('toolsGrid');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.getElementById('filterPills');
  const toolSearchInput = document.getElementById('toolSearchInput');
  const toolFilterPills = document.getElementById('toolFilterPills');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeBtn = document.getElementById('closeBtn');
  const themeToggle = document.getElementById('themeToggle');
  const htmlDoc = document.documentElement;

  // Settings & DB Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModalOverlay = document.getElementById('settingsModalOverlay');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const supaUrl = document.getElementById('supaUrl');
  const supaKey = document.getElementById('supaKey');
  const saveSupaBtn = document.getElementById('saveSupaBtn');
  const clearSupaBtn = document.getElementById('clearSupaBtn');
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const dbStatusText = document.getElementById('dbStatusText');

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

  // Cost Estimator Elements
  const summaryContainer = document.getElementById('summaryContainer');
  const selectMatFoundation = document.getElementById('selectMatFoundation');
  const inputMatQuantity = document.getElementById('inputMatQuantity');
  const resTotalNetPrice = document.getElementById('resTotalNetPrice');
  const resBaseCost = document.getElementById('resBaseCost');
  const resTotalMatCost = document.getElementById('resTotalMatCost');
  const resTotalLabCost = document.getElementById('resTotalLabCost');
  const resFactorF = document.getElementById('resFactorF');

  // Sag & Tension Elements
  const selectConductor = document.getElementById('selectConductor');
  const inputSpan = document.getElementById('inputSpan');
  const inputSag = document.getElementById('inputSag');
  const resTension = document.getElementById('resTension');
  const resCondWeight = document.getElementById('resCondWeight');
  const resMaxTension = document.getElementById('resMaxTension');
  const resSafetyStatus = document.getElementById('resSafetyStatus');

  let currentFilter = 'all';
  let currentToolFilter = 'all';
  let currentFoundationData = [];
  let currentFoundationTypes = [];
  let currentPriceSpecs = [];

  // --- UPDATE DATABASE STATUS BADGE ---
  function updateDbStatus() {
    if (SupabaseService.isConfigured) {
      dbStatusBadge.querySelector('.status-dot').classList.add('connected');
      dbStatusText.textContent = 'สถานะฐานข้อมูล: เชื่อมต่อ Supabase Live Data';
    } else {
      dbStatusBadge.querySelector('.status-dot').classList.remove('connected');
      dbStatusText.textContent = 'สถานะฐานข้อมูล: ใช้ข้อมูลสำรอง (Static Data)';
    }
  }

  // --- LOAD DATA (SUPABASE / FALLBACK) ---
  async function loadAllData() {
    currentFoundationData = await SupabaseService.getFoundationData();
    currentFoundationTypes = await SupabaseService.getFoundationTypes();
    currentPriceSpecs = await SupabaseService.getPriceEstimatorSpecs();

    updateDbStatus();
    renderCards();
    renderToolsGrid();
    renderPilesGrid();
    renderSpecsTable();
    renderClearancesAndRaking();
    
    // Render New Sections
    renderExecutiveSummary();
    renderOnSiteGuide();
    renderChecklists();
    initCostEstimator();
    
    initCalculator();
    initSagCalculator();
  }

  // --- TAB NAVIGATION ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      const targetSec = document.getElementById(`tab-${targetTab}`);
      if (targetSec) targetSec.classList.add('active');
    });
  });

  // --- RENDER KNOWLEDGEBASE CARDS ---
  function renderCards() {
    if (!cardContainer) return;
    cardContainer.innerHTML = '';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = currentFoundationData.filter(item => {
      const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
      const matchesQuery = query === '' || 
        item.title.toLowerCase().includes(query) || 
        item.summary.toLowerCase().includes(query) ||
        (Array.isArray(item.details) && item.details.some(d => d.toLowerCase().includes(query))) ||
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
        <span class="card-tag">${item.categoryName || item.category}</span>
        <div class="card-icon">${item.icon || '📌'}</div>
        <h3>${item.title}</h3>
        <p class="summary">${item.summary}</p>
        <div class="card-footer">
          <span>แบบอ้างอิง: ${item.drawingNo || '-'}</span>
          <span>อ่านเพิ่ม ➔</span>
        </div>
      `;

      card.addEventListener('click', () => openModal(item));
      cardContainer.appendChild(card);
    });
  }

  // --- RENDER 57 TOOLS CATALOG ---
  function renderToolsGrid() {
    if (!toolsGrid || typeof toolsCatalogData === 'undefined') return;
    toolsGrid.innerHTML = '';

    const query = toolSearchInput ? toolSearchInput.value.toLowerCase().trim() : '';

    const filtered = toolsCatalogData.filter(tool => {
      const matchesCat = currentToolFilter === 'all' || tool.category === currentToolFilter;
      const matchesQ = query === '' ||
        tool.name.toLowerCase().includes(query) ||
        tool.usage.toLowerCase().includes(query) ||
        tool.caution.toLowerCase().includes(query) ||
        tool.maintenance.toLowerCase().includes(query);
      
      return matchesCat && matchesQ;
    });

    if (filtered.length === 0) {
      toolsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.7;">
          <p style="font-size: 1.2rem;">ไม่พบเครื่องมือที่ตรงกับคำค้นหา "${query}"</p>
        </div>
      `;
      return;
    }

    filtered.forEach(tool => {
      const card = document.createElement('div');
      card.classList.add('tool-card');
      card.innerHTML = `
        <div class="tool-header">
          <span class="tool-id-badge">ลำดับที่ ${tool.id}</span>
        </div>
        <h4>${tool.name}</h4>
        <div class="tool-info-section">
          <strong>⚙️ การใช้งาน:</strong> ${tool.usage}
        </div>
        <div class="caution-box">
          <strong>⚠️ ข้อควรระวัง:</strong> ${tool.caution}
        </div>
        <div class="maint-box">
          <strong>🛠️ การบำรุงรักษา:</strong> ${tool.maintenance}
        </div>
      `;
      toolsGrid.appendChild(card);
    });
  }

  // Tool Filters & Search
  if (toolFilterPills) {
    toolFilterPills.addEventListener('click', (e) => {
      if (e.target.classList.contains('pill')) {
        toolFilterPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        currentToolFilter = e.target.getAttribute('data-tool-filter');
        renderToolsGrid();
      }
    });
  }

  if (toolSearchInput) {
    toolSearchInput.addEventListener('input', renderToolsGrid);
  }

  // --- RENDER PILES GRID (4 TYPES) ---
  function renderPilesGrid() {
    if (!pilesGrid || typeof pileTypesData === 'undefined') return;

    pilesGrid.innerHTML = pileTypesData.map(pile => `
      <div class="pile-card">
        <span class="pile-badge">${pile.typeNo}</span>
        <h4>${pile.name}</h4>
        <ul class="pile-spec-list">
          <li><strong>⚡ ระบบสายดิน:</strong> ${pile.groundWire}</li>
          <li><strong>🛡️ เหล็กพิเศษหัวเข็ม:</strong> ${pile.specialHeadRebar}</li>
          <li><strong>📐 ขนาดเสาเข็ม:</strong> ${pile.dimensions}</li>
          <li><strong>💪 โมเมนต์ใช้งาน:</strong> ${pile.workingMoment}</li>
          <li><strong>📌 แบบมาตรฐาน:</strong> <code>${pile.drawingNo}</code></li>
        </ul>
        <p class="pile-desc">${pile.description}</p>
      </div>
    `).join('');
  }

  // --- RENDER CLEARANCES & RAKING ---
  function renderClearancesAndRaking() {
    const clearancesList = document.getElementById('clearancesList');
    const rakingList = document.getElementById('rakingList');

    if (clearancesList && typeof clearanceRulesData !== 'undefined') {
      clearancesList.innerHTML = clearanceRulesData.clearances.map(c => `
        <li class="spec-item-box">
          <strong>${c.title}</strong>
          <span style="font-size: 1.1rem; font-weight: 700; color: #2ed573;">กำหนดไว้ไม่น้อยกว่า: ${c.required}</span>
          <p style="font-size: 0.85rem; opacity: 0.85; margin-top: 0.3rem;">${c.detail}</p>
        </li>
      `).join('');
    }

    if (rakingList && typeof clearanceRulesData !== 'undefined') {
      rakingList.innerHTML = clearanceRulesData.raking.map(r => `
        <li class="spec-item-box">
          <strong>${r.type}</strong>
          <span style="font-size: 1.1rem; font-weight: 700; color: var(--secondary-color);">ระยะเอียงเผื่อ (Offset): ${r.offset}</span>
          <p style="font-size: 0.85rem; opacity: 0.85; margin-top: 0.3rem;">ทิศทาง: ${r.direction}</p>
        </li>
      `).join('');
    }
  }

  // --- RENDER EXECUTIVE SUMMARY ---
  function renderExecutiveSummary() {
    if (!summaryContainer || typeof executiveSummaryData === 'undefined') return;

    summaryContainer.innerHTML = executiveSummaryData.map(section => `
      <div class="summary-card">
        <h4>${section.topic}</h4>
        <ul class="summary-list">
          ${section.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // --- RENDER ON-SITE GUIDE ---
  function renderOnSiteGuide() {
    const onsiteGrid = document.getElementById('onsiteGrid');
    if (!onsiteGrid || typeof onSiteGuideData === 'undefined') return;
    
    onsiteGrid.innerHTML = onSiteGuideData.map(step => `
      <div class="onsite-card">
        <div class="step-badge">${step.step}</div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${step.icon}</div>
        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 1.1rem;">${step.task}</h4>
        <p style="font-size: 0.9rem; opacity: 0.9;">${step.details}</p>
      </div>
    `).join('');
  }

  // --- RENDER CHECKLISTS ---
  function renderChecklists() {
    const checklistsContainer = document.getElementById('checklistsContainer');
    if (!checklistsContainer || typeof checklistData === 'undefined') return;
    
    checklistsContainer.innerHTML = checklistData.map((category, idx) => `
      <div class="checklist-card">
        <h4>${category.category}</h4>
        <div class="checklist-items">
          ${category.items.map((item, i) => `
            <div class="check-item">
              <input type="checkbox" id="chk_${idx}_${i}">
              <label for="chk_${idx}_${i}">${item}</label>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // --- COST ESTIMATOR (FACTOR F) ---
  function initCostEstimator() {
    if (!selectMatFoundation || typeof costEstimationData === 'undefined') return;

    const foundations = costEstimationData.foundationPrices;
    const factorF = costEstimationData.factorF.standardValue;

    selectMatFoundation.innerHTML = foundations.map(f => `
      <option value="${f.code}">${f.code} - ${f.desc}</option>
    `).join('');

    function calculateCosts() {
      const fCode = selectMatFoundation.value;
      const qty = parseInt(inputMatQuantity.value) || 1;
      const foundation = foundations.find(f => f.code === fCode);
      if (!foundation) return;

      const matCost = foundation.mat * qty;
      const labCost = foundation.lab * qty;
      const baseCost = matCost + labCost;
      const totalNetPrice = Math.round(baseCost * factorF);

      resTotalNetPrice.textContent = \`\${totalNetPrice.toLocaleString('th-TH')} บาท\`;
      resBaseCost.textContent = \`\${baseCost.toLocaleString('th-TH')} บาท\`;
      resTotalMatCost.textContent = \`\${matCost.toLocaleString('th-TH')} บาท\`;
      resTotalLabCost.textContent = \`\${labCost.toLocaleString('th-TH')} บาท\`;
      resFactorF.textContent = \`\${factorF} (สำหรับค่างานต้นทุน \${baseCost.toLocaleString('th-TH')} บาท)\`;
    }

    selectMatFoundation.addEventListener('change', calculateCosts);
    inputMatQuantity.addEventListener('input', calculateCosts);

    calculateCosts();
  }

  // --- SAG & TENSION CALCULATOR (T = W * l^2 / 8s) ---
  function initSagCalculator() {
    if (!selectConductor || typeof sagConductorData === 'undefined') return;

    selectConductor.innerHTML = sagConductorData.map(c => `
      <option value="${c.id}">${c.name} (${c.desc})</option>
    `).join('');

    function calculateSag() {
      const condId = selectConductor.value;
      const span = parseFloat(inputSpan.value) || 80;
      const sag = parseFloat(inputSag.value) || 0.8;

      const cond = sagConductorData.find(c => c.id === condId);
      if (!cond || sag <= 0) return;

      // Formula: T = (W * l^2) / (8 * s)
      const tension = (cond.weightPerMeter * Math.pow(span, 2)) / (8 * sag);
      const roundedTension = Math.round(tension);

      resTension.textContent = `${roundedTension.toLocaleString('th-TH')} กก.`;
      resCondWeight.textContent = `${cond.weightPerMeter} กก./ม.`;
      resMaxTension.textContent = `${cond.maxTension.toLocaleString('th-TH')} กก.`;

      if (roundedTension <= cond.maxTension) {
        resSafetyStatus.textContent = "✓ ปลอดภัยตามพิกัดรับแรง";
        resSafetyStatus.style.color = "#2ed573";
      } else {
        resSafetyStatus.textContent = "⚠️ เกินพิกัดแรงดึงสูงสุด! ควรเพิ่มระยะ Sag";
        resSafetyStatus.style.color = "#ff4757";
      }
    }

    selectConductor.addEventListener('change', calculateSag);
    inputSpan.addEventListener('input', calculateSag);
    inputSag.addEventListener('input', calculateSag);

    calculateSag();
  }

  // --- FILTER PILLS ---
  if (filterPills) {
    filterPills.addEventListener('click', (e) => {
      if (e.target.classList.contains('pill')) {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');

        if (currentFilter === 'piles') {
          const pilesTabBtn = document.querySelector('.tab-btn[data-tab="piles"]');
          if (pilesTabBtn) pilesTabBtn.click();
        } else if (currentFilter === 'tools') {
          const toolsTabBtn = document.querySelector('.tab-btn[data-tab="tools"]');
          if (toolsTabBtn) toolsTabBtn.click();
        }
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

    specsBody.innerHTML = currentFoundationTypes.map(item => `
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

    selectModel.innerHTML = currentPriceSpecs.map(spec => `
      <option value="${spec.id}">${spec.name} (${spec.drawingNo})</option>
    `).join('');

    function calculate() {
      const specId = selectModel.value;
      const varyFactor = parseFloat(selectVary.value) || 0;
      const qty = parseInt(inputQuantity.value) || 1;

      const spec = currentPriceSpecs.find(s => s.id === specId);
      if (!spec) return;

      const depthMultiplier = 1 + (varyFactor * 0.15);

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

    calculate();
  }

  // --- MODAL FUNCTIONS ---
  function openModal(data) {
    modalTitle.innerHTML = `${data.icon || '📌'} ${data.title}`;
    
    const detailsArr = Array.isArray(data.details) ? data.details : [data.details];
    const detailsHtml = detailsArr.map(detail => `<li>${detail}</li>`).join('');
    modalContent.innerHTML = `
      <div style="margin-bottom: 1rem; font-weight: 600; color: var(--primary-color);">
        📌 เลขที่แบบมาตรฐานอ้างอิง: ${data.drawingNo || '-'}
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

  // --- SETTINGS MODAL & SUPABASE CONFIG ---
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      const { url, key } = SupabaseService.getConfig();
      supaUrl.value = url;
      supaKey.value = key;
      settingsModalOverlay.classList.add('active');
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModalOverlay.classList.remove('active');
    });
  }

  if (saveSupaBtn) {
    saveSupaBtn.addEventListener('click', async () => {
      const url = supaUrl.value.trim();
      const key = supaKey.value.trim();

      if (!url || !key) {
        alert("กรุณากรอกทั้ง Supabase URL และ Anon Key ครับ");
        return;
      }

      SupabaseService.saveConfig(url, key);
      alert("บันทึกการตั้งค่าแล้ว! กำลังเชื่อมต่อฐานข้อมูล Supabase...");
      settingsModalOverlay.classList.remove('active');

      await loadAllData();
    });
  }

  if (clearSupaBtn) {
    clearSupaBtn.addEventListener('click', async () => {
      localStorage.removeItem('PEA_SUPABASE_URL');
      localStorage.removeItem('PEA_SUPABASE_KEY');
      supaUrl.value = '';
      supaKey.value = '';
      SupabaseService.init();
      alert("ยกเลิกการเชื่อมต่อ Supabase แล้ว กลับไปใช้ข้อมูลสำรอง");
      settingsModalOverlay.classList.remove('active');

      await loadAllData();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (settingsModalOverlay) settingsModalOverlay.classList.remove('active');
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

  // Initial load
  await loadAllData();
});
