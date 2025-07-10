-- Clean up existing data
TRUNCATE TABLE 
    "user",
    "manufacturer",
    "model",
    "model_variation",
    "body_style",
    "color",
    "vin_prefix",
    "vehicle_hierarchy_audit",
    "part_name",
    "part_category",
    "model_variation_category",
    "model_variation_to_category",
    "part",
    "category_part",
    "inventory",
    "part_alternative",
    "tag",
    "part_tag",
    "file"
CASCADE;

-- Reset sequences
ALTER SEQUENCE user_id_seq RESTART WITH 1;
ALTER SEQUENCE manufacturer_id_seq RESTART WITH 1;
ALTER SEQUENCE model_id_seq RESTART WITH 1;
ALTER SEQUENCE model_variation_id_seq RESTART WITH 1;
ALTER SEQUENCE body_style_id_seq RESTART WITH 1;
ALTER SEQUENCE color_id_seq RESTART WITH 1;
ALTER SEQUENCE vin_prefix_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicle_hierarchy_audit_id_seq RESTART WITH 1;
ALTER SEQUENCE part_name_id_seq RESTART WITH 1;
ALTER SEQUENCE part_category_id_seq RESTART WITH 1;
ALTER SEQUENCE model_variation_category_id_seq RESTART WITH 1;
ALTER SEQUENCE part_id_seq RESTART WITH 1;
ALTER SEQUENCE category_part_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_id_seq RESTART WITH 1;
ALTER SEQUENCE tag_id_seq RESTART WITH 1;
ALTER SEQUENCE file_id_seq RESTART WITH 1;

-- Insert sample user
INSERT INTO "user" (name, email, password) VALUES
('Admin User', 'admin@example.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm'); -- Password: password123

-- Insert body styles using enum values from schema
INSERT INTO body_style (code, name, category) VALUES
('Sedan', 'Sedan', 'Car'),
('Hatchback', 'Hatchback', 'Car'),
('SUV', 'Sport Utility Vehicle', 'Car'),
('Wagon', 'Station Wagon', 'Car'),
('Coupe', 'Coupe', 'Car'),
('Convertible', 'Convertible', 'Car'),
('Pickup', 'Pickup Truck', 'Truck'),
('Van', 'Van', 'Commercial'),
('Minivan', 'Minivan', 'Car'),
('Motorcycle', 'Motorcycle', 'Motorcycle'),
('Scooter', 'Scooter', 'Motorcycle'),
('ATV', 'All-Terrain Vehicle', 'ATV'),
('UTV', 'Utility Task Vehicle', 'UTV');

-- Insert colors with proper schema columns
INSERT INTO color (oem_code, name, hex_value, rgb_values) VALUES
-- Automotive colors
('040', 'Super White', '#FFFFFF', ARRAY[255, 255, 255]),
('1G3', 'Magnetic Gray Metallic', '#4A4A4A', ARRAY[74, 74, 74]),
('3T3', 'Ruby Flare Pearl', '#8B0000', ARRAY[139, 0, 0]),
('6X1', 'Blizzard Pearl', '#F8F8FF', ARRAY[248, 248, 255]),
('8X8', 'Blueprint', '#1E3A8A', ARRAY[30, 58, 138]),
-- Motorcycle colors
('R-343M', 'Grand Prix Red', '#C70000', ARRAY[199, 0, 0]),
('B-195C', 'Team Yamaha Blue', '#0066CC', ARRAY[0, 102, 204]),
('G-194M', 'Kawasaki Green', '#00A651', ARRAY[0, 166, 81]),
('O-245M', 'KTM Orange', '#FF6600', ARRAY[255, 102, 0]),
('BK-NH1', 'Jet Black', '#000000', ARRAY[0, 0, 0]),
-- Electric vehicle colors
('MSM', 'Midnight Silver Metallic', '#36454F', ARRAY[54, 69, 79]),
('PSR', 'Pearl White Multi-Coat', '#FEFEFE', ARRAY[254, 254, 254]);


