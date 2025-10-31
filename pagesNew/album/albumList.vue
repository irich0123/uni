<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="相册" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData">

			<view class="flex flex-wrap margin-tb-sm padding-tb-sm padding-lr">
				<view v-for="(item,index) in list" :key="index" style="width: 33%;"
					@click.stop="openAlbum(index)">
					<view v-if="item.id>0">
						<view class="bg-white radius flex align-start justify-center"
							style="width:200rpx;height:200rpx;position:relative" @click.stop="onImgTap(index)"
							@touchstart="touchStart" @touchend="touchEnd">
							<image style="width:200rpx;height:200rpx" class="radius" :src="item.thumbImg"
								v-if="!!item.thumbImg" />
							<view style="width:200rpx;height:200rpx"
								class="bg-white radius flex align-center justify-center" v-else>
								<uni-icons size="40" type="images" color="#dddddd"></uni-icons>
							</view>
							<view class="yjg-delete-img" @click.stop="onDelete(index)" v-if="item.showDeleteBtn">
								<uni-icons class="round flex align-center justify-center" color="#fb5318" type="clear"
									size="24" />
							</view>
							<view class="yjg-edit-img" @click.stop="onEdit(index)" v-if="item.showEditBtn">
								<uni-icons class="bg-theme padding-xss round flex align-center justify-center"
									color="white" type="compose" size="16" />
							</view>
						</view>
						<view
							class="text-black-4 text-df padding-top-ssm padding-bottom padding-left-xs flex align-center">
							{{ item.name }}<span class="text-ssm padding-left-xs"
								v-if="!!item.count">({{ item.count }})</span>
						</view>
					</view>
					<view v-else>
						<view class="bg-white gray-border radius item-img-box flex align-center justify-center"
							style="width:200rpx;height:200rpx">
							<uni-icons size="40" type="plusempty" color="#999999"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<text class="loading-text">{{
                loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
            }}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import {
		deleteAlbum,
		filterPagedAlbumList
	} from "@/api/user";
	import UniIcons from "@/components/uni-icons/uni-icons";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "list",
		components: {
			UniIcons,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				ownerId: null,
				ownerType: null,
				viewByMyself: 0,

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				pageNum: 1,
				pageSize: 20,
				list: [],

				touchStartTime: null,
				touchEndTime: null,

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
			this.userData = uni.getStorageSync("user");
			this.ownerId = parseInt(options.ownerId);
			this.ownerType = parseInt(options.ownerType);
			this.viewByMyself = parseInt(options.viewByMyself);
			if (!this.viewByMyself) {
				if (!!this.ownerId && this.ownerType === 0) {
					this.viewByMyself = (this.ownerId === this.userData.id ? 1 : 0);
				} else {
					// todo 企业相册
				}
			}
			this.initData();
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
				this.loadData();
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1500
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '../login/login'
					})
				}, 1500)
			},
			onImgLongTap(index) {
				if (!this.viewByMyself) {
					return;
				}
				if (this.list[index].thumbImg) {
					this.list[index].showEditBtn = !this.list[index].showEditBtn;
				} else {
					this.list[index].showDeleteBtn = !this.list[index].showDeleteBtn;
				}
			},
			onDelete(index) {
				let self = this;
				uni.showModal({
					title: '系统提示',
					content: '确认删除相册吗？删除后，图片就找不回来了',
					showCancel: true,
					cancelText: "取消",
					confirmText: '确认',
					success: function(res) {
						if (res.confirm) {
							self.deleteAlbum(index);
						}
					},
				});
			},
			deleteAlbum(index) {
				let paramsData = {
					id: this.list[index].id,
				}
				let self = this;
				deleteAlbum(paramsData).then(res => {
					if (res.retCode === 0) {
						self.list.splice(index, 1);
					}
				});
			},
			onEdit(index) {
				this.list[index].showEditBtn = false;
				uni.navigateTo({
					url: '/pagesNew/album/albumDetails?id=' + this.list[index].id,
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
				let paramsData = {
					page: this.pageNum,
					size: this.pageSize,
					ownerId: this.ownerId,
					ownerType: this.ownerType, //0=个人 1=组织
					status: 1, //可用
					open: this.viewByMyself ? null : 1, //公开
				}
				let self = this;
				filterPagedAlbumList(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.pageNum === 1) {
							self.list.splice(0, self.list.length);
						} else {
							if (!!self.viewByMyself) {
								self.list.splice(self.list.length - 1, 1);
							}
						}
						list.forEach(item => {
							item.showDeleteBtn = false;
							item.showEditBtn = false;
							self.list.push(item);
						})
						if (!!self.viewByMyself) {
							self.list.push({
								id: 0,
							})
						}
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
			openAlbum(index) {
				if (this.list[index].id > 0) {
					uni.navigateTo({
						url: '/pagesNew/album/albumItemList?id=' + this.list[index].id + "&viewByMyself=" +
							this.viewByMyself,
					})
				} else {
					uni.navigateTo({
						url: '/pagesNew/album/albumDetails?ownerId=' + this.userData.id + '&ownerType=0',
					})
				}
			},
			onImgTap(index) {
				if ((this.touchEndTime - this.touchStartTime) > 350) {
					this.onImgLongTap(index);
				} else {
					this.openAlbum(index);
				}
			},
			touchStart() {
				this.touchStartTime = new Date().getTime();
			},
			touchEnd() {
				this.touchEndTime = new Date().getTime();
			}
		},
	}
</script>

<style scoped>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.yjg-delete-img {
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		z-index: 5;
	}

	.yjg-edit-img {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
		z-index: 5;
	}

	.loading-text {
		min-height: 40rpx;
		line-height: 40rpx;
		font-size: 25rpx;
		display: flex;
		flex-direction: row;
		justify-content: center;
		color: #999999;
		padding: 10rpx 0rpx 30rpx 0rpx;
	}
</style>