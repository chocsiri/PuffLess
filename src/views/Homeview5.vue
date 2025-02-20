<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";


</script>

<template>
  <div class="header-background flex items-center justify-center text-black text-2xl font-bold p-4 relative">
    <div class="absolute top-1/4 left-0 right-0 text-center">
      <h1 class="text-3xl font-bold">เกี่ยวกับเรา</h1>
    </div>
  </div>


  <div class="container mx-auto p-4 space-y-6 relative -mt-20">
      <div class="bg-white shadow-2xl rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
        <div class="flex justify-between items-center p-4 rounded-2xl text-md font-bold w-[500px]">
            
        </div>



        <h2 class="text-lg font-bold mb-4 text-center">ระบบติดตามฝุ่นละออง PM 2.5</h2>
        <h5 class="mb-4 custom-margin flex items-center justify-center">ข้อมูลบนเว็บไซต์มีการใช้ เทคโนโลยีปัญญาประดิษฐ์ ในการวิเคราะห์ค่าฝุ่นละออง<br>(PM 2.5) บริเวณพื้นที่หน้ามหาวิทยาลัยพะเยา </h5>
        <h5 class="mb-4 custom-margin flex items-center justify-center">โดยเป็นการบูรณาการข้อมูลจากการดึง API รวมถึงแหล่งกำเนิดฝุ่น PM 2.5 <br>มานำเสนอในรูปแบบข้อมูลตัวเลขและแสดงกราฟต่างๆ เพื่อให้ผู้เข้าใช้งานสามารถ <br>เข้าใจสถานการณ์ได้ง่ายยิ่งขึ้น</h5> 
        <h2 class="text-lg font-bold mb-4 text-center custom-margin">ติดต่อเรา<br>weather@up.ac.th</h2>
        
      </div>

  </div>

  
  <div class="fixed bottom-0 left-0 w-full h-[75px] bg-custom-gray text-white p-2 ">
    <div class="flex justify-around">
    <router-link to="/">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" stroke="currentColor" class="size-7">
          <path d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L512 185l0-121c0-17.7-14.3-32-32-32l-32 0c-17.7 0-32 14.3-32 32l0 36.7L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1l32 0 0 69.7c-.1 .9-.1 1.8-.1 2.8l0 112c0 22.1 17.9 40 40 40l16 0c1.2 0 2.4-.1 3.6-.2c1.5 .1 3 .2 4.5 .2l31.9 0 24 0c22.1 0 40-17.9 40-40l0-24 0-64c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 64 0 24c0 22.1 17.9 40 40 40l24 0 32.5 0c1.4 0 2.8 0 4.2-.1c1.1 .1 2.2 .1 3.3 .1l16 0c22.1 0 40-17.9 40-40l0-16.2c.3-2.6 .5-5.3 .5-8.1l-.7-160.2 32 0z"/></svg>
        <span>หน้าหลัก</span>
      </button>
    </router-link>
     
    <router-link to="/Homeview2">
        <button class="flex flex-col items-center text-black  font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-7">
            <path d="M160 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM368 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z"/>
          </svg>
          <span>สถิติ</span>
        </button>
    </router-link>
    
      <router-link to="/Homeview3">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" stroke="currentColor" class="size-7"> <path d="M384 476.1L192 421.2l0-385.3L384 90.8l0 385.3zm32-1.2l0-386.5L543.1 37.5c15.8-6.3 32.9 5.3 32.9 22.3l0 334.8c0 9.8-6 18.6-15.1 22.3L416 474.8zM15.1 95.1L160 37.2l0 386.5L32.9 474.5C17.1 480.8 0 469.2 0 452.2L0 117.4c0-9.8 6-18.6 15.1-22.3z"/></svg>
        <span>แผนที่</span>
      </button>
      </router-link>

      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke-width="1.5" stroke="currentColor" class="size-7"> 
          <path d="M32 144c0 79.5 64.5 144 144 144l123.3 0c22.6 19.9 52.2 32 84.7 32s62.1-12.1 84.7-32l27.3 0c61.9 0 112-50.1 112-112s-50.1-112-112-112c-10.7 0-21 1.5-30.8 4.3C443.8 27.7 401.1 0 352 0c-32.6 0-62.4 12.2-85.1 32.3C242.1 12.1 210.5 0 176 0C96.5 0 32 64.5 32 144zM616 368l-336 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-64 96l-112 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-192 0L24 464c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zM224 392c0-13.3-10.7-24-24-24L96 368c-13.3 0-24 10.7-24 24s10.7 24 24 24l104 0c13.3 0 24-10.7 24-24z"/></svg>
        <span>สารมลพิษอื่นๆ</span>
      </button>
      
      <router-link to="/Homeview5">
      <button class="flex flex-col items-center text-custom-blue2 font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-6"  fill="#0E0069">
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
        <span>เกี่ยวกับเรา</span>
      </button>
    </router-link>
    </div>
  </div>
</template>

<style scoped>
.header-background {
  width: 100%;
  height: 300px;
  background: url("https://www.thaihealth.or.th/data/content/2019/10/50235/cms/newscms_thaihealth_c_cdelpqy24689.jpg") no-repeat center center;
  background-size: cover;
}
.custom-margin {
    margin-top: 50px;
}

</style>
