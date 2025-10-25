<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="TA的相册" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="tabClicked" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData">
			<view v-for="(base,idx) in tabBars" :key="idx">
				<view v-if="tabIndex === idx" class="flex flex-wrap">
					<view class="padding-tb-sm padding-lr-ssm" v-for="(item,index) in base.list" :key="index"
						@tap="toPreview(base.list,index)">
						<image class="radius" :src="item.url" style="width:200rpx;height:200rpx" />
					</view>
				</view>
			</view>
			<span class="loading-text margin-top-sm">{{
                tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
            }}
			</span>
		</scroll-view>
	</view>
</template>

<script>
	import wucTab from '@/components/wuc-tab/wuc-tab'
	import {
		filterPagedAlbumItemList,
		filterPagedAlbumList
	} from "@/api/user";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "albumShow",
		components: {
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				tabBars: [],
				tabIndex: 0,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				token: null,
				userId: null,

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
					this.contentTop = 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(options) {
			this.userId = parseInt(options.userId);

			if (this.userId) {
				this.initData();
			}
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

			initData() {
				this.getAlbumOfUser();
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
			getAlbumOfUser() {
				let self = this;
				let param = {
					ownerId: this.userId,
					ownerType: 0, //个人相册
					page: 1,
					size: 200,
					open: 1,
					status: 1,
				}
				filterPagedAlbumList(param).then(res => {
					if (res.retCode === 0) {
						let albumDefault = {
							id: null,
							name: '',
							loadingType: 2,
							isLoading: false,
							page: 1,
							size: 30,
							list: [],
						};
						self.tabBars.splice(0, self.tabBars.length);
						res.data.list.forEach(v => {
							let album = JSON.parse(JSON.stringify(albumDefault));
							album.name = v.name;
							album.id = v.id;
							self.tabBars.push(album);
						})

						if (self.tabBars.length > 0) {
							self.tabClicked(0);
						}
					}
				});
			},
			// 图片大图预览
			toPreview(list, index) {
				let arr = list.map(v=>v.url);
				uni.previewImage({
					urls: arr,
					current: arr[index],
					loop: true,
				})

			},
			//状态切换
			tabClicked(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.loadData();
				}
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.loadData();
					}, 300);
				}s
			},
			loadData() {
				let self = this;
				let param = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					albumId: this.tabBars[this.tabIndex].id,
					status: 1,
				}
				filterPagedAlbumItemList(param).then(res => {
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

<style scoped>
	@import "../../static/css/tabBar.css";
	@import "../../static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .wuc-tab {
		padding-left: 10px;
	}
</style>