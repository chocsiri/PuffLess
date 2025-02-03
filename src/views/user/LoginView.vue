<script setup>
import UserLayout from '@/layouts/UserLayout.vue'
import { useRouter } from 'vue-router'

</script>
<template>
    <div class="container mx-auto">
        <div class="flex-1">
            <RouterLink :to="{ name: 'home' }" class="btn btn-ghost text-3xl font-bold">
            A R T E M I S
            </RouterLink>
        </div>
    </div>
    <section class="bg-white dark:bg-gray-900">
        <div class="container flex items-center justify-center min-h-screen px-6 mx-auto">
            <form class="w-full max-w-md">

                <h1 class="mt-3 text-2xl font-bold text-gray-800 capitalize sm:text-3xl dark:text-white text-center">SignIn/Register</h1>

                <div class="relative flex items-center mt-8">
                    <span class="absolute">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </span>

                    <input type="email" class="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40" placeholder="Email address">
                </div>

                <div class="relative flex items-center mt-4">
                    <span class="absolute">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </span>

                    <input type="password" class="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40" placeholder="Password">
                </div>

                <div class="mt-6">
                    <button class="w-full px-6 py-3 text-xl font-bold tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg hover:bg-black focus:outline-none focus:ring focus:ring-black focus:ring-opacity-50">
                        <RouterLink :to="{ name: 'home' }">CONTINUE</RouterLink>
                    </button>
                    <div class="flex items-center justify-between mt-4">
                        <span class="w-1/5 border-b dark:border-black lg:w-1/5"></span>

                        <a href="#" class="text-m text-center text-gray-500 uppercase dark:text-gray-400 hover:underline">
                            OR
                        </a>

                        <span class="w-1/5 border-b dark:border-gray-400 lg:w-1/5"></span>
                    </div>
                    <a href="#" class="flex items-center justify-center px-6 py-3 mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <span class="mx-2 font-bold text-xl">
                            <RouterLink :to="{ name: 'register' }">REGISTER</RouterLink>
                        </span>
                    </a>
                    <div class="mt-6 text-center ">
                        <h1 class="text-sm text-gray hover:underline dark:text-blue-400">
                            By continuing, you agree to our
                        </h1>
                        <h1 class="text-sm text-gray hover:underline dark:text-blue-400">
                            Privacy & Cookie  Policy and Terms & Conditions.
                        </h1>
                    </div>
                </div>
            </form>
        </div>
    </section>
</template>
