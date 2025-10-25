<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="使用帮助" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
			@refresherrestore="onRestore" refresher-background="transparent">

			<uni-list :border="false">
				<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false">
					<view class="padding-lr-sm padding-tb-lg bg-white radius-s text-black-4" @click="switchPage(item)">
						{{index+1}}、{{ item.typeName }}
					</view>
				</uni-list-item>
			</uni-list>

			<text class="loading-text margin-top-sm">{{
			        tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			    }}
			</text>
		</scroll-view>
	</view>

</template>

<script>
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import UniList from "@/components/uni-list/uni-list";
	import wucTab from "@/components/wuc-tab/wuc-tab";
	import {
		filterHelpType
	} from "@/api/common";
	import {
		active
	} from '@/utils/config';
	
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "helpful",
		components: {
			UniListItem,
			UniList,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				tabBars: [{
						name: '热门问题',
						loadingType: 2,
						isLoading: false,
						list: [],
						page: 1,
						size: 10,
						hot: 1,
					},
					{
						name: '所有问题',
						loadingType: 2,
						isLoading: false,
						list: [],
						page: 1,
						size: 10,
						hot: 0,
					}
				],
				tabIndex: 0,
				triggered: false,

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
		onLoad() {
			this.initData();
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
			switchPage(item) {
				uni.navigateTo({
					url: '../help/helpInfo?typeId=' + item.id,
				})
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
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let paramsData = {
					hot: this.tabBars[this.tabIndex].hot,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					status: 1,
				}
				let self = this;
				filterHelpType(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex]
								.list.length);
						}

						res.data.list.forEach(item => {
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
		}
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
		padding: 20rpx 20rpx 0 20rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0 !important;
	}
</style>