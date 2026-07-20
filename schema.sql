-- ========================================================
-- PEA Foundation Guide - Supabase Database Setup Script
-- วิธีใช้: คัดลอกข้อความทั้งหมดนี้ ไปวางใน Supabase -> SQL Editor แล้วกด Run
-- ========================================================

-- 1. สร้างตารางข้อกำหนดคู่มือ (foundation_data)
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

-- 2. สร้างตารางวิศวกรรมประเภทฐานราก (foundation_types)
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

-- 3. สร้างตารางสเปกและสูตรคำนวณราคาก่อสร้าง (price_estimator_specs)
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

-- เปิดใช้งาน Row Level Security (RLS) ให้ทุกคนอ่านข้อมูลได้ (Public Read)
ALTER TABLE public.foundation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_estimator_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Public Read Access" ON public.foundation_data FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Access" ON public.foundation_types FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Access" ON public.price_estimator_specs FOR SELECT USING (true);

-- อนุญาตให้เพิ่ม/แก้ไขข้อมูลได้ (Public Insert/Update)
CREATE POLICY "Allow Public Insert" ON public.foundation_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Insert" ON public.foundation_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Insert" ON public.price_estimator_specs FOR INSERT WITH CHECK (true);

-- 4. ใส่ข้อมูลเริ่มต้น (Seed Data)
INSERT INTO public.foundation_data (id, category, category_name, title, icon, summary, details, drawing_no) VALUES
('preparation', 'general', 'ข้อกำหนดทั่วไป', 'การเตรียมพื้นที่และคุณสมบัติรับน้ำหนัก', '🗺️', 'ข้อกำหนดกำลังรับน้ำหนักของดิน (Bearing Capacity) และการปรับปรุงก้นหลุม', '["พื้นที่ที่จะติดตั้งฐานราก ดินจะต้องสามารถรับน้ำหนักปลอดภัย (Allowable Soil Bearing Capacity) ได้ตั้งแต่ 12 ตัน/ตารางเมตร ขึ้นไป", "ก่อนทำการวางฐานรากสำเร็จรูป หรือก่อนผูกเหล็กเทคอนกรีต ให้ใช้ ทรายหยาบเทรองก้นหลุมแล้วบดอัดให้แน่น โดยมีความหนา 0.10 เมตร เสมอ", "กรณีพื้นที่ดินนิ่มหรือรับน้ำหนักได้น้อยกว่า 12 ตัน/ตารางเมตร ต้องใช้ฐานรากชนิดตอกเสาเข็มรองรับ (เช่น เสาเข็ม คอร. 0.44x0.44x8.50 ม.)"]', 'IB2-011/44009 - 44021'),
('material', 'general', 'ข้อกำหนดทั่วไป', 'มาตรฐานวัสดุและการผสมคอนกรีต', '🧱', 'สัดส่วนผสมคอนกรีต กำลังอัดประลัย และมาตรฐานปูนซีเมนต์', '["กำหนดให้ใช้ปูนซีเมนต์ปอร์ตแลนด์ประเภท 1 หรือ ประเภท 3 ตามมาตรฐาน มอก.15 (เช่น ตราช้าง, ตราเพชร, ตราพญานาคสีเขียว)", "คอนกรีตที่ใช้ต้องสามารถรับแรงอัดประลัยได้ไม่น้อยกว่า 180 กก./ตร.ซม. (ทดสอบด้วยรูปทรงกระบอก Cylinder) ที่อายุ 28 วัน", "หากเป็นการเทหล่อคอนกรีตที่หน้างาน (Cast in place) กำหนดให้อัตราส่วนผสมของ ซีเมนต์ : ทราย : หิน เท่ากับ 1 : 2 : 4 (โดยปริมาตร)", "เหล็กเสริมใช้เหล็กเส้นกลม (ROUND BAR) มอก.20 และเหล็กข้ออ้อย (DEFORMED BAR) มอก.24"]', 'มอก.15, มอก.20, มอก.24'),
('curing', 'general', 'ข้อกำหนดทั่วไป', 'การบ่มคอนกรีตและเงื่อนไขการรับแรง', '💧', 'ระยะเวลาการบ่มคอนกรีตให้ได้กำลังตามมาตรฐานก่อนติดตั้งเสา', '["หลังจากเทคอนกรีตฐานรากเสร็จทิ้งไว้ 24 ชั่วโมง จะต้องทำการบ่มคอนกรีตโดยให้ผิวเปียกชุ่มอยู่เสมอ", "กรณีใช้ปูนซีเมนต์ปอร์ตแลนด์ประเภท 1 ต้องบ่มอย่างน้อย 14 วัน", "กรณีใช้ปูนซีเมนต์ปอร์ตแลนด์ประเภท 3 ต้องบ่มอย่างน้อย 3 วัน", "ห้ามติดตั้งเสาหรือทำการยึดโยงรับแรง จนกว่าจะครบกำหนดระยะเวลาการบ่มตามประเภทของปูนซีเมนต์ที่ใช้"]', 'ข้อกำหนดการก่อสร้าง กฟภ.'),
('type_precast', 'precast', 'ฐานรากสำเร็จรูป', 'ฐานรากเสา คอร. ชนิดสำเร็จรูป (Precast Concrete Foundation)', '🧩', 'หล่อสำเร็จจากโรงงาน ยกติดตั้งได้ทันที สะดวกรวดเร็ว ลดเวลาหน้างาน', '["หล่อสำเร็จรูปทรงบล็อกคอนกรีตจากโรงงาน ควบคุมคุณภาพเนื้อคอนกรีตได้มาตรฐานสูง", "มีช่องว่างตรงกลางสำหรับเสียบโคนเสา คอร. 22 เมตร (ขนาดช่อง 0.60x1.00x2.00 ม.)", "ต้องเททรายหยาบอัดแน่น 0.10 ม. รองก้นหลุมก่อนนำฐานรากวางลงในหลุม", "เหมาะสำหรับงานก่อสร้างเร่งด่วนในพื้นที่ริมถนนหรือทางหลวง"]', 'IB2-011/44009, IB2-011/44014'),
('type_cast_in_place', 'cast_in_place', 'ฐานรากหล่อในที่', 'ฐานรากเสา คอร. แบบหล่อที่หน้างาน (Cast-in-Place Foundation)', '🚧', 'หล่อคอนกรีตในหลุมหน้างาน เหมาะกับพื้นที่ขนส่งยากหรือมีข้อจำกัด', '["ขุดหลุม ตั้งไม้แบบ ผูกเหล็กเสริมตามแบบแปลน และเทคอนกรีต ณ สถานที่ก่อสร้าง", "ใช้อัตราส่วนผสมคอนกรีต 1 : 2 : 4 (ซีเมนต์ : ทราย : หิน) กำลังอัดไม่น้อยกว่า 180 กก./ตร.ซม.", "ทิ้งไว้ 24 ชม. ก่อนเริ่มบ่มคอนกรีตเปียกชุ่มอย่างน้อย 14 วัน (ปูนประเภท 1)", "เหมาะสำหรับพื้นที่เข้าถึงยากที่รถเครนไม่สามารถยกวางฐานสำเร็จรูปได้"]', 'IB2-011/44010, IB2-011/44012'),
('type_anchor', 'anchor', 'สมอบกยึดโยง', 'ฐานรากสมอบกคอนกรีต (Concrete Anchor Foundation)', '⚓', 'บล็อกคอนกรีตฝังดินสำหรับยึดสายโยง (Guy Wire) ต้านทานแรงดึงเสา', '["ฝังก้านสมอบก (Anchor Rod) ขนาด M24 หรือ M16 ฝังในเนื้อคอนกรีตลึกตามมาตรฐาน", "ใช้ยึดลวดเหล็กตีเกลียว (Guy Wires) ขนาด 95 ตร.มม. หรือ 50 ตร.มม. รับแรงดึงสูงสุด 12 ตัน", "เททรายหยาบบดอัดแน่นรอบก้อนสมอบก และบดอัดดินกลบตามชั้นลึก", "ใช้สำหรับเสาต้นมุม เสาอวสาน หรือเสาที่มีแรงดึงสายด้านข้างสูง"]', 'IB2-011/42010 - 42013, SA1-015/43008')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.foundation_types (code, name, type, dimensions, concrete_vol, rebar_weight, bearing_capacity, usage, drawing_no) VALUES
('F1 / F5A', 'ฐานรากเสา คอร. 22 ม. เดี่ยว (No Pile / 2 Piles)', 'เสาเดี่ยว (Single Pole)', '0.90 x 1.40 x 3.00 ม.', '2.30 ลบ.ม.', '290 กก.', '≥ 12 ตัน/ม.²', 'ใช้สำหรับเสาเดี่ยวตรง ทั่วไปในสายส่งแรงสูง 115 kV', 'IB2-011/44009 / IB2-011/44010'),
('F2 / F3', 'ฐานรากเสา คอร. 22 ม. คู่ (No Pile / 3 Piles)', 'เสาคู่ (Double Pole)', '0.90 x 2.50 x 3.00 ม.', '5.80 ลบ.ม.', '640 กก.', '≥ 12 ตัน/ม.²', 'ใช้สำหรับเสาคู่ ต้นเข้าสถานี เสามุม หรือเสาแรงดึงสูง', 'IB2-011/44012 / IB2-011/44017'),
('F4 / F9', 'ฐานรากเสา คอร. 22 ม. คู่ (6 Piles / 8 Piles)', 'เสาคู่เข็มตอก (Piled Double Pole)', '1.00 x 3.20 x 0.50 ม. (ฐานเข็ม)', '7.40 - 14.10 ลบ.ม.', '702 - 1,220 กก.', 'ดินอ่อน (ตอกเสาเข็ม คอร. 0.44x0.44x8.50 ม.)', 'ใช้ในพื้นที่ดินนิ่ม ปรับต่างระดับ VARY สูงสุด 3.00 ม.', 'IB2-011/44018 / IB2-011/44021'),
('Anchor Type 9 / 10 / 11', 'ฐานรากสมอบกคอนกรีตยึดสายโยง', 'สมอบก (Concrete Anchor)', '0.90 x 1.50 x 2.00 ม. ถึง 0.90 x 3.50 x 2.50 ม.', '2.80 - 8.22 ลบ.ม.', 'ก้านสมอบก M24x2500 มม. + เหล็กเสริม', 'รับแรงดึงปลอดภัย ≥ 12 ตัน', 'ยึดสายยึดโยงลวดเหล็ก 95 ตร.มม. สำหรับเสาแรงดึงสูง/ข้ามแม่น้ำ', 'IB2-011/42010, IB2-011/42012, IB2-011/42013');