-- Insert manufacturers (diverse vehicle types)
INSERT INTO manufacturer (public_id, name, display_name, slug, description, is_active, is_verified) VALUES
-- Automotive manufacturers
(gen_random_uuid(), 'Toyota', 'Toyota Motor Corporation', 'toyota', 'Japanese automotive manufacturer', true, true),
(gen_random_uuid(), 'Honda', 'Honda Motor Co., Ltd.', 'honda', 'Japanese automotive and motorcycle manufacturer', true, true),
(gen_random_uuid(), 'Ford', 'Ford Motor Company', 'ford', 'American automotive manufacturer', true, true),
(gen_random_uuid(), 'BMW', 'Bayerische Motoren Werke AG', 'bmw', 'German luxury automotive manufacturer', true, true),
(gen_random_uuid(), 'Tesla', 'Tesla, Inc.', 'tesla', 'American electric vehicle manufacturer', true, true),
-- Motorcycle manufacturers
(gen_random_uuid(), 'Yamaha', 'Yamaha Motor Co., Ltd.', 'yamaha', 'Japanese motorcycle manufacturer', true, true),
(gen_random_uuid(), 'Kawasaki', 'Kawasaki Heavy Industries', 'kawasaki', 'Japanese motorcycle manufacturer', true, true),
(gen_random_uuid(), 'Harley-Davidson', 'Harley-Davidson, Inc.', 'harley-davidson', 'American motorcycle manufacturer', true, true),
-- ATV manufacturers
(gen_random_uuid(), 'Polaris', 'Polaris Inc.', 'polaris', 'American powersports manufacturer', true, true),
(gen_random_uuid(), 'Can-Am', 'BRP Inc.', 'can-am', 'Canadian recreational vehicle manufacturer', true, true);

-- Insert models (diverse vehicle types)
INSERT INTO model (public_id, manufacturer_id, name, display_name, slug, vehicle_type, primary_markets, production_start, production_end, status, description) VALUES
-- Toyota models
(gen_random_uuid(), 1, 'Camry', 'Toyota Camry', 'camry', 'Sedan', ARRAY['NA', 'Asia']::market_region[], 2018, 2023, 'Active', 'Mid-size sedan'),
(gen_random_uuid(), 1, 'Prius', 'Toyota Prius', 'prius', 'Hatchback', ARRAY['NA', 'Europe']::market_region[], 2016, 2021, 'Active', 'Hybrid hatchback'),
(gen_random_uuid(), 1, 'RAV4', 'Toyota RAV4', 'rav4', 'SUV', ARRAY['NA', 'Europe']::market_region[], 2019, 2023, 'Active', 'Compact SUV'),
-- Honda models (automotive)
(gen_random_uuid(), 2, 'Civic', 'Honda Civic', 'civic', 'Sedan', ARRAY['NA', 'Europe']::market_region[], 2016, 2021, 'Active', 'Compact sedan'),
(gen_random_uuid(), 2, 'Accord', 'Honda Accord', 'accord', 'Sedan', ARRAY['NA']::market_region[], 2018, 2022, 'Active', 'Mid-size sedan'),
-- Honda motorcycles
(gen_random_uuid(), 2, 'CBR1000RR-R', 'Honda CBR1000RR-R Fireblade', 'cbr1000rr-r', 'Motorcycle', ARRAY['Global']::market_region[], 2020, 2023, 'Active', 'Superbike'),
(gen_random_uuid(), 2, 'CRF250R', 'Honda CRF250R', 'crf250r', 'Motorcycle', ARRAY['NA', 'Asia']::market_region[], 2018, 2022, 'Active', 'Motocross bike'),
-- Ford models
(gen_random_uuid(), 3, 'F-150', 'Ford F-150', 'f-150', 'Pickup', ARRAY['NA']::market_region[], 2018, 2023, 'Active', 'Full-size pickup truck'),
(gen_random_uuid(), 3, 'Mustang', 'Ford Mustang', 'mustang', 'Coupe', ARRAY['NA', 'Europe']::market_region[], 2018, 2022, 'Active', 'Sports car'),
-- BMW models
(gen_random_uuid(), 4, '3 Series', 'BMW 3 Series', '3-series', 'Sedan', ARRAY['Europe', 'NA', 'Asia']::market_region[], 2019, 2023, 'Active', 'Executive sedan'),
(gen_random_uuid(), 4, 'X5', 'BMW X5', 'x5', 'SUV', ARRAY['Europe', 'NA', 'Asia']::market_region[], 2019, 2022, 'Active', 'Mid-size luxury SUV'),
-- Tesla models
(gen_random_uuid(), 5, 'Model 3', 'Tesla Model 3', 'model-3', 'Sedan', ARRAY['NA', 'Europe', 'Asia']::market_region[], 2018, 2023, 'Active', 'Electric sedan'),
(gen_random_uuid(), 5, 'Model Y', 'Tesla Model Y', 'model-y', 'SUV', ARRAY['NA', 'Europe', 'Asia']::market_region[], 2020, 2023, 'Active', 'Electric SUV'),
-- Yamaha motorcycles
(gen_random_uuid(), 6, 'YZF-R6', 'Yamaha YZF-R6', 'yzf-r6', 'Motorcycle', ARRAY['Global']::market_region[], 2017, 2020, 'Active', 'Supersport motorcycle'),
-- Kawasaki motorcycles
(gen_random_uuid(), 7, 'Ninja ZX-10R', 'Kawasaki Ninja ZX-10R', 'ninja-zx-10r', 'Motorcycle', ARRAY['Global']::market_region[], 2018, 2021, 'Active', 'Superbike'),
-- Harley-Davidson
(gen_random_uuid(), 8, 'Street Glide', 'Harley-Davidson Street Glide', 'street-glide', 'Motorcycle', ARRAY['NA', 'Europe']::market_region[], 2018, 2022, 'Active', 'Touring motorcycle'),
-- Polaris ATVs
(gen_random_uuid(), 9, 'Sportsman 570', 'Polaris Sportsman 570', 'sportsman-570', 'ATV', ARRAY['NA']::market_region[], 2019, 2023, 'Active', 'Utility ATV'),
-- Can-Am ATVs
(gen_random_uuid(), 10, 'Outlander 650', 'Can-Am Outlander 650', 'outlander-650', 'ATV', ARRAY['NA', 'Europe']::market_region[], 2020, 2023, 'Active', 'Recreational ATV');

