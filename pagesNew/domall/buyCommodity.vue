<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="下单购买" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--            用户信息开始-->
			<view class="bg-white padding-sm margin-sm radius-s">
				<user-bar-normal :user="commodity.userDetailsInfo" :user-booth-on="true" />
			</view>
			<!--            用户信息结束-->

			<view class="margin-bottom-sm margin-lr-sm text-df bg-white radius-s padding bg-white">
				<commodity-list-cell :commodity="commodity" :show-status-bar="false" :show-admin-bar="false"
					:show-footer="false" />
			</view>

			<!--        购买方式开始-->
			<view class="margin-bottom-sm margin-lr-sm bg-white radius-s">
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>购买方式</view>
					<view>
						<!--  '0=整批出售 1=分批出售 2=零售',-->
						<text v-if="commodity.saleType === 0">整单</text>
						<text v-if="commodity.saleType === 1">批发</text>
						<text v-if="commodity.saleType === 2">零售</text>
					</view>
				</view>
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>购买数量：</view>
					<view class="flex align-center justify-between">
						<uni-number-box v-if="commodity.saleType !== 0" :disabled="disable" v-model="buyNumber"
							:min="minNumber" :max="commodity.qtyInStock" @change="changeQty" />
						<text v-else>{{ buyNumber }}</text>
						<text class="padding-left-sm">{{ commodity.unit }}</text>
					</view>
				</view>
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>购买单价：</view>
					<view class="flex align-center justify-between">
						<view class="padding-tb-ssm padding-lr-sm radius-s" v-if="commodity.isPriceNegotiable">
							<input v-model="price" :disabled="disable" />
						</view>
						<text v-else>
							<text v-if="commodity.saleType !== 0">{{ price1 }}</text>
							<text v-else>{{ price }}</text>
						</text>
						<text>元/{{ commodity.unit }}</text>
					</view>
				</view>
				<view class="text-normal gray-border-bottom flex align-center justify-between margin-lr padding-tb">
					<view>总金额：</view>
					<view class="flex align-center justify-between">
						<text>{{ totalPrice }}</text><text class="padding-left-sm">元</text>
					</view>
				</view>
			</view>
			<!--        购买方式结束-->
			<!--        收货地址开始-->
			<view class="margin-bottom-sm margin-lr-sm bg-white radius-s">
				<view class="flex align-center justify-between bg-white padding-tb-sm padding-lr" v-if="addressData.id"
					@click.stop="goToChooseAddress(addressData.id)">
					<address-list-cell :address="addressData" :forward="true" :showDefault="false" style="width:100%" />
				</view>
				<view class="flex align-center justify-between bg-white padding-tb-sm padding-lr" v-else
					@click.stop="goToChooseAddress">
					<view class="text-normal padding-tb">
						收货地址：
					</view>
					<view class="flex align-center">
						<view class="text-sm text-gray-4">请选择收货地址</view>
						<view class="margin-left-ssm">
							<image style="width: 16rpx;height: 28rpx;" :src="imgUrl+'/more.png'"></image>
						</view>
					</view>

				</view>
			</view>
			<!--        收货地址结束-->

			<!--        物流相关开始-->
			<view class="margin-bottom-sm margin-lr-sm bg-white radius-s text-normal">
				<view class="padding-tb margin-lr gray-border-bottom flex align-center justify-between">
					<view>运费支付：</view>
					<view class="flex align-center justify-end flex-grow">
						<picker mode="selector" :disabled="disable" @change="bindPickerChange"
							:value="isShippingCostIncludedId" :range="isShippingCostIncluded">
							<view>{{ isShippingCostIncluded[isShippingCostIncludedId] }}</view>
						</picker>
						<uni-icons type="forward" size="20" color="#cccccc"></uni-icons>

					</view>
				</view>
				<view class="padding-tb margin-lr gray-border-bottom flex align-center justify-between">
					<view>卖家包运费：</view>
					<view class="flex align-center justify-between">
						<picker mode="selector" :disabled="disable" @change="bindPickerChangeFreight" :value="freightId"
							:range="freight">
							<view>{{ freight[freightId] }}</view>
						</picker>
						<uni-icons type="forward" size="20" color="#cccccc"></uni-icons>
					</view>
				</view>
				<view class="padding-tb margin-lr gray-border-bottom flex align-center justify-between">
					<view>承运商</view>
					<view class="flex align-center justify-between">
						<picker mode="selector" :disabled="disable" @change="bindPickerChangeCarrier"
							:value="carrierIndex" :range-key="'name'" :range="carrierList">
							<view>{{ carrierList[carrierIndex].name }}</view>
						</picker>
						<uni-icons type="forward" size="20" color="#cccccc"></uni-icons>
					</view>
				</view>
				<view class="pay_count_cell" v-if="isShippingCostIncludedId === 1 && freightId === 0">
					<view>运费：</view>
					<view class="quantity-box">
						<view class="input_box">
							<input type="number" v-model="shippingCost" />
						</view>
						<text style="margin-left: 20rpx">元</text>
					</view>
				</view>
			</view>
			<!--        物流相关结束-->

			<!--        交易方式开始-->
			<view class="margin-bottom-sm margin-lr-sm bg-white radius-s">
				<view class="flex align-center justify-between text-normal padding">
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

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<view class="flex align-center justify-between" v-if="disable">
				<button class="flex-sub bg-white theme-border text-xl text-theme radius-0"
					@click="refreshTransaction">刷新</button>
				<button class="flex-twice text-xl text-white radius-0" :disabled="disableToPay"
					:class="!disableToPay?'theme-border':'gray-border'" @click="payTransaction">去支付
				</button>
			</view>
			<button class="bg-theme text-xl text-white radius-0" :class="!disableToPay?'theme-border':'gray-border'"
				:disabled="disableToPay" @click="createTransaction">下单</button>
		</view>

	</view>
