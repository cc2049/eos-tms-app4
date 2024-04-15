<template>
	<view class="detail">
		<MasterForm ref="FormRef" v-model="FormValue" :mConfig="MConfig" :sConfig="SConfig" :sformValue="sformValue"
			:detail="isDetail && !isEdit" />
			<view class="fixed-btn" v-if="!isDetail || isEdit">
				<u-button type="primary" @click="submit" class="sub-btn">{{ BtnName }}</u-button>
			</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onNavigationBarButtonTap
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
		getRules,
		getShowCol,
		getFormValue
	} from "@/common/form"

	import MasterForm from "@/components/PageForm/PageForm.vue"

	import {
		mapState,
		mapActions
	} from 'pinia'

	const sysCode = ref(getApp().globalData.sysCode)
	const pageTitle = ref("")

	import SendStore from '@/store/detail-ZLZH.js'
	import config from '../../../uni_modules/vk-uview-ui/libs/config/config';
	const SendDetail = SendStore();

	import useUserStore from '@/store/user.js'
	const userStore = computed(() => useUserStore().userInfo)

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();

	const BtnName = ref('提交')

	const FormRef = ref(null)
	const FormValue = ref({})
	const rules = ref({})
	const MConfig = ref([]) 
	const SConfig = ref([]) 
	const subTableID = ref(null) 
	const sformValue = ref(null) 
	const isDetail = ref(false) 
	const isReal = ref(false) 
	const isEdit = ref(false) 
	const BILLNO = ref(false)
	let saveURL = ''
	const showSubBtn = ref(false)
	onLoad((p) => {
		
		isReal.value = p.isReal == 1 ? true : false
		isEdit.value = p.isEdit == 1 ? true : false
		isDetail.value = p.isDetail == 1 ? true : false
		BILLNO.value = p.BILLNO
		getPageConfig()
	})

	onNavigationBarButtonTap((obj) => {
		isDetail.value = !isDetail.value
	
	})

	const getPageConfig = () => {
		let portData = {}
		global.$u.api.getConifg(portData).then(res => {
			const {
				COLUMNS,
				BUTTON,
				SLOTCFG,
				QUERY,
				MAINTABLE,
				VNAME,
				SUBTABLE
			} = res.RESULT

			getSaveUrl(SLOTCFG, BUTTON)
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

			if (isDetail.value) {
				getDetail(SLOTCFG)
			}

			if (isReal.value) {
				if (userStore.value.CERTIFICATIONSTATUS == 1) {
					isDetail.value = true
				}
				if (userStore.value.CERTIFICATIONSTATUS != 0) {
					getDetail(SLOTCFG)
				}

			}

			let hasMap = COLUMNS.filter(i => i.CONTROLS == 'ExMap')
			hasMap.length ? getLocation(hasMap[0]) : null
		})

	}


	/** 地图获取坐标和位置 */

	const getLocation = (cfg) => {
		uni.getLocation({
			type: "gcj02",
			geocode: true,
			success: res => {
				let {
					province,
					city,
					district,
					poiName
				} = res.address
				let address = province + city + district + poiName,
					latLon = res.longitude + ',' + res.latitude,
					key = cfg.FIELD,
					ysKey = cfg.REVERFIELD
				FormValue.value[key] = address
				FormValue.value[ysKey] = latLon
				console.log("address:", address, ysKey)
			},
			fail: (err) => {
				console.log("address:", err)
			},
		});
	}

	const getSaveUrl = (SLOTCFG, BUTTON) => {
		let add = BUTTON.filter(i => i.ACTION == 'ADD');
		let edit = BUTTON.filter(i => i.ACTION == 'EDIT');
		saveURL = isEdit.value == 1 && edit.length ? edit[0].ACTIONADDRESS : add.length ? add[0].ACTIONADDRESS :
			SLOTCFG
		BtnName.value = add.length ? add[0].VNAME : '提交'
	}

	const submit = () => {
		let MRules = []
		let passRules = []
		let MRulesFilter = getShowCol(MConfig.value).filter(ele => ele.CONTROLS == 'ExAptitude')
		MRulesFilter.forEach(item => {
			let config = JSON.parse(item.OTHER)
			if ((config.isSwitch == 1 && FormValue.value[item.FIELD] && FormValue.value[item.FIELD] != 0) || (
					config.isSwitch != 1)) {
				let arr = JSON.parse(config.list)
				MRules = MRules.concat(...arr)
			}
		})
		MRules.forEach(item => {
			if (item.require == 1 && !FormValue.value[item.id]) {
				passRules.push(false)
			} else {
				passRules.push(true)
			}
		})
		if (passRules.includes(false)) {
			return uni.showToast({
				title: '请上传图片～',
				icon: 'none'
			})
		}

		FormRef.value.submitForm().then(resForm => {
			console.log('表单提交', resForm);
			global.$axios(saveURL, resForm, ).then(res => {
				global.$_showToast('提交成功')
				setTimeout(() => {
					uni.$emit('reload')
					uni.navigateBack()
				}, 2000)
			}).catch(err => {})
		}).catch(err => {})
	}


	const getDetail = (queryUrl) => {
		let data = {
			BILLNO: isReal.value ? userStore.value.USERID : BILLNO.value
		}
		global.$axios(queryUrl, data).then(res => {
			FormValue.value = Object.assign(FormValue.value, res.RESULT)
		}).catch(err => {})
	}
</script>

<style scoped lang="scss">
	.detail {
		padding-bottom: 100rpx;
	}

	.fixed-btn {
		padding: 10rpx;
		background-color: $uni-bg-color;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 10;
		width: 100%;

		.sub-btn {
			width: calc(100% - 30rpx);
		}
	}
</style>