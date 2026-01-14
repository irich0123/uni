<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--        输入金额开始-->
			<view class="bg-white padding-lg margin-sm radius">
				<view class="text-lg text-gray-4">
					充值金额
				</view>

				<view class="flex color-black padding-tb-xl align-center" style="font-size: 72rpx;">
					<view class="text-black">
						￥
					</view>
					<view>
						<input class="text-black" type="number" placeholder="0.00" v-model="money" step="0.01"
							style="font-size:72rpx;height:100rpx;line-height:100rpx;" />
					</view>
				</view>
			</view>

			<!--        支付方式开始-->
			<view class="bg-white margin-sm padding-top-lg radius">
				<view class="padding-lr-sm">
					<view class="text-lg text-black gray-border-bottom padding-bottom-lg">支付方式</view>
				</view>
				<view class="padding-lr-xl">
					<view v-for="(item,index) in payWayList" :key="index" @click.stop="choosePayWay(index)"
						class="padding-tb-xl gray-border-bottom">
						<view v-if="item.active" class="flex align-center justify-between">
							<view class="flex align-center">
								<image style="width: 40rpx;height: 40rpx;" :src="item.img"></image>
								<view class="text-normal margin-left-sm text-black">{{ item.name }}</view>
							</view>
							<image style="width: 40rpx;height: 40rpx;"
								:src="index===payTypeIndex?imgSelected:imgUnSelected"></image>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" :disabled="disableSubmitBtn"
				@click="submitPay">确认充值</button>
		</view>

	</view>
</template>

