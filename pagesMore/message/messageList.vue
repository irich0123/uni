<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的消息" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<!--        信息列表开始-->
			<view class="margin-sm text-df">
				<!--列表开始-->
				<uni-list :border="false">
					<view v-for="(item,index) in list" :key="index">
						<uni-list-item :show-arrow="false" :right-text="item.createTime | formatDate"
							:thumb="imgUrl+'/ic_laba.png'" thumb-size="sm" @click.native="toDetail(item)">
							<view>
								<view class="text-lg text-black text-bold">{{item.msgTitle}}</view>
								<view class="text-df text-black-4 padding-tb-ssm">{{item.msgContent}}</view>
							</view>
						</uni-list-item>
					</view>
				</uni-list>
				<!--列表结束-->
				<text class="loading-text margin-top-sm">{{
			        loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			    }}
				</text>
			</view>
			<!--        信息列表结束-->
		</scroll-view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	var jpushModule = uni.requireNativePlugin("JG-JPush")
	// #endif

	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	import {
		filterPushBean
	} from "@/api/push";
	import {
		getNotifyConfigByCode
	} from "@/api/mall";
	import {
		toDate,
	} from "@/utils/myUtil";

	export default {
		name: "messageList",
		components: {
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				userData: {},

				page: 1,
				size: 10,
				list: [],
				triggered: false,

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

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
			formatDate(time) {
				return toDate(time);
			},
		},
		onLoad() {
			this.userData = uni.getStorageSync("user")

			this.initData();
		},
		onShow() {
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
				this.loadData();
			},
			mallNotifyHandle(code, relationId) {
				let self = this;
				getNotifyConfigByCode({
					code: code
				}).then(res => {
					if (res.retCode === 0) {
						if (res.data.toUserType != null) {
							if (res.data.toUserType == 0 && code.indexOf("19") === 0) {
								uni.navigateTo({
									url: '/pagesPersonal/myMall/transactionDetailsForBuyer?id=' +
										relationId
								})
							} else if (res.data.toUserType == 1 && code.indexOf("19") === 0) {
								uni.navigateTo({
									url: '/pagesPersonal/myMall/transactionDetailsForSeller?id=' +
										relationId
								})
							} else if (res.data.toUserType == 1 && code.indexOf("16") === 0) {
								if (code === "1601") {
									uni.navigateTo({
										url: '/pagesNew/details/mallDetails?cId=' + relationId,
									})
								} else {
									uni.navigateTo({
										url: '/pagesPersonal/myMall/publishMall',
									})
								}
							}
						}
					}
				})
			},
			workNotifyHandle(item) {
				if (item.msgTitle.indexOf("活信息") === 0) {
					uni.navigateTo({
						url: '/pagesPersonal/myReleaseWork/publishReleaseWork',
					})
				} else if (item.msgTitle.indexOf("承接信息") === 0) {
					uni.navigateTo({
						url: '/pagesPersonal/myWork/publishWorkOrder',
					})
				} else if (item.msgTitle.indexOf("信息置顶") === 0) {
					uni.navigateTo({
						url: '/pagesNew/stick/stickList',
					})
				}
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.redirectTo({
					url: '/pages/login/login'
				})
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
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;

				let self = this;
				let param = {
					page: this.page,
					size: this.size,
					status: 1,
					userId: this.userData.id,
				}
				filterPushBean(param).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						list.forEach(item => {
							self.list.push(item);
						});

						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
						}

						//#ifdef APP-PLUS 
						self.clearBadgeTo0();
						//#endif
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
			toDetail(item) {
				if (!!item.notifyCode && !!item.relationId) {
					if (item.notifyCode.indexOf("19") === 0 || item.notifyCode.indexOf("16") === 0) {
						this.mallNotifyHandle(item.notifyCode, item.relationId);
					}
				} else if (!item.notifyCode) {
					this.workNotifyHandle(item);
				}
			},
			clearBadgeTo0() {
				plus.runtime.setBadgeNumber(0);
				jpushModule.setBadge(0);
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

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		align-items: flex-start !important;
	}

	::v-deep .uni-list-item__icon {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	::v-deep .uni-list-item {
		padding: 50rpx 30rpx 40rpx 30rpx !important;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		background-color: #fff;
	}

	::v-deep .uni-list-item__content-title {
		font-size: 34rpx;
	}

	::v-deep .uni-list-item__content-note {
		font-size: 26rpx;
	}

	::v-deep .uni-list-item__extra-text {
		font-size: 30rpx;
	}

	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}
</style>