-- Insert model variations with updated schema fields
INSERT INTO model_variation (
    public_id, model_id, name, model_year, fuel_type, body_style_id, transmission_type, market_region, 
    default_color_id, trim_level, status, created_by, revision
) VALUES
-- Toyota Camry variations
(gen_random_uuid(), 1, 'Camry LE 2023', 2023, 'ICE', 1, 'CVT', 'NA', 1, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 1, 'Camry XSE 2023', 2023, 'ICE', 1, 'AT', 'NA', 2, 'Sport', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Toyota Prius (Hybrid)
(gen_random_uuid(), 2, 'Prius L Eco 2021', 2021, 'Hybrid', 2, 'CVT', 'NA', 4, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 2, 'Prius Prime 2021', 2021, 'PHEV', 2, 'CVT', 'NA', 1, 'Premium', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Toyota RAV4
(gen_random_uuid(), 3, 'RAV4 LE 2023', 2023, 'ICE', 3, 'CVT', 'NA', 2, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 3, 'RAV4 Hybrid XLE 2023', 2023, 'Hybrid', 3, 'CVT', 'NA', 3, 'Limited', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Honda Civic
(gen_random_uuid(), 4, 'Civic LX 2021', 2021, 'ICE', 1, 'CVT', 'NA', 1, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 4, 'Civic Type R 2021', 2021, 'ICE', 2, 'MT', 'NA', 6, 'Performance', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Honda Accord
(gen_random_uuid(), 5, 'Accord Sport 2022', 2022, 'ICE', 1, 'CVT', 'NA', 2, 'Sport', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 5, 'Accord Hybrid 2022', 2022, 'Hybrid', 1, 'CVT', 'NA', 1, 'Premium', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Honda CBR1000RR-R (Motorcycle)
(gen_random_uuid(), 6, 'CBR1000RR-R Fireblade 2023', 2023, 'ICE', 10, 'MT', 'Global', 6, 'Performance', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Honda CRF250R (Motorcycle)
(gen_random_uuid(), 7, 'CRF250R 2022', 2022, 'ICE', 10, 'MT', 'Global', 6, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Ford F-150
(gen_random_uuid(), 8, 'F-150 Regular Cab 2023', 2023, 'ICE', 7, 'AT', 'NA', 10, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 8, 'F-150 Lightning 2023', 2023, 'EV', 7, 'AT', 'NA', 1, 'Premium', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Ford Mustang
(gen_random_uuid(), 9, 'Mustang GT 2022', 2022, 'ICE', 5, 'MT', 'Global', 6, 'Performance', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 9, 'Mustang Convertible 2022', 2022, 'ICE', 6, 'AT', 'Global', 3, 'Premium', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- BMW 3 Series
(gen_random_uuid(), 10, '330i 2023', 2023, 'ICE', 1, 'AT', 'Global', 11, 'Luxury', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- BMW X5
(gen_random_uuid(), 11, 'X5 xDrive40i 2022', 2022, 'ICE', 3, 'AT', 'Global', 2, 'Luxury', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Tesla Model 3
(gen_random_uuid(), 12, 'Model 3 Standard Range 2023', 2023, 'EV', 1, 'AT', 'Global', 12, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
(gen_random_uuid(), 12, 'Model 3 Performance 2023', 2023, 'EV', 1, 'AT', 'Global', 10, 'Performance', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Tesla Model Y
(gen_random_uuid(), 13, 'Model Y Long Range 2023', 2023, 'EV', 3, 'AT', 'Global', 1, 'Premium', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Yamaha YZF-R6
(gen_random_uuid(), 14, 'YZF-R6 2020', 2020, 'ICE', 10, 'MT', 'Global', 7, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Kawasaki Ninja ZX-10R
(gen_random_uuid(), 15, 'Ninja ZX-10R 2021', 2021, 'ICE', 10, 'MT', 'Global', 8, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Harley-Davidson Street Glide
(gen_random_uuid(), 16, 'Street Glide Special 2022', 2022, 'ICE', 10, 'MT', 'Global', 10, 'Touring', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Polaris Sportsman ATV
(gen_random_uuid(), 17, 'Sportsman 570 EPS 2023', 2023, 'ICE', 12, 'CVT', 'NA', 8, 'Base', 'Active', '00000000-0000-0000-0000-000000000001', 1),
-- Can-Am Outlander ATV
(gen_random_uuid(), 18, 'Outlander 650 XT 2023', 2023, 'ICE', 12, 'CVT', 'Global', 6, 'Premium', 'Active', '00000000-0000-0000-0000-000000000001', 1);

-- Insert VIN prefixes
INSERT INTO vin_prefix (variation_id, prefix, prefix_length, description) VALUES
-- Toyota
(1, '4T1BF1FK5', 9, 'Camry LE 2023'),
(2, '4T1BF1FK6', 9, 'Camry XSE 2023'),
(3, 'JTMB3FEV1', 9, 'Prius L Eco 2021'),
(4, 'JTMB3FEV2', 9, 'Prius Prime 2021'),
(5, '2T3F1RFV5', 9, 'RAV4 LE 2023'),
(6, '2T3F1RFV6', 9, 'RAV4 Hybrid XLE 2023'),
-- Honda Cars
(7, '19XFC2F5', 8, 'Civic LX 2021'),
(8, '19XFC2F6', 8, 'Civic Type R 2021'),
(9, '1HGCV1F3', 8, 'Accord Sport 2022'),
(10, '1HGCV1F4', 8, 'Accord Hybrid 2022'),
-- Honda Motorcycles
(11, 'JH2SC8200', 9, 'CBR1000RR-R Fireblade 2023'),
(12, 'JH2ME1020', 9, 'CRF250R 2022'),
-- Ford
(13, '1FTFW1E5', 8, 'F-150 Regular Cab 2023'),
(14, '1FTFW1E6', 8, 'F-150 Lightning 2023'),
(15, '1FA6P8TH', 8, 'Mustang GT 2022'),
(16, '1FA6P8TJ', 8, 'Mustang Convertible 2022'),
-- BMW
(17, 'WBA8E1C0', 8, '330i 2023'),
(18, 'WBA8E1C1', 8, 'X5 xDrive40i 2022'),
-- Tesla
(19, '5YJ3E1EA', 8, 'Model 3 Standard Range 2023'),
(20, '5YJ3E1EB', 8, 'Model 3 Performance 2023'),
(21, '5YJYGDEE', 8, 'Model Y Long Range 2023'),
-- Yamaha
(22, 'JYARJ1200', 9, 'YZF-R6 2020'),
-- Kawasaki
(23, 'JKAZX1000', 9, 'Ninja ZX-10R 2021'),
-- Harley-Davidson
(24, '1HD1GZM1', 8, 'Street Glide Special 2022'),
-- Polaris
(25, '4XASP57A', 8, 'Sportsman 570 EPS 2023'),
-- Can-Am
(26, '3JBSDAA6', 8, 'Outlander 650 XT 2023');








-- Insert files for diagrams
INSERT INTO file (public_id, file_name, original_name, mime_type, file_size, file_path, bucket, provider, uploaded_by) VALUES
(gen_random_uuid(), 'engine-diagram.jpg', 'engine-diagram.jpg', 'image/jpeg', 1024, '/diagrams/engine-diagram.jpg', 'parts-diagrams', 'local', 1),
(gen_random_uuid(), 'transmission-diagram.jpg', 'transmission-diagram.jpg', 'image/jpeg', 1024, '/diagrams/transmission-diagram.jpg', 'parts-diagrams', 'local', 1),
(gen_random_uuid(), 'suspension-diagram.jpg', 'suspension-diagram.jpg', 'image/jpeg', 1024, '/diagrams/suspension-diagram.jpg', 'parts-diagrams', 'local', 1),
(gen_random_uuid(), 'electrical-diagram.jpg', 'electrical-diagram.jpg', 'image/jpeg', 1024, '/diagrams/electrical-diagram.jpg', 'parts-diagrams', 'local', 1),
(gen_random_uuid(), 'body-diagram.jpg', 'body-diagram.jpg', 'image/jpeg', 1024, '/diagrams/body-diagram.jpg', 'parts-diagrams', 'local', 1);

-- Insert part categories
INSERT INTO part_category (name, slug, description) VALUES
('Engine', 'engine', 'Engine components and related parts'),
('Transmission', 'transmission', 'Transmission and drivetrain components'),
('Suspension', 'suspension', 'Suspension and steering components'),
('Electrical', 'electrical', 'Electrical system components'),
('Body', 'body', 'Body panels and exterior components'),
('Interior', 'interior', 'Interior components and accessories'),
('Brakes', 'brakes', 'Brake system components'),
('Cooling', 'cooling', 'Cooling system components');

-- Insert model variation categories (diagrams)
INSERT INTO model_variation_category (public_id, category_id, major_group_id, file_id, part_list_image_id, display_order) VALUES
(gen_random_uuid(), 1, 'ENG', 1, 1, 1),  -- Engine category
(gen_random_uuid(), 2, 'TRANS', 2, 2, 2), -- Transmission category
(gen_random_uuid(), 3, 'SUSP', 3, 3, 3), -- Suspension category
(gen_random_uuid(), 4, 'ELEC', 4, 4, 4), -- Electrical category
(gen_random_uuid(), 5, 'BODY', 5, 5, 5), -- Body category
(gen_random_uuid(), 6, 'INT', NULL, NULL, 6), -- Interior category
(gen_random_uuid(), 7, 'BRAKE', NULL, NULL, 7), -- Brakes category
(gen_random_uuid(), 8, 'COOL', NULL, NULL, 8); -- Cooling category

-- Insert model variation to category relationships (sample for first few variations)
INSERT INTO model_variation_to_category (model_variation_id, category_id) VALUES
-- Toyota Camry LE (all categories)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Honda Civic LX (all categories)
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8),
-- Honda CBR1000RR-R (motorcycle categories)
(11, 1), (11, 4), (11, 7), (11, 8),
-- Tesla Model 3 (EV categories)
(19, 1), (19, 3), (19, 4), (19, 5), (19, 6), (19, 7),
-- Polaris ATV (ATV categories)
(25, 1), (25, 3), (25, 4), (25, 7);

-- Insert part names
INSERT INTO part_name (public_id, name, slug) VALUES
(gen_random_uuid(), 'Engine Block', 'engine-block'),
(gen_random_uuid(), 'Transmission Case', 'transmission-case'),
(gen_random_uuid(), 'Shock Absorber', 'shock-absorber'),
(gen_random_uuid(), 'Brake Pad', 'brake-pad'),
(gen_random_uuid(), 'Headlight Assembly', 'headlight-assembly'),
(gen_random_uuid(), 'Seat Cover', 'seat-cover'),
(gen_random_uuid(), 'Air Filter', 'air-filter'),
(gen_random_uuid(), 'Oil Filter', 'oil-filter'),
(gen_random_uuid(), 'Radiator', 'radiator'),
(gen_random_uuid(), 'Alternator', 'alternator');

-- Insert parts
INSERT INTO part (public_id, part_name_id, part_number, description) VALUES
(gen_random_uuid(), 1, 'T-11401-0H010', 'Engine Block Assembly - 2.5L'),
(gen_random_uuid(), 2, 'H-20011-RBB-000', 'CVT Transmission Case'),
(gen_random_uuid(), 3, 'F-3C34-18045-AA', 'Front Shock Absorber'),
(gen_random_uuid(), 4, 'T-04465-02140', 'Front Brake Pad Set'),
(gen_random_uuid(), 5, 'B-63117182520', 'LED Headlight Assembly'),
(gen_random_uuid(), 6, 'T-71072-06140', 'Driver Seat Cover'),
(gen_random_uuid(), 7, 'T-17801-21050', 'Engine Air Filter Element'),
(gen_random_uuid(), 8, 'T-15400-RTA-003', 'Engine Oil Filter'),
(gen_random_uuid(), 9, 'T-16400-0H050', 'Radiator Assembly'),
(gen_random_uuid(), 10, 'H-31100-RCA-A02', 'Alternator Assembly');

-- Insert category parts with coordinates
INSERT INTO category_part (model_variation_category_id, part_id, reference_number, reference_label, coordinates) VALUES
(1, 1, 1, 'Engine Block', '{"x": 200, "y": 300}'),
(1, 7, 2, 'Air Filter', '{"x": 150, "y": 200}'),
(1, 8, 3, 'Oil Filter', '{"x": 250, "y": 350}'),
(2, 2, 1, 'Transmission', '{"x": 300, "y": 400}'),
(3, 3, 1, 'Shock Absorber', '{"x": 100, "y": 500}'),
(4, 5, 1, 'Headlight', '{"x": 50, "y": 100}'),
(4, 10, 2, 'Alternator', '{"x": 180, "y": 320}'),
(5, 6, 1, 'Seat Cover', '{"x": 200, "y": 250}'),
(7, 4, 1, 'Brake Pad', '{"x": 120, "y": 450}'),
(8, 9, 1, 'Radiator', '{"x": 200, "y": 150}');

-- Insert inventory
INSERT INTO inventory (part_id, quantity, price, cost, reorder_level, location) VALUES
(1, 5, '2500.00', '1800.00', 2, 'A1-01'),
(2, 3, '3200.00', '2400.00', 1, 'B2-03'),
(3, 25, '150.00', '90.00', 10, 'C3-05'),
(4, 50, '85.00', '50.00', 20, 'D1-01'),
(5, 15, '320.00', '200.00', 5, 'A2-04'),
(6, 30, '120.00', '70.00', 10, 'E1-01'),
(7, 100, '35.00', '20.00', 50, 'F2-02'),
(8, 80, '25.00', '15.00', 40, 'G3-03'),
(9, 12, '450.00', '300.00', 5, 'H4-04'),
(10, 20, '280.00', '180.00', 8, 'I5-05');


-- Insert part alternatives
INSERT INTO part_alternative (original_part_id, alternative_part_id) VALUES
(7, 8), -- Air filter alternative to oil filter
(3, 4), -- Shock absorber alternative to brake pad
(5, 10); -- Headlight alternative to alternator

-- Insert tags
INSERT INTO tag (name, slug, color) VALUES
('OEM', 'oem', '#0066CC'),
('Performance', 'performance', '#FF6600'),
('Maintenance', 'maintenance', '#00AA00'),
('High Wear', 'high-wear', '#CC0000'),
('Electrical', 'electrical', '#9933FF'),
('Engine', 'engine', '#CC6600'),
('Suspension', 'suspension', '#006666'),
('Universal', 'universal', '#666666');

-- Insert part tags
INSERT INTO part_tag (part_id, tag_id) VALUES
(1, 1), (1, 6),
(2, 1), (2, 2),
(3, 1), (3, 7),
(4, 3), (4, 4),
(5, 1), (5, 5),
(6, 1),
(7, 3), (7, 8),
(8, 3), (8, 4),
(9, 1), (9, 6),
(10, 1), (10, 5); 