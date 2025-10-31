<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="订单确认" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			
			<view class="user-mess-box bg-white">
				<user-bar-normal :user="buyer" :user-booth-on="true" />
			</view>

			<view class="transaction-item bg-white">
				<commodity-transaction-list-cell :transaction="backupData" :showStatusBar="false" />
			</view>

			<uni-forms :modelValue="backupData" labelPosition="left" validateTrigger="bind" labelWidth="120" border>
				<!--        购买方式开始-->
				<view class="bg-white radius-s">
					<uni-forms-item label="销售方式：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<view class="text-black-4">{{backupData.commoditySnapshot.saleType | filterSaleType(that)}}</view>
					</uni-forms-item>

					<uni-forms-item label="交易方式：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<view class="text-black-4">平台担保交易</view>
					</uni-forms-item>

					<uni-forms-item label="数量：" required class="text-df padding-lr-sm" style="padding:0;"
						labelWidth="120">
						<uni-easyinput type="digit" v-model="backupData.quantity" :clearable="false"
							:inputBorder="false" />
						<view class="margin-left-ssm flex align-center text-black-4">
							{{ backupData.commoditySnapshot.unit }}
						</view>
					</uni-forms-item>

					<uni-forms-item label="单价：" required class="text-df padding-lr-sm" style="padding:0;"
						label-width="120">
						<uni-easyinput type="digit" v-model="backupData.unitPrice" :clearable="false"
							:inputBorder="false" />
						<view class="margin-left-ssm text-right text-black-4" style="min-width:80rpx">
							元/{{ backupData.commoditySnapshot.unit }}</view>
					</uni-forms-item>

					<uni-forms-item label="货值：" class="text-df padding-lr-sm" style="padding:0;" label-width="120">
						<view class="flex align-center">
							<text class="padding-left-xs text-black-5">{{ totalPrice }}</text>
							<text class="margin-left-ssm flex align-center text-black-4">元</text>
						</view>
					</uni-forms-item>

				</view>
				<!--        购买方式结束-->

				<!--        物流相关开始-->
				<view class="bg-white margin-tb text-df radius-s">
					<uni-forms-item label="运费到付：" style="padding:0;" class="text-df padding-lr-sm">
						<switch :checked="!backupData.isShippingCostIncluded" color="#fb5318"
							@change="switchShippingCostIncluded"></switch>
					</uni-forms-item>

					<uni-forms-item label="卖方包运费：" v-if="backupData.isShippingCostIncluded" style="padding:0;"
						class="text-df padding-lr-sm">
						<switch :checked="backupData.isShippingCostBySeller" color="#fb5318"
							@change="switchShippingCostBySeller"></switch>
					</uni-forms-item>

					<uni-forms-item label="运费：" required style="padding:0;" class="text-df padding-lr-sm"
						labelWidth="120" v-show="showShippingCost">
						<uni-easyinput type="number" v-model="backupData.shippingCost" :clearable="false"
							placeholder="请输入运费" :inputBorder="false" />
						<view class="margin-left-ssm flex align-center text-black-4">元</view>
					</uni-forms-item>

					<uni-forms-item label="承运商：" required style="padding:0;" class="text-df padding-lr-sm">
						<picker mode="selector" class="margin-left-ssm flex align-center" @change="carrierChange"
							:value="carrierIndex" :range-key="'name'" :range="carrierList">
							<view class="flex align-center">
								<view class="text-black-4">{{ carrierName }}</view>
								<uni-icons type="forward" size="22" color="#999999"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>
				<!--        物流相关结束-->

				<view class="bg-white radius-s">
					<uni-forms-item label="总金额：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<view><text>{{ totalPrice }}</text><text class="padding-left-xs text-black-4">元</text></view>
					</uni-forms-item>

					<uni-forms-item label="折后总额：" class="text-df padding-lr-sm" style="padding:0;" label-width="120">
						<uni-easyinput type="digit" v-model="backupData.totalValuePaid" :clearable="false"
							:inputBorder="false" />
						<text class="padding-left-xs text-black-4">元</text>
					</uni-forms-item>
					<view class="padding-tb-ssm padding-lr text-theme text-sm">您若不同意该价格，可适当修改价格和运费</view>
				</view>
			</uni-forms>
			<!--        收货地址开始-->
			<view class="margin-left-sm">
				<view class="text-ssm text-black-5 margin-tb-ssm margin-lr-sm">
					收货地址
				</view>
				<view class="flex align-center justify-start bg-white padding-lr radius-s">
					<address-list-cell :address="transaction.shippingAddress"></address-list-cell>
				</view>
			</view>
			<!--        收货地址结束-->

			<view class="blank"></view>
		</scroll-view>
		
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<view class="flex align-center justify-between">
				<button class="flex-sub bg-white text-normal text-black radius-0"
					@click="goToCancelTransaction">取消</button>
				<button class="flex-twice bg-theme theme-border text-normal color-white radius-0"
					@click="submitConfirmTransaction">{{ buttonValue }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import UniEasyInput from "@/components/uni-easyinput/uni-easyinput";
	import AddressListCell from "@/utils/yjg-list-cell/address-list-cell";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import CommodityTransactionListCell from "../components/commodity-transaction-list-cell";
	import {
		amendTransactionCondition,
		confirmTransactionBySeller,
		getCarrierList,
		getTransactionById,
	} from "@/api/mall";
	import {
		getUserInfoByUserId
	} from '@/api/user'
	import {
		getCommoditySaleTypeEnum
	} from '@/api/basic'
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "confirmTransaction",
		components: {
			CommodityTransactionListCell,
			UniForms,
			uniFormsItem,
			UniIcons,
			UniEasyInput,
			AddressListCell,
			CommodityListCell,
			UserBarNormal,
			// #ifndef H5
			myNavBar
			// #endif
		},
		computed: {
			//计算整批出售的货物总价
			totalPrice() {
				return Number(this.backupData.quantity * this.backupData.unitPrice)
			},
		},
		data() {
			return {
				that: this,

				token: null,

				buyer: {
					avatar: null,
					userVerifyStatus: null,
					realName: null,
					userAverageScoreAVG: null,
				},

				id: null, //交易id
				transaction: {
					id: null,
					buyerId: null,
					commoditySnapshot: {},
					shippingAddress: {
						realName: null,
						mobile: null,
						isDefaultAddress: null,
					}
				},

				backupData: {
					id: null,
					buyerId: null,
					commoditySnapshot: {},
					shippingAddress: {
						realName: null,
						mobile: null,
						isDefaultAddress: null,
					}
				},
				saleTypeList: [],

				carrierName: null,
				carrierList: [],
				carrierIndex: 0,

				buttonValue: '我同意',
				total: null,
				showShippingCost: false,

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			backupData: {
				handler(newVal) {
					if (Number(newVal.quantity) !== this.transaction.quantity ||
						Number(newVal.unitPrice) * 1000 !== this.transaction.unitPrice ||
						Number(newVal.shippingCost) * 1000 !== this.transaction.shippingCost ||
						Number(newVal.totalValuePaid) * 1000 !== this.transaction.totalValuePaid ||
						newVal.isShippingCostIncluded !== this.transaction.isShippingCostIncluded ||
						(newVal.isShippingCostBySeller !== this.transaction.isShippingCostBySeller && newVal
							.isShippingCostIncluded && !newVal.isShippingCostBySeller) ||
						newVal.carrierId !== this.transaction.carrierId
					) {
						this.buttonValue = "提交";
					} else {
						this.buttonValue = "我同意";
					}
				},
				deep: true,
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
			filterSaleType(type, that) {
				const [obj] = that.saleTypeList.filter(v => v.id === type)
				return !!obj ? obj.typeName : '';
			},
		},
		onLoad(options) {
			this.id = parseInt(options.id);
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
				console.log(e);
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
				this.listCommoditySaleType()
			},
			listCommoditySaleType() {
				let self = this;
				getCommoditySaleTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.saleTypeList = res.data;

						self.getCarrierList();
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
			//我同意或者已改价格按钮点击
			submitConfirmTransaction() {
				if (this.buttonValue === '我同意') {
					let paramsData = {
						id: this.id,
					}
					uni.showModal({
						title: '小二提醒',
						content: '您同意价格条款，可以让买家去付款了吗？',
						showCancel: true,
						cancelText: '取消',
						confirmText: '确定',
						confirmColor: '#fb5318',
						success: async function(res1) {
							if (res1.confirm) {
								confirmTransactionBySeller(paramsData).then(res => {
									if (res.retCode === 0) {
										uni.showToast({
											title: '确认订单成功！',
											icon: "none",
											duration: 1500
										})
										setTimeout(() => {
											let pages = getCurrentPages();
											let prevPage = pages[pages.length - 2];
											let object = 1;
											prevPage.$vm.otherFun(object);
											uni.navigateBack({
												delta: 1
											})
										}, 1500);
									}
								});
							}
						}
					})
				} else if (this.buttonValue === '提交') {
					let paramsData = {
						id: this.id,
						quantity: Number(this.backupData.quantity),
						unitPrice: Number(this.backupData.unitPrice) * 1000,
						isPrepaidShippingCost: this.backupData.isPrepaidShippingCost,
						isShippingCostIncluded: this.backupData.isShippingCostIncluded,
						shippingCost: Number(this.backupData.shippingCost) * 1000,
						totalValuePaid: Number(this.backupData.totalValuePaid) * 1000,
						carrierId: this.backupData.carrierId,
					}
					uni.showModal({
						title: '小二提醒',
						content: '您确认要修改价格条款吗？',
						showCancel: true,
						cancelText: '取消',
						confirmText: '确定',
						confirmColor: '#fb5318',
						success: async function(res1) {
							if (res1.confirm) {
								amendTransactionCondition(paramsData).then(res => {
									if (res.retCode === 0) {
										uni.showToast({
											title: '恭喜您！订单改价格成功！请等待买家付款',
											icon: "none",
											duration: 1500
										})
										setTimeout(() => {
											let pages = getCurrentPages();
											let prevPage = pages[pages.length - 2];
											let object = 1;
											prevPage.$vm.otherFun(object);

											uni.navigateBack({
												delta: 1
											})
										}, 1500);
									}
								});
							}
						}
					})
				}
			},
			//点击取消按钮
			goToCancelTransaction() {
				uni.navigateBack({
					delta: 1
				})
			},
			//获取所有承运商信息
			getCarrierList() {
				let self = this;
				getCarrierList().then(res => {
					if (res.retCode === 0) {
						self.carrierList.splice(0, self.carrierList.length);
						res.data.forEach(item => {
							self.carrierList.push(item);
						})
						if (self.transaction && self.transaction.carrierId) {
							self.carrierIndex = self.carrierList.findIndex(v => v.id === self.transaction
								.carrierId);
							if (self.carrierIndex != null && self.carrierIndex > -1) {
								self.carrierName = self.carrierList[self.carrierIndex].name;
							}
						}

						self.getTransactionById()
					}
				});
			},
			switchShippingCostIncluded() {
				this.backupData.isShippingCostIncluded = !this.backupData.isShippingCostIncluded; //是否到付
				this.showShippingCost = (this.backupData.isShippingCostIncluded && !this.backupData
					.isShippingCostBySeller);
			},
			switchShippingCostBySeller() {
				this.backupData.isShippingCostBySeller = !!!this.backupData.isShippingCostBySeller;
				this.showShippingCost = (this.backupData.isShippingCostIncluded && !this.backupData
					.isShippingCostBySeller);
			},
			carrierChange(e) {
				this.carrierIndex = e.target.value
				this.backupData.carrierId = this.carrierList[this.carrierIndex].id
			},
			//根据交易id获取交易详情
			getTransactionById() {
				let paramsData = {
					id: this.id,
					isNeedTransactionLog: this.isNeedTransactionLog,
					isNeedDisputeLog: this.isNeedDisputeLog,
					operatorType: 1, //0---买家。1---卖家
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

						uni.setNavigationBarTitle({
							title: "采购订单 [" + self.transaction.statusName + "]"
						})

						let t = JSON.stringify(self.transaction);

						self.backupData = JSON.parse(t);
						console.log(self.backupData);

						self.showShippingCost = self.backupData.isShippingCostIncluded && !self.backupData
							.isShippingCostBySeller;

						self.backupData.unitPrice = self.backupData.unitPrice / 1000;
						self.backupData.shippingCost = self.backupData.shippingCost / 1000;
						self.backupData.totalValuePaid = self.backupData.totalValuePaid / 1000;

						if (self.transaction && self.transaction.carrierId) {
							self.carrierIndex = self.carrierList.findIndex(v => v.id === self.transaction
								.carrierId);
							if (self.carrierIndex != null && self.carrierIndex > -1) {
								self.carrierName = self.carrierList[self.carrierIndex].name;
							}
						}
						self.getBuyerInfo(self.transaction.buyerId);
					}
				});
			},

			getBuyerInfo(id) {
				let paramsData = {
					userId: id
				}
				getUserInfoByUserId(paramsData).then(res => {
					if (res.retCode === 0) {
						this.buyer = res.data
					}
				});
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/bottomButtonBar.scss";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.user-mess-box {
			margin: 20rpx 20rpx 0rpx 20rpx;
			padding: 16rpx 30rpx;
			border-top-left-radius: 10rpx;
			border-top-right-radius: 10rpx;
		}

		.transaction-item {
			margin: 3rpx 20rpx 2rpx 20rpx;
			padding: 20rpx 20rpx;
			border-bottom-left-radius: 10rpx;
			border-bottom-right-radius: 10rpx;
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

	}

	::v-deep .uni-easyinput {

		.uni-easyinput__content {
			border-radius: 6rpx;
			display: flex;

			.uni-easyinput__content-input {
				font-size: 28rpx;

				.uni-input-wrapper {

					.uni-input-placeholder {
						font-size: 28rpx;
					}
				}
			}

			.uni-easyinput__content-textarea {
				min-width: 450rpx;
				min-height: 100rpx;
				padding: 16rpx 20rpx;

				.uni-textarea-wrapper {
					min-height: 120rpx;

					.uni-textarea-placeholder {
						font-size: 28rpx;
					}

					.uni-textarea-textarea {
						font-size: 28rpx;
					}
				}
			}
		}
	}
</style>