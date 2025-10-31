<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商品展期" @action="navAction" @reSize="reSize" class="my-nav-bar" />
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
					<uni-forms-item label="延期到">
						<picker mode="date" :value="extendedDate" :start="exhibitionStartDate" :end="exhibitionEndDate"
							@change="extendDateChange">
							<view class="flex align-center">
								<view class="text-black-4">{{ extendedDate }}</view>
								<uni-icons type="forward" size="20" color="#999999"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
					<uni-forms-item label="应付金额">
						<view class="flex align-center">
							<view class="text-theme text-normal">{{ totalMoney }}</view>
							<view class="padding-left-sm padding-right-xss text-black-4">元</view>
						</view>
					</uni-forms-item>
				</view>
			</uni-forms>
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

			<view class="blank"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" :disabled="payTypeIndex==null"
				@click="pay">立即支付</button>
		</view>

		<passkeyboard :show="showPopup" :payType="payType" :money="totalMoney" @password="password" :isIphoneX="false"
			@close="close"></passkeyboard>
	</view>
</template>

<script>
	import {
		payWayConfig,
		publicKey,
		imgUrl,active
	} from '@/utils/config.js'
	import passkeyboard from '@/components/yzc-paykeyboard/yzc-paykeyboard.vue';
	import {
		formatTime,
		formatTimeNoHour,
		regexDateStringToTimestamp
	} from "@/utils/myUtil";
	import {
		getCommodityById,
		getCommodityExtendShowTimeCost,
	} from "@/api/mall";
	import {
		getUserAccountInfoByUserId,
	} from "@/api/user";
	import {
		getPayOrderStatus,
		payAny
	} from "@/api/finance";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import UniForms from "../../components/uni-forms/uni-forms";
	import uniFormsItem from "../../components/uni-forms-item/uni-forms-item";

	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "commodityExtend",
		components: {
			CommodityListCell,
			passkeyboard,
			UniIcons,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				id: null,
				token: null,
				userData: {},
				openId: null,

				commodity: {},

				exhibitionDate: '', //展示日期
				extendedDate: '', //显示的展示日期
				exhibitionStartDate: '',
				exhibitionEndDate: '',

				days: 10,
				totalMoney: null,
				totalBean: null,
				payType: null,
				showPopup: false,
				payPassword: null,
				userTotalBeans: null,
				userBalanceMoney: null,

				payTypeIndex: null,
				imgSelected: imgUrl + '/mall/select.png',
				imgUnSelected: imgUrl + '/mall/noSelect.png',
				payWayConfig: payWayConfig,
				payWayList: [],

				timer: null,
				startTime: 0,
				payData: {},

				imgUrl: imgUrl,
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
			this.userData = uni.getStorageSync("user");
			this.openId = uni.getStorageSync('openId')

			// this.payWayConfig.find(v => {
			// 	return v.key === 'balance'
			// }).active = true;

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

			this.id = parseInt(options.id);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");

			if (!this.token) {
				this.toLogin();
				return;
			}

			this.payWayList = this.payWayConfig.filter(v => v.active);

			if (this.payWayList.length > 0) {
				this.payTypeIndex = 0;
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

			initData() {
				this.getUserInfo();
			},

			generateTimeDuration() {
				let day = 24 * 3600 * 1000;
				let oldEnd = this.commodity.endShowTime;
				if (this.commodity.endShowTime < new Date().getTime()) {
					oldEnd = new Date().getTime();
				}
				let secondDay = oldEnd + day;
				this.exhibitionStartDate = formatTimeNoHour(new Date(secondDay));
				this.extendedDate = formatTimeNoHour(new Date(oldEnd + 10 * day));
				console.log("extendedDate", this.extendedDate);
				this.exhibitionEndDate = formatTimeNoHour(new Date(oldEnd + 180 * day));
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
							self.userTotalBeans = res.data.beans;
						}

						self.getCommodityDetailsById();
					}
				});
			},

			getCommodityDetailsById() {
				let paramsData = {
					id: this.id,
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

						this.generateTimeDuration();

						self.getCommodityExtendShowTimeCost();
					}
				});

			},

			//立即支付提交
			pay() {
				if (this.payTypeIndex === null) {
					uni.showToast({
						title: '请选择支付方式',
						icon: "none",
						duration: 1500
					})
					console.log("请选择支付方式")
					return
				}

				//3---余额，4---金豆
				if (this.payWayList[this.payTypeIndex].payType === 3) {
					console.log("用户余额，", this.userBalanceMoney)
					console.log("应支付，", this.totalMoney)
					if (!this.userBalanceMoney || (this.userBalanceMoney < this.totalMoney)) {
						uni.showToast({
							title: '您的余额不足，请更换支付方式！',
							icon: "none",
							duration: 3000
						})
						return;
					}
					this.payPassword = ''
					this.showPopup = true
				} else if (this.payWayList[this.payTypeIndex].payType === 4) {
					console.log("用户金豆，", this.userTotalBeans)
					console.log("应支付，", this.totalBean)
					if (!this.userTotalBeans || this.userTotalBeans < this.totalBean) {
						uni.showToast({
							title: '您的金豆不足，请更换支付方式！',
							icon: "none",
							duration: 3000
						})
					}
					this.payPassword = ''
					this.showPopup = true
				} else {
					if (!this.openId) {
						uni.showToast({
							title: '非微信平台环境，不能支付',
							icon: "none",
							duration: 3000
						});
						return;
					}
					this.submitPay()
				}
			},

			submitPay() {
				let paramsData = {
					deviceType: 2,
					payType: this.payWayList[this.payTypeIndex].payType,
					productSaleId: this.id,
					targetType: 10,
					openId: this.openId,
				}
				if (this.type === 1) {
					paramsData['targetType'] = 13
				} else {
					paramsData['extendedShowDays'] = this.day
					paramsData['targetType'] = 9
				}
				if (this.payWayList[this.payTypeIndex].payType === 3 || this.payWayList[this.payTypeIndex].payType === 4) {
					paramsData['password'] = jse.encrypt(this.payPassword);
				}
				if (this.payType === 4) {
					paramsData['payAmount'] = this.totalBean;
				} else {
					paramsData['payAmount'] = this.totalMoney * 1000;
				}

				let self = this;
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
							//  #ifdef MP-WEIXIN
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: String(res.data.timeStamp),
								nonceStr: String(res.data.nonce_str),
								package: String(res.data.package),
								signType: 'MD5',
								paySign: String(res.data.sign),
								success: function(res1) {
									console.log("success:", res1)
									if (res1) {
										self.handlePayResult();
									}
								},
								fail: function(err) {
									console.log("fail:", err)
									uni.showToast({
										title: '支付失败',
										icon: "none",
										duration: 2000
									})
								}
							});
							//    #endif
						} else {
							self.paySuccess();
						}
					}
				});
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
					icon: "none",
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
			//展示日期
			extendDateChange(e) {
				this.extendedDate = e.detail.value;
				this.getCommodityExtendShowTimeCost()
			},

			//展期延长需要付费的金额
			getCommodityExtendShowTimeCost() {
				let paramsData = {
					id: this.id,
					endShowTime: regexDateStringToTimestamp(this.extendedDate + "T00:00:00"),
				}
				let self = this;
				getCommodityExtendShowTimeCost(paramsData).then(res => {
					if (res.retCode === 0) {
						self.totalMoney = res.data / 1000;
					}
				});
			},
			beforeDestroy() {
				clearTimeout(this.timer)
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.blank {
			min-height: 120rpx;
		}
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