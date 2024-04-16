<template>
	<view class="eos-tabbars">
		<view class="eos-tabbars-item" :class=" activeMenuCode == item.VCODE ?'active': '' " v-for="(item,index) in menuConfig" @click="handleMenu(item,index)">
			<view class="icon">
				<!-- <image src="../../static/c1.png" mode=""></image> -->
			</view>
			<view class="title">
				{{ item.NAME }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance
	} from 'vue';
	import useTabStore from '@/store/menus.js'
	import SendStore from '@/store/assigned.js'
	const menuConfig = computed(() => useTabStore().alltab)
	const activeMenuCode = computed(() => useTabStore().activeCode)
	
	// const activeIndex = ref('tab01')
	const handleMenu =(item,index)=>{
		// activeIndex.value = item.VCODE
		useTabStore().setActiveCode(item.VCODE)
		uni.switchTab({
			url: `/pages/${item.VCODE}/${item.VCODE}`
		})
		console.log(item.VCODE );
	}
	
</script>

<style lang="scss">
	.eos-tabbars {
		display: flex;
		justify-content: space-around;
		width: 100%;
		height: 60px;
		position: fixed;
		bottom: 0;
		left: 0;
		box-sizing: border-box;
		border-top: 1rpx solid #ededed;
		background-color: white;
		&-item {
			display: flex;
			flex-direction: column;
			flex: 1;
			text-align: center;
			.icon {
				image {
					width: 60rpx;
					height: 60rpx;
				}
			}
		}
		.active{
			color: $uni-primary;
			background-color: $uni-primary-light;
		}
	}
</style>