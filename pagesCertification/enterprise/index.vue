<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="企业认证" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-white padding margin-tb-sm radius-s">
				<view class="flex align-center text-df">
					<view class="text-black">
						<text space="emsp">社会统一编码：</text>
					</view>
					<view class="flex-grow text-black-4 padding-sm" :class="actionEdit?'bg-gray radius-s':''">
						<input :disabled="!actionEdit" type="text" placeholder="必须与营业执照一致"
							v-model="socialUnifiedCode" />
					</view>
				</view>
			</view>
			<view class="bg-white padding margin-tb radius-s">
				<view class="flex align-center text-df">
					<view class="text-black">
						公司名称：
					</view>
					<view class="flex-grow text-black-4 padding-sm" :class="actionEdit?'bg-gray radius-s':''">
						<input :disabled="!actionEdit" type="text" v-model="companyName" placeholder="必须与营业执照一致" />
					</view>
				</view>
			</view>
			<view class="bg-white padding margin-tb radius-s">
				<view class="flex align-center text-df">
					<view class="text-black">
						营业地址：
					</view>
					<view class="flex-grow text-black-4 padding-sm" :class="actionEdit?'bg-gray radius-s':''">
						<input :disabled="!actionEdit" type="text" v-model="companyAddress" placeholder="请输入您的营业地址" />
					</view>
				</view>
			</view>
			<view @click="onPlus(1)" class="flex align-center justify-center margin-bottom radius bg-white"
				style="width: 100%;">
				<view class="radius"
					:style="'background-image: url('+imgUrl+'/certification/bg_business_1.png);background-size: 100% 100%;width:710rpx;height:381rpx;'">
					<image class="radius" style="width:710rpx;height:381rpx;" mode="scaleToFill"
						:src="businessLicenseImg"></image>
				</view>
			</view>
			<view @click="onPlus(2)" class="flex align-center justify-center margin-bottom radius bg-white"
				style="width: 100%;">
				<view class="radius"
					:style="'background-image: url('+imgUrl+'/certification/bg_door_1.png);background-size: 100% 100%;width:710rpx;height:381rpx;'">
					<image class="radius" style="width:710rpx;height:381rpx;" mode="scaleToFill" :src="gateImg"></image>
				</view>
			</view>
			<view @click="onPlus(3)" class="flex align-center justify-center margin-bottom radius bg-white"
				style="width: 100%;">
				<view class="radius"
					:style="'background-image: url('+imgUrl+'/certification/bg_office_1.png);background-size: 100% 100%;width:710rpx;height:381rpx;'">
					<image class="radius" style="width:710rpx;height:381rpx;" mode="scaleToFill" :src="officeImg">
					</image>
				</view>
			</view>
			<view style="min-height:120rpx"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;" v-if="actionEdit">
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="uploadComAuthInfo">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		getComAuthInfo,
		uploadComAuthInfo
	} from "@/api/user";
	import {
		imgUrl,
		active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		imgCompress,
		compressImage,
		getImageInfo,
		uploadImg
	} from "@/api/upload";

	export default {
		name: "index",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,

				companyAddress: '',
				companyName: '',
				socialUnifiedCode: '',

				businessLicenseImg: null,
				gateImg: null,
				officeImg: null,

				isLoading: false,

				actionEdit: false,

				type: null,

				imgUrl: imgUrl,
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
			this.actionEdit = !!(options.action !== "view");
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
				this.getComAuthInfo();
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
			//提交验证
			validation() {
				if (!this.socialUnifiedCode) {
					uni.showToast({
						title: "请输社会统一编码，并与营业执照上一致！",
						icon: "none",
						duration: 3000
					})
					return false;
				}

				if (!this.companyName) {
					uni.showToast({
						title: "请输入公司名称，并与营业执照上一致！",
						icon: "none",
						duration: 3000
					})
					return false;
				}

				if (!this.companyAddress) {
					uni.showToast({
						title: "请输入您的营业地址！",
						icon: "none",
						duration: 3000
					})
					return false;
				}

				if (!this.businessLicenseImg) {
					uni.showToast({
						title: "请上传您的营业执照！",
						icon: "none",
						duration: 3000
					})
					return false;
				}

				if (!this.gateImg) {
					uni.showToast({
						title: "请上传您的办公环境大门照！",
						icon: "none",
						duration: 3000
					})
					return false;
				}
				if (!this.officeImg) {
					uni.showToast({
						title: "请上传您的办公环境内部照！",
						icon: "none",
						duration: 3000
					})
					return false;
				}

				return true;
			},
			getComAuthInfo() {
				let self = this;
				getComAuthInfo(null).then(res => {
					if (res.retCode === 0) {
						self.companyName = res.data.companyName;
						self.companyAddress = res.data.companyAddress;
						self.socialUnifiedCode = res.data.socialUnifiedCode;
						self.businessLicenseImg = res.data.businessLicenseImg;
						self.gateImg = res.data.gateImg;
						self.officeImg = res.data.officeImg;
					}
				});
			},
			//提交个人认证信息
			uploadComAuthInfo() {
				if (this.isLoading) { //如果未true,则不能在提交
					return
				}
				if (!this.validation()) {
					return
				}
				this.isLoading = true;
				let paramsData = {
					companyAddress: this.companyAddress,
					companyName: this.companyName,
					businessLicenseImg: this.businessLicenseImg,
					gateImg: this.gateImg,
					officeImg: this.officeImg,
					socialUnifiedCode: this.socialUnifiedCode
				}
				let self = this;
				uploadComAuthInfo(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '认证信息已提交，请等待平台审核！',
							icon: "none",
							duration: 2000
						})
						setTimeout(() => {
							uni.setStorageSync("needRefresh", 1);
							uni.navigateBack({
								delta: 1
							})
						}, 2000)
					}
					self.isLoading = false;
				}).catch(() => {
					self.isLoading = false;
				});
			},
			onPlus(type) {
				if (!this.actionEdit) {
					return;
				}
				let self = this
				this.type = type;
				uni.showActionSheet({
					itemList: ['从相册中选择', '拍照'],
					itemColor: '#fb5318',
					success: function(res) {
						if (res.tapIndex === 0) {
							self.chooseShop('album')
						} else if (res.tapIndex === 1) {
							self.chooseShop('camera')
						}
					},
					fail: function(res) {}
				});
			},
			chooseShop(source) {
				let self = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: [source],
					success: function(res) {
						let filePathArray = res.tempFilePaths
						let fileArray = res.tempFiles

						if (filePathArray.length > 1) {
							filePathArray = filePathArray.slice(0, 1)
							fileArray = fileArray.slice(0, 1)
						}
						self.handleEachFile(filePathArray, fileArray)
					}
				})
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
				if (imgData && imgData.length > 0) {
					if (this.type === 1) {
						this.businessLicenseImg = imgData[0].webPath;
					} else if (this.type === 2) {
						this.gateImg = imgData[0].webPath;
					} else if (this.type === 3) {
						this.officeImg = imgData[0].webPath;
					}
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
	}
</style>