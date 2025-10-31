<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="置顶情况" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view>
				<view class="margin-sm text-df" v-if="infoType==1">
					<work-order-list-cell :work-order="workOrder" :show-admin-bar="true" :show-status-bar="false"
						:show-footer="true" />
				</view>

				<view class="margin-sm text-df" v-if="infoType==0">
					<release-work-list-cell :release-work="releaseWork" :show-admin-bar="true" :show-status-bar="false"
						:show-footer="true" />
				</view>
			</view>
			<!--        信息列表开始-->
			<view class="padding-top-sm padding-left text-black-5 text-df" v-if="list.length>0">置顶记录</view>
			<view class="margin-sm text-df" v-if="list.length>0">
				<!--列表开始-->
				<uni-swipe-action>
					<uni-list :border="false">
						<uni-list-item :show-arrow="false" v-for="(item,index) in list" :key="index">
							<uni-swipe-action-item :options="option" @click="swipeClick($event,index,item.id)"
								:disabled="item.status===2">
								<view class="flex-grow">
									<stick-apply-list-cell :stickApply="item" :showStatusBar="true" @handle="tohandle">
									</stick-apply-list-cell>
								</view>
							</uni-swipe-action-item>
						</uni-list-item>
					</uni-list>
				</uni-swipe-action>
				<!--列表结束-->

				<text class="loading-text">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
				</text>
			</view>

		</scroll-view>
		<!--        信息列表结束-->

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme theme-border text-xl text-white radius-0" @click="toPost">添加置顶</button>
		</view>
	</view>
</template>

