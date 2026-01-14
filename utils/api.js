import {
	baseUrl
} from '@/utils/config'


export const myRequest = (options) => {
	if (!options.header) {
		options.header = {};
	}

	options.header["appType"] = uni.getStorageSync("appType");
	options.header["adminToken"] = uni.getStorageSync("adminToken");

	// #ifdef APP-PLUS
	options.header["appversion"] = plus.runtime.version; //苹果Hyper版本号
	options.header["deviceType"] = uni.getStorageSync("platform"); //android(0), ios(1), js(2), harmonyOs(3);
	options.header["deviceInfo"] = uni.getStorageSync("deviceInfo");
	// #endif
	// #ifdef H5 || MP-WEIXIN
	options.header["appversion"] = "h5";
	options.header["deviceType"] = 'js'; //android(0), ios(1), js(2);
	options.header["openId"] = uni.getStorageSync("openId")
	// #endif

	//对应后端来说，公众号和小程序都用h5
	options.header["content-type"] = options.header["content-type"] || "application/json";
	options.header["token"] = uni.getStorageSync("token");

	let isShowLoading = false;
	if (!options.silent) {
		uni.showLoading({});
		isShowLoading = true;
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: options.header || {},

			success: (res) => {
				if (isShowLoading) {
					uni.hideLoading();
				}
				console.log("连接成功: ", options)
				console.log("后台返回数据: ", res.data)
				if (res.statusCode === 200) {
					if (res.data.retCode === 0) {
						resolve(res.data);
					} else if (!options.silent & (res.data.retCode + '').indexOf("401") > -1) {
						console.log(0);
						uni.showToast({
							title: '请登录',
							icon: 'none',
							duration: 3000
						})
						uni.removeStorageSync('token')
						uni.removeStorageSync('adminToken')
						uni.removeStorageSync("user");
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/login/login'
							})
						}, 1000)

					} else if (res.data.retCode > 200 && res.data.retCode < 300) {
						resolve(res.data); //特殊处理，这个有支付接口是这么返回信息的
					} else {
						if (!!options.catch) { //指定需要截获错误信息进行处理
							reject(res.data);
						} else if (!!options.data && (!!options.data.page || !!options.data
								.pageNum)) { //获取分页列表的接口，进行出错处理
							reject(res.data);
						} else if (!options.silent) { //非静默方式
							uni.showToast({
								title: res.data.message,
								icon: 'none',
								duration: 3000
							})
						}
					}
				} else {
					uni.showToast({
						title: '接口请求失败！' + res.statusCode,
						icon: 'none',
						duration: 2000
					})
				}
			},
			fail: (err) => {
				if (isShowLoading) {
					uni.hideLoading();
				}
				console.log("网络错误：", err)
				uni.showToast({
					title: JSON.stringify(err),
					icon: 'none',
					duration: 3000
				})
			},
		})
	})
}