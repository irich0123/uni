<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="请登录" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="yjg-logo">
				<image :src="imgUrl+'/login/logo.png'" />
			</view>
			<view class="text-black text-bold margin-bottom-xl margin-left-xl" style="font-size: 42rpx;">欢迎您！</view>

			<view class="margin-lr flex flex-direction align-center justify-center">
				<view style="width:100%;min-height:112rpx;"
					class="bg-white radius-s  margin-bottom-lg flex align-center">
					<view class="text-df padding-left flex align-center justify-start">
						<input maxlength="11" :placeholder="'请输入手机号'" v-model="username" type="number" />
					</view>
				</view>

				<view style="width:100%;min-height:112rpx;"
					class="bg-white radius-s margin-bottom-lg flex align-center">
					<view class="text-df padding-left flex align-center justify-start flex-grow">
						<input maxlength="4" v-model="smsCode" :placeholder="'请输入验证码'" type="number" />
					</view>

					<view
						class="text-center padding-tb-ssm padding-lr-lg text-sm bg-theme radius-s color-white margin-right-sm"
						@click="requestCode">{{ codeText }}</view>
				</view>

				<view style="width:100%;" class="margin-top-sm margin-lr">
					<view class="flex align-center justify-center text-xl radius no-border" style="min-height:108rpx;"
						:class="btnDisabled?'text-gray bg-white':'color-white bg-theme'" @click="submit"
						:disabled="btnDisabled">登录</view>
				</view>

				<view class="margin-tb-ssm margin-lr text-sm flex align-center justify-start text-black-5">
					<checkbox-group @change="checkChanged">
						<checkbox :checked="isAgree" shape="square" />
					</checkbox-group>
					<view style="padding-top: 2rpx;">
						<text class="text-gray-4">我同意云加工</text>
						<text class="text-gray-4" style="color: #9999ff;" @click="toWebView(0)">《用户服务协议》</text>
						<text class="text-gray-4">和</text>
						<text class="text-gray-4" style="color: #9999ff;" @click="toWebView(1)">《隐私政策》</text>
					</view>
				</view>
			</view>

			<!-- #ifdef APP-PLUS -->
			<view class="flex flex-direction align-center justify-center">
				<view class="text-xs text-gray-5 text-center margin-top-xl padding-top-xl">第三方账号登录</view>
				<view class="margin-tb">
					<image :src="iosImg" class="padding" style="width:88rpx;height:88rpx;" @click="oauth('apple')"
						v-if="platform==='ios'" />
					<image v-show="wechat" :src="imgUrl+'/ic_login_wx.png'" class="padding"
						style="width: 88rpx;height: 88rpx;" @click="oauth('weixin')"></image>
					<image v-show="qq" :src="imgUrl+'/ic_login_qq.png'" class="padding"
						style="width: 88rpx;height: 88rpx;" @click="oauth('qq')"></image>
				</view>
			</view>
			<!-- #endif -->

		</scroll-view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	let jpushModule = uni.requireNativePlugin("JG-JPush");
	// #endif
	import {
		getSmsCode,
	} from "@/api/api";
	import {
		getOpenIdByCode,
	} from "@/api/push";
	import {
		getThirdPartyLoginType,
	} from "@/api/basic";
	import {
		thirdPartyLogin,
		userLogin,
		iosUserVerify
	} from "@/api/user";
	import {
		regex,
		imgUrl,
		webUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "login",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				disabled: false,
				codeText: '获取验证码',
				currentTime: 60,
				interval: null,

				isAgree: false,

				username: '',
				smsCode: '',

				btnDisabled: true,

				linkList: [{
						"url": webUrl + '/useragreement/index.html?t=' + new Date().getTime(),
						"name": '用户协议',
					},
					{
						"url": webUrl + '/privacy/index.html?t=' + new Date().getTime(),
						"name": '隐私政策',
					},
				],
				wechat: false,
				qq: false,

				thirdPartyLoginTypeList: [],
				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

				iosImg: imgUrl + '/ic_login_ios1.png',
				theme: 1,
				platform: 'android',
			}
		},
		watch: {
			inputValue: {
				handler(newVale) {
					this.btnDisabled = !((new RegExp(regex.mobile)).test(newVale.username) && (new RegExp(regex.sms)).test(
						newVale
						.smsCode));
				}
			},
			theme: {
				handler(newVal, oldVal) {
					if (newVal !== oldVal) {
						this.changeTheme();
					}
				},
				immediate: true,
			},
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		computed: {
			inputValue() {
				const {
					username,
					smsCode
				} = this;
				return {
					username,
					smsCode
				}
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			this.platform = uni.getSystemInfoSync().platform;

			this.theme = uni.getStorageSync("theme");
			uni.onThemeChange((res) => {
				this.theme = (res.theme === 'light' ? 1 : 0);
				uni.setStorageSync("theme", this.theme);
			})
			// #endif

			this.initData();
		},
		onShow() {
			// #ifdef APP-PLUS
			this.checkAppExist();
			// #endif
		},
		methods: {
			navAction(e) {
				if (e.action === 'back') {
					uni.navigateBack({
						delta: 1 // 返回的页面数
					});
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},
			changeTheme() {
				if (!!this.theme) {
					this.iosImg = this.iosImg.split(".png")[0] + "-dark.png";
				} else {
					this.iosImg = this.iosImg.replace("-dark", "");
				}
				this.$forceUpdate();
			},
			initData() {
				this.getLoginType();
			},
			getLoginType() {
				let self = this;
				getThirdPartyLoginType({}).then(res => {
					if (res.retCode === 0) {
						self.thirdPartyLoginTypeList.splice(0, self.thirdPartyLoginTypeList.length);
						self.thirdPartyLoginTypeList = res.data;
					}
				});
			},
			//获取验证码
			requestCode() {
				if (this.disabled) {
					return;
				}

				let currentTime = this.currentTime;

				console.log(this.username)
				if (this.username === '' || !(new RegExp(regex.mobile)).test(this.username)) {
					uni.showToast({
						icon: "none",
						title: "请输入正确的手机号",
						duration: 3000
					})
					return
				}

				this.interval = setInterval(() => {
					currentTime--;
					this.codeText = currentTime + '秒'
					this.disabled = true

					if (currentTime <= 0) {
						clearInterval(this.interval)
						this.codeText = '重新发送'
						this.disabled = false
					}
				}, 1000)

				let paramsData = {
					mobile: this.username,
					sendType: 1
				}
				getSmsCode(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '验证码获取成功',
							duration: 1000
						})
					}
				});
			},
			checkChanged(e) {
				if (e.detail.value.length > 0) {
					this.isAgree = true;
				} else {
					this.isAgree = false;
				}
			},

			//登录
			submit() {
				if (this.btnDisabled) {
					return
				}

				if (!this.username || !(new RegExp(regex.mobile)).test(this.username)) {
					uni.showToast({
						icon: "none",
						title: "请输入正确的手机号",
						duration: 2000
					})
					return
				}

				if (this.smsCode.length !== 4) {
					uni.showToast({
						icon: "none",
						title: "验证码格式不正确",
						duration: 2000
					})
					return
				}

				if (!this.isAgree) {
					uni.showToast({
						icon: "none",
						title: "请勾选同意云加工用户服务协议和隐私政策",
						duration: 2000
					})
					return
				}
				let self = this;
				let paramsData = {
					mobile: this.username,
					code: this.smsCode,
					recommendUserId: uni.getStorageSync("uId"),
					// #ifdef APP-PLUS
					appType: 0, // APP(0), 云加工小程序(1), 云加工公众号(2), 云招工公众号(3);
					// #endif
					// #ifdef H5
					appType: 2
					// #endif
					// #ifdef MP-WEIXIN
					appType: 1
					// #endif
				}
				userLogin(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("token", res.data.token)
						uni.setStorageSync("user", res.data.userBaseInfo)
						self.successHandle();
					}
				});
			},
			toWebView(index) {
				uni.navigateTo({
					url: '/pages/common/webview?url=' + encodeURIComponent(this.linkList[index].url) + '&name=' +
						encodeURIComponent(this.linkList[index].name),
				})
			},
			oauth(provider) {
				if (!this.isAgree) {
					uni.showToast({
						icon: "none",
						title: "请勾选同意云加工用户服务协议和隐私政策",
						duration: 2000
					})
					return
				}

				let self = this;
				uni.getProvider({
					service: 'oauth',
					success: function(res) {
						console.log(res);
						if (~res.provider.indexOf(provider)) {
							if (provider === "weixin") {
								uni.login({
									provider: provider,
									onlyAuthorize: true,
									success: function(event) {
										console.log(JSON.stringify(event));
										self.getWxOpenIdByCode(event.code);
									}
								});
							} else if (provider === "qq") {
								uni.login({
									provider: provider,
									success: function(loginRes) {
										console.log(JSON.stringify(loginRes));
										uni.getUserInfo({
											provider: provider,
											success: function(info) {
												console.log("info:", info)
												// 获取用户信息成功, info.authResult保存用户信息
												self.thirdPartyLogin(provider, info
													.userInfo.openid, info.userInfo
													.nickName, info.userInfo
													.headimgurl)
											}
										})
									},
									fail: function(err) {
										console.log("err:", err)
										// 登录授权失败  
										// err.code是错误码
									}
								});
							} else if (provider === "apple") {
								uni.login({
									provider: provider,
									success: function(event) {
										// console.log(JSON.stringify(appleInfo));
										self.getAppleUserInfo(provider);
									}
								});

							}
						}
					}
				});
			},
			getWxOpenIdByCode(code) {
				let self = this;
				let param = {
					code: code,
					projectName: "yjgApp",
				}
				getOpenIdByCode(param).then(res => {
					if (res.retCode === 0) {
						self.thirdPartyLogin("weixin", res.data, null, null);
					}
				});

			},
			thirdPartyLogin(provider, uid, name, avatar) {
				let type = this.thirdPartyLoginTypeList.find(v => v.label === provider).value;

				let self = this;
				let param = {
					type: type,
					uid: uid,
					name: !!name ? name : null,
					iconurl: avatar,
				}
				thirdPartyLogin(param).then(res => {
					if (res.retCode === 0) {
						if (!!res.data.token) {
							uni.setStorageSync("token", res.data.token)
							uni.setStorageSync("user", res.data.userBaseInfo);
							self.successHandle();
						} else {
							uni.redirectTo({
								url: './bindUser?uid=' + uid + '&type=' + type,
							})
						}
					}
				});
			},
			iosUserVerify(provider, userInfo) {
				let type = this.thirdPartyLoginTypeList.find(v => v.label === provider).value;
				let self = this;
				iosUserVerify({
					identityToken: userInfo.identityToken
				}).then(res => {
					if (res.retCode === 0) {
						if (!!res.data.token) {
							uni.setStorageSync("token", res.data.token)
							uni.setStorageSync("user", res.data.userBaseInfo);
							self.successHandle();
						} else {
							uni.redirectTo({
								url: '/pages/login/bindUser?uid=' + res.data.uid + '&type=' + type,
							})
						}
					}
				});
			},
			getAppleUserInfo(provider) {
				let self = this;
				uni.getUserInfo({
					provider: 'apple',
					success: function(info) {
						console.log("info=", info);
						if (info.errMsg.indexOf(":ok") > -1) {
							// 获取用户信息成功, info.authResult中保存登录认证数据
							self.iosUserVerify(provider, info.userInfo);
						}
					}
				})
			},
			successHandle() {
				// #ifdef APP-PLUS 
				jpushModule.setAlias({
					'alias': uni.getStorageSync("deviceInfo"),
					'sequence': 1
				});
				// #endif
				uni.showToast({
					icon: "success",
					title: "登录成功",
					duration: 1000
				});
				setTimeout(() => {
					uni.removeStorageSync("uId");
					uni.setStorageSync("needRefresh", 1);
					uni.navigateBack();
				}, 1000);
			},
			checkAppExist() {
				if (plus.runtime.isApplicationExist({
						pname: 'com.tencent.mm',
						action: 'weixin://'
					})) {
					this.wechat = true;
				} else {
					this.wechat = false;
				}
				if (plus.runtime.isApplicationExist({
						pname: 'com.tencent.mobileqq',
						action: 'mqq://'
					})) {
					this.qq = true;
				} else {
					this.qq = false;
				}
			}
		},
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100vh;
	}

	.yjg-logo {
		width: 269rpx;
		height: 108rpx;
		margin: 80rpx 50rpx;

		image {
			width: 100%;
			height: 100%;
		}
	}

	::v-deep .input-placeholder {
		color: #aaaaaa
	}



	/* #ifdef MP-WEIXIN  */
	::v-deep checkbox .wx-checkbox-input {
		border-color: #fb5318 !important;
		color: #fb5318 !important;
		border-radius: 8rpx;
	}

	::v-deep checkbox {
		transform: scale(0.65);
	}

	/* #endif  */

	/* #ifndef MP-WEIXIN  */
	/* checkbox 边框颜色 */
	::v-deep uni-checkbox .uni-checkbox-input {
		border-color: #fb5318 !important;
		transform: scale(0.45);
		padding: 6rpx !important;
		border-radius: 80rpx !important;
	}

	/* checkbox 选中后的边框颜色 */
	::v-deep uni-checkbox .uni-checkbox-input-checked {
		border-color: #fb5318 !important;
	}

	/* checkbox 选中后的样式 */
	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked {
		background-color: #fb5318 !important;
		border-color: #fb5318 !important;
		background-clip: content-box !important;
		padding: 6rpx !important;
	}

	/* checkbox 选中后的图标样式*/
	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked::before {
		display: none !important;
	}

	/* #endif  */


	@media (prefers-color-scheme: dark) {
		::v-deep uni-checkbox .uni-checkbox-input {
			background-color: transparent !important;
		}
	}
</style>