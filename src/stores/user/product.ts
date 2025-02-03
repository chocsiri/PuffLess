import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    list: [{
      name: 'เสื้อเชิ้ตแขนยาวลําลอง',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvd6-les9kuo40c7gcb',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'เสื้อยืดผู้ชาย แขนสั้น',
      imageUrl: 'https://down-th.img.susercontent.com/file/cn-11134207-7r98o-loxff7n7vvfb55',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 50.00,
    },
    {
      name: 'เสื้อยืดผู้ชายแขนสั้น',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qvfk-lj30zkql785p63',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,

    },
    {
      name: 'เสื้อยืดขนาดใหญ่ ทรงหลวม',
      imageUrl: 'https://down-th.img.susercontent.com/file/4d085534f99fac2e0310f53348bad1c1',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,

    },
    {
      name: 'เสื้อยืดแขนยาว ลําลอง',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7qver-ljf1hc3qqb9r97',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'เสื้อยืด oversize 2022',
      imageUrl: 'https://down-th.img.susercontent.com/file/c43b31dd9d2279c22534985674dd6dd7',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'ฟุตบอลโลก 2024 บราซิล',
      imageUrl: 'https://down-th.img.susercontent.com/file/cn-11134207-7r98o-lp3td8z086zg4d',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100.00,
    },
    {
      name: 'กางเกงขากว้าง เอวสูง ',
      imageUrl: 'https://down-th.img.susercontent.com/file/b03c62682c066a478f9e0744fc0fed49',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'เสื้อแขนยาว เปิดหลัง',
      imageUrl: 'https://down-th.img.susercontent.com/file/cn-11134207-7r98o-lp7dl1v2dg7w37',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'กระโปรงสั้น ทรงเอ',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7rbm4-ln0z2ry9znlh2b',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'เสื้อแขนสั้น เปิดไหล่',
      imageUrl: 'https://down-th.img.susercontent.com/file/9fe0b33baf92f8c7b47448c9f02c5e98',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100,
    },
    {
      name: 'กระโปรงโปรงเอ',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7r98u-lng1lqk0wrc7e2',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 50.00,
    },
    {
      name: 'สายเดี่ยว มีฟองน้ำ',
      imageUrl: 'https://down-th.img.susercontent.com/file/ff064d228415ea33564cc25201a0cd89',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: ' เสื้อยืดแขนสั้น สีขาวผู้หญิง',
      imageUrl: 'https://down-th.img.susercontent.com/file/cn-11134207-7r98o-llymx6a90g8205',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100,
    },
    {
      name: 'กระโปรงผู้หญิง ชายแต่งระบาย',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7rbmw-lqa7g2xg7z56c0',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'เสื้อยืดสีขาวผู้หญิง',
      imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7quky-lkj0db0ngb1lb2',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 80.00,
    },
    {
      name: 'sexy girl ชุดนอนเซ็กซี่',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-22110-65dc1xx3ebkv8a',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 50.00,
    },
    {
      name: 'กางเกงยีนขากว้าง ทรงหลวม',
      imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-7r98o-lkjelmp57bww5d',
      quantity: 10,
      about: '*สินค้ามือสอง',
      status: 'open',
      price: 100,
    }]
  }),
  actions: {
    filterProducts (searchText) {
      return this.list.filter(product => product.name.includes(searchText))
    }
  }
})
