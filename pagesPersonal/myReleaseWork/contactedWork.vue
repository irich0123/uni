<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="已联系承接" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view class="margin-top-ssm" @click.stop="toItemDetail(item.id)"
				v-for="(item,index1) in list" :key="index1">
				<work-order-list-cell :showAdminBar="true" :work-order="item.workOrderResponse" @onPhoneCall="phoneCall" />
			</view>

			<text class="loading-text margin-top-sm">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import {
		filterContactWorkOrder,
	} from "@/api/workinfo";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "contactedWork",
		components: {
			WorkOrderListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				list: [],
				triggered: false,
				page: 1,
				size: 10,

				token: null,
				userData: {},

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
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user")

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user")

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
			//承接打电话
			phoneCall(item) {
				uni.makePhoneCall({
					phoneNumber: item.mobile,
				}).catch(e => {});
			},
			//跳转到承接详情页
			toItemDetail(workId) {
				uni.navigateTo({
					url: '/pagesNew/details/workDetails?id=' + workId + '&fromAdmin=1',
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
			//获取我联系的外发信息
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;

				let paramsData = {
					page: this.page,
					size: this.size,
					userId: this.userData.id,
					deleteFlag: false,
				}
				let self = this;
				filterContactWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						let contactedWorkOrderList = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						contactedWorkOrderList.forEach(item => {
							if (item.workOrderResponse.img) {
								item.workOrderResponse.img = JSON.parse(item.workOrderResponse.img);
							}
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
		},

	}
</script>

<style scoped lang="scss">
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
	}

</style>