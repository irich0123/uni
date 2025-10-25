<template>
	<view class="container">
		<!-- #ifndef  H5-->
		<my-nav-bar title="最新活动" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<!--列表开始-->
			<uni-list :border="false">
				<uni-list-item :show-arrow="false" v-for="(item,index) in list" :key="index"
					@click.native="toDetail(item)">
					<image :src="item.img" style="width:100%;" class="radius-l" mode="widthFix" />
				</uni-list-item>
			</uni-list>
			<!--列表结束-->

			<text class="loading-text margin-top-sm">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>

		</scroll-view>
	</view>
</template>

<script>
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import UniList from "@/components/uni-list/uni-list";
	import {
		filterActiveInfo
	} from "@/api/common"
	import {
		active
	} from '@/utils/config';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "promotionList",
		components: {
			UniListItem,
			UniList,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,

				page: 1,
				size: 10,
				triggered: false,
				list: [],

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
		onLoad() {
			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');

			if (!this.token) {
				this.toLogin();
				return;
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

				let paramsData = {
					page: this.page,
					size: this.size,
					swiches: 1,
				}

				let self = this;
				filterActiveInfo(paramsData).then(res => {
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
				if (item.localUrl.indexOf("http:") > -1) {
					//todo 小程序和公众号分享 及APP分享功能
					uni.navigateTo({
						url: '/pages/common/webview?url=' + encodeURIComponent(item.localUrl + "?t=" + new Date().getTime()),
					})
				} else {
					uni.navigateTo({
						url: item.localUrl,
					})
				}
			},
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
		margin: 0 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 20rpx 20rpx 0 20rpx !important;
	}
</style>