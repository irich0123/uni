<template>
	<view class='container no-scroll'>
		<!-- #ifndef  H5-->
		<my-nav-bar title="帮助文档" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view class="margin-bottom-sm text-df">
				<view class='margin-sm padding bg-white radius-s' v-for="(item,index) in list" :key="index">
					<view class='text-black-4 text-df text-bold margin-bottom-ssm flex align-start'>
						<text style="width:40rpx">{{index+1}}、</text>
						<text class="flex-grow">{{item.msgTitle }}</text>
					</view>
					<view class='text-black-4 text-df padding-left-lg' v-html="item.msgContent" />
				</view>
				<text class="loading-text">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
				</text>
			</view>
		</scroll-view>
	</view>

</template>

<script>
	import {
		filterPagedHelpInfoList
	} from "@/api/common";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from "@/utils/config";
	
	export default {
		name: "helpInfo",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				typeId: null,

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
		onLoad(options) {
			this.typeId = parseInt(options.typeId);

			this.loadData();
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
					pageNum: this.page,
					pageSize: this.size,
					helpTypeId: this.typeId,
					status: 1,
				}
				let self = this;
				filterPagedHelpInfoList(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						res.data.list.forEach(item => {
							item.msgContent = item.msgContent.replace(/\\n/g, "<br>")
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
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>