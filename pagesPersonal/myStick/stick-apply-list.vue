<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="置顶信息" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
			@refresherrestore="onRestore" refresher-background="transparent">

			<!--列表开始-->
			<uni-swipe-action>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false">
						<uni-swipe-action-item :options="option" @click="swipeClick($event,index,item.id)"
							:disabled="tabIndex===0">
							<view class="flex-grow">
								<stick-apply-cell :stickApply="item" :showStatusBar="true" @handle="tohandle">
								</stick-apply-cell>
							</view>
						</uni-swipe-action-item>
					</uni-list-item>
				</uni-list>
			</uni-swipe-action>

			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
			<!--列表结束-->
		</scroll-view>
	</view>

</template>

<script>
	import wucTab from '@/components/wuc-tab/wuc-tab'
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniSwipeActionItem from '@/components/uni-swipe-action-item/uni-swipe-action-item.vue'
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import StickApplyCell from "../components/stick-apply-cell";
	import {
		filterStickApply,
		getStickApplyTypeEnum,
		getStickApplyStatusEnum,
		deleteStickAppy
	} from "@/api/stick";
	import {
		imgUrl,active
	} from '@/utils/config.js';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "stick-apply-list",
		components: {
			StickApplyCell,
			uniSwipeAction,
			uniSwipeActionItem,
			UniList,
			UniListItem,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
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
				siteList: [],
				statusList: [],
				tabBars: [{
						name: '进行中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [2],
						list: [],
					},
					{
						name: '待付款',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [1],
						list: [],
					},
					{
						name: '已结束',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [3, 4],
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
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

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
						self.loadData();
					}
				});
			},
			toEdit(id) {
				uni.navigateTo({
					url: '/pagesNew/stick/stickApply?id=' + id,
				})
			},

			//点击删除
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

			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
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
			//获取我发布的承接信息列表
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let paramsData = {
					userId: this.userData.id,
					statusList: this.tabBars[this.tabIndex].statusList,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
				}
				let self = this;
				filterStickApply(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex]
								.list.length);
						}
						res.data.list.forEach(item => {
							self.parseData(item);
							item.typeName = self.siteList.find(v => v.value === item.type).label;
							item.statusName = self.statusList.find(v => v.value === item.status).label;
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
			parseData(item) {
				if (item.workOrder && item.workOrder.img) {
					item.workOrder.img = JSON.parse(item.workOrder.img);
				}
				if (item.releaseWork && item.releaseWork.img) {
					item.releaseWork.img = JSON.parse(item.releaseWork.img);
				}
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

</style>