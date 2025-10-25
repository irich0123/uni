<template>
	<view class="container">
	</view>
</template>

<script>
	import {
		GetRequest
	} from "@/utils/myUtil";
	import {
		getOpenIdByCode
	} from "@/api/push";

	export default {
		name: "index",
		data() {
			return {
				weChatCode: '',
				openId: '',
				urlParam: '',
			}
		},
		onLoad(options) {
			for (var key in options) {
				var value = options[key]
				this.urlParam += key + '=' + value + '&'
			}
			if (this.urlParam.length > 0) {
				this.urlParam = this.urlParam.slice(0, -1);
			}

			this.openId = uni.getStorageSync("openId")

			// #ifdef H5
			this.requestParam = GetRequest();
			this.weChatCode = this.requestParam.code;
			// #endif

			this.getOpenId();
		},
		methods: {
			getOpenId() {
				// #ifdef H5
				if (!this.weChatCode) {
					// 获取到微信code，并授权登录
					if (!this.requestParam.code) {
						let pageUrl = window.location.href
							.replace(/[/]/g, "%2f")
							.replace(/[:]/g, "%3a")
							.replace(/[#]/g, "%23")
							.replace(/[&]/g, "%26")
							.replace(/[=]/g, "%3d");
						window.location.href =
							"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxdded918741d63a55&redirect_uri=" +
							pageUrl +
							"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
					}
				}

				if (this.weChatCode) {
					let self = this;
					let param = {
						code: self.weChatCode,
						projectName: 'YJG'
					}
					getOpenIdByCode(param).then(res => {
						if (res.retCode === 0) {
							self.openId = res.data
							uni.setStorageSync('openId', self.openId);
							uni.reLaunch({
								url: "/pages/index/index?" + self.urlParam,
							});
						}
					});
				}
				// #endif

				// #ifdef MP-WEIXIN
				let self = this;
				uni.login({
					provider: 'weixin',
					success: function(loginRes) {
						let param = {
							code: loginRes.code,
							projectName: 'yjgMini',
						}
						getOpenIdByCode(param).then(res => {
							if (res.retCode === 0) {
								self.openId = res.data;
								uni.setStorageSync('openId', self.openId);
								uni.reLaunch({
									url: "/pages/index/index?" + self.urlParam,
								});
							}
						});
					}
				});
				// #endif
			},
		}
	}
</script>

<style scoped>

</style>