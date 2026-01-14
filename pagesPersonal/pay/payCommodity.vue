<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商品支付" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--        商品基本 信息开始-->
			<view class="margin-sm text-df">
				<view class="text-ssm text-gray-5 margin-sm">
					商品信息
				</view>
				<view class="padding bg-white">
					<commodity-list-cell :show-status-bar="false" :commodity="commodity" />
				</view>
			</view>
			<!--        商品基本信息结束-->

			<!--        展示时间开始-->
			<uni-forms labelPosition="left" :model-value="commodity" border>
				<view class="bg-white radius-s">
					<uni-forms-item label="上架时间">
						<view class="text-black-4">{{ commodity.startShowTime | formatDate }}</view>
					</uni-forms-item>
					<uni-forms-item label="下架时间">
						<view class="text-black-4">{{ commodity.endShowTime | formatDate }}</view>
					</uni-forms-item>
					<uni-forms-item label="应付金额">
						<view class="flex align-center">
							<view class="text-theme text-normal">{{ totalMoney }}</view>
							<view class="padding-left-sm padding-right-xss text-black-4">元</view>
						</view>
					</uni-forms-item>
				</view>
			</uni-forms>
			<!-- 			
			<view class="flex align-center justify-between text-xs1 margin-lr-sm padding-tb-ssm padding-lr"
				:style="!theme?'':'background: #EEDC82;'">
				购买尾货通卡，免费发布展示商品信息！
			</view> -->
			<!--        展示时间结束-->

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
			<button class="bg-theme text-xl color-white radius-0" :disabled="payTypeIndex==null"
				@click="toPay">立即支付</button>
		</view>

		<passkeyboard :show="showPopup" :payType="payType" :money="totalMoney" @password="password" :isIphoneX="false" style="z-index: 99;"
			@close="close"></passkeyboard>
	</view>
</template>

