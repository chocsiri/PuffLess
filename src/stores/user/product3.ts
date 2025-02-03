import { defineStore } from 'pinia'

export const useProductStore = defineStore('product3', {
  state: () => ({
    list: [{
      name: 'กางเกงขากว้าง ผ้าลูกฟูก',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7rbk0-ll0rs6h599m80c',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: ' เสื้อยืดคอกลม New Collection',
      imageUrl: 'https://down-th.img.susercontent.com/file/00df83812853d451d00b8ae7a38f2139',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'Fayshow เสื้อยืดแฟชั่นผู้หญิง',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-23010-mj289lnhq4lvbb',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 70.00,

    },
    {
      name: 'เสื้อยืดลําลอง แขนสั้น',
      imageUrl: 'https://down-th.img.susercontent.com/file/4c694733841dea6d21be11b9451cf412',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 70.00,

    },
    {
      name: 'เสื้อกันหนาว แขนยาว มีฮู้ด',
      imageUrl: 'https://down-th.img.susercontent.com/file/e296e2d9bfe3cdb7e87b34f5e7dd95bd',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 90.00,
    },
    {
      name: 'เสื้อยืดแขนสั้น ทรงหลวม',
      imageUrl: 'https://down-th.img.susercontent.com/file/946d9b8ab272859baa9c21f39ec67818',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 70.00,
    },
    {
      name: 'เสื้อยืดคอกลม แขนสั้น',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvdn-lgrnokbh1fh80d',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 70.00,
    },
    {
      name: 'เสื้อยืดแขนสั้นผู้ชาย',
      imageUrl: 'https://down-th.img.susercontent.com/file/a0b99ecdb7487484fbab4c6b76145128',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'เสื้อยืดแขนสั้น คอกลม',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7rbm8-ln16w48ahc18a1',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 70.00,
    },
    {
      name: 'เสื้อยืดลําลองผู้หญิง ',
      imageUrl: 'https://down-th.img.susercontent.com/file/11db3f1c98416ec9727a8ff914063e32',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'ชุดมินิเดรส แขนกุด เปิดไหล่',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7rcct-lqx3tv49x5ab75',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 60.00,
    },
    {
      name: 'เสื้อคลุมแขนยาว เอวลอย',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-22110-58a476k298jvad',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 50.00,
    },
    {
      name: ' เสื้อแขนยาวไหมพรม ผ้าฉลุ',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvfv-liobssr9egp250',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'มาใหม่ฤดูหนาวบางคอแขนยาว',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7r99b-lluf6g6gc30rc7',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'ชุดนอน ขายาว ลายสน',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7rbnf-lonupgowim7r33',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 60.00,
    },
    {
      name: 'เสื้อยืดแขนสั้น ผ้าฝ้ายแท้',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvf5-lgzkyl19jig3e7',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'เสื้อโปโลแขนสั้น สีพื้น',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qveo-leyn1n1g52nj75',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 120.00,
    },
    {
      name: 'เสื้อโปโล แขนห้าส่วน สีพื้น',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvey-lfb4cfmxh6ezf7',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 130.00,
    }]
  }),
  actions: {
    filterProducts (searchText) {
      return this.list.filter(product => product.name.includes(searchText))
    }
  }
})