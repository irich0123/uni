<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="购买金豆卡" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view class="margin-sm">
				<uni-list>
					<uni-list-item title="总金额 [限时优惠]" :show-arrow="false" :right-text="price+'.00元'"
						:note="cardInfoList[type].slogan" />
				</uni-list>
			</view>

			<view class="margin-sm padding-tb-sm radius bg-white">
				<view class="text-black padding-tb-ssm padding-lr text-lg text-bold">请选择</view>
				<view class="flex flex-wrap padding-lr-ssm">
					<view v-for="(item,index) in list" :key="index" @click.stop="itemClicked(index)"
						class="flex-grow margin-tb-ssm"
						style="position:relative;width:224rpx;max-width:224rpx;min-height:150rpx">
						<image style="width:80rpx;height:80rpx;position:absolute;top:1px;left:1px;z-index:9;"
							v-if="item.type===1" mode="scaleToFill" :src="timeLimitImgUrl"></image>
						<view
							class="bg-white padding-tb gray-border radius flex flex-direction align-center justify-center margin-right-sm"
							style="min-height: 150rpx;"
							:class="[!!item.checked?'bg-theme theme-border color-white':'']">
							<view class="text-lg">{{ (item.type===1)?item.signName:("金豆"+item.beanNum+"颗") }}</view>
							<view class="margin-tb-ssm text-xs" style="text-decoration: line-through;"
								:class="!!item.checked?'':'text-gray-4'" v-if="item.type===1">
								￥{{ item.discount? item.price / 1000:item.originPrice /1000 }}.00
							</view>
							<view class="text-gray-4 margin-tb-ssm text-xs" v-if="item.type===0">
							</view>
							<view v-if="item.type===1">
								￥{{ item.discount? Math.round(item.discount * item.price / 100000): Math.round(item.price /1000) }}.00
							</view>
							<view v-if="item.type===0">
								￥{{ Math.round(item.price /1000) }}.00
							</view>
						</view>
					</view>
				</view>

				<view class="protocal-line padding-lr flex align-center justify-start" v-if="goodsType===1">
					<checkbox-group>
						<checkbox :checked="isActivated" shape="square" :value="'1'" disabled />
					</checkbox-group>
					<text class="padding-left-xs text-sm" style="margin-top: 7rpx;">立即激活</text>
				</view>

			</view>

			<!--        支付方式开始-->
			<view class="bg-white margin-sm padding-top-lg">
				<view class="padding-lr-sm">
					<view class="text-lg text-black gray-border-bottom padding-bottom">支付方式</view>
				</view>
				<view class="padding-lr-xl">
					<view v-for="(item,index) in payWayList" :key="index" @click.stop="choosePayWay(index)"
						class="padding-tb-lg gray-border-bottom">
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
				@click="submitPay">确认</button>
		</view>
	</view>
</template>

