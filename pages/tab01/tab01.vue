<template>
	<view class="">
		<button @click="goLogin"> 重新登录 </button>
		<button @click="getMenuCFG"> 获取菜单的动态配置案例 </button>
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
	const goLogin =()=>{
		uni.clearStorage()
		uni.reLaunch({
			url: '/pages/index/login'
		})
	}
	const getMenuCFG = () => {
		uni.$eos.api.getConifg({
			MODULEID: 'MU221010650325',
			PAGEID: 'PG221010670930'
		}).then(res => {
			console.log(99, res);
		})
	}
</script>

<style scoped lang="scss">

</style>