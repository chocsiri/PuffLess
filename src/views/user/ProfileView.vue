<script setup>
import {ref, onMounted} from'vue'
import UserLayout from '@/layouts/UserLayout.vue'

const profileImageUrl = ref('https://tse3.mm.bing.net/th?id=OIP._RyEtaF1Mu1i8pE3Pxn_UwHaHa&pid=Api&P=0&h=180')
const email = ref('')
const name = ref('')
const tel = ref('')

const handleFileUpload = (event) => {
  const file = event.target.files[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImageUrl.value = e.target.result
      
    }
    reader.readAsDataURL(file)
  }
}

const updateProfile = () => {
  const profileData ={
    imageUrl: profileImageUrl.value,
    name: name.value,
    email:  email.value,
    tel: tel.value
  }
  localStorage.setItem('profile-data', JSON.stringify(profileData))
}

onMounted(() => {
  const profileData = localStorage.getItem('profile-data')
  if (profileData) {
    profileData = JSON.parse(profileData)
    profileImageUrl.value = profileData.imageUrl
    name.value = profileData.name
    email.value = profileData.email
    tel.value = profileData.tel
  }
})
</script>
<template>
  <UserLayout>
    <div class="max-w-2xl mx-auto border border-base-200 shadow-md">
      <div class="font-bold text-2xl text-center">Profile</div>

        <div class="flex flex-col items-center">
          <div class="flex flex-col items-center">
            <div class="avatar">
              <div class="w-24 rounded-full">
                <img :src="profileImageUrl">
              </div>
            </div>
            <input type="file" @change="handleFileUpload">
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Name</span>
            </label>
            <input v-model="email" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs"/>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input v-model="name" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs"/>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">TEL.</span>
            </label>
            <input v-model="tel" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs"/>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">MY ADDRESS</span>
            </label>
            <input v-model="tel" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs"/>
          </div>
          <button @click="updateProfile" class="btn btn-primary w-full mt-4">Update profile</button>
        </div>
      </div>
  </UserLayout>
</template>   