INSERT INTO public.price_estimator_specs (id, name, base_material_cost, base_labor_cost, concrete_unit_vol, rebar_unit_weight, formwork_unit_area, sand_unit_vol, drawing_no) VALUES
('f_single_nopile', 'ฐานรากเสาเดี่ยว คอร. 22ม. (หล่อที่หน้างาน - No Pile)', 13120, 4520, 2.30, 290, 19, 0.60, 'IB2-011/44009'),
('f_single_precast', 'ฐานรากเสาเดี่ยว คอร. 22ม. (ชนิดสำเร็จรูป)', 12130, 3962, 2.10, 290, 19, 0.60, 'IB2-011/44010'),
('f_double_nopile', 'ฐานรากเสาคู่ คอร. 22ม. (No Pile)', 25100, 8110, 5.80, 640, 27, 1.20, 'IB2-011/44012'),
('f_single_3piles', 'ฐานรากเสาเดี่ยว คอร. 22ม. (ตอกเสาเข็ม 3 ต้น - VARY 0.00ม.)', 39540, 14107, 4.80, 540, 24, 0.90, 'IB2-011/44020'),
('f_double_8piles', 'ฐานรากเสาคู่ คอร. 22ม. (ตอกเสาเข็ม 8 ต้น - VARY 0.00ม.)', 73520, 26748, 11.20, 1038, 42, 2.20, 'IB2-011/44021'),
('anchor_single', 'สมอบกคอนกรีตรับสายยึดโยง (สำหรับเสาเดี่ยว)', 8310, 2600, 2.80, 150, 11, 0.20, 'IB2-011/42013'),
('anchor_river', 'ฐานรากสมอบก คอร. พาดสายข้ามแม่น้ำ (22 kV)', 8032, 2224, 3.55, 180, 15, 0.30, 'IB1-015/25046')
ON CONFLICT (id) DO NOTHING;
