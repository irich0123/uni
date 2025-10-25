<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我投诉的" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<!--        信息列表开始-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<uni-swipe-action>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false">
						<uni-swipe-action-item :options="option" @click="swipeClick($event,tabIndex,item.id)">
							<view class="flex-grow bg-white flex flex-direction align-start justify-center radius-s"
								v-if="tabIndex === 0" @click="toItemDetail(item.id)">
								<view style="width:100%"
									class="flex align-start justify-between padding-top padding-bottom-sm gray-border-bottom">
									<view class="text-theme text-df text-bold padding-left">
										{{item.status | filterStatus(that)}}
									</view>
									<view class="text-gray-4 text-sm padding-right">{{ item.updateTime | formatDate }}
									</view>
								</view>
								<user-bar-normal style="width:100%" :user="item.userBeComplaint" :statisticsOn="true"
									:userDetailOn="false" detailColor="gray" />
								<view class="flex align-start justify-start margin-sm padding-sm bg-gray-1 text-black "
									style="width: 88%;min-height: 80rpx;">
									<text class="text-gray-5 text-bold">{{ item.content }}</text>: {{ item.remark }}
								</view>
							</view>
							<view class="flex-grow bg-white flex flex-direction align-start justify-center radius-s"
								v-if="tabIndex === 1" @click="toItemDetail(item.id)">
								<view style="width:100%"
									class="flex align-start justify-between padding-top padding-bottom-sm gray-border-bottom">
									<view class="text-theme text-df text-bold padding-left">
										{{item.status | filterStatus(that)}}
									</view>
									<view class="text-gray-4 text-sm padding-right">{{ item.updateTime | formatDate }}
									</view>
								</view>
								<release-work-list-cell style="width:100%" v-if="!!item.releaseWork"
									:show-status-bar="false" :show-footer="false" :release-work="item.releaseWork" />
								<work-order-list-cell style="width:100%" v-if="!!item.workOrder"
									:show-status-bar="false" :show-footer="false" :work-order="item.workOrder" />
								<view class="flex align-start justify-start margin-sm padding-sm bg-gray-1 text-black "
									style="width: 88%;min-height: 80rpx;">
									<text class="text-gray-5 text-bold">{{ item.content }}</text>: {{ item.remark }}
								</view>
							</view>
							<view class="flex-grow bg-white flex flex-direction align-start justify-center radius-s"
								v-if="tabIndex === 2" @click="toItemDetail(item.id)">
								<view style="width:100%"
									class="flex align-start justify-between padding-top padding-bottom-sm gray-border-bottom">
									<view class="text-theme text-df text-bold padding-left">
										{{item.status | filterStatus(that)}}
									</view>
									<view class="text-gray-4 text-sm padding-right">{{ item.updateTime | formatDate }}
									</view>
								</view>
								<view class="padding bg-white">
									<commodity-list-cell style="width:100%" :show-status-bar="false"
										:commodity="item.commodity" />
								</view>
								<view class="flex align-start justify-start margin-sm padding-sm bg-gray-1 text-black "
									style="width: 88%;min-height: 80rpx;">
									<text class="text-gray-5 text-bold">{{ item.content }}</text>: {{ item.remark }}
								</view>
							</view>
						</uni-swipe-action-item>
					</uni-list-item>

					<!--                我投诉的商品-->
				</uni-list>
			</uni-swipe-action>
			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>

		</scroll-view>
		<!--        信息列表结束-->
	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import wucTab from "@/components/wuc-tab/wuc-tab";
	import {
		filterComplaint,
		cancelComplaint
	} from "@/api/common";
	import {
		getComplaintStatus
	} from "@/api/basic";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import {
		formatTime6,
	} from "@/utils/myUtil";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "myComplaint",
		components: {
			CommodityListCell,
			WorkOrderListCell,
			ReleaseWorkListCell,
			UserBarNormal,
			UniListItem,
			UniList,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				that: this,

				token: null,
				userData: {},

				option: [{
					text: '取消',
					style: {
						backgroundColor: '#fb5318'
					}
				}],

				tabBars: [{
						name: '用户',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						type: 1,
						list: [],
					},
					{
						name: '加工信息',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						type: 2,
						list: [],
					},
					{
						name: '尾货商品',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						type: 3,
						list: [],
					}
				],
				tabIndex: 0,
				triggered: false,

				statusList: [],

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
			filterStatus(type, that) {
				const [obj] = that.statusList.filter(v => v.value === type)
				return !!obj ? obj.label : '';
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
				this.getComplaintStatusEnum();
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1500
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}, 1500);
			},
			getComplaintStatusEnum() {
				let self = this;
				getComplaintStatus().then(res => {
					if (res.retCode === 0) {
						self.statusList.splice(0, self.statusList.length);
						res.data.forEach(v => {
							self.statusList.push(v);
						})

						self.loadData();
					}
				});
			},
			//跳转到投诉详情页面
			toItemDetail(id) {
				uni.navigateTo({
					url: './complaintDetails?id=' + id,
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
			//获取投诉的人或者投诉的活信息列表
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					type: this.tabBars[this.tabIndex].type.toString(),
					pageNum: this.tabBars[this.tabIndex].page,
					pageSize: this.tabBars[this.tabIndex].size,
					userId: this.userData.id,
					statusList: [1, 2, 3],
				}
				let self = this;
				filterComplaint(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							if (this.tabBars[this.tabIndex].type === 2) {
								if (item.releaseWork) {
									if (item.releaseWork.img) {
										item.releaseWork.img = JSON.parse(item.releaseWork.img)
									}
								}
								if (item.workOrder) {
									if (item.workOrder.img) {
										item.workOrder.img = JSON.parse(item.workOrder.img)
									}
								}
							} else if (this.tabBars[this.tabIndex].type === 3) {
								if (item.commodity) {
									if (item.commodity.photos) {
										item.commodity.photos = JSON.parse(item.commodity.photos);
									} else {
										item.commodity.photos = [];
									}
								}
								if (item.commodity.unitPriceBreakdown) {
									item.commodity.unitPriceBreakdown = JSON.parse(item.commodity
										.unitPriceBreakdown)
								}
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
					this.loadData();
				}
			},
			swipeClick(e, index, id) {
				let self = this;

				if (e.content.text === '取消') {
					uni.showModal({
						title: '提示',
						content: '确认取消投诉吗?',
						success: (res1) => {
							if (res1.confirm) {
								this.cancelComplaint(index, id);
							}
						}
					});
				}
			},
			cancelComplaint(index, id) {
				let self = this;
				cancelComplaint({
					id: id
				}).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "取消投诉成功",
							icon: "none",
							duration: 2000,
						})

						let idx = self.tabBars[index].list.findIndex(v => v.id === id);
						if (idx > -1) {
							self.tabBars[index].list.splice(idx, 1, res.data);
						}
					}
				});
			}

		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/tabBar.css";
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
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}
</style>