<template>
	<view class="header disflex justify-sb">
		<view class="disflex">
			<view class="header-tabs" :class="currentTab == item.VALUE?'active':''" v-for="(item,index) in tabsList"
				:key="item.VALUE" @click="clickStatus(item.VALUE)">
				{{item.LABEL}}
			</view>
		</view>
		<view class="disflex header-screen" @click="filtrateBtn" v-if="hasQuery">筛选</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch
	} from 'vue';
	const currentTab =ref(null)
	const emits = defineEmits(['tabsChange', 'queryChange']);

	const props = defineProps({
		tabsList: {
			type: Array,
			default: []
		},
		hasQuery: {
			type: Boolean,
			default: false
		}
	})
	
	currentTab.value = props.tabsList[0].VALUE

	const clickStatus = (t) => {
		currentTab.value = t 
		emits('tabsChange', t)
	}
	
	const filtrateBtn = () => {
		emits('queryChange')
	}
	
	defineExpose({clickStatus:clickStatus})
	
</script>

<style lang="scss">
	.header {
		position: -webkit-sticky;
		position: sticky;
		z-index: 999;
		top: 0;
		background: #FFFFFF;
		padding: 10rpx 36rpx 0 50rpx;
		margin-bottom: 15rpx;

		&-tabs {
			font-size: 26rpx;
			font-weight: 400;
			color: rgba(0, 0, 0, 0.8);
			margin-right: 50rpx;
			padding-bottom: 20rpx;

			&.active {

				font-size: 32rpx;
				font-weight: bold;
				color: #000000;
				border-bottom: 7rpx solid #2C76FF;
				border-radius: 3rpx;
			}
		}

		&-screen {
			padding-bottom: 20rpx;
			font-size: 26rpx;
			font-weight: 500;
			color: #2C76FF;
		}
	}
</style>