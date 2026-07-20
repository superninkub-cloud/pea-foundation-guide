-- ========================================================
-- PEA 115 kV Transmission Line Suite - Supabase Master Database
-- วิธีใช้: คัดลอกข้อความทั้งหมดนี้ ไปวางใน Supabase -> SQL Editor แล้วกด Run
-- ========================================================

-- 1. ตารางข้อกำหนดและเทคนิคการก่อสร้าง 115 kV (foundation_data)
CREATE TABLE IF NOT EXISTS public.foundation_data (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    summary TEXT NOT NULL,
    details JSONB NOT NULL,
    drawing_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ตารางวิศวกรรมสเปกประเภทฐานราก (foundation_types)
CREATE TABLE IF NOT EXISTS public.foundation_types (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    dimensions TEXT NOT NULL,
    concrete_vol TEXT NOT NULL,
    rebar_weight TEXT NOT NULL,
    bearing_capacity TEXT NOT NULL,
    usage TEXT NOT NULL,
    drawing_no TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ตารางสเปกและสูตรคำนวณราคาก่อสร้าง (price_estimator_specs)
CREATE TABLE IF NOT EXISTS public.price_estimator_specs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_material_cost NUMERIC NOT NULL,
    base_labor_cost NUMERIC NOT NULL,
    concrete_unit_vol NUMERIC NOT NULL,
    rebar_unit_weight NUMERIC NOT NULL,
    formwork_unit_area NUMERIC NOT NULL,
    sand_unit_vol NUMERIC NOT NULL,
    drawing_no TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ตารางคลังเครื่องมือก่อสร้าง 57 รายการ (tools_catalog)
CREATE TABLE IF NOT EXISTS public.tools_catalog (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    usage TEXT NOT NULL,
    caution TEXT NOT NULL,
    maintenance TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เปิดใช้งาน RLS (Row Level Security)
ALTER TABLE public.foundation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_estimator_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Public Read Access" ON public.foundation_data FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Access" ON public.foundation_types FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Access" ON public.price_estimator_specs FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Access" ON public.tools_catalog FOR SELECT USING (true);

CREATE POLICY "Allow Public Insert" ON public.foundation_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Insert" ON public.foundation_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Insert" ON public.price_estimator_specs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Insert" ON public.tools_catalog FOR INSERT WITH CHECK (true);

-- 5. Seed Data
INSERT INTO public.foundation_data (id, category, category_name, title, icon, summary, details, drawing_no) VALUES
('tech_ch1_tools', 'tools', 'เครื่องมือก่อสร้าง', 'เครื่องมือและอุปกรณ์ก่อสร้างสายส่ง 115 kV (57 รายการ)', '🧰', 'จำแนกเครื่องมือเป็น 4 กลุ่มหลัก: วางแนว, ฐานราก, ปักเสา และพาดสาย', '["กลุ่มที่ 1 เครื่องมือวางแนว: เทปวัดระยะ, เครื่องวัดระยะทาง, กล้องเล็งแนว Digital Theodolite, กล้องระดับ, ไม้โพลล์", "กลุ่มที่ 2 เครื่องมือก่อสร้างฐานราก: เครื่องตัดคอนกรีต, เครื่องเจาะกระแทก, เครื่องผสมคอนกรีต, ถังเทคอนกรีต, แบบเหล็ก, Sheet Piles", "กลุ่มที่ 3 เครื่องมือปักเสา: รถเครน (16 ตันขึ้นไป), รถแบ็คโฮ, คอฟฟิ่งฮอยส์, คัมอะลอง, สลิง, สเกน, หมวก/เข็มขัดนิรภัย", "กลุ่มที่ 4 เครื่องมือพาดสาย: รอกพาดสายเดี่ยว/คู่, เครื่องบีบไฮดรอลิก, วิทยุสื่อสาร, เชือกนำสาย, ไดนาโมมิเตอร์, เครื่องวัดกราวด์"]', 'คู่มือเทคนิค กฟภ. เล่ม 115 kV หน้า 1-1 ถึง 1-20'),
('tech_ch2_survey', 'survey', 'การวัดระยะเล็งแนว', 'การวัดระยะ เล็งแนว และการแก้ปัญหาอุปสรรคหน้างาน', '📐', 'ขั้นตอนการสำรวจ ตรวจสอบระดับดินเดิม การทำหมุดอ้างอิง และการปรับเปลี่ยนโครงสร้าง', '["ขุดและตรวจสอบระดับดินเดิมเทียบกับระดับผิวจราจร โดยตั้งไม้โพลล์ในรัศมี 1 เมตรจากจุดก่อสร้างจริง", "การทำหมุดอ้างอิง: สร้างแนวขนานแนวกลางฐานรากออกด้านซ้าย-ขวา ข้างละ 3 เมตร เพื่อใช้อ้างอิงตำแหน่งหลุมขุด", "การแก้ปัญหาอุปสรรค: หากระดับดินเปลี่ยน หรือติดสิ่งกีดขวาง (เช่น สะพาน, ท่อประปา, เขตทางหลวง) สามารถพิจารณาปรับเปลี่ยนชนิดฐานราก (เช่น เปลี่ยนจาก F6 เป็น F1/1 หรือ F6/4) โดยวิศวกรควบคุมงาน"]', 'รูปที่ 1-4 หน้า 2-7 ถึง 2-16'),
('tech_ch3_foundation', 'foundation_tech', 'งานก่อสร้างฐานราก', 'เทคนิคการก่อสร้างฐานราก ฐานเข็ม เทหุ้มโคน และสมอบก', '🏗️', 'ขั้นตอนการเข้าแบบหล่อ การดัดเหล็กเสริม คอนกรีตเทหุ้มโคน T1/T5 และสมอบก A1-A4', '["ฐานรากหล่อในที่ F6-F8: ขุดหลุม ลึกอย่างน้อย 2.70 ม. (รวมทรายหยาบอัดแน่น 10 ซม. คอนกรีตหยาบ 1:3:5 หนา 10 ซม.)", "เทหุ้มโคนเสา T1 / T5: สำหรับพื้นที่ทางเท้าหรือมีท่อระบายน้ำขวางแนว (T5 ขนาด 1.20x1.20x0.75 ม., T1 ขนาด 2.00x2.00x0.75 ม.) ปักเสาลึก 3.00 ม.", "สมอบกคอนกรีต A1-A4: ติดตั้งก้านสมอบก M24/M16 ฝังในคอนกรีตลึกตามมาตรฐาน บดอัดทรายหยาบและดินคืนรอบก้อนสมอบกทุกชั้น"]', 'แบบมาตรฐาน IB2-011/44009-44021, IB1-017/23058'),
('tech_ch4_erection', 'erection', 'งานปักเสา คอร.', 'การปักเสา คอร. 22 เมตร และการตั้งค่าเผื่อการเอียง (Raking)', '🚜', 'วิธีการใช้รถเครนยกปักเสา การรัดสลิง 2 จุด และตารางค่าเผื่อการเอียงเสาแต่ละชนิด', '["การยกเสา: ต้องใช้สลิงขนาด 3/4 นิ้ว ถักห่วงหัว-ท้ายความยาวตั้งแต่ 10 เมตรขึ้นไป รัดสลิงแบบสแปรค 2 จุด ห่างจากปลายเสาประมาณ 7-9 เมตร", "การปรับแนวตั้งฉาก: ใช้ลูกดิ่ง 3 ขา ตรวจสอบแนวตั้งดิ่งของเสาทั้งสองด้าน", "ตารางค่าเผื่อเอียง (Raking Allowances):\\n  • เสาทางตรง (TG): เอียง 12 - 15 ซม.\\n  • เสาทางโค้ง (SA): เอียง 0 - 25 ซม.\\n  • เสาคู่ไม่มีสายยึดโยง: เอียง 30 - 50 ซม.\\n  • เสาต้นก่อนเข้าทางโค้ง (AS): เอียง 20 - 25 ซม."]', 'รูปที่ 8-18 หน้า 4-8 ถึง 4-13'),
('tech_ch5_stringing', 'stringing', 'งานพาดสาย 115 kV', 'เทคนิคการพาดสาย 115 kV (Full Tension & Slack Span)', '⚡', '8 ขั้นตอนการพาดสายแบบรับแรงดึงเต็มพิกัด และสูตรคำนวณแรงดึง T = W*l²/8s', '["8 ขั้นตอนการพาดสาย Full Tension: 1. วางแผน 2. ตั้งรีลสาย 3. ติดรอกและพาดเชือกนำ 4. ลากสาย 5. แต่งสายดึง Sag 6. จับยึดสาย 7. เข้าเขี้ยวต่อสาย/สเปเซอร์ 8. ต่อสายดิน", "สายไฟฟ้า: ใช้สายอลูมิเนียมเปลือย 400 ตร.มม. และสายล่อฟ้า OHGW ลวดเหล็กตีเกลียว 35/95 ตร.มม.", "ระยะหย่อนยาน (Sag): คำนวณจากสูตร T = (W * l^2) / (8 * s) โดยปรับตามตารางอุณหภูมิ 35-40°C"]', 'SA02-015/19089, SA1-015/31061')
ON CONFLICT (id) DO NOTHING;

-- 6. ตารางบันทึกการตรวจสอบหน้างาน (construction_checklists) สำหรับพัฒนาต่อยอด
CREATE TABLE IF NOT EXISTS public.construction_checklists (
    id SERIAL PRIMARY KEY,
    project_name TEXT NOT NULL,
    checklist_category TEXT NOT NULL,
    item_description TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    checked_by TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ตารางบันทึกการสั่งวัสดุ (material_orders) สำหรับพัฒนาต่อยอด
CREATE TABLE IF NOT EXISTS public.material_orders (
    id SERIAL PRIMARY KEY,
    project_name TEXT NOT NULL,
    foundation_type TEXT NOT NULL,
    quantity INT NOT NULL,
    cement_bags INT NOT NULL,
    sand_cube NUMERIC NOT NULL,
    stone_cube NUMERIC NOT NULL,
    water_liters INT NOT NULL,
    ordered_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.construction_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Public Read Access" ON public.construction_checklists FOR SELECT USING (true);
CREATE POLICY "Allow Public Insert" ON public.construction_checklists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Read Access" ON public.material_orders FOR SELECT USING (true);
CREATE POLICY "Allow Public Insert" ON public.material_orders FOR INSERT WITH CHECK (true);
