/**
 * เครื่องมือช่วยปรับแต่งประสิทธิภาพตารางใน TiDB
 * ใช้สำหรับวิเคราะห์และปรับปรุงตารางที่มีอยู่ให้ทำงานได้อย่างมีประสิทธิภาพ
 */

const db = require('../config');
const tableDesign = require('./table-design');

/**
 * ฟังก์ชันหลักสำหรับตรวจสอบและปรับแต่งประสิทธิภาพตาราง
 * @param {boolean} applyChanges - หากเป็น true จะทำการปรับแต่งจริง หากเป็น false จะเพียงแสดงคำแนะนำ
 */
async function optimizeTables(applyChanges = false) {
  console.log('==========================================================');
  console.log('🔧 เริ่มต้นการตรวจสอบและปรับแต่งประสิทธิภาพตาราง TiDB');
  console.log('==========================================================');
  
  // สร้าง connection pool
  const pool = db.createPool();
  
  try {
    // ตรวจสอบการเชื่อมต่อ
    if (!(await db.healthCheck(pool))) {
      console.error('❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้');
      process.exit(1);
    }
    
    // ดึงรายชื่อตารางทั้งหมด
    const [tables] = await pool.query('SHOW TABLES');
    console.log(`ℹ️ พบตารางทั้งหมด ${tables.length} ตาราง`);
    
    // วิเคราะห์แต่ละตาราง
    const tableResults = [];
    for (const tableObj of tables) {
      const tableName = tableObj[Object.keys(tableObj)[0]];
      console.log(`\n🔍 กำลังวิเคราะห์ตาราง ${tableName}...`);
      
      const result = await tableDesign.analyzeTable(pool, tableName);
      tableResults.push(result);
      
      // ปรับแต่งตารางตามความจำเป็น
      if (applyChanges) {
        await optimizeTable(pool, tableName, result);
      }
    }
    
    // สรุปผลการวิเคราะห์
    console.log('\n==========================================================');
    console.log('📊 สรุปผลการวิเคราะห์ตาราง');
    console.log('==========================================================');
    
    for (const result of tableResults) {
      console.log(`\nตาราง: ${result.tableName}`);
      
      if (result.error) {
        console.log(`❌ เกิดข้อผิดพลาด: ${result.error}`);
        continue;
      }
      
      console.log(`- Primary Key: ${result.primaryKey || 'ไม่มี'}`);
      console.log(`- จำนวนดัชนี: ${result.indexCount}`);
      console.log(`- จำนวนข้อมูล: ${result.recordCount} รายการ`);
      
      if (result.sizeInMB !== null) {
        console.log(`- ขนาดข้อมูล: ${result.sizeInMB} MB`);
      }
      
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('- คำแนะนำ:');
        result.recommendations.forEach(rec => {
          console.log(`  ${rec}`);
        });
      } else {
        console.log('- ไม่มีคำแนะนำเพิ่มเติม');
      }
    }
    
    console.log('\n==========================================================');
    if (applyChanges) {
      console.log('✅ การปรับแต่งประสิทธิภาพตารางเสร็จสมบูรณ์');
    } else {
      console.log('ℹ️ การวิเคราะห์ตารางเสร็จสมบูรณ์ แต่ไม่ได้ทำการปรับแต่ง');
      console.log('   หากต้องการปรับแต่งตาราง โปรดใช้คำสั่ง: node schema/table-optimizer.js --apply');
    }
    console.log('==========================================================');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบและปรับแต่งประสิทธิภาพ:', error);
    process.exit(1);
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

/**
 * ปรับแต่งตารางตามผลการวิเคราะห์
 * @param {object} pool - connection pool
 * @param {string} tableName - ชื่อตาราง
 * @param {object} analysis - ผลการวิเคราะห์
 */
async function optimizeTable(pool, tableName, analysis) {
  console.log(`\n🔧 กำลังปรับแต่งตาราง ${tableName}...`);
  
  try {
    // ตรวจสอบว่ามี recommendations หรือไม่
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      console.log('✅ ไม่จำเป็นต้องปรับแต่งตาราง');
      return;
    }
    
    // ปรับแต่งตามคำแนะนำ
    for (const recommendation of analysis.recommendations) {
      if (recommendation.includes('Primary Key')) {
        await addPrimaryKey(pool, tableName);
      } else if (recommendation.includes('ควรพิจารณาการเพิ่มดัชนี')) {
        await addSuggestedIndices(pool, tableName);
      } else if (recommendation.includes('ข้อมูลมีขนาดใหญ่') && analysis.sizeInMB > 100) {
        await suggestPartitioning(pool, tableName);
      }
    }
    
    // Optimize table
    console.log(`🔧 กำลังทำ OPTIMIZE TABLE ${tableName}...`);
    await pool.query(`OPTIMIZE TABLE ${tableName}`);
    console.log(`✅ ปรับแต่งตาราง ${tableName} เสร็จสมบูรณ์`);
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการปรับแต่งตาราง ${tableName}:`, error);
  }
}

/**
 * เพิ่ม Primary Key สำหรับตารางที่ไม่มี
 * @param {object} pool - connection pool
 * @param {string} tableName - ชื่อตาราง
 */
async function addPrimaryKey(pool, tableName) {
  console.log(`🔧 กำลังตรวจสอบและเพิ่ม Primary Key สำหรับตาราง ${tableName}...`);
  
  try {
    // ตรวจสอบว่ามีคอลัมน์ id หรือไม่
    const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
    const idColumn = columns.find(col => col.Field.toLowerCase() === 'id');
    
    if (idColumn) {
      // มีคอลัมน์ id อยู่แล้ว ให้ทำเป็น Primary Key
      console.log('🔧 กำลังเพิ่ม Primary Key ให้กับคอลัมน์ id ที่มีอยู่...');
      await pool.query(`ALTER TABLE ${tableName} ADD PRIMARY KEY (id)`);
      console.log('✅ เพิ่ม Primary Key สำเร็จ');
    } else {
      // ไม่มีคอลัมน์ id ให้สร้างใหม่
      console.log('🔧 กำลังเพิ่มคอลัมน์ id และกำหนดเป็น Primary Key...');
      await pool.query(`ALTER TABLE ${tableName} ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST`);
      console.log('✅ เพิ่มคอลัมน์ id และกำหนดเป็น Primary Key สำเร็จ');
    }
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการเพิ่ม Primary Key:`, error);
    console.log('⚠️ อาจจำเป็นต้องกำหนด Primary Key ด้วยตนเอง');
  }
}

