<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的商品" @action="navAction" @reSize="reSize"
			:img-btn-src1="imgUrl+'/ic_edit_hollow_white.png'" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme"></wuc-tab>

		<!--        信息列表开始-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<!--列表开始-->
			<uni-swipe-action>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false"
						@click.native="toItemDetail(item.id)">
						<uni-swipe-action-item :options="option" @click="swipeClick($event,index,item.id)"
							:disabled="tabIndex!==3">
							<view class="flex-grow padding bg-white">
								<commodity-list-cell :commodity="item" :show-status-bar="false" :show-admin-bar="true">
									<view
										class="padding-top-sm margin-top-sm gray-border-top flex align-center justify-end text-black text-sm">
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 0 || item.status === 3 || item.status === 4 ||  item.status === 1"
											@click.stop="goToEditMallDetails(item.id)">编辑
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 0" @click.stop="commodityCancelAudit(item.id)">取消
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 3" @click.stop="getAuditFailureReason(item.id)">原因
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 3" @click.stop="commodityPostRefund(item.id,index)">退款
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 2 "
											@click.stop="commodityPullOffOrPutOnShelves(item.id,0)">下架
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 4"
											@click.stop="commodityPullOffOrPutOnShelves(item.id,1)">上架
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 2 " @click.stop="commodityExtend(item.id)">
											展期
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 5 ||item.status === 7 || item.status === 13 "
											@click.stop="renewCommodity(item.id,1)">重发
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 5 ||item.status === 7"
											@click.stop="deleteCommodity(item.id,index)">删除
										</view>
										<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
											v-if="item.status === 1 " @click.stop="toPayCommodityPost(item.id)">展示支付
										</view>
									</view>
								</commodity-list-cell>
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
		<!--        信息列表结束-->
		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5  -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" />
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->
	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import uniSwipeAction from "@/components/uni-swipe-action/uni-swipe-action";
	import uniSwipeActionItem from "@/components/uni-swipe-action-item/uni-swipe-action-item";
	import wucTab from "@/components/wuc-tab/wuc-tab";
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import {
		cancelCommodity,
		commodityPostRefund,
		deleteCommodity,
		getFailureReasonCommodity,
		filterCommodity,
		onOffCommodity,
	} from "@/api/mall";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import {
		imgUrl,active
	} from '@/utils/config.js';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "publishMall",
		components: {
			CommodityListCell,
			UniList,
			UniListItem,
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
						name: '进行中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [2, 4],
						list: [],
					},
					{
						name: '待付款',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [1, 8],
						list: [],
					},
					{
						name: '审核中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [0, 3],
						list: [],
					},
					{
						name: '已结束',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [5, 7, 13],
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
					},
					{
						iconPath: imgUrl + '/ic_edit_hollow.png',
						selectedIconPath: imgUrl + '/ic_edit_hollow.png',
						text: '发布',
						active: false
					}
				],
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
				} else if (e.action === 'btn1') {
					this.newCommodity();
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},

			initData() {
				this.loadData()
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

			//跳转到商品发布支付页面
			toPayCommodityPost(id) {
				uni.navigateTo({
					url: '../pay/payCommodity?id=' + id
				})
			},
			//删除
			deleteCommodity(id, index) {
				let paramsData = {
					id: id,
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '确认删除该商品吗？删除后，将不会在列表显示！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							console.log('用户点击确定');
							deleteCommodity(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '商品删除成功！',
										icon: "none",
										duration: 1000
									})
									self.tabBars[self.tabIndex].list.splice(index,
										1);
								}
							});
						}
					}
				})
			},
			//跳转到商品展期页面
			commodityExtend(id) {
				uni.navigateTo({
					url: './commodityExtend?id=' + id
				})
			},
			//商品下架/上架
			commodityPullOffOrPutOnShelves(id, status) {
				let content;
				let title;
				if (status === 0) {
					content = '确定要把此商品下架吗？'
					title = '商品下架成功'
				} else {
					content = '确定要把此商品上架吗？'
					title = '商品上架成功'
				}
				let paramsData = {
					id: id,
					commodityShelfStatus: status
				}

				let self = this
				uni.showModal({
					title: '小二提醒',
					content: content,
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							console.log('用户点击确定');
							onOffCommodity(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: title,
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										self.tabBars[self.tabIndex].page = 1;
										self.loadData();
									}, 1500)
								}
							});
						}
					}
				})
			},
			//商品重发
			renewCommodity(id, type) {
				uni.navigateTo({
					url: '/pagesNew/domall/postCommodity?id=' + id + '&renew=' + type
				})
			},
			//商品编辑
			goToEditMallDetails(id) {
				uni.navigateTo({
					url: '/pagesNew/domall/postCommodity?id=' + id
				})
			},
			//审核中 - 取消审核
			commodityCancelAudit(id) {
				let paramsData = {
					id: id
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '确定要取消此商品吗？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							cancelCommodity(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '取消审核成功!',
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
			//审核失败 - 退款申请
			commodityPostRefund(id) {
				let paramsData = {
					id: id
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '确定要退款吗？注意如果商品展示过，将不支持退款哦！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							console.log('用户点击确定');
							commodityPostRefund(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "提交成功",
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
			//获取审核失败原因
			getAuditFailureReason(id) {
				let paramsData = {
					id: id
				}
				getFailureReasonCommodity(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showModal({
							title: '失败原因',
							content: res.data,
							showCancel: false,
							confirmText: '我知道了',
							confirmColor: '#fb5318',
							success: function(res1) {
								if (res1.confirm) {
									console.log('用户点击确定');
								}
							}
						})
					}
				});
			},

			//跳转到商品详情页
			toItemDetail(id) {
				uni.navigateTo({
					url: '../../pagesNew/details/mallDetails?cId=' + id + '&fromAdmin=1'
				})
			},

			//点击删除
			swipeClick(e, index, id) {
				let paramsData = {
					id: id,
				}
				let self = this
				if (e.content === '移除') {
					uni.showModal({
						title: '提示',
						content: '是否删除?',
						success: (res1) => {
							if (res1.confirm) {
								deleteCommodity(paramsData).then(res => {
									if (res.retCode === 0) {
										uni.showToast({
											title: "删除成功",
											icon: 'none',
											duration: 1000
										})
										self.tabBars[self.tabIndex].list.splice(index, 1);
									}
								});
							}
						}
					});
				}
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
			//根据状态获取我发布的商品列表
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					statusList: this.tabBars[this.tabIndex].statusList,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					sellerId: this.userData.id,
					orderByClause: 'updateTime desc'
				}
				let self = this;
				filterCommodity(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex]
								.list.length);
						}
						res.data.list.forEach(item => {
							item.shortAddress = item.shortAddress.replace(/,/g, ' ')
							if (item.unitPriceBreakdown) {
								item.unitPriceBreakdown = JSON.parse(item.unitPriceBreakdown)
							}

							if (item.photos) {
								item.photos = JSON.parse(item.photos);
							} else {
								item.photos = [];
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
			//跳转到发布商品页面
			newCommodity() {
				uni.navigateTo({
					url: '/pagesNew/domall/postCommodity'
				})
			},
			//状态切换
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
			//悬浮按钮的操作
			trigger(e) {
				this.content[e.index].active = !e.item.active;
				if (e.item.text === '发布') {
					this.newCommodity();
				} else if (e.item.text === '我的') {
					uni.switchTab({
						url: '/pages/personal/personal'
					})
				}
			},
			fabClick() {
				if (!this.fabMenuPopped) {
					this.fabMenuPopped = true;
					setTimeout(() => {
						this.fabMenuPopped = false;
						if (!!this.$refs.fab) {
							this.$refs.fab.close();
						}
					}, 3000);
				}
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/tabBar.css";
	@import "@/static/css/fab.css";
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
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


	::v-deep .uni-swipe_button-group {
		margin: 0;
		border-radius: 0rpx !important;
	}

	::v-deep .uni-swipe_button-group uni-view {
		border-radius: 20rpx;
	}

	::v-deep .uni-swipe_button-group .uni-swipe_button {
		border-radius: 20rpx;
	}
</style>