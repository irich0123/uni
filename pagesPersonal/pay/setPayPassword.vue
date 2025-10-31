<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="设置支付密码" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-white margin-sm padding-top-sm padding-lr padding-bottom-lg radius-s">
				<view class="padding-tb text-black text-lg flex align-center justify-between">
					<view>请输入密码</view>
					<view v-if="!plaintext" @click="eyeClicked"><uni-icons type="eye" size="22"
							color="blue"></uni-icons></view>
					<view v-else @click="eyeClicked"><uni-icons type="eye-slash" size="22" color="blue"></uni-icons>
					</view>
				</view>
				<view @tap='keyboardOpen(0)'>
					<password-input ref="p0" :numLng='valArr[0].val' :plaintext="plaintext"></password-input>
				</view>
				<view class="padding-tb text-black text-lg flex align-center justify-between">请重复密码</view>
				<view @tap='keyboardOpen(1)'>
					<password-input ref="p1" :numLng='valArr[1].val' :plaintext="plaintext"></password-input>
				</view>
			</view>
			<view class="margin-sm padding-top padding-tb-lg padding-lr bg-white">
				<view class="padding-tb text-black text-lg flex align-center justify-between">校验验证码</view>
				<view class="bg-gray text-df padding-left flex align-center justify-start" style="min-height: 110rpx;">
					<input maxlength="11" v-model="username" type="number" disabled />
				</view>

				<view class="bg-gray margin-top radius-s flex align-center justify-center" style="min-height: 110rpx;">
					<view class="text-df padding-lr-sm flex-grow flex align-center justify-start">
						<input name="smsCode" maxlength="4" v-model="smsCode" :placeholder="userCodePlaceholder"
							placeholderStyle="color: #cccccc" id="smsCode" type="number" @blur="submitBtnValid" />
					</view>

					<button class="flex align-center justify-center text-sm bg-theme radius-s color-white" style="padding: 6rpx 24rpx;"
						@click="requestCode" :disabled="disabled">{{ codeText }}</button>
				</view>

				<number-keyboard ref='keyboard' v-model="value" @input='onInput'
					:psdLength='valArr[currentKey].lng'></number-keyboard>
			</view>

			<view class="margin-lr-sm margin-tb-sm">
				<button class="login flex align-center justify-center text-xl bg-theme color-white margin-lr" @click="submitPassword" :disabled="btnDisable">{{ buttonValue }}</button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import numberKeyboard from '../components/number-keyboard.vue'
	import passwordInput from '../components/password-input.vue'
	import {
		getSmsCode
	} from "@/api/api";
	import {
		regex,
		publicKey,active
	} from "@/utils/config";
	import {
		setPassword
	} from "@/api/user";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	
	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "setPayPassword",
		components: {
			numberKeyboard,
			passwordInput,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				buttonValue: '提交',
				newPassword: '',
				rePassword: '',
				value: '',
				currentKey: 0,
				valArr: [{
					val: '',
					lng: 6
				}, {
					val: '',
					lng: 6
				}, {
					val: '',
					lng: 6
				}],
				title: '支付密码',
				btnDisable: true,

				userCodePlaceholder: '请输入验证码',
				username: '',
				smsCode: '',
				currentTime: 60,
				codeText: '获取验证码',
				disabled: false,

				plaintext: true,
				
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			smsCode() {
				this.submitBtnValid();
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
		onLoad() {
			this.userData = uni.getStorageSync("user");
		},
		onShow() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			if (!this.token) {
				this.toLogin();
				return
			}
			this.username = this.userData.mobile;
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
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.navigateTo({
					url: '../login/login'
				})
			},
			//获取验证码
			requestCode() {
				let currentTime = this.currentTime;
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
					sendType: 2 //设置支付密码 需要的类型
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

			validate() {
				this.newPassword = this.valArr[0].val
				this.rePassword = this.valArr[1].val

				if (!this.newPassword) {
					uni.showToast({
						title: '请输入新密码',
						icon: "none",
						duration: 1500
					})
					return false;
				}
				if (!this.rePassword) {
					uni.showToast({
						title: '请再次输入密码',
						icon: "none",
						duration: 1500
					})
					return false;
				}
				if (this.rePassword !== this.newPassword) {
					uni.showToast({
						title: '两次密码不一致',
						icon: "none",
						duration: 1500
					})
					return false;
				}
				return true;
			},

			//密码提交
			submitPassword() {
				if (!this.validate()) {
					return;
				}
				let params = {
					deviceType: 2,
					password: encodeURI(jse.encrypt(this.newPassword)),
					code: this.smsCode,
				}
				setPassword(params).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "密码设置成功！",
							duration: 1500,
							icon: "none"
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 1500)
					}
				});
			},
			//打开键盘
			keyboardOpen(key) {
				this.currentKey = key;
				this.valArr[key].val = "";
				this.value = "";
				if (key === 0) {
					this.$refs.p0.SetActive(true);
				} else {
					this.$refs.p0.SetActive(false);
				}
				if (key === 1) {
					this.$refs.p1.SetActive(true);
				} else {
					this.$refs.p1.SetActive(false);
				}
				this.$refs.keyboard.reset();
				this.$refs.keyboard.open()
			},
			eyeClicked() {
				this.plaintext = !this.plaintext;
			},
			submitBtnValid() {
				this.btnDisable = !(this.valArr[0].val.length === this.valArr[0].lng &&
					this.valArr[1].val.length === this.valArr[1].lng &&
					(new RegExp(regex.sms)).test(this.smsCode));
			},
			//输入的值
			onInput(val) {
				this.valArr[this.currentKey].val = val;

				if (this.valArr[0].val.length === this.valArr[0].lng &&
					this.valArr[1].val.length === this.valArr[1].lng) {
					this.$refs.keyboard.close()
					this.btnDisable = !(new RegExp(regex.sms)).test(this.smsCode);
				} else {
					this.btnDisable = true;
					if (this.valArr[this.currentKey].val.length === this.valArr[this.currentKey].lng) {
						if (this.currentKey === 0) {
							this.keyboardOpen(this.currentKey + 1);
						} else {
							this.keyboardOpen(0);
						}
					}
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	
	.login {
		height: 90rpx;
		border-radius: 50rpx;
		letter-spacing: 2rpx;
		border: 0;
	}
	
	.login[disabled] {
		color: #cccccc;
		background: #fff;
	}
	
	.container {
		width: 100%;
		height: 100%;
	}
</style>