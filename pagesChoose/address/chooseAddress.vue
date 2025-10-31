<template>
	<view class="container no-scroll					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif">
		<!-- #ifndef  H5-->
		<my-nav-bar title="选择收货地址" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData">

			<radio-group @change="radioChange">
				<uni-list>
					<uni-list-item v-for="(item,index) in list" :key="index" :show-arrow="false">
						<view class="flex align-center justify-start padding-lr-sm margin-bottom-xss">
							<address-list-cell :address="item" :radio="true" :checked="addressId===item.id" />
						</view>
					</uni-list-item>
				</uni-list>
			</radio-group>

			<text class="loading-text">{{
			        loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			    }}
			</text>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white flex align-center" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="flex-sub bg-white theme-border text-xl text-theme radius-0" @click="toAdd">新地址</button>
			<button class="flex-twice bg-theme theme-border text-xl text-white radius-0"
				@click="chooseAddress">确定</button>
		</view>

	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import addressListCell from "@/utils/yjg-list-cell/address-list-cell";
	import {
		filterAddress
	} from "@/api/user";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "chooseAddress",
		components: {
			UniList,
			UniIcons,
			UniListItem,
			addressListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				list: [],
				page: 1,
				size: 10,

				addressIndex: 0,
				addressId: null,

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
				immediate: true,
			}
		},
		onLoad(options) {
			this.userData = uni.getStorageSync("user");

			if (options.addressId) {
				this.addressId = parseInt(options.addressId);
			}

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
				this.loadData()
			},

			chooseAddress() {
				if (!this.addressId) {
					uni.showToast({
						title: '请选择收货地址',
						icon: "none",
						duration: 1500
					})
					return
				}
				let pages = getCurrentPages();
				let prevPage = pages[pages.length - 2];
				let object = {
					address: this.list.find(v => v.id === this.addressId),
				}
				prevPage.$vm.otherFun(object);
				uni.navigateBack({
					delta: 1
				})
			},
			//选择地址
			radioChange(evt) {
				this.addressId = parseInt(evt.detail.value);
			},
			//添加
			toAdd() {
				uni.navigateTo({
					url: './addressDetails'
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
			//获取地址信息列表
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					page: this.page,
					size: this.size,
					userId: this.userData.id,
					status: 1,
				}
				let self = this;
				filterAddress(paramsData).then(res => {
					if (res.retCode === 0) {
						let rows = res.data.list
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						rows.forEach(row => {
							if (!self.addressId && !!row.isDefaultAddress) {
								self.addressId = row.id;
							}
							self.list.push(row);
						})
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
						}
					}
					self.isLoading = false;
				}).catch(() => {
					self.isLoading = false;
				});
			},
		},
	}
</script>

<style scoped lang="scss">
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
		background-color: white;
		border-radius: 10rpx;
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}
</style>