<script>
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniSwipeActionItem from '@/components/uni-swipe-action-item/uni-swipe-action-item.vue'
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		filterStickApply,
		getStickApplyTypeEnum,
		getStickApplyStatusEnum,
		deleteStickAppy
	} from "@/api/stick";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import StickApplyListCell from "../components/stick-apply-list-cell";
	import {
		getWorkOrderDetailsByIdAnon,
		getReleaseWorkDetailsByIdAnon,
	} from "@/api/workinfo";
	import {
		getWorkOrderStatusEnum,
		getReleaseWorkStatusEnum
	} from "@/api/basic";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "list",
		components: {
			uniSwipeAction,
			uniSwipeActionItem,
			WorkOrderListCell,
			ReleaseWorkListCell,
			StickApplyListCell,
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,

				option: [{
						text: '删除',
						style: {
							backgroundColor: '#fb5318'
						}
					},
					{
						text: '修改',
						style: {
							backgroundColor: '#fb9753'
						}
					}
				],

				workOrder: {},
				workOrderStatusList: [],

				releaseWork: {},
				releaseWorkStatusList: [],

				infoId: null,
				infoType: null,

				page: 1,
				size: 10,
				list: [],
				triggered: false,

				siteList: [],
				statusList: [], //需要获得状态列表

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

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
		onLoad(query) {
			this.infoType = parseInt(query.type);
			this.infoId = parseInt(query.id);

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
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			initData() {
				this.getStickApplyStatusEnum();
			},
			getStickApplyStatusEnum() {
				let self = this;
				getStickApplyStatusEnum().then(res => {
					if (res.retCode === 0) {
						self.statusList.splice(0, self.statusList.length);
						res.data.forEach(v => {
							self.statusList.push(v);
						})

						self.getStickApplyType();
					}
				});
			},
			getStickApplyType() {
				let self = this;
				getStickApplyTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.siteList.splice(0, self.siteList.length);
						res.data.forEach(v => {
							self.siteList.push(v);
						})

						self.getWorkOrderStatusList();
					}
				});
			},
			getWorkOrderStatusList() {
				let self = this;
				getWorkOrderStatusEnum().then(res => {
					if (res.retCode === 0) {
						self.workOrderStatusList = res.data;

						self.getReleaseWorkStatusList()
					}
				});
			},
			getReleaseWorkStatusList() {
				let self = this;
				getWorkOrderStatusEnum().then(res => {
					if (res.retCode === 0) {
						self.releaseWorkStatusList = res.data;

						self.getInfo()
					}
				});
			},
			getInfo() {
				if (this.infoType == 1) {
					this.getWorkOrderById();
				} else if (this.infoType == 0) {
					this.getReleaseWorkById();
				}
			},
			toPost() {
				uni.navigateTo({
					url: '/pagesNew/stick/stickApply?infoId=' + this.infoId + '&infoType=' + this.infoType
				})
			},
			toEdit(id) {
				uni.navigateTo({
					url: '/pagesNew/stick/stickApply?id=' + id,
				})
			},
			swipeClick(e, index, id) {
				let paramsData = {
					id: id,
				}
				let self = this
				if (e.content.text === '删除') {
					uni.showModal({
						title: '提示',
						content: '确认删除此项置顶吗?',
						success: async (res1) => {
							if (res1.confirm) {
								deleteStickAppy(paramsData).then(res => {
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
				} else if (e.content.text === '修改') {
					this.toEdit(id);
				}
			},


			//根据承接id获取详情
			getWorkOrderById() {
				let paramsData = {
					id: this.infoId,
				}
				let self = this;
				getWorkOrderDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.workOrder = res.data;

						if (!!self.workOrder.img) {
							self.workOrder.img = JSON.parse(self.workOrder.img);
						} else {
							self.workOrder.img = [];
						}

						self.workOrder.statusName = self.workOrderStatusList.find(v => {
							return v.value === self.workOrder.verifyStatus
						}).label;

						self.loadData()
					}
				});
			},
			//根据id获取活信息详情
			getReleaseWorkById() {
				let paramsData = {
					id: this.infoId,
				}
				let self = this;
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.releaseWork = res.data;

						if (!!self.releaseWork.img) {
							self.releaseWork.img = JSON.parse(self.releaseWork.img);
						} else {
							self.releaseWork.img = [];
						}

						self.releaseWork.statusName = self.releaseWorkStatusList.find(v => {
							return v.value === self.releaseWork.verifyStatus
						}).label;


						self.loadData()
					}
				});
			},

			loadMoreData() {
				if (this.loadingType === 0) {
					this.loadingType = 1;
					setTimeout(() => {
						this.page++;
						this.loadData();
					}, 300);
				}
			},
			//获取活信息列表
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;

				let paramsData = {
					page: this.page,
					size: this.size,
					relationId: this.infoId,
					statusList: [-1, 0, 1, 2, 3], //审核未通过(-1),待审核(0),待支付(1),已支付(2),已过期(3),已取消(4), 已删除(5);
				}

				let self = this;
				filterStickApply(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						list.forEach(item => {
							item.typeName = self.siteList.find(v => v.value === item.type).label;
							item.statusName = self.statusList.find(v => v.value === item.status).label;
							self.list.push(item);
						});

						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
						}
					}
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.page = 1;
				this.list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			toDelete(id, index) {
				let self = this;
				uni.showModal({
					title: '小二提示',
					content: '确认删除此置顶吗？',
					showCancel: true,
					cancelText: "取消",
					confirmText: '确认',
					confirmColor: '#fb5318',
					success: function(res) {
						if (res.confirm) {
							self.deleteStickApply(id, index)
						}
					},
				})
			},
			deleteStickApply(id, index) {
				let self = this;
				deleteStickAppy({
					id: id
				}).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: '删除成功',
							duration: 1000
						});

						self.list.splice(index, 1);
					}
				});
			},
			toPay(id) {
				uni.navigateTo({
					url: '/pagesPersonal/pay/payStickApply?id=' + id,
				})
			},
			tohandle(e) {
				if (e.action === "pay") {
					this.toPay(e.id);
				}
			}
		},
	}
</script>

<style scoped lang="scss">
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__content {
		text-align: left;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		margin: 0 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 0rpx !important;
	}
</style>