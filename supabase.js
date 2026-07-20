// Supabase Database Connection & Service Module
const SupabaseService = {
  client: null,
  isConfigured: false,

  // อ่านการตั้งค่าจาก LocalStorage
  getConfig() {
    return {
      url: localStorage.getItem('PEA_SUPABASE_URL') || '',
      key: localStorage.getItem('PEA_SUPABASE_KEY') || ''
    };
  },

  // บันทึกการตั้งค่าลง LocalStorage
  saveConfig(url, key) {
    localStorage.setItem('PEA_SUPABASE_URL', url.trim());
    localStorage.setItem('PEA_SUPABASE_KEY', key.trim());
    return this.init();
  },

  // เริ่มต้นสร้าง Supabase Client
  init() {
    const { url, key } = this.getConfig();
    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isConfigured = true;
        console.log("⚡ Supabase Client initialized successfully.");
        return true;
      } catch (err) {
        console.warn("⚠️ Failed to initialize Supabase client:", err);
        this.isConfigured = false;
        return false;
      }
    }
    this.isConfigured = false;
    return false;
  },

  // ดึงข้อมูล Foundation Data จาก Supabase (พร้อม Fallback)
  async getFoundationData() {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('foundation_data')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          // แปลงกลับเป็นฟอร์แมตหลัก
          return data.map(item => ({
            id: item.id,
            category: item.category,
            categoryName: item.category_name,
            title: item.title,
            icon: item.icon,
            summary: item.summary,
            details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details,
            drawingNo: item.drawing_no
          }));
        }
      } catch (err) {
        console.warn("⚠️ Supabase fetch error, using local fallback data:", err);
      }
    }
    // ใช้ข้อมูลสำรองจาก data.js
    return typeof foundationData !== 'undefined' ? foundationData : [];
  },

  // ดึงข้อมูล Foundation Types จาก Supabase (พร้อม Fallback)
  async getFoundationTypes() {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('foundation_types')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            code: item.code,
            name: item.name,
            type: item.type,
            dimensions: item.dimensions,
            concreteVol: item.concrete_vol,
            rebarWeight: item.rebar_weight,
            bearingCapacity: item.bearing_capacity,
            usage: item.usage,
            drawingNo: item.drawing_no
          }));
        }
      } catch (err) {
        console.warn("⚠️ Supabase fetch error, using local fallback types:", err);
      }
    }
    return typeof foundationTypes !== 'undefined' ? foundationTypes : [];
  },

  // ดึงข้อมูล Price Estimator Specs จาก Supabase (พร้อม Fallback)
  async getPriceEstimatorSpecs() {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('price_estimator_specs')
          .select('*');

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            baseMaterialCost: parseFloat(item.base_material_cost),
            baseLaborCost: parseFloat(item.base_labor_cost),
            concreteUnitVol: parseFloat(item.concrete_unit_vol),
            rebarUnitWeight: parseFloat(item.rebar_unit_weight),
            formworkUnitArea: parseFloat(item.formwork_unit_area),
            sandUnitVol: parseFloat(item.sand_unit_vol),
            drawingNo: item.drawing_no
          }));
        }
      } catch (err) {
        console.warn("⚠️ Supabase fetch error, using local fallback specs:", err);
      }
    }
    return typeof priceEstimatorSpecs !== 'undefined' ? priceEstimatorSpecs : [];
  },

  // ฟังก์ชันสำหรับเพิ่มข้อมูลใหม่ลง Supabase
  async insertFoundationData(item) {
    if (!this.isConfigured || !this.client) {
      throw new Error("กรุณาเชื่อมต่อ Supabase URL และ Key ก่อนเพิ่มข้อมูล");
    }

    const { data, error } = await this.client
      .from('foundation_data')
      .insert([{
        id: item.id || `custom_${Date.now()}`,
        category: item.category,
        category_name: item.categoryName,
        title: item.title,
        icon: item.icon || '📌',
        summary: item.summary,
        details: item.details,
        drawing_no: item.drawingNo
      }]);

    if (error) throw error;
    return data;
  }
};

// Initial check on load
document.addEventListener('DOMContentLoaded', () => {
  SupabaseService.init();
});
