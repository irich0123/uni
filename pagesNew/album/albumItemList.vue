<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData">

			<view class="flex flex-wrap margin-tb-sm padding-tb-sm padding-lr">
				<view v-for="(item,index) in list" :key="index" style="width: 33%;">
					<view v-if="item.id>0">
						<view class="bg-white gray-border radius flex flex-direction align-center justify-center"
							style="width:200rpx;height:200rpx;position:relative" @click.stop="onImgTap(index)"
							@touchstart="touchStart" @touchend="touchEnd">
							<image style="width:200rpx;height:200rpx" class="radius" :src="item.url" />
							<view class="yjg-delete-img" @click.stop="onDelete(index)" v-if="item.showDeleteBtn">
								<uni-icons class="round flex align-center justify-center" color="#fb5318" type="clear"
									size="24" />
							</view>
						</view>
					</view>
					<view v-else>
						<view class="bg-white gray-border radius flex flex-direction align-center justify-center"
							style="width:200rpx;height:200rpx" @click.stop="onPlus(index)">
							<uni-icons size="40" type="plusempty" color="#999999"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<text class="loading-text">{{
                loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
            }}
			</text>
			<view style="height: 200rpx"></view>
		</scroll-view>
	</view>

</template>

<script>
	import {
		createAlbumItem,
		deleteAlbumItem,
		filterPagedAlbumItemList,
		getAlbumResponseById
	} from "@/api/user";
	import UniIcons from "../../components/uni-icons/uni-icons";
	import UploadImgBar from "../../utils/yjg-upload/upload-img-bar";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		imgCompress,
		compressImage,
		getImageInfo,
		uploadImg
	} from "@/api/upload.js";
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "enterpriseAlbum",
		components: {
			UploadImgBar,
			UniIcons,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				listChanged: false,

				albumId: null,
				viewByMyself: '',

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				page: 1,
				size: 30,
				list: [],

				imgLengthMax: 200,

				title: '',

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
			this.albumId = parseInt(options.id);
			this.viewByMyself = parseInt(options.viewByMyself);

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
					if (this.listChanged) {
						uni.setStorageSync("needRefresh", 1);
					}
					uni.navigateBack({
						delta: 1 // 返回的页面数
					});
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},

			initData() {
				this.getAlbumById();
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
			getAlbumById() {
				let paramsData = {
					id: this.albumId,
				}
				let self = this;
				getAlbumResponseById(paramsData).then(res => {
					if (res.retCode === 0) {
						// #ifdef H5
						uni.setNavigationBarTitle({
							title: res.data.name,
						})
						// #endif
						// #ifndef H5
						self.title = res.data.name;
						// #endif
						self.loadData();
					}
				});
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
					page: this.page,
					size: this.size,
					albumId: this.albumId,
					status: 1,
				}
				let self = this;
				filterPagedAlbumItemList(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						} else {
							if (!!self.viewByMyself) {
								self.list.splice(self.list.length - 1, 1);
							}
						}
						list.forEach(item => {
							item.showDeleteBtn = false;
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
			onPlus() { //点击了加号
				let self = this
				uni.showActionSheet({
					itemList: ['从相册中选择', '拍照'],
					itemColor: '#fb5318',
					success: function(res) {
						if (res.tapIndex === 0) {
							self.chooseImageShop('album')
						} else if (res.tapIndex === 1) {
							self.chooseImageShop('camera')
						}
					},
					fail: function(res) {}
				});
			},
			//从相册中选择
			chooseImageShop(type) {
				let self = this
				uni.chooseImage({
					count: this.imgLengthMax - this.list.length, //默认9
					// sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: [type], //从相册选择还是拍照
					success: function(res) {
						let filePathArray = res.tempFilePaths
						let fileArray = res.tempFiles

						// #ifdef H5
						if (filePathArray.length > (self.imgLengthMax - self.list.length)) {
							filePathArray = filePathArray.slice(0, (self.imgLengthMax - self.list
								.length))
							fileArray = fileArray.slice(0, (self.imgLengthMax - self.list.length))
						}
						// #endif
						self.handleEachFile(filePathArray, fileArray)
					}
				});
			},
			async handleEachFile(filePathArray, fileArray) {
				for (let i = 0; i < filePathArray.length; i++) {
					let imgFilePath = filePathArray[i];
					// #ifdef H5
					const file = await imgCompress(imgFilePath, (imgFilePath.size > 1024 * 1024 * 0.5) ? 0.2 : 0.8);
					this.uploadImage(file);
					// #endif
					// #ifndef H5
					const scale = await getImageInfo(imgFilePath);
					if (!scale) {
						this.uploadImage(imgFilePath);
					} else {
						const file = await compressImage(imgFilePath, scale);
						this.uploadImage(file);
					}
					// #endif
				}
			},

			//图片上传
			async uploadImage(data) {
				const imgData = await uploadImg(data);

				this.imgLength = this.list.length;

				if (imgData && imgData.length > 0) {
					this.newAlbumItem(imgData[0].webPath);
				}
			},

			newAlbumItem(url) {
				if (!!url) {
					let paramsData = {
						url: url,
						albumId: this.albumId,
						mediaType: 0, //0=图片
					}
					let self = this;
					createAlbumItem(paramsData).then(res => {
						if (res.retCode === 0) {
							self.list.splice(self.list.length - 1, 1);
							res.data.showDeleteBtn = false;
							self.list.push(res.data);
							self.list.push({
								id: 0,
							});
							self.listChanged = true;
						}
					});
				}
			},
			onImgLongTap(index) {
				this.list[index].showDeleteBtn = !this.list[index].showDeleteBtn;
			},
			onDelete(index) {
				this.deleteAlbumItem(index);
			},
			deleteAlbumItem(index) {
				let paramsData = {
					id: this.list[index].id,
				}
				let self = this;
				deleteAlbumItem(paramsData).then(res => {
					if (res.retCode === 0) {
						self.list.splice(index, 1);
						self.listChanged = true;
					}
				});
			},
			onImgTap(index) {
				if ((this.touchEndTime - this.touchStartTime) > 350) {
					this.onImgLongTap(index);
				} else {
					uni.previewImage({
						current: index,
						urls: this.list.filter(v => v.id > 0).map(v => v.url),
						loop: true
					});
				}
			},
			touchStart() {
				this.touchStartTime = new Date().getTime();
			},
			touchEnd() {
				this.touchEndTime = new Date().getTime();
			}
		}
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
		top: -20rpx;
		right: -20rpx;
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