<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="相册编辑" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<uni-forms :modelValue="album" labelPosition="left" validateTrigger="bind" border labelWidth="120">
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="相册名称：" name="title" required class="form-input-item">
						<uni-easyinput type="text" v-model="album.name" :clearable="false" placeholder="请输入相册名称"
							maxlength="30" :inputBorder="false" />
					</uni-forms-item>

					<uni-forms-item label="相册类型：" name="type" class="form-input-item">
						<picker mode="selector" class="margin-left-ssm flex align-center" @change="typeChange"
							:value="typeIndex" :range-key="'name'" :range="typeList">
							<view class="flex align-center">
								<view class="text-black-4">{{ typeName }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="公开展示：" name="open" class="form-input-item">
						<switch :checked="!!album.open" color="#fb5318" :disabled="typeList[typeIndex].classify===0"
							@change="switchOpenAlbum"></switch>
					</uni-forms-item>
				</view>
			</uni-forms>

			<view class="blank"></view>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl text-white radius-0" :disabled="!album.name" @click="submitAlbum">
				确定
			</button>
		</view>
		<!--        底部按钮结束-->
	</view>
</template>

<script>
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import {
		createAlbum,
		getAlbumResponseById,
		getAlbumTypeAllValid,
		updateAlbum
	} from "@/api/user";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "AlbumDetails",
		components: {
			UniForms,
			uniFormsItem,
			UniIcons,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				album: {
					open: 1,
				},

				typeList: [{
					classify: 0,
				}],
				typeIndex: 0,
				typeName: null,

				ownerId: null,
				ownerType: null,

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
			this.album.id = parseInt(options.id);

			uni.setNavigationBarTitle({
				title: !this.album.id ? "添加相册" : "修改相册",
			});
			this.ownerId = parseInt(options.ownerId);
			this.ownerType = parseInt(options.ownerType);

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
				this.getAlbumTypeList();
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
			getAlbumTypeList() {
				let self = this;
				getAlbumTypeAllValid().then(res => {
					if (res.retCode === 0) {
						self.typeList.splice(0, self.typeList.length);
						res.data.forEach(item => {
							self.typeList.push(item);
						});
						if (self.typeIndex != null) {
							self.typeName = self.typeList[self.typeIndex].name;
						}
						if (!!self.album.id) {
							self.getAlbumById();
						}
					}
				});
			},
			getAlbumById() {
				let paramsData = {
					id: this.album.id,
				}
				let self = this;
				getAlbumResponseById(paramsData).then(res => {
					if (res.retCode === 0) {
						self.album = res.data;
					}
				});
			},
			submitAlbum() {
				let paramsData = {
					ownerId: this.ownerId,
					ownerType: this.ownerType,
					type: this.typeList[this.typeIndex].id,
					name: this.album.name,
					id: this.album.id,
				}
				if (!this.album.id) {
					createAlbum(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: "添加成功！",
								duration: 1500,
							})
							setTimeout(() => {
								uni.setStorageSync("needRefresh", 1);
								uni.navigateBack({
									delta: 1,
								})
							})
						}
					});
				} else {
					updateAlbum(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: "更新成功！",
								duration: 1500,
							})
							setTimeout(() => {
								uni.setStorageSync("needRefresh", 1);
								uni.navigateBack({
									delta: 1,
								})
							})
						}
					});
				}
			},
			typeChange: function(e) {
				this.typeIndex = e.target.value;
				this.album.type = this.typeList[this.typeIndex].id;
				this.typeName = this.typeList[this.typeIndex].name;
				if (this.typeList[this.typeIndex].classify === 0) {
					this.album.open = 1;
				}
			},
			switchOpenAlbum() {
				this.album.open = !this.album.open;
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;

		::v-deep .uni-forms {
			background-color: transparent;
			margin: 20rpx;

			.uni-forms-item {
				display: flex;
				flex-direction: column;
				font-size: 28rpx;
				padding: 10rpx 0;
				background-color: transparent !important;

				.uni-forms-item__box {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;

					.uni-forms-item__inner {
						width: 100%;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-between;
						padding: 10rpx 0;

						.uni-forms-item__label {
							padding-left: 20rpx;
							font-size: 28rpx;

							.label-icon {
								margin-right: 5px;
								margin-top: -1px;
							}

							.is-required {
								padding-right: 4rpx;
							}
						}

						.uni-forms-item__content {
							display: flex;
							align-items: center;
							justify-content: flex-end;
							padding-right: 20rpx;

						}
					}
				}
			}
		}
	}

	::v-deep .uni-easyinput {
		.uni-easyinput__content {
			border-radius: 6rpx;
			display: flex;

			.uni-easyinput__content-input {
				font-size: 14px;

				.uni-input-wrapper {

					.uni-input-placeholder {
						font-size: 14px;
					}
				}
			}

			.uni-easyinput__content-textarea {
				min-width: 450rpx;
				min-height: 100rpx;
				padding: 16rpx 20rpx;

				.uni-textarea-wrapper {
					min-height: 120rpx;

					.uni-textarea-placeholder {
						font-size: 14px;
					}

					.uni-textarea-textarea {
						font-size: 14px;
					}
				}
			}
		}
	}
</style>