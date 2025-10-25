<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="下单购买" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--            用户信息开始-->
			<view class="bg-white padding-sm margin-sm radius-s">
				<user-bar-normal :user="seller" :user-booth-on="true" @onCall="phoneClick" @onItem="itemClick" />
			</view>
			<!--            用户信息结束-->

			<view class="margin-bottom-sm margin-lr-sm text-df bg-white radius-s padding bg-white">
				<commodity-list-cell :commodity="transaction.commoditySnapshot" :showStatusBar="false"
					:showFooter="false"></commodity-list-cell>
			</view>

			<!--        购买方式开始-->
			<view class="margin-bottom-sm margin-lr-sm bg-white radius-s">
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>购买方式</view>
					<view>
						<text v-if="transaction.commoditySnapshot.saleType === 0">整单</text>
						<text v-if="transaction.commoditySnapshot.saleType === 1">批发</text>
						<text v-if="transaction.commoditySnapshot.saleType === 2">零售</text>
					</view>
				</view>
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>购买数量：</view>
					<view class="flex align-center justify-between">
						<text>{{ transaction.quantity | formatQuantity }}</text>
						<text class="padding-left-xs">{{ transaction.commoditySnapshot.unit }}</text>
					</view>
				</view>
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>购买单价：</view>
					<view class="flex align-center justify-between">
						<text class="input_box">
							{{ transaction.unitPrice | formatPrice }}
						</text>
						<text class="padding-left-xs">元/{{ transaction.commoditySnapshot.unit }}</text>
					</view>
				</view>
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>总金额：</view>
					<view>{{ transaction.total | formatPrice }}<span class="padding-left-xs">元</span></view>
				</view>
				<view
					class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb text-theme">
					<view>结算金额：</view>
					<view>{{ transaction.totalValuePaid | formatPrice }}<span class="padding-left-xs">元</span>
					</view>
				</view>
			</view>
			<!--        购买方式结束-->
			<!--        收货地址开始-->
			<view class="margin-sm">
				<view class="text-ssm text-gray-5 margin-sm">
					收货地址
				</view>
				<view class="flex align-center justify-between bg-white padding-lr">
					<address-list-cell :address="transaction.shippingAddress"></address-list-cell>
				</view>
			</view>
			<!--        收货地址结束-->

			<!--        物流相关开始-->
			<view class="margin-sm text-normal bg-white radius">
				<view class="padding-tb margin-lr gray-border-bottom flex align-center justify-between">
					<view>运费支付：</view>
					<view class="flex align-center justify-between">
						<text v-if="transaction.isPrepaidShippingCost">预付</text>
						<text v-else>到付</text>

					</view>
				</view>
				<view class="padding-tb margin-lr gray-border-bottom flex align-center justify-between"
					v-if="transaction.isPrepaidShippingCost">
					<view>卖家包运费：</view>
					<view class="flex align-center justify-between">
						<text v-if="transaction.isShippingCostIncluded">包运费</text>
						<text v-else>不包运费</text>

					</view>
				</view>
				<view class="padding-tb margin-lr gray-border-bottom flex align-center justify-between">
					<view>承运商</view>
					<view class="flex align-center justify-between">
						{{ transaction.carrierName }}

					</view>
				</view>
				<view class="gray-border-bottom text-normal margin-lr padding-tb flex align-center justify-between"
					v-if="transaction.isPrepaidShippingCost  && !transaction.isShippingCostIncluded ">
					<view>运费：</view>
					<view class="flex align-center justify-between">
						{{ transaction.shippingCost }}
						<text class="margin-left-sm">元</text>
					</view>
				</view>
			</view>
			<!--        物流相关结束-->

			<!--        交易方式开始-->
			<view class="margin-sm bg-white radius">
				<view class="padding text-normal flex align-center justify-between">
					<view>交易方式：</view>
					<view>平台担保交易</view>
				</view>
				<view class="text-sm text-gray-4 padding-bottom padding-lr">
					尾货通平台担保交易担保买卖双方交易安全！买家买货是先全额支付货款到平台，然后通知卖家发货；买家在收到货物后并确认后，发放货款给卖家；具体操作细则，请查看帮助文档说明。
				</view>
			</view>
			<!--        交易方式结束-->

			<view class="blank"></view>
		</scroll-view>
		
		<!--        卖家信息开始-->
		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<view class="flex align-center justify-between">
				<button class="flex-sub bg-white text-xl text-theme radius-0" @click="refreshTransaction"
					v-show="showRefresh">刷新</button>
				<button class="flex-twice text-xl color-white radius-0" :class="!disablePayment?'bg-theme':''"
					@click="payTransaction" :disabled="disablePayment">结算</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		calculateMath,
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	import CommodityListCell from "../../utils/yjg-list-cell/commodity-list-cell";
	import UserBarNormal from "../../utils/yjg-user/user-bar-normal";
	import AddressListCell from "../../utils/yjg-list-cell/address-list-cell";
	import {
		getTransactionById,
		refreshTransaction
	} from "@/api/mall";
	import {
		getUserInfoByUserId
	} from "@/api/user";
	import {
		regex,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "buyCommodityConfirm",
		components: {
			AddressListCell,
			CommodityListCell,
			UserBarNormal,
			// #ifndef H5
			myNavBar
			// #endif
		},
		computed: {},
		data() {
			return {
				token: null,

				transactionId: null, //交易id
				transaction: {
					sellerId: null,
					commoditySnapshot: {},
					shippingAddress: {
						realName: null,
						mobile: null,
						isDefaultAddress: null,
					}
				},
				seller: {
					avatar: null,
					userVerifyStatus: null,
					realName: null,
					userAverageScoreAVG: null,
				},
				showRefresh: true,
				disablePayment: true,

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
				return formatTime6(new Date(time));
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.transactionId = parseInt(options.transactionId);
			this.initData();
		},
		onShow() {

			this.token = uni.getStorageSync("token")

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
				this.getTransactionById();
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1500
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '../login/login'
					})
				}, 1500)
			},
			getTransactionById() {
				let paramsData = {
					id: this.transactionId,
					isNeedTransactionLog: false,
					isNeedDisputeLog: false,
					operatorType: 0, //0---买家。1---卖家
				}
				let self = this;
				getTransactionById(paramsData).then(res => {
					if (res.retCode === 0) {
						if (!!res.data.commoditySnapshot.photos) {
							res.data.commoditySnapshot.photos = JSON.parse(res.data.commoditySnapshot.photos)
						} else {
							res.data.commoditySnapshot.photos = [];
						}
						if (res.data.commoditySnapshot.unitPriceBreakdown) {
							res.data.commoditySnapshot.unitPriceBreakdown = JSON.parse(res.data.commoditySnapshot
								.unitPriceBreakdown)
						}
						self.transaction = res.data

						self.disablePayment = self.transaction.status !== 1;

						self.getSellerInfo(self.transaction.sellerId);
					}
				});
			},

			getSellerInfo(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					userId: id
				}
				getUserInfoByUserId(paramsData).then(res => {
					if (res.retCode === 0) {
						this.seller = res.data
					}
				});
			},
			//刷新交易
			refreshTransaction() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					id: this.transactionId,
					operatorType: 0, //0---买家；1---卖家
				}
				let self = this;
				refreshTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "刷新成功！",
							icon: "none",
							duration: 2000
						})
					} else if (res.retCode === 200) { //"卖家同意了，可以直接购买"
						uni.showToast({
							title: res.message,
							icon: "none",
							duration: 2000
						});
						self.showRefresh = false;
					} else if (res.retCode === 201) { //"卖家修改了价格条件，请刷新页面后，再提交购买！"
						uni.showToast({
							title: "卖家修改了订单内容，请仔细查看订单内容",
							icon: "none",
							duration: 3000
						});
						setTimeout(() => {
							self.getTransactionById();
						}, 3000);
					} else if (res.retCode === 202) { //"卖家取消了订单！"
						uni.showModal({
							title: '小二提醒',
							content: res.message,
							showCancel: false,
							confirmText: '我知道了',
							confirmColor: '#fb5318',
							success: function(res0) {
								if (res0.confirm) {
									uni.navigateBack({
										delta: 1,
									})
								}
							}
						})
					} else if (res.retCode === 203) { //"请耐心等待卖方确认订单条款！"
						uni.showToast({
							title: res.message,
							icon: "none",
							duration: 2000
						});
					}
				});
			},

			payTransaction() {
				uni.navigateTo({
					url: '../../pagesPersonal/pay/payTransaction?id=' + this.transactionId,
				})
			},
			phoneClick(event) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				this.callPhone();
			},

			itemClick(event) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				if (event.type === 0) {
					uni.navigateTo({
						url: '/pagesNew/details/otherUserInfo?userId=' + event.id,
					})
				} else if (event.type === 1) {
					uni.navigateTo({
						url: '../../pagesCertification/enterprise/enterpriseDetails?userId=' + event.id,
					})
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.blank {
		min-height: 120rpx;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>