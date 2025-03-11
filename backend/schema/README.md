# คู่มือการจัดการตารางใน TiDB

เอกสารนี้อธิบายแนวทางในการจัดการตารางและโครงสร้างฐานข้อมูลสำหรับ TiDB ให้มีประสิทธิภาพสูงสุด

## สารบัญ

1. [หลักการออกแบบตาราง](#หลักการออกแบบตาราง)
2. [การตั้งค่า Primary Key](#การตั้งค่า-primary-key)
3. [การจัดการดัชนี (Indexes)](#การจัดการดัชนี-indexes)
4. [การแบ่งพาร์ทิชัน (Partitioning)](#การแบ่งพาร์ทิชัน-partitioning)
5. [การเลือกชนิดข้อมูล (Data Types)](#การเลือกชนิดข้อมูล-data-types)
6. [การจัดการตารางขนาดใหญ่](#การจัดการตารางขนาดใหญ่)
7. [เครื่องมือจัดการตาราง](#เครื่องมือจัดการตาราง)

## หลักการออกแบบตาราง

TiDB เป็นฐานข้อมูลแบบกระจาย (Distributed Database) ที่มีความเข้ากันได้กับ MySQL แต่มีการจัดการข้อมูลในรูปแบบพิเศษ มีหลักการออกแบบที่สำคัญดังนี้:

### 1. ข้อแตกต่างจาก MySQL ที่ควรทราบ

- TiDB ใช้ TiKV เป็นที่เก็บข้อมูลแบบกระจาย (Distributed KV Storage)
- TiDB รองรับการทำธุรกรรม (Transaction) แบบกระจาย แต่มีข้อจำกัดบางประการ
- TiDB เหมาะกับการอ่านข้อมูลขนาดใหญ่และการเก็บข้อมูลแบบ OLAP (Online Analytical Processing)

### 2. แนวทางการออกแบบทั่วไป

- ออกแบบตารางให้ง่ายต่อการอ่านและค้นหา
- ลดความซับซ้อนของความสัมพันธ์ระหว่างตาราง
- คำนึงถึงการเติบโตของข้อมูลในอนาคต
- คำนึงถึงรูปแบบการใช้งานข้อมูล (Access Patterns)

## การตั้งค่า Primary Key

การเลือก Primary Key ที่เหมาะสมเป็นสิ่งสำคัญมากสำหรับ TiDB เนื่องจาก TiDB จัดเก็บข้อมูลตาม Primary Key

### ข้อแนะนำในการตั้ง Primary Key

- **ใช้คอลัมน์ที่มีค่าเพิ่มขึ้นอย่างต่อเนื่อง**: เช่น AUTO_INCREMENT
- **หลีกเลี่ยงการใช้ UUID เป็น Primary Key โดยตรง**: UUID มีการกระจายตัวสูง ทำให้ข้อมูลกระจายไปทั่ว TiKV และมีประสิทธิภาพต่ำ
- **ไม่ควรอัพเดท Primary Key**: การอัพเดท Primary Key จะทำให้เกิดการย้ายข้อมูลใน TiKV ซึ่งมีต้นทุนสูง
- **ไม่ควรใช้คอลัมน์ที่มีการอัพเดทบ่อยเป็น Primary Key**

### ตัวอย่างที่ดี

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ตัวอย่างที่ควรหลีกเลี่ยง

```sql
CREATE TABLE events (
  id CHAR(36) PRIMARY KEY,  -- UUID ไม่เหมาะสำหรับเป็น Primary Key
  event_name VARCHAR(255) NOT NULL,
  event_data JSON
);
```

## การจัดการดัชนี (Indexes)

การสร้างดัชนีที่เหมาะสมช่วยเพิ่มประสิทธิภาพในการค้นหาข้อมูล แต่ต้องระวังผลกระทบต่อการเขียนข้อมูล

### ข้อแนะนำในการสร้างดัชนี

- **สร้างดัชนีสำหรับคอลัมน์ที่ใช้ในการค้นหาบ่อย**
- **ใช้ Composite Indexes สำหรับการค้นหาด้วยหลายเงื่อนไข**
- **ไม่ควรสร้างดัชนีมากเกินไป**: ดัชนีมากเกินไปจะทำให้การเขียนข้อมูลช้าลง
- **ใช้ Covering Indexes**: สร้างดัชนีที่ครอบคลุมคอลัมน์ที่ต้องการดึงข้อมูล

### ตัวอย่างการสร้างดัชนี

```sql
-- ดัชนีสำหรับคอลัมน์เดียว
CREATE INDEX idx_pm25_location ON pm25_data (location);

-- Composite Index สำหรับหลายคอลัมน์
CREATE INDEX idx_pm25_loc_time ON pm25_data (location, timestamp);

-- Covering Index
CREATE INDEX idx_pm25_search ON pm25_data (location, timestamp, value);
```

## การแบ่งพาร์ทิชัน (Partitioning)

การแบ่งพาร์ทิชันช่วยในการจัดการข้อมูลขนาดใหญ่และปรับปรุงประสิทธิภาพ

### ประเภทของการแบ่งพาร์ทิชันใน TiDB

- **Range Partitioning**: แบ่งตามช่วงของค่า เช่น ช่วงวันที่
- **Hash Partitioning**: แบ่งโดยใช้ฟังก์ชัน Hash เพื่อกระจายข้อมูล
- **List Partitioning**: แบ่งตามค่าที่กำหนด (รองรับใน TiDB 4.0 ขึ้นไป)

### ตัวอย่างการแบ่ง Range Partitioning

```sql
CREATE TABLE pm25_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value FLOAT NOT NULL,
  location VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL
)
PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
  PARTITION p2022 VALUES LESS THAN (UNIX_TIMESTAMP('2023-01-01 00:00:00')),
  PARTITION p2023 VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01 00:00:00')),
  PARTITION future VALUES LESS THAN MAXVALUE
);
```

### ตัวอย่างการแบ่ง Hash Partitioning

```sql
CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sensor_id INT NOT NULL,
  value FLOAT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
PARTITION BY HASH(sensor_id) PARTITIONS 4;
```

## การเลือกชนิดข้อมูล (Data Types)

การเลือกชนิดข้อมูลที่เหมาะสมช่วยประหยัดพื้นที่และเพิ่มประสิทธิภาพ

### ข้อแนะนำในการเลือกชนิดข้อมูล

- **ใช้ชนิดข้อมูลที่เล็กที่สุดที่เพียงพอ**: เช่น ใช้ INT แทน BIGINT เมื่อไม่จำเป็น
- **ระบุขนาดคอลัมน์ VARCHAR ให้เหมาะสม**: ไม่ควรกำหนดขนาดใหญ่เกินความจำเป็น
- **ใช้ TIMESTAMP แทน DATETIME เมื่อเป็นไปได้**: TIMESTAMP ใช้พื้นที่น้อยกว่า
- **ใช้ DECIMAL สำหรับค่าเงิน**: ไม่ควรใช้ FLOAT หรือ DOUBLE สำหรับข้อมูลทางการเงิน
- **ใช้ TINYINT(1) สำหรับข้อมูล Boolean**

### ตัวอย่างการเลือกชนิดข้อมูลที่เหมาะสม

```sql
CREATE TABLE optimized_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
```

## การจัดการตารางขนาดใหญ่

เมื่อตารางมีข้อมูลขนาดใหญ่ ควรมีกลยุทธ์ในการจัดการให้เหมาะสม

### กลยุทธ์การจัดการข้อมูลขนาดใหญ่

1. **การแบ่งพาร์ทิชัน**: แบ่งตารางออกเป็นส่วนย่อยตามช่วงเวลาหรือเงื่อนไขอื่นๆ
2. **การแยกข้อมูลเก่า (Archiving)**: ย้ายข้อมูลเก่าไปเก็บในตารางแยกต่างหาก
3. **การบีบอัดข้อมูล**: ใช้คุณสมบัติการบีบอัดข้อมูลของ TiDB
4. **การใช้ TTL (Time To Live)**: กำหนดอายุข้อมูลและลบทิ้งโดยอัตโนมัติ

### ตัวอย่างการแยกข้อมูลเก่า

```sql
-- สร้างตารางสำหรับเก็บข้อมูลเก่า
CREATE TABLE pm25_archive LIKE pm25_data;

-- ย้ายข้อมูลเก่าไปยังตารางสำรอง
INSERT INTO pm25_archive SELECT * FROM pm25_data WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- ลบข้อมูลเก่าจากตารางหลัก
DELETE FROM pm25_data WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## เครื่องมือจัดการตาราง

โปรเจคนี้มีเครื่องมือช่วยในการจัดการตารางดังนี้:

### 1. สร้างตารางใหม่ทั้งหมด

```bash
node schema/create-tables.js
```

เครื่องมือนี้จะสร้างตารางทั้งหมดใหม่ตามแนวทางการออกแบบที่เหมาะสมสำหรับ TiDB

### 2. วิเคราะห์และปรับปรุงตารางที่มีอยู่

```bash
# วิเคราะห์ตารางและแสดงคำแนะนำ
node schema/table-optimizer.js

# วิเคราะห์และปรับปรุงตารางโดยอัตโนมัติ
node schema/table-optimizer.js --apply
```

เครื่องมือนี้จะวิเคราะห์ตารางที่มีอยู่และให้คำแนะนำในการปรับปรุง หรือปรับปรุงโดยอัตโนมัติถ้าใช้ `--apply`

### 3. ศึกษาแนวทางการออกแบบตาราง

ดูตัวอย่างและคำแนะนำได้ในไฟล์ `schema/table-design.js`

```bash
cat schema/table-design.js
```

## สรุป

การจัดการตารางใน TiDB ที่ดีจะช่วยให้ระบบมีประสิทธิภาพและรองรับการเติบโตได้ดี ควรคำนึงถึงแนวทางเหล่านี้:
- เลือก Primary Key ที่เหมาะสม
- สร้างดัชนีเฉพาะที่จำเป็น
- พิจารณาการแบ่งพาร์ทิชันสำหรับข้อมูลขนาดใหญ่
- เลือกชนิดข้อมูลที่เหมาะสม
- มีกลยุทธ์การจัดการข้อมูลเมื่อมีขนาดใหญ่

การใช้เครื่องมือที่มีในโปรเจคจะช่วยให้การจัดการตารางทำได้ง่ายขึ้น 