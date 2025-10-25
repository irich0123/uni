<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="采购订单" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<!--列表开始-->
			<uni-swipe-action>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false"
						@click.native="toItemDetail(item.id)">
						<uni-swipe-action-item :options="option" @click="swipeClick($event,index,item.id)"
							:disabled="tabIndex!==2">
							<view class="flex-grow padding bg-white radius">
								<commodity-transaction-list-cell :transaction="item">
									<view
										class="padding-top-sm margin-top-sm gray-border-top flex align-center justify-end text-black text-sm">
										<!-- 待卖方确认(0), 待买方付款(1), 待卖方发货(2), 待买方确认收货(3), 待结算(4), 待评价(5), 完成(6), 纠纷中(7),
										待买方退货(8), 待卖方确认退货(9), 已退货待结算(10), 已失效(11), 订单取消协商中(12), 购物车(13), 订单被卖家取消(14),
										订单被买家取消(15), 发货过期平台取消(16), 平台干预中(17), 已结束(18);-->
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 0 " @click.stop="orderConfirmPush(item.id)">确单提醒
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 0" @click.stop="goToBuyCommodityConfirm(item.id)">去结算
										</view>

										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 1"
											@click.stop="goToPayTransaction(item.id,item.quantity,item.totalValuePaid)">
											付款
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 2" @click.stop="promptDeliveryTransaction(item.id)">
											发货提醒
										</view>

										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 3 "
											@click.stop="receiveGoodsConfirmTransaction(item.id,item.buyerId)">
											确认收货
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 3 || item.status === 12 || item.status === 4 || item.status === 15 || item.status === 7 || item.status === 8 || item.status === 9 || item.status === 17 || item.status === 10 || item.status === 14"
											@click.stop="getMappedDeliveryByTransactionId(item.id,0)">物流
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 8" @click.stop="deliveryGoodsTransaction(item.id)">发货
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 3 "
											@click.stop="extendReceiveGoodsConfirmationTransaction(item.id)">
											延迟收货
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="(item.status === 2 && item.overTimeStatus === item.status) || item.status === 7 || item.status === 12 || item.status === 17"
											@click.stop="goToDispute(item.id)">
											争议
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 12"
											@click.stop="goToCancelTransaction(item.id,item.buyerId,item.sellerId)">
											赔偿约定
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 0 || item.status === 1 || item.status === 2 || item.status === 3"
											@click.stop="cancelTransaction(item.id,index)">取消
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 6 || item.status === 11 || item.status === 16 || item.status === 18"
											@click.stop="deleteTransaction(item.id,index)">删除
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 17"
											@click.stop="getArbitrationByTransactionId(item.id)">仲裁
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 17 || item.status === 9 || item.status === 10"
											@click.stop="getMappedDeliveryByTransactionId(item.id,1)">退货物流
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 9 "
											@click.stop="promptConfirmDeliveryTransaction(item.id,item.buyerId)">
											收货提醒
										</view>
									</view>
								</commodity-transaction-list-cell>
							</view>
						</uni-swipe-action-item>
					</uni-list-item>
				</uni-list>
				<!--列表结束-->
			</uni-swipe-action>
			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>

		<!--       物流弹出框-->
		<uni-popup ref="popup" type="center" :animation="true">
			<view class="bg-white radius padding text-df" v-if="deliveryData">
				<view class="text-xl text-theme text-center padding-bottom-sm">
					物流信息
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>
						承运商：
					</view>
					<view>
						{{ deliveryData.carrierName }}
					</view>
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>
						运单号：
					</view>
					<view>
						{{ deliveryData.waybill }}
					</view>
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>
						发货时间：
					</view>
					<view>
						{{ deliveryData.shipTime | formatDate }}
					</view>
				</view>
				<view class="flex align-center justify-between padding gray-border-bottom">
					<view>
						状态：
					</view>
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
			<view class="bg-white radius padding text-df">
				<view class="text-xl text-theme text-center padding-bottom-sm">
					请填写物流信息
				</view>
				<view class="padding">
					<view class="text-lg flex align-center justify-start" style="width: 100%;">
						<view>
							物流公司：
						</view>
						<view v-if="carrierList">
							<picker mode="selector" @change="carrierChange" :value="carrierIndex" :range-key="'name'"
								:range="carrierList">
								<view class="flex align-center">
									<view>{{ carrierList[carrierIndex].name }}</view>
									<image style="width: 32rpx;height: 20rpx;margin-left: 190rpx"
										:src="imgUrl+'/xiala.png'" />
								</view>
							</picker>
						</view>
					</view>

				</view>
				<view class="flex-grow text-normal flex align-center justify-between" style="width: 100%;">
					<view>
						运单号：
					</view>
					<input v-model="waybill"
						class="flex-twice radius-s bg-gray-1 padding-ssm flex align-center justify-center" />
				</view>
				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-lg padding-lr padding-tb-sm radius text-center"
						@click="$refs.popupGoods.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-lg padding-lr padding-tb-sm radius text-center"
						@click="submitDeliveryGoodsTransaction">确定</view>
				</view>
			</view>
		</uni-popup>


		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5  -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" v-show="isShowFab" />
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->

	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import uniSwipeAction from "@/components/uni-swipe-action/uni-swipe-action";
	import uniSwipeActionItem from "@/components/uni-swipe-action-item/uni-swipe-action-item";
	import wucTab from "@/components/wuc-tab/wuc-tab";
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import {
		formatTime6
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
		getPagedClusterTransactionList,
		orderConfirmPush,
		promptConfirmDeliveryTransaction,
		promptDeliveryTransaction,
		receiveGoodsConfirmTransaction
	} from "@/api/mall";
	import CommodityTransactionListCell from "../components/commodity-transaction-list-cell";
	import {
		imgUrl,active
	} from '@/utils/config.js';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "myCommodityBuyTransaction",
		components: {
			CommodityTransactionListCell,
			UniListItem,
			UniList,
			uniPopup,
			uniSwipeAction,
			uniSwipeActionItem,
			wucTab,
			// #ifdef H5
			UniFab,
			// #endif
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				option: [{
					text: '移除',
					style: {
						backgroundColor: '#fb5318',
					}
				}],
				tabBars: [{
						name: '待确认',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						status: 0,
						list: [],
					},
					{
						name: '进行中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						status: 1,
						list: [],
					},
					{
						name: '已结束',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						status: 2,
						list: [],
					}
				],
				tabIndex: 0,
				triggered: false,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				deliveryData: null,
				transactionId: null, //交易id
				waybill: '', //运单号

				carrierList: [{
					name: null,
				}],
				carrierId: null,
				carrierIndex: 0,

				token: null,
				userData: {},

				//悬浮层开始
				horizontal: 'left',
				vertical: 'top',
				direction: 'horizontal',
				pattern: {
					color: '#fb5318',
					backgroundColor: '#ffffff',
					selectedColor: '#fb5318',
					buttonColor: "#fb531899"
				},
				content: [{
					iconPath: imgUrl + '/personal/ic_portrait_hollow.png',
					selectedIconPath: imgUrl + '/personal/ic_portrait_hollow.png',
					text: '我的',
					active: false
				}],
				isShowFab: true, //浮层是否显示
				fabMenuPopped: false,
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
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop;
					//#endif
					// #ifdef H5
					this.contentTop = 0;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
		},
		onLoad() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');
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
				this.getCarrierList()
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
					id: this.transactionId,
					carrierIdExact: this.carrierId,
					waybillExact: this.waybill,
					deliveryType: 1
				}
				let self = this;
				deliveryGoodsTransaction(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "提交成功！",
							icon: "none",
							duration: 1500
						})
						setTimeout(() => {
							self.$refs.popupGoods.close()
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
				this.transactionId = id
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

						self.loadData()
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
										self.tabBars[self.tabIndex].page = 1;
										self.loadData()
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
					url: '/pagesPersonal/myMall/negoTransaction?id=' + id + '&payBy=' + payBy + '&payTo=' + payTo
				})
			},
			//延迟收货
			extendReceiveGoodsConfirmationTransaction(id) {
				let paramsData = {
					id: id
				}
				uni.showModal({
					title: '小二提醒',
					content: '您确认要为此订单延迟收货吗？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							console.log('用户点击确定');
							extendReceiveGoodsConfirmationTransaction(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "操作成功",
										icon: "none",
										duration: 1500
									})
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
			deleteTransaction(id, index) {
				let paramsData = {
					id: id,
					operatorType: 0
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '您确认要删除此订单吗？删除后此订单将不会在列表显示！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							deleteTransaction(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '删除成功！',
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										self.tabBars[self.tabIndex].list.splice(index, 1);
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
							url: '/pagesNew/domall/buyCommodityConfirm?transactionId=' + id
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
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '您确认要取消此订单吗？取消后此订单将不会继续执行！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
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
											self.tabBars[self.tabIndex].page = 1;
											self.loadData()
										}, 1500)
									}
								}
							});
						}
					}
				})
			},
			//跳转到我的采购订单详情
			toItemDetail(id) {
				uni.navigateTo({
					url: '/pagesPersonal/myMall/transactionDetailsForBuyer?id=' + id,
				})
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.loadData();
					}, 300);
				}
			},
			//获取我的采购订单列表
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					clusterId: this.tabBars[this.tabIndex].status,
					userType: 0, //买家
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size
				}
				let self = this;
				getPagedClusterTransactionList(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}

						res.data.list.forEach(item => {
							if (item.unitPriceBreakdown) {
								item.unitPriceBreakdown = JSON.parse(item.unitPriceBreakdown)
							}
							if (item.commoditySnapshot.photos) {
								item.commoditySnapshot.photos = JSON.parse(item.commoditySnapshot.photos);
							} else {
								item.commoditySnapshot.photos = [];
							}
							self.tabBars[self.tabIndex].list.push(item);
						});

						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.tabBars[this.tabIndex].page = 1;
				this.tabBars[this.tabIndex].list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			//状态切换
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
			//点击移除
			swipeClick(e, index, id) {
				let paramsData = {
					id: id,
					operatorType: 0
				}
				let self = this
				let {
					content
				} = e
				if (content.text === '移除') {
					uni.showModal({
						title: '小二提醒',
						content: '您确认要删除此订单吗？删除后此订单将不会在列表显示！',
						showCancel: true,
						cancelText: '取消',
						confirmText: '确定',
						confirmColor: '#fb5318',
						success: function(res1) {
							if (res1.confirm) {
								deleteTransaction(paramsData).then(res => {
									if (res.retCode === 0) {
										uni.showToast({
											title: '删除成功！',
											icon: "none",
											duration: 1500
										})
										setTimeout(() => {
											self.tabBars[self.tabIndex].list.splice(index,
												1);
										}, 1500)
									}
								});
							}
						}
					})
				}
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
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
		},
	}
</script>

<style scoped lang="scss" lang="scss">
	@import "@/static/css/tabBar.css";
	@import "@/static/css/fab.css";
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.dis-agree {
		border-bottom-left-radius: 20rpx;
		border-right: 1px solid #EEEEEE;
	}

	.more-think {
		border-right: 1px solid #EEEEEE;
	}

	.agree {
		border-bottom-right-radius: 20rpx;
		border-left: 1px solid #ffffff;
		color: #fb5318
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}

	::v-deep .uni-popup__wrapper-box {
		width: 90%;
	}

	::v-deep .uni-swipe_box {
		background-color: transparent !important;
	}

	::v-deep .uni-swipe_button-group {
		margin: 0;
		border-radius: 0rpx !important;
	}

	::v-deep .uni-swipe_button-group .uni-swipe_button {
		border-radius: 10rpx;
	}
</style>