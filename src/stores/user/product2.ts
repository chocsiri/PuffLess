import { defineStore } from 'pinia'

export const useProductStore = defineStore('product2', {
  state: () => ({
    list: [{
      name: 'shirt NIRVANA',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134201-7qul2-ljfopx1e7d7586',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'shirt NIRVANA2',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134201-7qul9-ljfopx6nznjc3a',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'X Jersey Boy Polo',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7r991-lq27r0hok1r88c',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 110.00,

    },
    {
      name: 'Korean denim shirt',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134201-7qukw-ljfomky7xt6033',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 199.00,

    },
    {
      name: 'Korean Blackwork Polo',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7qul7-ljh8ks5it4jtce',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'แจ็คเก็ตOversizeเกาหลี',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134201-7qula-ljfokmv8hw2945',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 250.00,
    },
    {
      name: 'ENJOY PREMIUM SHIRT',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7qul4-lkfhe4dkwt0p38',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'Korea jeans',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7qul0-lkj4layql2t793',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 155.00,
    },
    {
      name: 'เสื้อครอปแขนยาวผู้หญิง',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-23020-scl9k31x6mnv91',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'Crop shirt ',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvep-lfussf5jmcqt24',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'เสื้อสายเดี่ยว เอวเอส',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-23030-tjtuq1hj9gov8c',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'เสื้อกล้ามสายเดี่ยว',
      imageUrl: 'https://down-th.img.susercontent.com/file/dacd440e09bfe1c51523766a94804094',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'เสื้อเอวลอย เสื้อผ้ามินิมอล',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvey-linun75flblj0e',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 60.00
    },
    {
      name: 'Smoked Forest Tee',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7r98x-lq2essypkq1w8c',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'Butterfly Shadow Tee',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7r98t-lq2essypgick79',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'Korea FaddingShort Jeans',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134201-7qula-ljfoqc760p2gf6',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'Korea Short Jeans',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7qul3-lkj4layq8fp757',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 150.00,
    },
    {
      name: 'Demon Spirit Shirts',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7r98q-loxzxwu0q1ku0c',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 110.00,
    }]
  }),
  actions: {
    filterProducts (searchText) {
      return this.list.filter(product => product.name.includes(searchText))
    }
  }
})