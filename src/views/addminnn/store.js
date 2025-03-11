// ข้อมูลตัวอย่าง
const sampleData = {
  airQuality: [
    {
      id: 1,
      location: 'กรุงเทพ',
      pm25_value: 45.5,
      temperature: 32.5,
      humidity: 65.0,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      location: 'เชียงใหม่',
      pm25_value: 35.2,
      temperature: 28.5,
      humidity: 70.0,
      timestamp: new Date().toISOString()
    }
  ]
};

// ฟังก์ชันจัดการข้อมูล
export const store = {
  // ดึงข้อมูลคุณภาพอากาศ
  getAirQualityData() {
    const data = localStorage.getItem('airQualityData');
    return data ? JSON.parse(data) : sampleData.airQuality;
  },

  // เพิ่มข้อมูลคุณภาพอากาศ
  addAirQualityData(data) {
    const currentData = this.getAirQualityData();
    const newData = {
      id: currentData.length + 1,
      ...data,
      timestamp: new Date().toISOString()
    };
    
    currentData.push(newData);
    localStorage.setItem('airQualityData', JSON.stringify(currentData));
    return newData;
  },

  // ตรวจสอบการเข้าสู่ระบบ
  isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  },

  // ออกจากระบบ
  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  }
};

export default store; 