<script>
	import {
		regex,
		payWayConfig,
		imgUrl,
		active
	} from "@/utils/config";
	import {
		getPayOrderStatus,
		payAny
	} from "@/api/finance";
	
	// #ifdef H5
	import {
		h5OnBridgeReady,
	} from "@/utils/pay";
	// #endif
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	import {
		appAliPay,
		appWeixinPay,
		mpWeixinMiniPay,
	} from "@/utils/pay";
	// #endif

	export default {
		name: "payFund",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				money: null,

				token: null,
				userData: {},
				openId: null,

				targetType: null,

				payTypeIndex: null,
				imgSelected: imgUrl + '/mall/select.png',
				imgUnSelected: imgUrl + '/mall/noSelect.png',
				payWayConfig: payWayConfig,
				payWayList: [],
				disableSubmitBtn: true,

				timer: null,
				startTime: 0,
				payData: {},

				title: '',
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			money: function() {
				this.btnValid();
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
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			this.openId = uni.getStorageSync('openId');

			this.targetType = parseInt(options.type);

			if (this.targetType == null || (this.targetType !== 1 && this.targetType !== 6)) {
				uni.showToast({
					title: "参数错误！",
					icon: "error",
					duration: 2000,
				})
				setTimeout(() => {
					uni.navigateBack({
						delta: 1,
					})
				})
			} else if (this.targetType === 1) {
				// #ifdef H5
				uni.setNavigationBarTitle({
					title: "充值余额",
				})
				// #endif
				// #ifndef H5
				this.title = "充值余额";
				// #endif
			} else if (this.targetType === 6) {
				// #ifdef H5
				uni.setNavigationBarTitle({
					title: "充值保证金",
				})
				// #endif
				// #ifndef H5
				this.title = "充值保证金";
				// #endif
			}
			
			this.payWayConfig.forEach(v=>{
				v.active = false;
			})

			// #ifdef H5
			this.payWayConfig.find(v => {
				return v.key === 'wx-h5'
			}).active = true;
			// #endif
			// #ifdef MP-WEIXIN
			this.payWayConfig.find(v => {
				return v.key === 'wx-mini'
			}).active = true;
			// #endif
			// #ifdef APP-PLUS
			//这里不能用苹果支付 充值
			this.payWayConfig.find(v => {
				return v.key === 'wx-app'
			}).active = true;
			this.payWayConfig.find(v => {
				return v.key === 'ali-app'
			}).active = true;
			// #endif
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			this.payWayList = this.payWayConfig.filter(v => v.active);

			if (this.payWayList.length > 0) {
				this.payTypeIndex = 0;
			}

			console.log("payWayList=", this.payWayList);

			if (!this.token) {
				this.toLogin();
			}
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
					url: '/pages/login/login'
				})
			},

			verification() {
				if (!new RegExp(regex.decimal_two_digit).test(this.money)) {
					uni.showToast({
						title: '充值金额最多两位小数',
						icon: "none",
						duration: 1500
					})
					return
				}
				if (parseFloat(this.money) <= 0) {
					uni.showToast({
						title: '充值金额必须大于0',
						icon: "none",
						duration: 1500
					})
					return
				}
				return true
			},
			//充值
			submitPay() {
				if (!this.verification()) {
					return
				}
				let self = this;
				let paramsData = {
					"openId": this.openId,
					"payType": this.payWayList[this.payTypeIndex].payType,
					"targetType": this.targetType, //1充值余额  6=充值保证金
					"buyAmount": Number(this.money) * 1000,
					"payAmount": Number(this.money) * 1000,
				}

				// #ifdef H5 | MP-WEIXIN 
				this.h5AndMpHandle(paramsData);
				// #endif

				// #ifdef APP-PLUS
				this.appPlusHandle(paramsData);
				// #endif
			},

			onBridgeReady() {
				let self = this;
				h5OnBridgeReady(this.payData).then(() => {
					self.handlePayResult();
				})
			},
			h5AndMpHandle(paramsData) {
				let self = this;
				payAny(paramsData).then(res => {
					if (res.retCode === 0) {
						self.payData = res.data;
						if (self.payWayList[self.payTypeIndex].payType === 8) { //微信H5支付
							// #ifdef H5
							if (typeof WeixinJSBridge === "undefined") {
								if (document.addEventListener) {
									document.addEventListener('WeixinJSBridgeReady', self.onBridgeReady,
										false);
								} else if (document.attachEvent) {
									document.attachEvent('WeixinJSBridgeReady', self.onBridgeReady);
									document.attachEvent('onWeixinJSBridgeReady', self.onBridgeReady);
								}
							} else {
								self.onBridgeReady();
							}
							// #endif
						} else if (self.payWayList[self.payTypeIndex].payType === 5) { //微信小程序支付
							//    #ifdef MP-WEIXIN
							mpWeixinMiniPay(self.payData).then(() => {
								self.handlePayResult();
							});
							// #endif
						}
					}
				});
			},
			appPlusHandle(paramsData) {
				let self = this;
				payAny(paramsData).then(resPay => {
					if (resPay.retCode === 0) {
						self.payData = resPay.data;
						uni.getProvider({
							service: 'payment',
							success: async (res) => {
								if (self.payWayList[self.payTypeIndex].payType === 1 &&
									res.providers.findIndex((channel) => {
										return (channel.id === 'wxpay')
									}) > -1) { //微信APP支付
									appWeixinPay(self.payData).then(() => {
										self.handlePayResult();
									})
								} else if (self.payWayList[self.payTypeIndex].payType === 2 &&
									res.providers.findIndex((channel) => {
										return (channel.id === 'alipay')
									}) > -1) { //支付宝

									let payDataString = self.payData;
									let orderInfo = payDataString.split("&orderNo=")[0];

									self.payData = {};
									self.payData.orderNo = payDataString.split("&orderNo=")[1];
									appAliPay(orderInfo).then(() => {
										self.handlePayResult();
									})
								}
							},
						});
					}
				});
			},

			// 开始准备轮询
			handlePayResult() {
				this.startTime = new Date().getTime() // 获取触发轮询时的时间
				this.inquireData() // 调用轮询接口,开始进行轮询
			},
			inquireData() {
				const reload = () => {
					clearTimeout(this.timer) // 清除定时器
					// 超过5秒则停止轮询
					if (new Date().getTime() - this.startTime > 5 * 1000) {
						clearTimeout(this.timer);
						uni.showToast({
							title: "支付失败！",
							icon: "error",
						})
						return
					}
					// 1s一次, 轮询中
					this.timer = setTimeout(() => {
						this.inquireData() // 调用轮询
					}, 1000)
				}
				let params = {
					orderNo: this.payData.orderNo,
				}
				let self = this;
				getPayOrderStatus(params).then(res => {
					if (res.retCode === 0) {
						if (!!res.data) { //'1'表示支付成功！
							self.paySuccess();
						} else {
							reload()
						}
					}
				}).catch(() => {
					// 请求错误,也继续轮询
					reload()
				})
			},

			paySuccess() {
				uni.showToast({
					title: '支付成功！',
					duration: 2000
				})
				setTimeout(() => {
					uni.setStorageSync("needRefresh", 1);
					uni.navigateBack({
						delta: 1,
					})
				}, 2000);
			},

			//选择支付方式
			choosePayWay(index) {
				this.payTypeIndex = index;
				this.payType = this.payWayList[this.payTypeIndex].payType;
				this.btnValid();
			},

			btnValid() {
				if (parseFloat(this.money) < 0) {
					uni.showToast({
						title: '充值金额必须大于0',
						icon: "none",
						duration: 1500
					});
					this.disableSubmitBtn = true;
					return
				}
				if (!!this.money && !new RegExp(regex.decimal_two_digit).test(this.money)) {
					uni.showToast({
						icon: 'none',
						title: '最多2位小数',
						duration: 1500
					});
					this.disableSubmitBtn = true;
					return;
				}
				this.disableSubmitBtn = !(this.money && Number(this.money) > 0 && this.payTypeIndex != null);
			}
		},
		beforeDestroy() {
			clearTimeout(this.timer)
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
	}
</style>