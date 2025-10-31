<template>
	<view>
		<view class="flex flex-wrap align-center justify-start">
			<view class="gray-border-1 radius-s margin-top-sm margin-right-sm flex align-center justify-center"
				v-for="(item,index) in imgList" :key="index" style="width: 120rpx;height: 120rpx;position: relative;"
				@longpress.stop="onImgLongTap(index)" @touchstart="touchStart" @touchend="touchEnd"
				@click.stop="onImgTap(index)">
				<view class="flex align-start justify-end"
					style="position: absolute;top:-16rpx;right:-10rpx;width:40rpx;height:40rpx;z-index:5;"
					@click.stop="onDelete(index)" v-if="showDeleteBtn">
					<uni-icons color="#fb5318" type="minus-filled" size="22" />
				</view>
				<image :src="item" style="width:120rpx;height:120rpx;" mode="aspectFill" />
			</view>
			<view class="gray-border-1 radius-s margin-top-sm margin-right-sm flex align-center justify-center"
				@click="beforeSelectImage" v-if="showPlusBtn" style="width:120rpx;height:120rpx;">
				<uni-icons color="#cccccc" type="plusempty" size="30" />
			</view>
		</view>
		<view class="text-df text-theme text-right" v-if="showImageLength">{{ listLength }}/{{ imgLengthMax }}</view>
	</view>
</template>