<script>
	import {
		payWayConfig,
		publicKey,
		imgUrl,
		active
	} from '@/utils/config.js'
	import passkeyboard from '@/pagesPersonal/components/yzc-paykeyboard/yzc-paykeyboard.vue';
	import {
		formatTime,
	} from "@/utils/myUtil";
	import {
		getCommodityById,
		getPaymentForCommodityPost,
	} from "@/api/mall";
	import {
		getUserAccountInfoByUserId,
	} from "@/api/user";
	import {
		getPayOrderStatus,
		payAny
	} from "@/api/finance";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
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
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";

	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "payCommodity",
		components: {
			CommodityListCell,
			passkeyboard,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},
				openId: null,

				commodity: {
					id: null,
				},

				totalMoney: null,
				payType: null,
				showPopup: false,
				payPassword: null,

				payTypeIndex: null,
				imgSelected: imgUrl + '/mall/select.png',
				imgUnSelected: imgUrl + '/mall/noSelect.png',
				payWayConfig: payWayConfig,
				payWayList: [],

				userBalanceMoney: null,

				timer: null,
				startTime: 0,
				payData: {},

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
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
		filters: {
			formatDate(time) {
				return formatTime(time);
			},
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			this.openId = uni.getStorageSync('openId')

			this.payWayConfig.forEach(v => {
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
			this.payWayConfig.find(v => {
				return v.key === 'wx-app'
			}).active = true;
			this.payWayConfig.find(v => {
				return v.key === 'ali-app'
			}).active = true;
			// #endif

			this.commodity.id = parseInt(options.id);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			this.payWayList = this.payWayConfig.filter(v => v.active);

			if (this.payWayList.length > 0) {
				this.payTypeIndex = 0;
			}

			if (!this.token) {
				this.toLogin();
				return;
			}

			if (!!uni.getStorageSync("needRefresh")) {
				uni.removeStorageSync("needRefresh");
				this.initData();
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

			initData() {
				this.getCommodityDetailsById();
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

			//获取个人资料信息
			getUserInfo() {
				let self = this;
				getUserAccountInfoByUserId({
					userId: this.userData.id
				}).then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							self.userBalanceMoney = Number(res.data.balanceMoney / 1000);
						}
					}
				});
			},

			getCommodityDetailsById() {
				let paramsData = {
					id: this.commodity.id,
				}
				let self = this;
				getCommodityById(paramsData).then(res => {
					if (res.retCode === 0) {
						let commodity = res.data;

						if (!!commodity.photos) {
							commodity.photos = JSON.parse(commodity.photos);
						} else {
							commodity.photos = [];
						}

						if (!!commodity.unitPriceBreakdown) {
							commodity.unitPriceBreakdown = JSON.parse(commodity.unitPriceBreakdown);
						} else {
							commodity.unitPriceBreakdown = [];
						}

						self.commodity = commodity

						self.getPaymentForCommodityPost(self.commodity.sellerId, self.commodity.startShowTime, self
							.commodity.endShowTime);

						//获取用户现有的 余额以及金豆数
						self.getUserInfo();
					}
				});
			},
			//立即支付提交
			toPay() {
				if (this.payWayList[this.payTypeIndex].payType === 3) {
					this.showPopup = true;
					return
				}
				this.submitPay()
			},
			submitPay() {
				let self = this;
				let paramsData = {
					payType: this.payWayList[this.payTypeIndex].payType,
					productSaleId: this.commodity.id,
					targetType: 9,
					openId: this.openId,
				}

				paramsData['extendedShowDays'] = this.day
				paramsData['targetType'] = 9

				paramsData['payAmount'] = this.totalMoney * 1000;

				if (this.payWayList[this.payTypeIndex].payType === 3) {
					paramsData["deviceType"] = 2;
					paramsData['password'] = jse.encrypt(this.payPassword);
					payAny(paramsData).then(res => {
						if (res.retCode === 0) {
							self.paySuccess();
						}
					}).catch(err => {
						uni.showToast({
							title: err.message,
							icon: "error",
						})
					});
				} else {
					// #ifdef H5 | MP-WEIXIN
					this.h5AndMpHandle(paramsData);
					// #endif

					// #ifdef APP-PLUS
					this.appPlusHandle(paramsData);
					// #endif
				}
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

			password(e) {
				this.payPassword = e
				if (this.payPassword) {
					this.submitPay()
				} else {
					uni.showToast({
						title: '请输入支付密码',
						icon: "none",
						duration: 1500
					})
				}
			},
			close() {
				this.showPopup = false
			},
			//选择支付方式
			choosePayWay(index) {
				this.payTypeIndex = index;
				this.payType = this.payWayList[this.payTypeIndex].payType;
			},

			getPaymentForCommodityPost(sellerId, startShowTime, endShowTime) {
				let paramsData = {
					sellerId: sellerId,
					startShowTime: startShowTime,
					endShowTime: endShowTime
				}
				let self = this;
				getPaymentForCommodityPost(paramsData).then(res => {
					if (res.retCode === 0) {
						self.totalMoney = res.data / 1000;
					}
				});
			},
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
	}

	.blank {
		height: 100rpx;
	}

	::v-deep .uni-forms {
		background-color: transparent;
		margin: 20rpx;

		.uni-forms-item {
			display: flex;
			flex-direction: column;
			font-size: 28rpx;
			padding: 10rpx 0;
			background-color: transparent !important;

			.uni-forms-item__box {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				.uni-forms-item__inner {
					width: 100%;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					padding: 10rpx 0;

					.uni-forms-item__label {
						padding-left: 20rpx;
						font-size: 28rpx;

						.label-icon {
							margin-right: 5px;
							margin-top: -1px;
						}

						.is-required {
							padding-right: 4rpx;
						}
					}

					.uni-forms-item__content {
						display: flex;
						align-items: center;
						justify-content: flex-end;
						padding-right: 20rpx;

					}
				}
			}
		}
	}
</style>