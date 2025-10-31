<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="置顶支付" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="margin-sm padding-tb-sm radius-s bg-white">
				<uni-list>
					<uni-list-item title="置顶城市" :show-arrow="false" :right-text="stickApply.addressDetails" />
					<uni-list-item title="展示位置" :show-arrow="false" :right-text="stickApply.type | typeFilter(that)" />
					<uni-list-item title="开始时间" :show-arrow="false" :right-text="stickApply.starttime | formatDate" />
					<uni-list-item title="结束时间" :show-arrow="false" :right-text="stickApply.endtime | formatDate" />
					<uni-list-item title="总费用" :show-arrow="false" :right-text="stickApply.amount | formatPrice" />
				</uni-list>
			</view>

			<!--        支付方式开始-->
			<view class="bg-white margin-sm padding-top-lg">
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
			<button class="bg-theme theme-border text-xl text-white radius-0" :disabled="disableSubmitBtn"
				@click="submitPay">确认</button>
		</view>

	</view>
</template>

<script>
	import {
		getPayOrderStatus,
		payAny
	} from "@/api/finance";
	import {
		getStickApplyTypeEnum,
		infoStickAppy
	} from "@/api/stick";
	import {
		payWayConfig,
		imgUrl,active
	} from '@/utils/config.js';
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "payStickApply",
		components: {
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				that: this,
				stickApply: {},

				token: null,
				userData: {},
				openId: null,

				payTypeIndex: null,
				imgSelected: imgUrl + '/mall/select.png',
				imgUnSelected: imgUrl + '/mall/noSelect.png',
				payWayConfig: payWayConfig,
				payWayList: [],
				disableSubmitBtn: true,

				siteList: [],

				timer: null,
				startTime: 0,
				payData: {},

				_iap: {},
				iosPayOrderList: [],

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		filters: {
			formatPrice(number) {
				return priceTranslate(number) + " 元";
			},
			formatDate(time) {
				return formatTime6(new Date(time));
			},
			typeFilter(type, that) {
				const [obj] = that.siteList.filter(v => v.value === type)
				return !!obj ? obj.label : '';
			},
		},
		watch: {
			payTypeIndex: function() {
				this.disableSubmitBtn = !(this.payTypeIndex != null);
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

			this.stickApply.id = parseInt(options.id);

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
			// 置顶支付 todo 苹果端
			this.payWayConfig.find(v => {
				return v.key === 'wx-app'
			}).active = true;
			this.payWayConfig.find(v => {
				return v.key === 'ali-app'
			}).active = true;
			// #endif

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
				this.getStickApplyType();
			},
			getStickApplyType() {
				let self = this;
				getStickApplyTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.siteList.splice(0, self.siteList.length);
						res.data.forEach(v => {
							self.siteList.push(v);
						})

						self.getStickApply();
					}
				});
			},
			getStickApply() {
				let self = this;
				infoStickAppy({
					id: this.stickApply.id
				}).then(res => {
					if (res.retCode === 0) {
						self.stickApply = res.data;
					}
				});
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

			//付款
			submitPay() {
				let self = this;
				let paramsData = {
					"openId": this.openId,
					"payType": this.payWayList[this.payTypeIndex].payType,
					"targetType": 5, //信息置顶
					"buyAmount": Number(this.stickApply.amount),
					"payAmount": Number(this.stickApply.amount),
					"productSaleId": this.stickApply.id,
				}

				// #ifdef H5 | MP-WEIXIN 
				payAny(paramsData).then(res => {
					if (res.retCode === 0) {
						self.payData = res.data;
						if (self.payWayList[self.payTypeIndex].payType === 8) {
							// #ifdef H5
							if (typeof WeixinJSBridge === "undefined") {
								if (document.addEventListener) {
									document.addEventListener('WeixinJSBridgeReady', self.onBridgeReady, false);
								} else if (document.attachEvent) {
									document.attachEvent('WeixinJSBridgeReady', self.onBridgeReady);
									document.attachEvent('onWeixinJSBridgeReady', self.onBridgeReady);
								}
							} else {
								self.onBridgeReady();
							}
							//    #endif
						} else if (self.payWayList[self.payTypeIndex].payType === 5) {
							//    #ifdef MP-WEIXIN
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: String(res.data.timeStamp),
								nonceStr: String(res.data.nonce_str),
								package: String(res.data.package),
								signType: 'MD5',
								paySign: String(res.data.sign),
								success: function(res1) {
									if (res1) {
										self.handlePayResult();
									}
								},
								fail: function(err) {
									uni.showToast({
										title: '支付失败',
										icon: "error",
										duration: 2000
									})
								}
							});
							//    #endif
						}
					}
				});
				// #endif

				// #ifdef APP-PLUS
				payAny(paramsData).then(resPay => {
					if (resPay.retCode === 0) {
						self.payData = resPay.data;

						uni.getProvider({
							service: 'payment',
							success: async (res) => {
								if (self.payWayList[self.payTypeIndex].payType === 1) { //微信APP支付
									const wxChannel = res.providers.find((channel) => {
										return (channel.id === 'wxpay')
									})
									if (!!wxChannel) {
										uni.requestPayment({
											"provider": "wxpay",
											"orderInfo": {
												"appid": self.payData.appid,
												"noncestr": self.payData.nonce_str,
												"package": self.payData.package, // 固定值
												"partnerid": self.payData.mch_id, // 微信支付商户号
												"prepayid": self.payData.prepay_id, // 统一下单订单号 
												"timestamp": parseInt(self.payData
													.timestamp), // 时间戳（单位：秒）
												"sign": self.payData
													.sign, // 签名，这里用的 MD5/RSA 签名
											},
											success(res0) {
												self.handlePayResult();
											},
											fail(e) {
												uni.showToast({
													title: '支付失败',
													icon: "error",
													duration: 2000
												})
											}
										})
									}
								} else if (self.payWayList[self.payTypeIndex].payType ===
									2) { //支付宝APP支付
									const aliChannel = res.providers.find((channel) => {
										return (channel.id === 'alipay')
									})
									if (!!aliChannel) {
										let payDataString = self.payData;
										let orderInfo = payDataString.split("&orderNo=")[0];

										self.payData = {};
										self.payData.orderNo = payDataString.split("&orderNo=")[1];

										uni.requestPayment({
											"provider": "alipay",
											"orderInfo": orderInfo,
											success(res0) {
												self.handlePayResult();
											},
											fail(e) {
												uni.showToast({
													title: '支付失败',
													icon: "error",
													duration: 2000
												})
											}
										})
									}
								}

							},
						});
					}
				});
				// #endif
			},

			onBridgeReady() {
				let self = this;
				WeixinJSBridge.invoke(
					'getBrandWCPayRequest', {
						"appId": this.payData.appid, //公众号名称，由商户传入
						"timeStamp": this.payData.timeStamp, //时间戳，自1970年以来的秒数
						"nonceStr": this.payData.nonce_str, //随机串
						"package": this.payData.package,
						"signType": 'MD5', //微信签名方式：
						"paySign": this.payData.sign //微信签名
					},
					function(result) {
						if (result.err_msg.indexOf("get_brand_wcpay_request:ok") > -1) {
							// 使用以上方式判断前端返回,微信团队郑重提示：
							//res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
							self.handlePayResult();
						} else {
							uni.showToast({
								icon: 'error',
								title: '支付失败！',
								duration: 1500
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

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		padding: 10rpx 20rpx;
		margin-bottom: 2rpx;
	}

	::v-deep uni-list-item {
		background-color: white;
		margin-bottom: 2rpx;
	}

	::v-deep uni-list-item:first-child {
		padding-top: 6rpx;
		border-top-left-radius: 20rpx !important;
		border-top-right-radius: 20rpx !important;
	}

	::v-deep uni-list-item:last-child {
		padding-bottom: 6rpx;
		border-bottom-left-radius: 20rpx !important;
		border-bottom-right-radius: 20rpx !important;
	}

	::v-deep .uni-list-item__icon {
		padding: 0 30rpx 0 20rpx;
		margin-right: 0;
	}

	::v-deep .uni-list-item__container {
		padding-top: 0rpx;
		padding-bottom: 0rpx;
		width: 100%;
	}

	::v-deep .uni-list-item__content-title {
		font-size: 28rpx;
	}

	::v-deep .uni-list-item__extra-text {
		font-size: 28rpx !important;
		color: #7f7f7f !important;
	}

	::v-deep .uni-list-item__icon-img {
		height: 34rpx;
		width: 48rpx;
		padding-top: 6rpx;
	}
</style>