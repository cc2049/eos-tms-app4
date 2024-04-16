import axios from '@/common/axios.js'
let hotSearchUrl = '/ebapi/store_api/hot_search';
let loginUrl = '/auth/check/login';
let menuUrl = '/sys/module/getMenuByRoleList'
const configUrl = '/sys/pageConfig/getByPageNo';
const userInfoUrl = '/sys/user/getUserAccountInfo';


uni.$eos = {
	api: {}
}
const install = (Vue, vm) => {
	let getUserToken = (params = {}) => axios({
		url: loginUrl,
		data: params,
		isAes: false
	});
	let getUserMenu = (params = {}) => axios({
		url: menuUrl,
		data: params,
	});
	let getConifg = (params = {}) => axios({
		url: configUrl,
		data: params,
	});
	let getUserInfo = (params = {}) => axios({
		url: userInfoUrl,
		data: params,
	});
	uni.$eos.api = {
		getUserToken,
		getUserMenu,
		getConifg,
		getUserInfo
	};
}

export default {
	install
}