<template>
	<view class="detail">
		<MasterForm ref="FormRef" v-model="FormValue" :mConfig="MConfig" :sConfig="SConfig" :sformValue="sformValue"
			:detail="detailFlag" />

	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onNavigationBarButtonTap,
		onReady
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance
	} from 'vue';

	import {
		getForm,
		getShowCol,
		getFormValue,
		getRules
	} from '@/common/form.js'

	import MasterForm from "@/components/PageForm/PageForm.vue"

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

	const queryUrl = ref('')
	const queryId = ref('')



	const FormRef = ref(null)
	const FormValue = ref({})
	const rules = ref({})
	const MConfig = ref([]) 
	const SConfig = ref([])
	const subTableID = ref(null)   
	const sformValue = ref(null) 
	let saveURL = ''
	const detailFlag = ref(true)
	onLoad((options) => {
		queryId.value = options.BILLNO
		queryUrl.value = options.url
		getPageConfig()

	})

	onNavigationBarButtonTap((obj) => {
		detailFlag.value = false
	
	})
	const getPageConfig = () => {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})

		let portData = {}
		global.$u.api.getConifg(portData).then(res => {
			uni.hideLoading()
			const {
				COLUMNS,
				BUTTON,
				SLOTCFG,
				QUERY,
				MAINTABLE,
				SUBTABLE
			} = res.RESULT
			saveURL = SLOTCFG
			FormValue.value = getForm(COLUMNS)
			MConfig.value = COLUMNS
			rules.value = getRules(COLUMNS)
			if (SUBTABLE.length > 0) {
				let newSubConfig = SUBTABLE[0].COLUMNS
				SConfig.value = SUBTABLE[0].COLUMNS
				let newRulesArr = []
				newRulesArr = [...COLUMNS, ...SConfig.value];
				rules.value = getRules(newRulesArr)
				subTableID.value = SUBTABLE[0].FIELD
				sformValue.value = getForm(SConfig.value)
				let newsformValue = JSON.parse(JSON.stringify(sformValue.value))
				FormValue.value.SubFormValue = [newsformValue]
				FormValue.value.SubFormTitle = SUBTABLE[0].VNAME
			}
			queryUrl.value = SLOTCFG
			getDetail()
		})
	}


	const getDetail = () => {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})
		let data = {
			BILLNO: queryId.value,
			...getApp().globalData.activeMenuID
		}
		global.$axios('/'+queryUrl.value, data, 'POST').then(res => {
			uni.hideLoading()

			FormValue.value = res.RESULT
			showSUBTABLE.value.length > 0 ? FormValue.value.SubFormValue = res.RESULT.SUBLIST : ''
		}).catch(err => {})

	}
</script>

<style scoped lang="scss">
	.detail {}
</style>