<script>
	import {
		getTailCardListAndroid,
		getBeanCardListAndroid,
		getPayOrderStatus,
		payAny,
		queryPayOrder,
		getBeanCardListIos,
		getBeanGoodsListAndroid,
		getBeanGoodsListIos,
		iapPayVerify
	} from "@/api/finance";
	import {
		payWayConfig,
		imgUrl,active
	} from '@/utils/config.js';
	import {
		Iap,
		IapTransactionState
	} from "@/utils/iap.js";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "payBeanGoods",
		components: {
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				price: null,

				list: [],
				timeLimitImgUrl: imgUrl + '/personal/xianshi.png',
				imageUrl: imgUrl + '/agree.png',
				isActivation: true,

				token: null,
				userData: {},
				openId: null,

				type: 0, //0=金豆卡 1=尾货通卡
				goodsType: 0,

				activationTips: '激活后的有效期内看信息无限制', //立即激活后面的提示文字
				payTypeIndex: null,
				imgSelected: imgUrl + '/mall/select.png',
				imgUnSelected: imgUrl + '/mall/noSelect.png',
				payWayConfig: payWayConfig,
				payWayList: [],
				disableSubmitBtn: true,

				cardInfoList: [{
						name: '金豆卡',
						targetType: {
							activated: 4,
							nonActive: 3,
						},
						slogan: "查看外发信息电话，免金豆",
						fn: () => this.getBeanGoodsList(),
					},
					{
						name: '尾货通卡',
						targetType: {
							activated: 12,
							nonActive: 11,
						},

						slogan: "发布商品信息，免金豆",
						fn: () => this.getTailCardList(),
					},
				],

				timer: null,
				startTime: 0,
				payData: {},
				isActivated: true,

				platform: null,

				_iap: {},
				iosPayOrderList: [],

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			payTypeIndex: {
				handler(newVal) {
					console.log(newVal);
					this.disableSubmitBtn = !(newVal !== null);
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
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			this.openId = uni.getStorageSync('openId');

			this.type = parseInt(options.type);

			uni.setNavigationBarTitle({
				title: this.cardInfoList[this.type].name,
			});

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
			if (this.platform == "ios") {
				this.payWayConfig.find(v => {
					return v.key === 'ios-iap'
				}).active = true;
			} else {
				this.payWayConfig.find(v => {
					return v.key === 'wx-app'
				}).active = true;
				this.payWayConfig.find(v => {
					return v.key === 'ali-app'
				}).active = true;
			}
			// #endif

			this.platform = uni.getSystemInfoSync().osName;

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

			async initIap() {
				this._iap = new Iap({
					products: this.list.map(v => v.productId),
				});
				try {
					// 初始化，获取iap支付通道
					await this._iap.init();

				} catch (e) {
					uni.showModal({
						title: "init",
						content: e.message,
						showCancel: false
					});
				}

				if (this._iap._ready) {
					await this._iap.getProduct();
					this.restore();
				}
			},
			async restore() {
				// 检查上次用户已支付且未关闭的订单，可能出现原因：首次绑卡，网络中断等异常
				try {
					// 从苹果服务器检查未关闭的订单，可选根据 username 过滤，和调用支付时透传的值一致
					const transactions = await this._iap.restoreCompletedTransactions({
						username: ""
					});
					console.log("transactions==", transactions);

					if (!transactions.length) {
						return;
					}

					transactions.forEach(async (transaction) => {
						let payOrder = this.iosPayOrderList.find(v => v.receipt === transaction
							.transactionReceipt);
						console.log("payOrder==", payOrder);
						if (payOrder != null) {
							switch (transaction.transactionState) {
								case IapTransactionState.purchased:
									console.log("purchased");
									// 用户已付款，在此处请求开发者服务器，在服务器端请求苹果服务器验证票据
									let result = await this.validatePaymentResult({
										orderNo: payOrder.orderNo,
										receipt: transaction.transactionReceipt
									});

									// 验证通过，交易结束，关闭订单
									if (result != null) {
										await this._iap.finishTransaction(transaction);
									}

									break;
								case IapTransactionState.failed:
									console.log("failed");
									// 关闭未支付的订单
									await this._iap.finishTransaction(transaction);
									break;
								default:
									break;
							}
						}
					})

				} catch (e) {
					uni.showModal({
						content: e.message,
						showCancel: false
					});
				}
			},
			initData() {
				this.cardInfoList[this.type].fn();
			},
			listRecentIosOrder() {
				let self = this;
				let param = {
					userId: this.userData.id,
					payType: 6,
					status: 1,
					startTime: new Date().getTime() - (3 * 24 * 3600 * 1000), //最近3天的订单
				}
				queryPayOrder(param).then(res => {
					if (res.retCode === 0) {
						self.iosPayOrderList.splice(0, self.iosPayOrderList.length);
						res.data.forEach(v => {
							self.iosPayOrderList.push(v);
						});

						self.initIap();
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
			itemClicked(index) { //这个传值和传index在小程序里面是不同的
				this.list.forEach(v => {
					v.checked = false;
				})
				let item = this.list[index];
				item.checked = !item.checked;
				this.goodsType = item.type;
				let day = null;
				if (item.type === 1) { //金豆卡
					if (!!item.discount) {
						this.price = Math.round(item.price * item.discount / 100000);
					} else {
						this.price = Math.round(item.price / 1000);
					}
					day = (item.signName.indexOf("月") > -1 ? "30" : (item.signName.indexOf("季") > -1 ? "90" : "365"))
				} else if (item.type === 0) {
					this.price = Math.round(item.price / 1000);
				}
				this.refreshNote(item.type, this.type, day);
			},

			refreshNote(goodsType, cardType, day) {
				if (cardType === 0) { //金豆及金豆卡
					if (goodsType === 1) {
						this.cardInfoList[cardType].slogan = (!!day ? day + "天内，" : '') + "查看外发信息电话，免金豆";
					} else if (goodsType === 0) {
						this.cardInfoList[cardType].slogan = "用于查看外发信息电话";
					}
				} else {
					this.cardInfoList[cardType].slogan = (!!day ? day + "天内，" : '') + "发布商品信息，免金豆";
				}
			},

			//付款
			submitPay(e) {
				let self = this;
				let checkedProductIndex = this.list.findIndex(v => v.checked);
				let payTarget;
				if (this.list[checkedProductIndex].type === 0) { //金豆
					payTarget = 2;
				} else {
					payTarget = this.isActivation ? this.cardInfoList[this.type].targetType.activated : this.cardInfoList[
						this.type].targetType.nonActive;
				}

				let paramsData = {
					"openId": this.openId,
					"payType": this.payWayList[this.payTypeIndex].payType,
					"targetType": payTarget,
					"buyAmount": this.list[checkedProductIndex].type === 0 ? this.list[checkedProductIndex]
						.beanNum : null,
					"payAmount": this.price * 1000,
					// #ifdef APP-PLUS
					"productSaleId": (this.platform == "ios") ? this.list[checkedProductIndex].id : (this.list[
						checkedProductIndex].type === 0 ? null : this.list[checkedProductIndex].id),
					// #endif
					// #ifndef APP-PLUS
					"productSaleId": this.list[checkedProductIndex].type === 0 ? null : this.list[
						checkedProductIndex].id,
					// #endif
				}

				// #ifdef H5 | MP-WEIXIN 
				payAny(paramsData).then(res => {
					if (res.retCode === 0) {
						self.payData = res.data;
						if (self.payWayList[self.payTypeIndex].payType === 8) {
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
								if (self.payWayList[self.payTypeIndex].payType === 6) {
									const iapChannel = res.providers.find((channel) => {
										return (channel.id === 'appleiap')
									})

									if (!!iapChannel) {
										if (self.loading == true) {
											return;
										}
										self.loading = true;
										try {
											// 请求苹果支付
											const transaction = await self._iap.requestPayment({
												productid: self.list[checkedProductIndex]
													.productId,
												manualFinishTransaction: true,
												username: self.payData, //根据业务需求透传参数，关联用户和订单关系
											});

											// 在此处请求开发者服务器，在服务器端请求苹果服务器验证票据
											let result = await self.validatePaymentResult({
												orderNo: self.payData,
												receipt: transaction
													.transactionReceipt, // 不可作为订单唯一标识
											});

											// 验证成功后关闭订单
											if (result != null) {
												await self._iap.finishTransaction(transaction);
												let orderNo = self.payData;
												self.payData = {};
												self.payData.orderNo = orderNo;

												// 支付成功
												self.handlePayResult();
											} else {
												uni.showToast({
													title: '支付失败',
													icon: "error",
													duration: 2000
												})
											}
										} catch (e) {
											// uni.showModal({
											// 	// content: e.errMsg,
											// 	content: "未知错误",
											// 	showCancel: false
											// });
										} finally {
											self.loading = false;
										}
									}
								} else if (self.payWayList[self.payTypeIndex].payType ===
									1) { //微信APP支付
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
								} else if (self.payWayList[self.payTypeIndex].payType === 2) { //支付宝APP支付
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

			//获取金豆卡列表
			getBeanGoodsList() {
				let self = this;
				// #ifdef H5 | MP-WEIXIN
				this.getBeanGoodsListAndroid();
				// #endif
				// #ifdef APP-PLUS
				if (this.platform == "ios") {
					this.getBeanGoodsListIos();
				} else {
					this.getBeanGoodsListAndroid();
				}
				// #endif
			},
			getBeanGoodsListAndroid() {
				let self = this;
				getBeanGoodsListAndroid().then(res => {
					if (res.retCode === 0) {
						self.list.splice(0, self.list.length);
						if (res.data.beanList && res.data.beanList.length > 0) {
							res.data.beanList.forEach(v => {
								v.type = 0; //金豆
								v.checked = false;
								self.list.push(v);
							})
						}
						if (res.data.beanCardList && res.data.beanCardList.length > 0) {
							res.data.beanCardList.forEach(v => {
								v.type = 1; //金豆卡
								v.checked = false;
								self.list.push(v);
							})
						}
						if (self.list.length > 0) {
							let day = null;
							let vo = self.list[0];
							vo.checked = true;
							self.goodsType = vo.type;
							if (vo.type === 0) {
								self.price = Math.round(vo.price / 1000);
							} else if (vo.type === 1) {
								self.price = Math.round(vo.price * vo.discount / 100000);
								day = (vo.signName.indexOf("月") > -1 ? "30" : (vo.signName.indexOf("季") > -1 ?
									"90" : "365"))
							}

							self.refreshNote(vo.type, self.type, day);
						}
					}
				});
			},
			getBeanGoodsListIos() {
				let self = this;
				getBeanGoodsListIos().then(res => {
					if (res.retCode === 0) {
						self.list.splice(0, self.list.length);
						if (res.data.beanList && res.data.beanList.length > 0) {
							res.data.beanList.forEach(v => {
								v.type = 0; //金豆
								v.checked = false;
								self.list.push(v);
							})
						}
						if (res.data.beanCardList && res.data.beanCardList.length > 0) {
							res.data.beanCardList.forEach(v => {
								v.type = 1; //金豆卡
								v.checked = false;
								self.list.push(v);
							})
						}
						if (self.list.length > 0) {
							let day = null;
							let vo = self.list[0];
							vo.checked = true;
							self.goodsType = vo.type;
							if (vo.type === 0) {
								self.price = Math.round(vo.price / 1000);
							} else if (vo.type === 1) {
								self.price = Math.round(vo.price / 1000);
								day = (vo.signName.indexOf("月") > -1 ? "30" : (vo.signName.indexOf("季") > -1 ?
									"90" : "365"))
							}

							self.refreshNote(vo.type, self.type, day);
						}
						self.listRecentIosOrder();
					}
				});
			},
			getTailCardList() { ///这里的尾货通卡券产品还未通过审核
				// #ifdef H5 | MP-WEIXIN
				this.getTailCardListAndroid();
				// #endif
				// #ifdef APP-PLUS
				if (this.platform == "ios") {
					this.getTailCardListIos();
				} else {
					this.getTailCardListAndroid();
				}
				// #endif
			},
			getTailCardListAndroid() {
				let self = this;
				getTailCardListAndroid().then(res => {
					if (res.retCode === 0) {
						self.list.splice(0, self.list.length);
						res.data.forEach(v => {
							v.checked = false;
							self.list.push(v);
						});
						if (self.list.length > 0) {
							self.list[0].checked = true;
							self.price = Math.round(self.list[0].price * self.list[0].discount / 100000);
						}
					}
				});
			},
			getTailCardListIos() {
				let self = this;
				getTailCardListIos().then(res => {
					if (res.retCode === 0) {
						self.list.splice(0, self.list.length);
						res.data.forEach(v => {
							v.checked = false;
							self.list.push(v);
						});
						if (self.list.length > 0) {
							self.list[0].checked = true;
							self.price = Math.round(self.list[0].price / 1000);
						}

						self.listRecentIosOrder();
					}
				});
			},
			//选择支付方式
			choosePayWay(index) {
				this.payTypeIndex = index;
				this.payType = this.payWayList[this.payTypeIndex].payType;
			},
			//iap验证是否支付成功
			validatePaymentResult(data) {
				return new Promise((resolve, reject) => {
					iapPayVerify(data).then(res => {
						if (res.retCode === 0) {
							resolve(res.data);
						}
					}).catch(() => {
						resolve(null);
					});
				});
			}
		},
		beforeDestroy() {
			clearTimeout(this.timer)
		}
	}
</script>

<style scoped lang="scss">
	.protocal-line {

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
	}

	.container {
		width: 100%;
		height: 100%;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		padding: 0 20rpx;
		background-color: white;
		margin-bottom: 2rpx;
	}

	/* #ifdef H5 */
	::v-deep .uni-list-item:first-child {
		padding-top: 6rpx;
		border-top-left-radius: 20rpx !important;
		border-top-right-radius: 20rpx !important;
	}

	::v-deep .uni-list-item:last-child {
		padding-bottom: 6rpx;
		border-bottom-left-radius: 20rpx !important;
		border-bottom-right-radius: 20rpx !important;
	}

	/* #endif */

	::v-deep .uni-list-item__content-title {
		font-size: 32rpx;
	}

	::v-deep .uni-list-item__extra-text {
		font-size: 32rpx !important;
		color: #7f7f7f !important;
	}

	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}
</style>