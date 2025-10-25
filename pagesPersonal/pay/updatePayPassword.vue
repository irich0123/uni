<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="修改支付密码" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="margin-sm padding-top-sm padding-lr padding-bottom-lg radius-s">
				<view class="padding-tb text-black text-lg flex align-center justify-between">
					<view>请输入旧密码</view>
					<view v-if="!plaintext" @click="eyeClicked"><uni-icons type="eye" size="22"
							color="blue"></uni-icons>
					</view>
					<view v-else @click="eyeClicked"><uni-icons type="eye-slash" size="22" color="blue"></uni-icons>
					</view>
				</view>
				<view @tap='keyboardOpen(0)'>
					<password-input ref="p0" :numLng='valArr[0].val' :plaintext="plaintext"></password-input>
				</view>

				<view class="padding-tb text-black text-lg flex align-center justify-between">请输入新密码</view>
				<view @tap='keyboardOpen(1)'>
					<password-input ref="p1" :numLng='valArr[1].val' :plaintext="plaintext"></password-input>
				</view>
				<view class="padding-tb text-black text-lg flex align-center justify-between">请重复新密码</view>
				<view @tap='keyboardOpen(2)'>
					<password-input ref="p2" :numLng='valArr[2].val' :plaintext="plaintext"></password-input>
				</view>

				<number-keyboard ref='keyboard' v-model="value" @input='onInput'
					:psdLength='valArr[currentKey].lng'></number-keyboard>
			</view>

			<view class="margin-lr-sm margin-top margin-bottom-xs">
				<button class="login flex align-center justify-center text-xl bg-theme color-white margin-lr"
					@click="verifyOldPassword" :disabled="btnDisable">{{ buttonValue }}</button>
			</view>

			<view class="forget_box" @click.stop="goToSetPassword">
				忘记支付密码？
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import numberKeyboard from '../components/number-keyboard.vue'
	import passwordInput from '../components/password-input.vue'
	import {
		hasPassword,
		setPassword,
		verUserPassword
	} from "@/api/user";
	import {
		publicKey,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "updatePayPassword",
		components: {
			numberKeyboard,
			passwordInput,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				buttonValue: '确认设置',
				oldPassword: "",
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

				plaintext: true,

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			valArr: {
				handler(newVal) {
					this.btnDisable = !(newVal[0].val.length === 6 && newVal[1].val.length === 6 && newVal[2].val
						.length === 6);
				},
				deep: true
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
		onShow() {
			this.hasPassword()
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

			goToSetPassword() {
				uni.redirectTo({
					url: '/pagesPersonal/pay/setPayPassword'
				})
			},

			//密码提交
			verifyOldPassword() {
				if (!this.validate()) {
					return;
				}
				let params = {
					deviceType: 2,
					password: jse.encrypt(this.oldPassword)
				}
				let self = this;
				verUserPassword(params).then(res => {
					if (res.retCode === 0) {
						self.postNewPassword();
					}
				});
			},
			postNewPassword() {
				let params = {
					password: jse.encrypt(this.newPassword),
					deviceType: 2,
				}
				setPassword(params).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "密码重置成功！",
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
			validate() {
				this.oldPassword = this.valArr[0].val
				this.newPassword = this.valArr[1].val
				this.rePassword = this.valArr[2].val

				if (!this.oldPassword) {
					uni.showToast({
						title: '请输入原密码',
						icon: "none",
						duration: 1500
					})
					return false;
				}

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
				if (key === 2) {
					this.$refs.p2.SetActive(true);
				} else {
					this.$refs.p2.SetActive(false);
				}
				this.$refs.keyboard.reset();
				this.$refs.keyboard.open()
			},
			eyeClicked() {
				this.plaintext = !this.plaintext;
			},
			//输入的值
			onInput(val) {
				this.valArr[this.currentKey].val = val;

				if (this.valArr[0].val.length === this.valArr[0].lng &&
					this.valArr[1].val.length === this.valArr[1].lng &&
					this.valArr[2].val.length === this.valArr[2].lng) {
					this.$refs.keyboard.close()
					this.btnDisable = false;
				} else {
					this.btnDisable = true;
					if (this.valArr[this.currentKey].val.length === this.valArr[this.currentKey].lng) {
						if (this.currentKey < 2) {
							this.keyboardOpen(this.currentKey + 1);
						} else {
							this.keyboardOpen(0);
						}
					}
				}
			},
			//检查是否存在密码
			hasPassword() {
				let self = this;
				hasPassword().then(res => {
					if (res.retCode === 0) {
						if (!!res.data) {
							self.title = '支付密码修改'
							self.buttonValue = '确认修改'
						} else {
							self.title = '支付密码设置'
							self.buttonValue = '确认设置'
						}
						uni.setNavigationBarTitle({
							title: self.title
						})
					}
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;

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

		.forget_box {
			color: #0081ff;
			font-size: 24rpx;
			text-align: right;
			padding: 10rpx 60rpx 20rpx 0;
		}
	}
</style>