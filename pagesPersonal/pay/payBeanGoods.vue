<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view class="margin-sm">
				<uni-list>
					<uni-list-item :title="barTitle" :show-arrow="false" :right-text="price+'.00元'"
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
				@click="toPay">确认</button>
		</view>

		<jp-pwd ref="jpPwds" @completed="completed" @forget="forgetPass" :pay-type="pwd.payType" style="z-index: 99;"
			:key-type="pwd.keyType" :pawType="pwd.pawType" :tite="pwd.title" :contents="pwd.contents"
			:cancel-type="true" :keep="pwd.keep" :places="pwd.places" contentsColor="#555" :isPwy="pwd.isPwy"
			titeColor="#fb5318"></jp-pwd>

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
	} from "@/api/finance";
	import {
		payWayConfig,
		imgUrl,
		active,
		publicKey
	} from '@/utils/config.js';
	import {
		Iap,
		IapTransactionState
	} from "@/utils/iap.js";
	import jpPwd from '@/components/jp-pwd/jp-pwd.vue';
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";

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
		iapValidatePaymentResult,
		iapPay,
		iapRestore
	} from "@/utils/pay";
	// #endif

	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "payBeanGoods",
		components: {
			UniList,
			UniListItem,
			jpPwd,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				price: null,
				title: '购买金豆',
				barTitle: '总金额 [限时优惠]',

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

				pwd: {
					money: 0, //支付金额
					payType: 'two', //支付样式  one two
					keyType: 'two', //键盘样式  one two
					pawType: 'one', //输入框样式  one two
					title: '系统提示', //标题
					contents: '请输入支付密码', //提示
					keep: true, //点击遮挡是否关闭
					places: 6,
					isPwy: true
				},
				payPassword: null,
				payMoney: 0, //需要支付的保证金
			}
		},
		watch: {
			payTypeIndex: {
				handler(newVal) {
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
			},
			title: {
				handler(newVal) {
					// #ifdef H5
					uni.setNavigationBarTitle({
						title: newVal,
					})
					// #endif
				}
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			this.openId = uni.getStorageSync('openId');

			if (!!options.type) {
				this.type = parseInt(options.type);
			}

			uni.setNavigationBarTitle({
				title: this.cardInfoList[this.type].name,
			});

			this.payWayConfig.forEach(v => {
				v.active = false;
			})

			// #ifdef MP-WEIXIN || H5
			this.payWayConfig.find(v => {
				return v.key === 'balance'
			}).active = true;
			// #endif

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
			this.platform = uni.getStorageSync("platform");
			if (this.platform == "ios") {
				this.payWayConfig.find(v => {
					return v.key === 'ios-iap'
				}).active = true;
			} else {
				this.payWayConfig.find(v => {
					return v.key === 'balance'
				}).active = true;
				this.payWayConfig.find(v => {
					return v.key === 'wx-app'
				}).active = true;
				this.payWayConfig.find(v => {
					return v.key === 'ali-app'
				}).active = true;
			}
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
					iapRestore(this._iap, this.iosPayOrderList);
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
					this.title = "购买金豆卡";
					if (!!item.discount) {
						this.price = Math.round(item.price * item.discount / 100000);
					} else {
						this.price = Math.round(item.price / 1000);
					}
					day = (item.signName.indexOf("月") > -1 ? "30" : (item.signName.indexOf("季") > -1 ? "90" : "365"))
				} else if (item.type === 0) {
					this.price = Math.round(item.price / 1000);
					this.title = "购买金豆";
				}
				this.refreshNote(item.type, this.type, day);
			},

			refreshNote(goodsType, cardType, day) {
				if (cardType === 0) { //金豆及金豆卡
					if (goodsType === 1) {
						this.cardInfoList[cardType].slogan = (!!day ? day + "天内，" : '') + "查看外发信息电话，免金豆";
						this.barTitle = '总金额 [限时优惠]';
					} else if (goodsType === 0) {
						this.cardInfoList[cardType].slogan = "用于查看外发信息电话";
						this.barTitle = '总金额';
					}
				} else {
					this.cardInfoList[cardType].slogan = (!!day ? day + "天内，" : '') + "发布商品信息，免金豆";
				}
			},
			password(e) {
				this.payPassword = e
				if (this.payPassword) {
					this.submitPay();
				} else {
					uni.showToast({
						title: '请输入支付密码',
						icon: "none",
						duration: 1500
					})
				}
			},
			forgetPass() {
				this.$refs.jpPwds.toCancel();
				uni.navigateTo({
					url: '/pagesPersonal/pay/setPayPassword',
				})
			},
			completed(e) {
				this.password(e);
			},
			toPay() {
				if (this.payWayList[this.payTypeIndex].payType === 3) {
					this.$refs.jpPwds.toOpen();
				} else {
					this.submitPay();
				}
			},
			//付款
			submitPay(e) {
				let self = this;
				let index = this.list.findIndex(v => v.checked);
				let payTarget;
				if (this.list[index].type === 0) { //金豆
					payTarget = 2;
				} else {
					payTarget = this.isActivation ? this.cardInfoList[this.type].targetType.activated : this.cardInfoList[
						this.type].targetType.nonActive;
				}

				let paramsData = {
					"openId": this.openId,
					"payType": this.payWayList[this.payTypeIndex].payType,
					"targetType": payTarget,
					"buyAmount": this.list[index].type === 0 ? this.list[index]
						.beanNum : null,
					"payAmount": this.price * 1000,
					// #ifdef APP-PLUS
					"productSaleId": (this.platform == "ios") ? this.list[index].id : (this.list[
						index].type === 0 ? null : this.list[index].id),
					// #endif
					// #ifndef APP-PLUS
					"productSaleId": this.list[index].type === 0 ? null : this.list[
						index].id,
					// #endif
				}

				if (this.payWayList[this.payTypeIndex].payType === 3) { //余额支付
					paramsData["deviceType"] = 2;
					paramsData["password"] = jse.encrypt(this.payPassword);
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
					this.appPlusHandle(paramsData, this.list[index].productId);
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
			appPlusHandle(paramsData, productId) {
				let self = this;
				payAny(paramsData).then(resPay => {
					if (resPay.retCode === 0) {
						self.payData = resPay.data;
						uni.getProvider({
							service: 'payment',
							success: async (res) => {
								if (self.payWayList[self.payTypeIndex].payType === 6) { //苹果内支付
									const iapChannel = res.providers.find((channel) => {
										return (channel.id === 'appleiap')
									})
									if (!!iapChannel) {
										if (self.loading == true) {
											return;
										}
										self.loading = true;
										try {
											iapPay(self._iap, self.payData, productId).then(() => {
												let orderNo = self.payData;
												self.payData = {};
												self.payData.orderNo = orderNo;

												// 支付成功
												self.handlePayResult();
											});
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
								} else if (self.payWayList[self.payTypeIndex].payType === 1 &&
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
								self.title = "购买金豆";
							} else if (vo.type === 1) {
								self.price = Math.round(vo.price * vo.discount / 100000);
								day = (vo.signName.indexOf("月") > -1 ? "30" : (vo.signName.indexOf("季") > -1 ?
									"90" : "365"));
								self.title = "购买金豆卡";
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
								self.title = "购买金豆";
							} else if (vo.type === 1) {
								self.price = Math.round(vo.price / 1000);
								day = (vo.signName.indexOf("月") > -1 ? "30" : (vo.signName.indexOf("季") > -1 ?
									"90" : "365"))
								self.title = "购买金豆卡";
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
							v.type = 1;
							v.checked = false;
							self.list.push(v);
						});
						if (self.list.length > 0) {
							self.list[0].checked = true;
							self.price = Math.round(self.list[0].price * self.list[0].discount / 100000);
							self.title = "购买尾货通卡";
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
							v.type = 1;
							v.checked = false;
							self.list.push(v);
						});
						if (self.list.length > 0) {
							self.list[0].checked = true;
							self.price = Math.round(self.list[0].price / 1000);
							self.title = "购买尾货通卡";
						}

						self.listRecentIosOrder();
					}
				});
			},
			//选择支付方式
			choosePayWay(index) {
				this.payTypeIndex = index;
			},
			//iap验证是否支付成功

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