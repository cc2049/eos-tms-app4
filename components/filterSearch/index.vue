<template>
	<view class="filterSearch">
		<u-input v-if="keywordConfig.length > 0" v-model="form.KEYWORD" type="text" border
			@input="$u.debounce(searchKeyword , 500)" :placeholder="keywordConfig[0].LABEL" />
		<text v-else></text>
		<view class="filterSearch-right" v-if="showConfig.length>0" @click="filtrateBtn">筛选</view>
	</view>
	<u-popup v-model="showFiltrate" mode="bottom">
		<view class="filtratePop">
		<!-- 	<view class="filtratePop-top">
				<tms-app-form ref="mFormRef" :config="showConfig" v-model="form" />
			</view> -->
			<scroll-view class="filtratePop-top" :scroll-y="true">
				<tms-app-form ref="mFormRef" :config="showConfig" v-model="form" />
			</scroll-view>
			<view class="filtratePop-footer">
				<u-button type="primary" class="filtratePop-btn mr-20" @click="resetPopup">重置</u-button>
				<u-button type="primary" class="filtratePop-btn" @click="search">查询</u-button>
			</view>
		</view>
	</u-popup>

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
		watch,
		getCurrentInstance,
		onMounted,
	} from 'vue';

	import {
		getForm,
		getShowCol,
		getFormValue
	} from '@/common/form.js'
	import {
		mapState,
		mapActions
	} from 'pinia'
	import SendStore from '@/store/detail-ZLZH.js'
	const SendDetail = SendStore();

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();

	const emit = defineEmits(['search', 'resetPopup', 'keywordBlur'])
	const props = defineProps({
		config: Array,
	})

	const showFiltrate = ref(false)
	const form = ref({})
	const KEYWORD = ref('')
	const showConfig = ref([])
	const keywordConfig = ref([])

	watch(() => props.config, val => {
		keywordConfig.value = val.filter(ele => ele.FIELD == 'KEYWORD')
		showConfig.value = getShowCol(val)
		form.value = getFormValue(val)
	}, {
		immediate: true
	})

	const filtrateBtn = () => {
		showFiltrate.value = true
	}
	const resetPopup = () => {
		form.value = {}
		showFiltrate.value = false
		emit('resetPopup')
	}
	const search = () => {
		emit('search', form.value)
		showFiltrate.value = false
	}

	const searchKeyword = () => {
		emit('keywordBlur', form.value.KEYWORD)
	}
</script>

<style scoped lang="scss">
	.filterSearch {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #F3F3F3;
		padding: 18rpx 16rpx;

		&-right {
			margin-left: 26rpx;

			width: 147rpx;
			height: 68rpx;
			background: #FFFFFF;
			border: 1px solid #E1E1E1;
			border-radius: 17rpx;
			text-align: center;
			line-height: 68rpx;


			font-size: 24rpx;
			font-weight: 500;
			color: #307CFF;
		}

		.u-input {
			height: 68rpx;
		}

		.u-input--border {
			background: #FFFFFF;
			border: 1px solid #E1E1E1;
			border-radius: 17rpx;
		}

	}

	.filtratePop {
		padding-bottom: 40rpx;
	}
</style>