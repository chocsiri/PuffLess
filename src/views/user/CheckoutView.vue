<script setup>
import UserLayout from '@/layouts/UserLayout.vue'
import { useRouter } from 'vue-router'
</script>
<template>
  <UserLayout>
    <div class="mt-10 px-5 max-w-2xl bg-base-200 bg-opacity-100">
      <br><a class="font-bold text-center text-3xl">ตรวจสอบชื่อที่อยู่เพื่อทำการจัดส่งสินค้า</a><br><br> 
        <a class="text-xl">ชื่อ : Artemis Store <br>
        ที่อยู่ : 19 หมู่ 2 ตำบลแม่กา อำเภอเมือง จังหวัดพะเยา 56000 <br>
        อีเมล : Ar*********@gmail.com <br>
        เบอร์โทรศัพท์ : 099-*****99 <br><br><br></a>
    </div>
    <div class="mt-14 mb-14 px-5 max-w-2xl bg-base-200 bg-opacity-90">
      <br><a class="font-bold text-center text-3xl">เลือกประเภทการชำระเงิน</a><br><br>
      <input type="radio" id="option1" name="group1" checked="checked" class="checkbox checkbox-xs" /><label for="option1"><a class="px-3 text-xl">โอนเงินผ่านบัญชีธนาคาร</a></label><br><br>
      <input type="radio" id="option2" name="group1" checked="checked" class="checkbox checkbox-xs" /><label for="option2"><a class="px-3 text-xl">เก็บเงินปลายทาง</a></label><br><br>
      <p class="text-x" style="color: red;">* เมื่อได้รับสินค้าแล้ว กรุณาตรวจสอบสินค้าก่อนเซ็นรับสินค้าทุกครั้ง หากท่านเซ็นรับสินค้าแล้ว ทางเราขอสงวนสิทธิ์ในการรับผิดชอบต่อสินค้า</p>
      <RouterLink :to="{ name: 'success' }" class="btn btn-wide mt-4 bg-black text-white">CONFIRM PAYMENT</RouterLink><br><br>
    </div>
  </UserLayout>
</template>