</template>

<script>
	import uniNumberBox from "../components/uni-number-box.vue"
	import {
		regex,
		active
	} from "@/utils/config";
	import {
		createTransaction,
		getCarrierList,
		getCommodityById,
		refreshTransaction
	} from "@/api/mall";
	import {
		queryAddress,
	} from "@/api/user";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import AddressListCell from "@/utils/yjg-list-cell/address-list-cell";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "buyCommodity",
		components: {
			CommodityListCell,
			uniNumberBox,
			UserBarNormal,
			AddressListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		computed: {
			//计算整批出售的货物总价
			totalPrice() {
				let foo = 0;
				if (this.isShippingCostIncludedId === 1) {
					if (this.freightId === 0) {
						foo = (this.buyNumber * this.price) + parseFloat(this.shippingCost);
					} else {
						foo = (this.buyNumber * this.price);
					}
				} else {
					foo = this.buyNumber * this.price;
				}
				return foo.toFixed(2)
			},
			price1() {
				for (let i = 0; i < this.unitPriceBreakdown.length; i++) {
					if (this.buyNumber >= this.unitPriceBreakdown[i].n) {
						this.price = this.unitPriceBreakdown[i].p
					}
				}
				return this.price.toFixed(2)
			}
		},
		data() {
			return {
				token: null,
				userData: {},

				id: null,

				commodity: {
					isStick: false,
					unitPriceBreakdown: [],
					userDetailsInfo: {
						avatar: null,
					}
				},
				minNumber: 1, //最先数量
				buyNumber: 0, //购买数量
				price: 0, //购买价格
				unitPrice: 0,
				addressData: {}, //收货地址
				isShippingCostIncludedId: 0,
				isShippingCostIncluded: ['到付', '预付'],
				freightId: 0,
				freight: ['不包运费', '包运费'],
				carrierList: [{
					name: ''
				}],
				carrierIndex: 0,
				carrierId: null,
				shippingCost: 0, //运费
				unitPriceBreakdown: [],
				disable: false, //是否可以点击或者修改

				transactionId: null, //交易id

				disableToPay: false,

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			addressData: {
				handler: function(newVal) {
					this.disableToPay = !newVal || !newVal.id;
				},
				immediate: true,
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
		onLoad(options) {
			this.userData = uni.getStorageSync("user");

			this.id = parseInt(options.id);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

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
				//获取承运商信息
				this.getCarrierList()
				this.getCommodityDetailsById()
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

			//刷新交易
			refreshTransaction() {
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
						self.disableToPay = false;
					} else if (res.retCode === 201) { //"卖家修改了价格条件，请刷新页面后，再提交购买！"
						//重定向到交易确认页面
						uni.showModal({
							title: '小二提醒',
							content: "卖家修改了订单内容，现在去查看并确认吗？",
							showCancel: true,
							cancelText: "稍后再确认",
							confirmText: '我知道了',
							confirmColor: '#fb5318',
							success: function(res0) {
								if (res0.confirm) {
									uni.redirectTo({
										url: '/pagesNew/domall/buyCommodityConfirm?transactionId=' +
											self.transactionId,
									})
								}
							}
						})
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
			validate() {
				let firstReg = (new RegExp(regex.decimal_begin_with_dot)); //不能以小数点开头
				let reg1 = (new RegExp(regex.decimal_two_digit)); //小数点后只能有两位只能输入数字
				if (firstReg.test(this.shippingCost)) {
					uni.showToast({
						icon: 'none',
						title: '输入的单价第一位不能为小数点',
						duration: 2000
					})
					return false;
				}
				if (!reg1.test(this.shippingCost)) {
					uni.showToast({
						icon: 'none',
						title: '单价只能输入数字和一位小数点且小数点只保留两位',
						duration: 2000
					})
					return false;
				}
				if (!((new RegExp(regex.decimal_positive)).test(this.shippingCost))) {
					uni.showToast({
						icon: 'none',
						title: '请输入正数',
						duration: 2000
					})
					return false;
				}
				return true;
			},
			//下单，创建交易
			createTransaction() {
				if (!this.validate()) {
					return
				}

				let isShippingCostIncluded = false
				let isPrepaidShippingCost = false
				if (this.isShippingCostIncludedId === 1) {
					isPrepaidShippingCost = true
				}
				if (this.freightId === 1) {
					isShippingCostIncluded = true
				}
				let paramsData = {
					commodityId: this.commodity.id,
					buyerId: this.userData.id,
					quantity: this.buyNumber,
					unitPrice: this.price * 1000,
					isPrepaidShippingCost: isPrepaidShippingCost, //是否预付运费
					isShippingCostIncluded: isShippingCostIncluded, //是否含运费
					sellerId: this.commodity.sellerId,
					carrierId: this.carrierId,
					addressId: this.addressData.id,
					shippingCost: this.shippingCost * 1000,
				}

				let self = this;
				createTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						let identifier = res.data.identifier;
						self.transactionId = res.data.id
						if (res.data.isNeedConfirmBySeller) {
							this.disable = true
							uni.showModal({
								title: '小二提醒',
								content: '您的订单已经创建成功！订单编号为' + identifier +
									',请耐心等待卖家确认交易条款，或直接联系卖家！您也可以在个人中心-商城订单中查询相关信息',
								showCancel: false,
								confirmText: '我知道了',
								confirmColor: '#fb5318',
								success: function(res1) {
									if (res1.confirm) {
										uni.navigateBack({
											delta: 1,
										})
									}
								}
							})
						} else {
							uni.showToast({
								icon: 'none',
								title: '订单创建成功！',
								duration: 1500
							});
							setTimeout(() => {
								self.payTransaction();
							}, 1500);
						}
					}
				});
			},
			payTransaction() {
				uni.redirectTo({
					url: '/pagesPersonal/pay/payTransaction?id=' + this.transactionId,
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
					}
				});
			},
			bindPickerChange(e) {
				this.isShippingCostIncludedId = e.target.value
			},
			bindPickerChangeFreight(e) {
				this.freightId = e.target.value
			},
			bindPickerChangeCarrier(e) {
				this.carrierIndex = e.target.value
				this.carrierId = this.carrierList[this.carrierIndex].id
			},

			//根据地址id获取地址信息
			getAddressById(userId) {
				let paramsData = {
					userId: userId,
					userType: 1,
					status: 1,
					isDefaultAddress: 1,
				}
				let self = this;
				queryAddress(paramsData).then(res => {
					if (res.retCode === 0 && res.data.length > 0) {
						self.addressData = res.data[0];
					}
				});

			},
			//跳转到地址选择页面
			goToChooseAddress(id) {
				if (this.disable) {
					return
				}
				uni.navigateTo({
					url: '../../pagesChoose/address/chooseAddress?addressId=' + id
				})
			},
			//获取用户地址信息
			changeQty(value) {
				this.buyNumber = value
			},
			//获取商品信息详情
			getCommodityDetailsById() {
				let paramsData = {
					id: this.id
				}
				let self = this;
				getCommodityById(paramsData).then(res => {
					if (res.retCode === 0) {
						let commodity = res.data;

						commodity.totalPrice = commodity.unitPriceMin * commodity.qtyInStock;

						self.price = commodity.unitPriceMin / 1000;
						self.shippingCost = commodity.shippingCost / 1000;
						self.buyNumber = commodity.qtyInStock;

						if (!!commodity.photos) {
							commodity.photos = JSON.parse(commodity.photos)
						} else {
							commodity.photos = [];
						}
						if (!!commodity.unitPriceBreakdown) {
							commodity.unitPriceBreakdown = JSON.parse(commodity.unitPriceBreakdown);
							self.unitPriceBreakdown = [];

							commodity.unitPriceBreakdown.forEach(item => {
								self.unitPriceBreakdown.push({
									p: item.p / 1000,
									n: item.n,
									m: item.m,
								});
							})

						} else {
							this.unitPriceBreakdown = [];
						}

						if (commodity.saleType !== 0) {
							self.price = self.unitPriceBreakdown[0].p;
							if (self.unitPriceBreakdown[0].n < commodity.qtyInStock) {
								self.minNumber = self.unitPriceBreakdown[0].n
								self.buyNumber = this.unitPriceBreakdown[0].n
							} else {
								self.minNumber = commodity.qtyInStock
								self.buyNumber = commodity.qtyInStock
							}
						} else {
							self.price = commodity.unitPriceMin / 1000;
						}

						if (commodity.isShippingCostIncluded) {
							self.isShippingCostIncludedId = 1
							self.freightId = 1
						} else {
							self.isShippingCostIncludedId = 0
							self.freightId = 0
						}

						self.carrierId = commodity.carrierId
						this.carrierIndex = (self.carrierList || []).findIndex((item) => item.id === self
							.carrierId)

						if (commodity.promptInfo) {
							commodity.promptInfo = commodity.promptInfo.replace(/\\r\\n/g, "\n");
						} else {
							commodity.promptInfo = '';
						}

						self.commodity = commodity

						self.$nextTick(() => {
							self.getAddressById(self.userData.id);
						});
					}
				});

			},
			otherFun(object) { //选择地址后的数据收集
				if (!!object) {
					this.addressData = object.address;
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	::v-deep .uni-input-wrapper {
		background: #f9f9f9;
		/*width: 90%;*/
		text-align: right;
		font-size: 28rpx;
		border-radius: 10rpx;
	}

	button[disabled] {
		border: 2rpx solid #ccccccc !important;
	}

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