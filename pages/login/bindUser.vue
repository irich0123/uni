<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="绑定手机号" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="yjg-logo">
				<image :src="imgUrl+'/login/ic_safe.png'" />
			</view>
			<view class="color-black text-bold margin-bottom-xl margin-left-xl" style="font-size: 40rpx;">请绑定手机号
			</view>

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
						<input style="padding-left:10rpx" maxlength="4" v-model="smsCode" :placeholder="'请输入验证码'"
							type="number" />
					</view>

					<view
						class="text-center padding-tb-ssm padding-lr-lg text-sm bg-theme radius-s color-white margin-right-sm"
						@click="requestCode" :disabled="disabled">{{ codeText }}</view>
				</view>

				<view style="width:100%;" class="margin-top-sm margin-lr">
					<view class="flex align-center justify-center text-xl radius no-border" style="min-height:108rpx;"
						:class="btnDisabled?'text-gray bg-white':'color-white bg-theme'" @click="submit"
						:disabled="btnDisabled">确定</view>
				</view>
			</view>
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
		thirdPartyBind
	} from "@/api/user";
	import {
		regex,imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "bindUser",
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

				username: '',
				smsCode: '',
				type: null,
				uid: null,

				btnDisabled: true,
				
				imgUrl:imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			'inputValue': function(val) {
				this.btnDisabled = !((new RegExp(regex.mobile)).test(val.username) && (new RegExp(regex.sms)).test(val
					.smsCode));
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
		onLoad(options) {
			if (!!options.type) {
				this.type = parseInt(options.type);
			}
			this.uid = options.uid;

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
			
			//获取验证码
			requestCode() {
				let currentTime = this.currentTime;

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
					sendType: 3, //第三方绑定
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
			//登录
			submit() {
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

				let paramsData = {
					uid: this.uid,
					type: this.type,
					mobile: this.username,
					code: this.smsCode,
					recommendUserId: uni.getStorageSync("uId"),
				}
				let self = this;
				thirdPartyBind(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("token", res.data.token)
						uni.setStorageSync("user", res.data.userBaseInfo)
						self.successHandle();
					}
				});
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
				uni.removeStorageSync("uId");
				uni.setStorageSync("needRefresh", 1);
				uni.navigateBack({
					delta: 1,
				});
			}
		},
	}
</script>

<style scoped lang="scss">
	
	.yjg-logo {
		width: 90rpx;
		height: 115rpx;
		margin: 100rpx 50rpx 20rpx 50rpx;
		text-align: center;
	
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	::v-deep .input-placeholder {
		color: #aaaaaa
	}
	
	.container {
		width: 100%;
		height: 100vh;
	
		display: flex;
		flex-direction: column;
	
	}
	
</style>