<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="TA的店铺" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1 position-relative" scroll-y :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view class="waterfall-flow" style="margin-top:10px">
				<!-- class="item" 必须有, 限制好 item 宽度  -->
				<view class="item" :style="item.style" v-for="(item, index) in list" :key="item.id">
					<view @click="itemClicked(index)" class="bg-white margin-bottom-xs">
						<view class="box">
							<image style="display: block;width: 100%;" mode="widthFix" :src="item.image" />
							<view class="content" v-if="!!item.content">{{ item.content }}</view>
							<view class="user" v-if="!!item.user">
								<image :src="item.user.avatar" />
								<text>{{ item.user.name }}</text>
							</view>
							<waterfall-title-bar :item="item" />
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

	</view>
</template>

<script>
	import {
		filterCommodity
	} from "@/api/mall";
	import WaterfallTitleBar from "../components/waterfall-title-bar";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "boothCommodity",
		components: {
			WaterfallTitleBar,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				someoneId: null,

				isLoading: false,
				loadingType: 2,

				page: 1,
				size: 10,
				triggered: true,
				list: [],
				hasNextPage: true,

				boxBottomPosition: [],
				marginBottom: 10,
				contentHeight: 0,
				scrollViewHeight: 0,

				isBottomReached: false,
				maxTop: 0,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			list: function(newVal, oldVal) {
				if (newVal !== oldVal) {
					let mark;
					if (this.page > 1) {
						mark = oldVal.length;
					} else {
						mark = 0;
						this.boxBottomPosition.splice(0, this.boxBottomPosition.length);
						this.contentHeight = 0;
					}
					let len = this.list.length;
					let screenWidth = uni.getWindowInfo().screenWidth;
					let style = '';
					this.$nextTick(async function() {
						const query = uni.createSelectorQuery().in(this);
						let dataArray = [];
						await new Promise((resolve, reject) => {
							setTimeout(() => {
								query.selectAll('.waterfall-flow .item').fields({
									size: true
								}, data => {
									dataArray = data;
									resolve()
								}).exec();
							}, 520) // 针对图片 mode="widthFix" 尺寸改变时的延迟
						})
						for (let i = mark; i < len; i++) {
							if (i < 2) {
								style = `top: 0; left: ${(screenWidth / 2) * i}px;`
								this.boxBottomPosition.push(dataArray[i].height)
							} else {
								let preBoxBottomPosition = this.boxBottomPosition[i - 2];
								this.boxBottomPosition.push(dataArray[i].height +
									preBoxBottomPosition);
								if (i % 2 === 0) {
									style = `top: ${preBoxBottomPosition}px; left: 0;`
								} else {
									style =
										`top: ${preBoxBottomPosition}px; left: ${(screenWidth / 2)}px;`
								}
							}
							this.$set(this.list[i], 'style', style);
						}
						this.contentHeight = Math.max(this.boxBottomPosition[len - 1], this
							.boxBottomPosition[len - 2], );

						this.$forceUpdate();
					})
				}
			},
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					let windowInfo = uni.getWindowInfo();
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal;
					this.safeAreaTop = windowInfo.safeAreaInsets.bottom;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(options) {
			this.someoneId = parseInt(options.id);

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
			itemClicked(index) {
				let param = {
					id: this.list[index].id,
					page: this.page,
					size: this.size,
					sellerId: this.someoneId,
					status: 2,
					orderByClause: 'updateTime desc',
				};

				uni.navigateTo({
					url: '/pagesNew/details/mallDetails?p=' + encodeURIComponent(JSON.stringify(param)),
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
					sellerId: this.someoneId,
					status: 2,
				}
				let self = this;
				filterCommodity(paramsData).then(res => {
					if (res.retCode === 0) {
						self.hasNextPage = res.data.hasNextPage;

						let list = res.data.list;
						
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						
						list.forEach(item => {
							item.unitPrice = item.unitPrice / 1000;
							if (item.unitPriceBreakdown) {
								item.unitPriceBreakdown = JSON.parse(item.unitPriceBreakdown)
							}
							if (item.photos) {
								item.photos = JSON.parse(item.photos);
								if (item.photos.length > 0) {
									item.image = item.photos[0];
								} else {
									item.image = self.imgUrl + "/work.png"
								}
							} else {
								item.photos = [];
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
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.waterfall-flow {
		position: relative;

		.item {
			width: 48%;
			position: absolute;
			margin-bottom: 10rpx;
		}
	}
</style>