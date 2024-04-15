<template>
	<view class="list">
		<view class="myCar">

			<filterSearch :config="queryConfig" :key="queryConfig" @resetPopup="resetPopup" @search="search"
				@keywordBlur="keywordBlur" />
			<tms-app-list :showCOLUMNS="showCOLUMNS" :allCOLUMNS="allCOLUMNS" :tableData="tableData" ref="commonTableRef"
				v-if="tableData.length>0" @clickAlone="clickAlone">
			</tms-app-list>
			<noData v-else />
			<u-modal v-model="showModel" show-cancel-button @confirm="confirmModel" :async-close="true"
				:content="modelContent">
			</u-modal>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onPullDownRefresh,
		onReachBottom,
		onNavigationBarButtonTap,
		onHide,
		onBackPress
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance,
		toRefs
	} from 'vue';

	import {
		getForm,
		getShowCol,
		getFormValue

	} from '@/common/form.js'
	import {
		getMyMenu,
		getUrlParams
	} from '@/common'
	import {
		mapState,
		mapActions
	} from 'pinia'
	
	import useFormStore from '@/store/form'
	const useForm = useFormStore()
	const config = computed(() => useForm.config)
	const { title, url, params, mutiple, MENUID } = toRefs(config.value);
	import SendStore from '@/store/detail-ZLZH.js'
	const SendDetail = SendStore();
	const emit = defineEmits(['change'])

	const sysCode = ref(getApp().globalData.sysCode)


	import SendStore2 from '@/store/assigned.js'
	const SendDetail2 = SendStore2();

	let initPageID = null;
	const pageTitle = ref('列表')
	import filterSearch from "@/components/filterSearch/index.vue"
	import noData from "@/components/noData/index.vue"

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();
	const commonUrl = ref(null)

	const allLineList = ref([])
	const receivingParam = ref({})

	onLoad((p) => {
		receivingParam.value = p

		commonUrl.value = getApp().globalData.BaseURL

		uni.showLoading()
		pageTitle.value = p.title
	
		initPageID = getApp().globalData.activeMenuID.PAGEID
		getPageConfig()



	})

	onShow(() => {

	})
	onHide(() => {

	})
	onPullDownRefresh(() => {
		pageInfo.currentPage = 1
		setTimeout(function() {
			uni.stopPullDownRefresh();
		}, 1000);


		queryList()


	})

	onReachBottom(() => {
		if (pageInfo.currentPage > pageInfo.totalPages) {
			return global.$_showToast('没有更多数据了。')
		}
		queryList()
	})



	const commonData = ref({})
	const showCOLUMNS = ref([])
	const allCOLUMNS = ref([])
	const allButton = ref([])
	const ButtonList = ref([])
	const SLOTCFG = ref(null)
	const QUERY = ref([])

	const queryForm = {}
	const queryConfig = ref([])
	const showQueryConfig = ref([])

	const pageInfo = reactive({
		currentPage: 1,
		pageSize: 10,
		totalResult: 0,
		sortName: "",
		sortOrder: "",
		totalPages: 0,
	});

	const tableData = ref([])
	const totalData = ref(null)
	const listUrl = ref('')

	const addBtnList = ref([])
	const pageCode = ref(null)

	onNavigationBarButtonTap((obj) => {
		clickBtn(addBtnList.value[0])
	})

	const getPageConfig = () => {

		let portData = {}

		if (receivingParam.value.allId) { 

			let strArr = receivingParam.value.allId.split(',')
			portData = {
				BILLNO: receivingParam.value.BILLNO,
				MODULEID: strArr[0],
				PAGEID: strArr[1],
			}
		}


		global.$u.api.getConifg(portData).then(res => {
			commonData.value = res.RESULT
			const {
				COLUMNS,
				BUTTON,
				SLOTCFG,
				QUERY,
				MAINTABLE,
				SUBTABLE,
				PAGES,
				VCODE
			} = commonData.value
			allCOLUMNS.value = COLUMNS
			showCOLUMNS.value = getShowCol(COLUMNS)
			SendDetail.setShowCOLUMNS(showCOLUMNS.value)
			SendDetail.setCOLUMNS(COLUMNS)
			SendDetail.setMAINTABLE(MAINTABLE)
			SendDetail.setSUBTABLE(SUBTABLE)
			ButtonList.value = getShowCol(BUTTON)
			allButton.value = BUTTON
			listUrl.value = SLOTCFG

			queryForm.value = getFormValue(QUERY)
			queryConfig.value = QUERY
			showQueryConfig.value = getShowCol(QUERY)
			pageCode.value = VCODE

			addBtnList.value = allButton.value.filter(ele => ele.ACTION == "ADD")
			setPLUSBtn(addBtnList.value)
			queryList()

		})
	}

	const setPLUSBtn = (arr) => {
		if (arr.length == 0) return
	}

	const uToast = ref(null)
	const customChooserVal = ref(null)

	const LAT = ref('0')
	const LON = ref('0')

	const queryList = () => {
		let data = {
			PAGENUM: pageInfo.currentPage,
			PAGESIZE: pageInfo.pageSize,
			SORTNAME: pageInfo.sortName,
			REVERSE: pageInfo.sortOrder,
			PARENTPAGE: "",
			LAT: LAT.value,
			LON: LON.value,
			...queryForm?.value,
			...params?.value
		};

		if (receivingParam.value.allId) {
			let strArr = receivingParam.value.allId.split(',')
			data.BILLNO = receivingParam.value.BILLNO
			data.MODULEID = strArr[0]
			data.PAGEID = strArr[1]
		}



		data.KEYWORD = queryForm.value.KEYWORD || ''
		getApp().globalData.activeMenuID.PAGEID = initPageID
		global.$axios(listUrl.value, data, 'POST', true, true).then(res => {
			let {
				TOTAL,
				RECORDS,
				TOTALDATA,
				PAGES,
			} = res.RESULT;
			if (pageInfo.currentPage == 1) {
				tableData.value = []
				tableData.value = RECORDS
			} else {
				tableData.value = [...tableData.value, ...RECORDS]
			}
			if (pageInfo.currentPage <= PAGES) {
				pageInfo.currentPage += 1
			}
			totalData.value = TOTALDATA ? JSON.parse(TOTALDATA) : null;
			pageInfo.totalResult = TOTAL
			pageInfo.totalPages = PAGES 

		})
	}
	const modelContent = ref('')
	const showModel = ref(false)
	const saveDataModel = ref({})
	const clickAlone = (row) => {
		uni.$emit("Select", row)
		setTimeout(() => {
			uni.navigateBack()
		}, 100)
	}

	const confirmModel = () => {
		const url = saveDataModel.value.btn.ACTIONADDRESS
		let data = null
		if (saveDataModel.value.NODE) {
			data = {
				NODE: saveDataModel.value.NODE,
				BILLNO: saveDataModel.value.row.BILLNO
			}
		}
		else {
			data = [saveDataModel.value.row.BILLNO]
		}
		global.$axios(url, data, 'POST').then(res => {
			showModel.value = false
			global.$_showToast(res.MESSAGE || '提交成功')
			setTimeout(() => {
				pageInfo.currentPage = 1
				queryList()
			}, 2000)
		}).catch(err => {
			showModel.value = false
		})
	}
	const goToForm = () => {
		uni.navigateTo({
			url: '/pages/common/form/form'
		})
	}
	const resetPopup = (val) => {
		queryForm.value = {}
		pageInfo.currentPage = 1
		queryList()
	}
	const search = (val) => {
		queryForm.value = val
		pageInfo.currentPage = 1
		queryList()
	}
	const keywordBlur = (val) => {
		queryForm.value.KEYWORD = val
		pageInfo.currentPage = 1
		queryList()
	}


	const defaultValue = ref(null)


	const commonTableRef = ref('')
	const permissDetailData = ref({})
	const showTable = ref(true)

	onBackPress((p) => {
	})
</script>

<style scoped lang="scss">
	.myCar {
		&.myCarFooter {
			padding-bottom: 120rpx;
		}

		.myCarItem {}
	}

	.footer {
		background-color: #307cff;
		height: 98rpx;
		font-size: 28rpx;
		font-weight: 500;
		color: #ffffff;
		line-height: 98rpx;
		text-align: center;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
	}



	.bidInfo {
		margin-top: 30rpx;

		&-header {
			color: #2c76ff;
			font-size: 24rpx;

			&-left {
				font-weight: bold;
			}
		}

		&-tableBg {
			background-color: #fff;
			overflow-y: auto;
			padding-top: 20rpx;

			.u-td {
				border: none;
			}

			.u-tr {
				border-bottom: 1rpx solid #bbbbbb;
			}

			.u-tr:first-child {
				border: none;
			}

			.u-th {
				background: rgba(48, 124, 255, 0.1);
				border: none !important;
				font-size: 28rpx;
				font-weight: 500;
				color: #151515;
			}
		}
	}
</style>