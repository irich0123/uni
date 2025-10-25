<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="缴纳保证金" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-white margin-sm padding-tb-sm padding-lr radius-s">
				<view class="margin-tb-ssm padding-tb-sm flex align-center justify-between">
					<view class="text-gray-4 text-df">交易编号：</view>
					<view class="text-black text-df">{{ contractInfo.contractNo }}</view>
				</view>
				<view class="margin-tb-ssm padding-tb-sm flex align-center justify-between">
					<text class="text-gray-4 text-df">保证金金额：</text>
					<span class="text-black text-df">
						{{ showMoney | formatPrice }}<text class="padding-left-xs">元</text>
					</span>
				</view>
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
			<button class="bg-theme text-xl color-white radius-0" :disabled="disableSubmitBtn"
				@click="submitPay">立即支付</button>
		</view>

	</view>
</template>

<script>
	import {
		payWayConfig,
		publicKey,
		imgUrl,active
	} from '@/utils/config.js'
	import {
		calculateMath,
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		getUserAccountInfoByUserId
	} from "@/api/user";
	import {
		getContractRecord
	} from "@/api/workinfo";
	import {
		getPayOrderStatus,
		payAny
	} from "@/api/finance";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "paymentDeposit",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},
				openId: null,

				totalMoney: '',
				payType: null,
				payPassword: null,

				userTotalBeans: null,
				userBalanceMoney: null,

				id: null,
				showMoney: null,

				contractInfo: {
					contractNo: null,
				},

				payTypeIndex: 0,
				imgSelected: imgUrl + '/mall/select.png',
				imgUnSelected: imgUrl + '/mall/noSelect.png',
				payWayConfig: payWayConfig,
				payWayList: [],
				disableSubmitBtn: true,

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
		filters: {
			formatDate(time) {
				return formatTime(time);
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");
			
			this.id = parseInt(options.contractId); //交易编号

			this.openId = uni.getStorageSync('openId')

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
				this.getContractRecord();
				//获取用户现有的 余额以及金豆数
				this.getUserInfo();
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
							self.userTotalBeans = res.data.beans;
						}
					}
				});
			},
			//获取交易详情
			getContractRecord() {
				let paramsData = {
					id: this.id
				}
				let self = this;
				getContractRecord(paramsData).then(res => {
					if (res.retCode === 0) {
						self.contractInfo = res.data.contractInfo;
						if (self.userData.id === self.contractInfo.firstPartUserId) {
							self.showMoney = self.contractInfo.firstPartDepositRequire;
							self.totalMoney = self.showMoney / 1000;
						} else if (self.userData.id === self.contractInfo.secondPartUserId) {
							self.showMoney = self.contractInfo.secondPartDepositRequire;
							self.totalMoney = self.showMoney / 1000;
						} else {
							uni.showToast({
								icon: 'none',
								title: '您未参与此交易，无需缴纳保证金',
								duration: 1500
							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								})
							}, 1500);
						}
					}
				});
			},

			//立即支付提交
			submitPay() {
				let self = this;
				let paramsData = {
					payType: this.payWayList[this.payTypeIndex].payType,
					productSaleId: this.id,
					targetType: 7, //缴纳保证金
					openId: this.openId,
					payAmount: this.totalMoney * 1000,
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
							// #endif
						} else if (self.payWayList[self.payTypeIndex].payType === 5) {
							// #ifdef MP-WEIXIN
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
									console.log("fail:", err)
									uni.showToast({
										title: '支付失败',
										icon: "error",
										duration: 2000
									})
								}
							});
							// #endif
						}
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
		height: 100%;
		width: 100%;
	}
</style>