<template>
	<view class="">
		22222222222222
		
		<button @click="goLogin"> 重新登录 </button>
		
		<EosTabBar></EosTabBar> 
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onTabItemTap,
		onPullDownRefresh,
		onReachBottom,
		onNavigationBarButtonTap,
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance
	} from 'vue';
	const goLogin =()=>{
		uni.clearStorage()
		uni.reLaunch({
			url: '/pages/index/login'
		})
	}
</script>

<style scoped lang="scss">

</style>