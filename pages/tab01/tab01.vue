<template>
	<view class="">
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
	uni.hideTabBar()
</script>

<style scoped lang="scss">

</style>