<script>
	import UniIcons from "@/components/uni-icons/uni-icons";
	import {
		baseUrl
	} from "@/utils/config";
	import {
		imgCompress,
		compressImage,
		getImageInfo,
		uploadImg
	} from "@/api/upload.js";
	//#ifdef APP-PLUS
	import {
		checkCamera,
		checkAlbum
	} from '@/utils/android_permission.js'
	//#endif
	export default {
		name: "uploadImgBar",
		components: {
			UniIcons
		},
		computed: {
			listLength: {
				get() {
					return this.imgList.length;
				},
				set(v) {

				}
			}
		},
		props: {
			imgList: {
				type: Array,
				default () {
					return [];
				},
			},
			imgLengthMax: {
				type: Number,
				default: 5,
			},
			needPlusBtn: {
				type: Boolean,
				default: true,
			},
			showImageLength: {
				type: Boolean,
				default: true,
			}
		},
		data() {
			return {
				showDeleteBtn: false,
				showPlusBtn: true,

				touchStartTime: null,
				touchEndTime: null,
			}
		},
		watch: {
			listLength: function() {
				if (this.needPlusBtn) {
					this.showPlusBtn = this.listLength !== this.imgLengthMax;
				} else {
					this.showPlusBtn = false;
				}
			},
		},
		created() {
			this.token = uni.getStorageSync('token');
		},
		methods: {
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

			onDelete(index) {
				this.imgList.splice(index, 1);
				this.$emit("changed", {
					list: JSON.parse(JSON.stringify(this.imgList)),
				});
			},

			getImageInfo(src) {
				return new Promise((resolve, reject) => {
					uni.getImageInfo({
						src: src,
						success: function(image) {
							if (image.width > 1000 || image.height > 1000) {
								var scaleX = 100000 / image.width;
								var scaleY = 100000 / image.height;
								var scale = (scaleX > scaleY ? scaleY : scaleX).toFixed(3) + '%';
								resolve(scale);
							} else {
								resolve(0);
							}
						}
					})
				})
			},
			compressImage(src, scale) {
				return new Promise((resolve, reject) => {
					uni.compressImage({
						src: src,
						width: scale,
						heigh: scale,
						success: res => { //压缩后的图片上传
							resolve(res.tempFilePath);
						},
						fail: () => { //压缩失败，原图上传
							resolve(src);
						},
					})
				})
			},
			beforeSelectImage() {
				//#ifndef APP-PLUS
				this.selectImage();
				//#endif
				//#ifdef APP-PLUS
				let platform = uni.getStorageSync("platform");
				if (platform === 'ios') {
					this.selectImage();
				} else if (platform === 'android') {
					let self = this;
					uni.showActionSheet({
						itemList: ['拍摄', '从相册选择'],
						success: function(res) {
							if (res.tapIndex === 0) {
								let permission = uni.getStorageSync("permission");
								if (!permission || !permission.camera) {
									uni.showModal({
										title: '提示',
										content: '在发布信息或提交意见反馈时，需要调用摄像头拍照功能，请确认同意，否则将无法使用此项功能',
										showCancel: false,
										confirmText: '我知道了',
										success: function(res0) {
											if (res0.confirm) {
												if (checkCamera()) {
													self.selectImage(["camera"])
												}
											}
										}
									});

								} else if (permission.camera === -1) {
									uni.showToast({
										title: '您已拒绝使用您的摄像头功能！',
										icon: 'none',
										duration: 2000,
									})
								} else if (permission.camera === 1) {
									self.selectImage(['camera']);
								}
							} else if (res.tapIndex === 1) {
								let permission = uni.getStorageSync("permission");
								if (!permission || !permission.storage) {
									uni.showModal({
										title: '提示',
										content: '在发布信息或提交意见反馈时，需要调用您的本地存储功能，请确认同意，否则将无法使用此项功能',
										showCancel: false,
										confirmText: '我知道了',
										success: function(res0) {
											if (res0.confirm) {
												if (checkAlbum()) {
													self.selectImage(["album"])
												}
											}
										}
									});

								} else if (permission.storage === -1) {
									uni.showToast({
										title: '您已拒绝使用您的本地存储功能！',
										icon: 'none',
										duration: 2000,
									})
								} else if (permission.storage === 1) {
									self.selectImage(['album']);
								}
							}
						}
					})
				}
				//#endif
			},

			selectImage(sourceType) {
				if (!sourceType) {
					sourceType = ['album', 'camera'];
				}

				let self = this
				uni.chooseImage({
					count: this.imgLengthMax - this.imgList.length, //默认9
					sizeType: ['original'],
					sourceType: sourceType,
					success: function(res) {

						let filePathArray = res.tempFilePaths
						let fileArray = res.tempFiles

						// #ifdef H5
						if (filePathArray.length > (self.imgLengthMax - self.imgList.length)) {
							filePathArray = filePathArray.slice(0, (self.imgLengthMax - self
								.imgList
								.length))
							fileArray = fileArray.slice(0, (self.imgLengthMax - self.imgList
								.length))
						}
						// #endif
						self.handleEachFile(filePathArray, fileArray)
					},
					fail: function(res) {
						//#ifdef APP-PLUS
						console.log(res);
						if (res.errMsg.indexOf("No Permission") > -1) {
							if (sourceType.length === 1) {
								let permission = uni.getStorageSync("permission");
								if (!permission) {
									permission = {};
								}
								if (sourceType[0] === 'album') {
									permission.storage = 0;
								} else if (sourceType[0] === 'camera') {
									permission.camera = 0;
								}
								uni.setStorageSync("permission", permission);
							}
						}
						//#endif
					},
					complete() {
						console.log('结束');
					}
				});
			},

			async handleEachFile(filePathArray, fileArray) {
				for (let i = 0; i < filePathArray.length; i++) {
					let imgFilePath = filePathArray[i];
					// #ifdef H5
					const file = await imgCompress(imgFilePath, (imgFilePath.size > 1024 * 1024 * 0.5) ?
						0.2 :
						0.8);
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

				imgData.forEach(v => {
					this.imgList.push(v.webPath);
				})

				this.showDeleteBtn = false
				this.listLength = this.imgList.length
				this.$emit("changed", {
					list: JSON.parse(JSON.stringify(this.imgList)),
				});
			},
			onImgTap(index) {
				if (this.touchEndTime - this.touchStartTime < 350) {
					uni.previewImage({
						current: index,
						urls: this.imgList,
						loop: true
					});
				} else {
					this.onImgLongTap();
					return;
				}
			},
			onImgLongTap() {
				this.showDeleteBtn = !this.showDeleteBtn;
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

</style>