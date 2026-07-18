-- ==========================================================================
-- SMART ATTENDANCE PORTAL — SUPABASE POSTGRESQL DATABASE SCHEMA
-- Separate Student and Admin panels, 2-Session Attendance, Geolocation & WebAuthn
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT DEFAULT 'Portal Administrator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_ticket_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mobile_number TEXT DEFAULT '9876543210',
  password TEXT NOT NULL,
  department TEXT DEFAULT 'CSE',
  section TEXT DEFAULT 'A',
  year TEXT DEFAULT '2nd Year',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_1_status TEXT DEFAULT 'Pending' CHECK (session_1_status IN ('Present', 'Absent', 'Pending')),
  session_1_time TIMESTAMPTZ,
  session_2_status TEXT DEFAULT 'Pending' CHECK (session_2_status IN ('Present', 'Absent', 'Pending')),
  session_2_time TIMESTAMPTZ,
  day_status TEXT DEFAULT 'Absent' CHECK (day_status IN ('Present', 'Absent', 'Pending')),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE (student_id, date)
);

-- 4. Settings Table (Campus Geolocation & Session Windows)
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  campus_latitude NUMERIC(10, 6) DEFAULT 17.406500,
  campus_longitude NUMERIC(10, 6) DEFAULT 78.477200,
  radius_meters INTEGER DEFAULT 500,
  location_check_enabled BOOLEAN DEFAULT true,
  session_1_start TEXT DEFAULT '09:00',
  session_1_end TEXT DEFAULT '13:00',
  session_2_start TEXT DEFAULT '14:00',
  session_2_end TEXT DEFAULT '17:00',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WebAuthn Biometric Credentials Table
CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  transports TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow API access to admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow API access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow API access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow API access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow API access to webauthn_credentials" ON public.webauthn_credentials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow API access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================================
-- SEED INITIAL SETTINGS & ADMIN ACCOUNT
-- ==========================================================================
INSERT INTO public.settings (id, campus_latitude, campus_longitude, radius_meters, location_check_enabled, session_1_start, session_1_end, session_2_start, session_2_end)
VALUES (1, 17.406500, 78.477200, 500, true, '09:00', '13:00', '14:00', '17:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admins (username, password, name)
VALUES ('admin', crypt('admin123', gen_salt('bf')), 'Principal & Admin')
ON CONFLICT (username) DO NOTHING;

-- ==========================================================================
-- SEED ALL 65 EXACT STUDENTS (Password = Hall Ticket Number)
-- ==========================================================================
INSERT INTO public.students (hall_ticket_number, name, password, department, section, year, mobile_number)
VALUES
  ('24Q91A05AA', 'Bollam Yashwanth', crypt('24Q91A05AA', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543201'),
  ('24Q91A05AB', 'C Harthik', crypt('24Q91A05AB', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543202'),
  ('24Q91A05AC', 'Ch Praveen Raju', crypt('24Q91A05AC', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543203'),
  ('24Q91A05AD', 'Challa Rishitha', crypt('24Q91A05AD', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543204'),
  ('24Q91A05AE', 'Chinnolla Pravallika', crypt('24Q91A05AE', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543205'),
  ('24Q91A05AF', 'Dage Mallika', crypt('24Q91A05AF', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543206'),
  ('24Q91A05AG', 'Daravath Sravani', crypt('24Q91A05AG', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543207'),
  ('24Q91A05AH', 'Dasari Kiran', crypt('24Q91A05AH', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543208'),
  ('24Q91A05AJ', 'Deeravath Jagadish Nayak', crypt('24Q91A05AJ', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543209'),
  ('24Q91A05AK', 'Dheeravath Tinku', crypt('24Q91A05AK', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543210'),
  ('24Q91A05AL', 'G Keerthi', crypt('24Q91A05AL', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543211'),
  ('24Q91A05AM', 'Gorribanda Anitha', crypt('24Q91A05AM', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543212'),
  ('24Q91A05AP', 'Gudam Akshaya', crypt('24Q91A05AP', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543213'),
  ('24Q91A05AR', 'Jummula Abishai', crypt('24Q91A05AR', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543214'),
  ('24Q91A05AT', 'Jeela Alekhya', crypt('24Q91A05AT', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543215'),
  ('24Q91A05AU', 'K Sai Chandra', crypt('24Q91A05AU', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543216'),
  ('24Q91A05AV', 'Kalyankar Saiteja', crypt('24Q91A05AV', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543217'),
  ('24Q91A05AW', 'Kanikatla Nishad', crypt('24Q91A05AW', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543218'),
  ('24Q91A05AX', 'Karipe Praneeth', crypt('24Q91A05AX', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543219'),
  ('24Q91A05AY', 'Katigher Vaagdevi', crypt('24Q91A05AY', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543220'),
  ('24Q91A05AZ', 'Kola Aparna', crypt('24Q91A05AZ', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543221'),
  ('24Q91A05BA', 'Konda Lakshmi', crypt('24Q91A05BA', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543222'),
  ('24Q91A05BB', 'Kota Nandini', crypt('24Q91A05BB', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543223'),
  ('24Q91A05BC', 'Kota Shashanth', crypt('24Q91A05BC', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543224'),
  ('24Q91A05BD', 'Kotagiri Rakesh', crypt('24Q91A05BD', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543225'),
  ('24Q91A05BE', 'Kukkarikalla Kalyani', crypt('24Q91A05BE', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543226'),
  ('24Q91A05BF', 'Lalagari Harika', crypt('24Q91A05BF', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543227'),
  ('24Q91A05BG', 'Madunagula Jyoshna', crypt('24Q91A05BG', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543228'),
  ('24Q91A05BJ', 'Mandru Susun', crypt('24Q91A05BJ', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543229'),
  ('24Q91A05BK', 'Maryada Keerthi', crypt('24Q91A05BK', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543230'),
  ('24Q91A05BL', 'Medi Deepthi Sree', crypt('24Q91A05BL', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543231'),
  ('24Q91A05BM', 'Mekala Hayanth', crypt('24Q91A05BM', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543232'),
  ('24Q91A05BN', 'Miriyala V S D S Mukunda Sharma', crypt('24Q91A05BN', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543233'),
  ('24Q91A05BP', 'Mohammad Abrar', crypt('24Q91A05BP', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543234'),
  ('24Q91A05BQ', 'Mohammad Saif Parvez', crypt('24Q91A05BQ', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543235'),
  ('24Q91A05BT', 'Nomula Bhaskar', crypt('24Q91A05BT', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543236'),
  ('24Q91A05BU', 'Nuthanapati Navadeep', crypt('24Q91A05BU', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543237'),
  ('24Q91A05BV', 'P Vinay Tagore Goud', crypt('24Q91A05BV', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543238'),
  ('24Q91A05BW', 'Paladugu Signari', crypt('24Q91A05BW', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543239'),
  ('24Q91A05BX', 'Peddinti Prashanth Kumar', crypt('24Q91A05BX', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543240'),
  ('24Q91A05BY', 'Rampalli Manoj Kumar', crypt('24Q91A05BY', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543241'),
  ('24Q91A05BZ', 'Rayala Karthikeya', crypt('24Q91A05BZ', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543242'),
  ('24Q91A05CA', 'Shaik Behad Sayanaa', crypt('24Q91A05CA', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543243'),
  ('24Q91A05CB', 'Shaik Nishat', crypt('24Q91A05CB', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543244'),
  ('24Q91A05CC', 'Singarapu Prem', crypt('24Q91A05CC', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543245'),
  ('24Q91A05CD', 'Sunkara Mohan Anji Reddy', crypt('24Q91A05CD', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543246'),
  ('24Q91A05CE', 'Talari Raj Kumar', crypt('24Q91A05CE', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543247'),
  ('24Q91A05CF', 'Tejavath Arun', crypt('24Q91A05CF', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543248'),
  ('24Q91A05CG', 'Thumkunta Sai Pavan Goud', crypt('24Q91A05CG', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543249'),
  ('24Q91A05CH', 'V Charitha', crypt('24Q91A05CH', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543250'),
  ('24Q91A05CJ', 'Vankudoth Sathish', crypt('24Q91A05CJ', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543251'),
  ('24Q91A05CK', 'Yabnod Shivprasad', crypt('24Q91A05CK', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543252'),
  ('24Q91A05CL', 'Yedla Gnanavyshnavi', crypt('24Q91A05CL', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543253'),
  ('24Q91A05Z4', 'Anumala Sidvitha', crypt('24Q91A05Z4', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543254'),
  ('24Q91A05Z5', 'Askani Sinduja', crypt('24Q91A05Z5', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543255'),
  ('24Q91A05Z6', 'Avadhanam Parthiv Kumar', crypt('24Q91A05Z6', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543256'),
  ('24Q91A05Z7', 'Avula Karthikeya', crypt('24Q91A05Z7', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543257'),
  ('24Q91A05Z9', 'Banoth Sandeep', crypt('24Q91A05Z9', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543258'),
  ('25Q95A0532', 'Jagarla Anshith', crypt('25Q95A0532', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543259'),
  ('25Q95A0533', 'Manda Meghana', crypt('25Q95A0533', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543260'),
  ('25Q95A0534', 'Nakka Surya Narayana', crypt('25Q95A0534', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543261'),
  ('25Q95A0535', 'Putukam Maruthi', crypt('25Q95A0535', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543262'),
  ('25Q95A0536', 'Ramavath Yashwanth', crypt('25Q95A0536', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543263'),
  ('25Q95A0537', 'Sirigiri Lavanya', crypt('25Q95A0537', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543264'),
  ('25Q95A0538', 'Rebba Manaswini', crypt('25Q95A0538', gen_salt('bf')), 'CSE', 'A', '2nd Year', '9876543265')
ON CONFLICT (hall_ticket_number) DO NOTHING;
