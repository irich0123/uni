<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="交易详情" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="user-mess-box bg-white">
				<user-bar-normal :user="seller" :user-booth-on="true" />
			</view>

			<view class="commodity_base_box padding-lr-sm bg-white">
				<commodity-list-cell :commodity="transaction.commoditySnapshot" :showStatusBar="false"
					:showFooter="false" />
			</view>

			<view class="margin-sm bg-white radius">
				<uni-list>
					<uni-list-item :show-arrow="false" title="订单编号">
						<template v-slot:right>
							<text>{{ transaction.identifier }}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="购买方式">
						<template v-slot:right>
							{{transaction.commoditySnapshot.saleType | filterSaleType(that)}}
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="交易方式">
						<template v-slot:right>
							<text>平台担保交易</text>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			<view class="margin-sm bg-white radius">
				<uni-list>
					<uni-list-item :show-arrow="false" title="成交数量">
						<template v-slot:right>
							<text>{{ transaction.quantity | formatQuantity }}</text>
							<text class="padding-left-xs">{{ transaction.commoditySnapshot.unit }}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="成交单价">
						<template v-slot:right>
							<text>
								{{ transaction.unitPrice | formatPrice }}
							</text>
							<text class="padding-left-xs">元/{{ transaction.commoditySnapshot.unit }}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="总价">
						<template v-slot:right>
							<text>{{ transaction.total | formatPrice }}</text>
							<text class="padding-left-xs">元</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="实付金额">
						<template v-slot:right>
							<text>{{ transaction.totalValuePaid | formatPrice }}</text>
							<text class="padding-left-xs">元</text>
						</template>
					</uni-list-item>
				</uni-list>
			</view>

			<view class="margin-sm bg-white radius">
				<uni-list>
					<uni-list-item :show-arrow="false" title="运费支付">
						<template v-slot:right>
							<text>{{ transaction.isPrepaidShippingCost?'预付':'到付' }}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="卖家包运费" v-if="transaction.isPrepaidShippingCost">
						<template v-slot:right>
							<text>{{ transaction.isShippingCostIncluded?'包运费':'不包运费' }}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="承运商">
						<template v-slot:right>
							<text>{{ transaction.carrierName }}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="运费"
						v-if="!transaction.isPrepaidShippingCost && transaction.isShippingCostIncluded ">
						<template v-slot:right>
							<text>{{ transaction.shippingCost | formatPrice }}</text>
							<text class="padding-left-xs">元</text>
						</template>
					</uni-list-item>
				</uni-list>
			</view>

			<!--        收货地址开始-->
			<view class="margin-sm">
				<view class="text-ssm text-gray-5 margin-tb-ssm margin-lr-ssm">
					收货地址
				</view>
				<view class="flex align-center justify-between bg-white padding-tb-ssm padding-lr radius-s">
					<address-list-cell :address="transaction.shippingAddress"></address-list-cell>
				</view>
			</view>
			<!--        收货地址结束-->

			<view class="blank"></view>
		</scroll-view>
		
		<view class="bg-gray-1 gray-border-top flex align-center"
			style="width:100%;position:fixed;left:0;bottom:0;z-index: 1;min-height:100rpx;">
			<view class="flex flex-grow align-center justify-end padding-left-sm  padding-lr-ssm text-black">
				<!-- 待卖方确认(0), 待买方付款(1), 待卖方发货(2), 待买方确认收货(3), 待结算(4), 待评价(5), 完成(6), 纠纷中(7),
                    待买方退货(8), 待卖方确认退货(9), 已退货待结算(10), 已失效(11), 订单取消协商中(12), 购物车(13), 订单被卖家取消(14),
                    订单被买家取消(15), 发货过期平台取消(16), 平台干预中(17), 已结束(18);-->

				<view class="button_other" v-if="transaction.status === 0 "
					@click.stop="orderConfirmPush(transaction.id)">确单提醒
				</view>
				<view class="button_other"
					@click.stop="goToBuyCommodityConfirm(transaction.id)">去结算
				</view>
				<view class="button_other" v-if="transaction.status === 1"
					@click.stop="goToPayTransaction(transaction.id,transaction.quantityShow,transaction.totalValuePaidShow)">
					付款
				</view>
				<view class="button_other" v-if="transaction.status === 2"
					@click.stop="promptDeliveryTransaction(transaction.id)">发货提醒
				</view>
				<view class="button_other" v-if="transaction.status === 3 "
					@click.stop="receiveGoodsConfirmTransaction(transaction.id,transaction.buyerId)">确认收货
				</view>
				<view class="button_other"
					v-if="transaction.status === 3 || transaction.status === 12 || transaction.status === 4 || transaction.status === 15 || transaction.status === 7 || transaction.status === 8 || transaction.status === 9 || transaction.status === 17 || transaction.status === 10 || transaction.status === 14"
					@click.stop="getMappedDeliveryByTransactionId(transaction.id,0)">物流
				</view>
				<view class="button_other" v-if="transaction.status === 8"
					@click.stop="deliveryGoodsTransaction(transaction.id)">发货
				</view>
				<view class="button_other" v-if="transaction.status === 3 "
					@click.stop="extendReceiveGoodsConfirmationTransaction(transaction.id)">延迟收货
				</view>
				<view class="button_other"
					v-if="(transaction.status === 2 && transaction.overTimeStatus === transaction.status) || transaction.status === 7 || transaction.status === 12 || transaction.status === 17 "
					@click.stop="goToDispute(transaction.id)">争议
				</view>
				<view class="button_other" v-if="transaction.status === 12"
					@click.stop="goToCancelTransaction(transaction.id,transaction.buyerId,transaction.sellerId)">
					赔偿约定
				</view>
				<view class="button_other"
					v-if="transaction.status === 0 || transaction.status === 1 || transaction.status === 2 || transaction.status === 3"
					@click.stop="cancelTransaction(transaction.id)">取消
				</view>
				<view class="button_other"
					v-if="transaction.status === 6 || transaction.status === 11 || transaction.status === 16 || transaction.status === 18"
					@click.stop="deleteTransaction(transaction.id,index)">删除
				</view>

				<view class="button_other" v-if="transaction.status === 17"
					@click.stop="getArbitrationByTransactionId(transaction.id)">仲裁
				</view>
				<view class="button_other"
					v-if="transaction.status === 17 || transaction.status === 9 || transaction.status === 10"
					@click.stop="getMappedDeliveryByTransactionId(transaction.id,1)">退货物流
				</view>
				<view class="button_other" v-if="transaction.status === 9 "
					@click.stop="promptConfirmDeliveryTransaction(transaction.id,transaction.buyerId)">
					收货提醒
				</view>
			</view>
		</view>

		<!--       物流弹出框-->
		<uni-popup ref="popup" type="center" :animation="true">
			<view class="bg-white radius padding text-df" v-if="deliveryData">
				<view class="text-lg text-theme text-center padding-bottom gray-border-bottom">
					物流信息
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>承运商：</view>
					<view>{{ deliveryData.carrierName }}</view>
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>运单号：</view>
					<view>{{ deliveryData.waybill }}</view>
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>发货时间：</view>
					<view>{{ deliveryData.shipTime }}</view>
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>状态：</view>
					<view>
						<text v-if="deliveryData.status === 0">运转中</text>
						<text v-else></text>
					</view>
				</view>
				<view class="text-lg text-theme text-center padding-top" @click.stop="$refs.popup.close()">
					我知道了
				</view>
			</view>
		</uni-popup>

		<!--       发货弹出框-->
		<uni-popup ref="popupGoods" type="center" :animation="true">
			<view class="bg-white radius-l padding text-df">
				<view class="text-xl text-theme text-center padding-bottom-sm">
					请填写物流信息
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<view class="flex-grow text-normal flex align-center justify-between" style="width: 100%;">
						<view class="flex-sub">物流公司：</view>
						<view class="flex-twice radius-s bg-gray-1 padding-ssm flex align-center justify-center"
							v-if="carrierList">
							<picker mode="selector" @change="carrierChange" :value="carrierIndex" :range-key="'name'"
								:range="carrierList">
								<view class="select-carrier">
									<view>{{ carrierList[carrierIndex].name }}</view>
									<view class="image_box">
										<image :src="imgUrl+'/xiala.png'"></image>
									</view>
								</view>
							</picker>
						</view>
					</view>
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<view class="flex-grow text-normal flex align-center justify-between" style="width: 100%;">
						<view class="flex-sub">运单号：</view>
						<input v-model="waybill"
							class="flex-twice radius-s bg-gray-1 padding-ssm flex align-center justify-center" />
					</view>
				</view>
				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-lg padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupGoods.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-lg padding-lr padding-tb-sm radius text-center"
						@click.stop="submitDeliveryGoodsTransaction">确定</view>
				</view>
			</view>
		</uni-popup>

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5 -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" v-show="isShowFab"></uni-fab>
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->
	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import AddressListCell from "@/utils/yjg-list-cell/address-list-cell";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import {
		calculateMath,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		cancelTransaction,
		checkStockTransaction,
		deleteTransaction,
		deliveryGoodsTransaction,
		extendReceiveGoodsConfirmationTransaction,
		getArbitrationByTransactionId,
		getCarrierList,
		getMappedDeliveryByTransactionId,
		getTransactionById,
		orderConfirmPush,
		promptConfirmDeliveryTransaction,
		promptDeliveryTransaction,
		receiveGoodsConfirmTransaction
	} from "@/api/mall";
	import {
		getUserInfoByUserId
	} from '@/api/user'
	import {
		getCommoditySaleTypeEnum
	} from '@/api/basic'
	import {
		imgUrl,active
	} from '@/utils/config.js'
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "transactionDetailsForBuyer",
		components: {
			uniPopup,
			AddressListCell,
			CommodityListCell,
			UserBarNormal,
			UniList,
			UniListItem,
			// #ifdef H5 
			UniFab,
			// #endif
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				that: this,

				token: null,
				userData: {},

				seller: {
					avatar: null,
					userVerifyStatus: null,
					realName: null,
					userAverageScoreAVG: null,
				},

				id: null,

				transaction: {
					sellerId: null,
					commoditySnapshot: {},
					shippingAddress: {
						realName: null,
						mobile: null,
						isDefaultAddress: null,
					}
				},
				saleTypeList: [],
				
				deliveryData: null, //物流信息
				waybill: '', //运单号

				carrierList: [{
					name: null,
				}],
				carrierId: null,
				carrierIndex: 0,

				o: null,

				//悬浮层开始
				horizontal: 'right',
				vertical: 'bottom',
				direction: 'vertical',
				pattern: {
					color: '#ffffff',
					backgroundColor: '#fff',
					selectedColor: '#fb5318',
					buttonColor: "#fb5318"
				},
				content: [{
					iconPath: imgUrl+'/personal/ic_portrait_hollow.png',
					selectedIconPath: imgUrl+'/personal/ic_portrait_hollow.png',
					text: '我的',
					active: false
				}, ],
				isShowFab: false, //浮层是否显示
				//    悬浮层结束
				
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
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			},
			filterSaleType(type, that) {
				const [obj] = that.saleTypeList.filter(v => v.id === type)
				return !!obj ? obj.typeName : '';
			},
		},
		onLoad(options) {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			this.id = parseInt(options.id);
			this.o = options.o; //操作

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

			this.isShowFab = this.o === 'n';
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
			//买家提醒卖家确认收到退货
			promptConfirmDeliveryTransaction(id, buyerId) {
				let paramsData = {
					id: id,
					operatorType: 0,
					buyerId: buyerId
				}
				promptConfirmDeliveryTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "操作成功！",
							icon: "none",
							duration: 1500
						})
					}
				});
			},
			//提交发货信息
			submitDeliveryGoodsTransaction() {
				if (!this.carrierId) {
					uni.showToast({
						title: "请选择承运商",
						icon: "none",
						duration: 1500
					})
					return
				}
				if (!this.waybill) {
					uni.showToast({
						title: "请输入运单号",
						icon: "none",
						duration: 1500
					})
					return
				}
				let paramsData = {
					id: this.id,
					carrierIdExact: this.carrierId,
					waybillExact: this.waybill,
					deliveryType: 1
				}
				deliveryGoodsTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "提交成功！",
							icon: "none",
							duration: 1500
						})
						setTimeout(() => {
							this.$refs.popupGoods.close()
						}, 1500)
					}
				});
			},
			//修改承运商选择
			carrierChange(e) {
				this.carrierIndex = e.target.value
				this.carrierId = this.carrierList[this.carrierIndex].id
			},
			//发货弹出框打开
			deliveryGoodsTransaction(id) {
				this.id = id
				this.$refs.popupGoods.open()
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
						if (!!self.carrierIndex) {
							self.carrierId = self.carrierList[self.carrierIndex].id
						}

						self.getTransactionById()
					}
				});
			},
			//获取仲裁信息
			getArbitrationByTransactionId(id) {
				let paramsData = {
					id: id
				}
				getArbitrationByTransactionId(paramsData).then(res => {
					if (res.retCode === 0) {
						// todo
					}
				});
			},
			//买家确认收到货
			receiveGoodsConfirmTransaction(id, buyerId) {
				let paramsData = {
					id: id,
					buyerId: buyerId,
					deliveryType: 0
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '请确认已经收到商品了么？如果没有收到，请不到点击确认！点击确认后，货款将转入卖家账户！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							console.log('用户点击确定');
							receiveGoodsConfirmTransaction(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "操作成功",
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										self.getTransactionById()
									}, 1500)
								}
							});
						}
					}
				})
			},
			//根据交易id获取争议日志id，再跳转到争议页面
			goToDispute(id) {
				uni.navigateTo({
					url: '/pagesPersonal/myMall/dispute?id=' + id + '&initiatorType=0'
				})
			},
			//买家取消 -- 赔偿约定
			goToCancelTransaction(id, payBy, payTo) {
				uni.navigateTo({
					url: './negoTransaction?id=' + id + '&payBy=' + payBy + '&payTo=' + payTo
				})
			},
			//延迟收货
			extendReceiveGoodsConfirmationTransaction(id) {
				let paramsData = {
					id: id
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '您确认要为此订单延迟收货吗？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							console.log('用户点击确定');
							extendReceiveGoodsConfirmationTransaction(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "操作成功",
										icon: "none",
										duration: 1500
									});
									setTimeout(() => {
										self.getTransactionById()
									}, 1500);
								}
							});
						}
					}
				})
			},

			//获取物流信息
			getMappedDeliveryByTransactionId(id, deliveryType) {
				let paramsData = {
					id: id,
					deliveryType: deliveryType, // "deliveryType":大货发货(0), 大货退货(1), 样品发货(2), 样品退货(3);
				}
				let self = this;
				getMappedDeliveryByTransactionId(paramsData).then(res => {
					if (res.retCode === 0) {
						self.deliveryData = res.data
						self.$refs.popup.open()
					}
				});
			},
			//买家 -- 发货提醒
			promptDeliveryTransaction(id) {
				let paramsData = {
					id: id
				}
				promptDeliveryTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "操作成功",
							icon: "none",
							duration: 2000
						})
					}
				});
			},
			//根据交易id删除交易信息
			deleteTransaction(id) {
				let paramsData = {
					id: id,
					operatorType: 0
				}
				uni.showModal({
					title: '小二提醒',
					content: '您确认要删除此订单吗？删除后此订单将不会在列表显示！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							deleteTransaction(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '删除成功！',
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										uni.navigateBack({
											delta: 1
										})
									}, 1500)
								}
							});
						}
					}
				})
			},
			//给卖家发确单提醒
			orderConfirmPush(id) {
				let paramsData = {
					id: id
				}
				orderConfirmPush(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "操作成功",
							icon: "none",
							duration: 2000
						})
					}
				});
			},
			//去结算按钮
			goToBuyCommodityConfirm(id) {
				let paramsData = {
					id: id
				}
				checkStockTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.navigateTo({
							url: '../../pagesNew/domall/buyCommodityConfirm?transactionId=' + id
						})
					}
				});
			},
			//去付款按钮
			goToPayTransaction(id) {
				uni.navigateTo({
					url: '/pagesPersonal/pay/payTransaction?id=' + id,
				})
			},
			//取消交易
			//  "needReparation": "1":如果返回的是1，说明需要赔偿，需要出现取消申请页面(是否收到货，取消原因，赔偿金额)，然后请求reparationClaimTransaction接口
			cancelTransaction(id) {
				let paramsData = {
					id: id,
					operatorType: 0 //取消用户，买家还是卖家 0--买家 1--卖家
				}
				uni.showModal({
					title: '小二提醒',
					content: '您确认要取消此订单吗？取消后此订单将不会继续执行！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							cancelTransaction(paramsData).then(res => {
								if (res.retCode === 0) {
									if (res.data.isNeedReparation) {
										uni.navigateTo({
											url: '../myMall/negoTransaction?id=' + id +
												'&payBy=' + res.data.buyerId + '&payTo=' + res
												.data.sellerId
										})
									} else {
										uni.showToast({
											title: '订单取消成功!',
											icon: "none",
											duration: 1500
										})
										setTimeout(() => {
											let pages = getCurrentPages();
											let prevPage = pages[pages.length - 2];
											let object = 1;
											prevPage.$vm.otherFun(object);

											uni.navigateBack({
												delta: 1,
											})
										}, 1500)
									}
								}
							});
						}
					}
				})
			},
			//根据交易id获取交易详情
			getTransactionById() {
				let paramsData = {
					id: this.id,
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

						uni.setNavigationBarTitle({
							title: "采购订单 [" + self.transaction.statusName + "]"
						})

						self.getSellerInfo(self.transaction.sellerId);
					}
				});
			},
			getSellerInfo(id) {
				let paramsData = {
					userId: id
				}
				let self = this;
				console.log(paramsData)
				getUserInfoByUserId(paramsData).then(res => {
					if (res.retCode === 0) {
						self.seller = res.data
					}
				});
			},
			//悬浮按钮的操作
			trigger(e) {
				console.log(e);
				this.content[e.index].active = !e.item.active;
				if (e.item.text === '我的') {
					if (!this.token) {
						this.toLogin();
						return;
					}
					uni.switchTab({
						url: '/pages/personal/personal'
					})
				}
			},
			fabClick() {
				if (!this.fabMenuPopped) {
					this.fabMenuPopped = true;
					setTimeout(() => {
						if (!!this.$refs.fab) {
							this.$refs.fab.close();
						}
						this.fabMenuPopped = false;
					}, 3000);
				}
			},
			otherFun(object) { //选择地址后的数据收集
				if (!!object) {
					console.log(object);
					this.getTransactionById()
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/fab.css";


	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		margin: 20rpx 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 10rpx 30rpx !important;
		font-size: 28rpx;
		border: 1rpx solid #eee;
	}

	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			border: 1rpx solid #000;
		}
	}

	::v-deep .uni-list-item__content-title {
		font-size: 28rpx;
		color: #777;
	}
	
	.button_other {
		font-size: 28rpx;
		padding: 10rpx 24rpx;
		border-radius: 100rpx;
		display: flex;
		align-items: center;
		margin-right: 16rpx;
		border: 1rpx solid #ccc;
	}
	
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.user-mess-box {
			margin: 20rpx 20rpx 0 20rpx;
			padding: 16rpx 30rpx;
			border-top-left-radius: 10rpx;
			border-top-right-radius: 10rpx;
		}

		.commodity_base_box {
			margin: 2rpx 20rpx 0 20rpx;
			border-bottom-left-radius: 10rpx;
			border-bottom-right-radius: 10rpx;
		}

		.blank {
			min-height: 120rpx;
		}

	}

	::v-deep .uni-popup__wrapper-box {
		width: 90%;
	}
</style>