/**
 * เพิ่มดัชนีที่แนะนำสำหรับตาราง
 * @param {object} pool - connection pool
 * @param {string} tableName - ชื่อตาราง
 */
async function addSuggestedIndices(pool, tableName) {
  console.log(`🔧 กำลังวิเคราะห์และเพิ่มดัชนีที่แนะนำสำหรับตาราง ${tableName}...`);
  
  try {
    // ดึงข้อมูลคอลัมน์
    const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
    const [indices] = await pool.query(`SHOW INDEX FROM ${tableName}`);
    
    // รายการคอลัมน์ที่มีดัชนีแล้ว
    const indexedColumns = new Set(indices.map(idx => idx.Column_name));
    
    // ตรวจสอบและเพิ่มดัชนีสำหรับคอลัมน์ที่น่าจะใช้ในการค้นหาบ่อย
    const suggestedColumns = columns.filter(col => {
      const name = col.Field.toLowerCase();
      return !indexedColumns.has(col.Field) && 
             (name.includes('name') || 
              name.includes('status') || 
              name.includes('type') || 
              name.includes('date') || 
              name.includes('time') || 
              name.includes('location') || 
              name.endsWith('_id'));
    });
    
    // เพิ่มดัชนี
    for (const column of suggestedColumns) {
      console.log(`🔧 กำลังเพิ่มดัชนีสำหรับคอลัมน์ ${column.Field}...`);
      await pool.query(`ALTER TABLE ${tableName} ADD INDEX idx_${tableName}_${column.Field} (${column.Field})`);
      console.log(`✅ เพิ่มดัชนีสำหรับคอลัมน์ ${column.Field} สำเร็จ`);
    }
    
    if (suggestedColumns.length === 0) {
      console.log('ℹ️ ไม่พบคอลัมน์ที่ควรเพิ่มดัชนี');
    }
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการเพิ่มดัชนี:`, error);
  }
}

/**
 * แนะนำการแบ่งพาร์ทิชันสำหรับตารางขนาดใหญ่
 * @param {object} pool - connection pool
 * @param {string} tableName - ชื่อตาราง
 */
async function suggestPartitioning(pool, tableName) {
  console.log(`📝 คำแนะนำสำหรับการแบ่งพาร์ทิชันตาราง ${tableName}:`);
  
  try {
    // ตรวจสอบว่ามีคอลัมน์ timestamp หรือ date หรือไม่
    const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
    const dateColumns = columns.filter(col => 
      col.Type.includes('timestamp') || 
      col.Type.includes('date') || 
      col.Type.includes('time')
    );
    
    if (dateColumns.length > 0) {
      // มีคอลัมน์วันที่ แนะนำการแบ่งตามช่วงเวลา
      const dateCol = dateColumns[0].Field;
      console.log(`
ตัวอย่าง SQL สำหรับการแบ่งพาร์ทิชันตาม ${dateCol}:

-- สร้างตารางใหม่พร้อมพาร์ทิชัน
CREATE TABLE ${tableName}_partitioned LIKE ${tableName};
ALTER TABLE ${tableName}_partitioned
  PARTITION BY RANGE (UNIX_TIMESTAMP(${dateCol})) (
    PARTITION p_oldest VALUES LESS THAN (UNIX_TIMESTAMP('2022-01-01 00:00:00')),
    PARTITION p_2022h1 VALUES LESS THAN (UNIX_TIMESTAMP('2022-07-01 00:00:00')),
    PARTITION p_2022h2 VALUES LESS THAN (UNIX_TIMESTAMP('2023-01-01 00:00:00')),
    PARTITION p_2023h1 VALUES LESS THAN (UNIX_TIMESTAMP('2023-07-01 00:00:00')),
    PARTITION p_2023h2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01 00:00:00')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
  );
  
-- คัดลอกข้อมูล
INSERT INTO ${tableName}_partitioned SELECT * FROM ${tableName};

-- ตรวจสอบและสลับตาราง
-- RENAME TABLE ${tableName} TO ${tableName}_old, ${tableName}_partitioned TO ${tableName};
      `);
    } else {
      // ไม่มีคอลัมน์วันที่ แนะนำการแบ่งแบบ HASH
      const [primaryKeys] = await pool.query(`
        SELECT k.COLUMN_NAME
        FROM information_schema.table_constraints t
        JOIN information_schema.key_column_usage k
        USING(constraint_name,table_schema,table_name)
        WHERE t.constraint_type='PRIMARY KEY'
          AND t.table_schema=DATABASE()
          AND t.table_name='${tableName}'
      `);
      
      let partitionColumn = primaryKeys.length > 0 ? primaryKeys[0].COLUMN_NAME : 'id';
      
      console.log(`
ตัวอย่าง SQL สำหรับการแบ่งพาร์ทิชันแบบ HASH:

-- สร้างตารางใหม่พร้อมพาร์ทิชัน
CREATE TABLE ${tableName}_partitioned LIKE ${tableName};
ALTER TABLE ${tableName}_partitioned
  PARTITION BY HASH(${partitionColumn}) PARTITIONS 4;
  
-- คัดลอกข้อมูล
INSERT INTO ${tableName}_partitioned SELECT * FROM ${tableName};

-- ตรวจสอบและสลับตาราง
-- RENAME TABLE ${tableName} TO ${tableName}_old, ${tableName}_partitioned TO ${tableName};
      `);
    }
    
    console.log('⚠️ โปรดตรวจสอบคำแนะนำข้างต้นและปรับแต่งตามความเหมาะสมก่อนใช้งานจริง');
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการแนะนำการแบ่งพาร์ทิชัน:`, error);
  }
}

// เรียกใช้ฟังก์ชันหลักเมื่อรันไฟล์โดยตรง
if (require.main === module) {
  const applyChanges = process.argv.includes('--apply');
  optimizeTables(applyChanges);
}

module.exports = {
  optimizeTables,
  optimizeTable,
  addPrimaryKey,
  addSuggestedIndices,
  suggestPartitioning
}; 