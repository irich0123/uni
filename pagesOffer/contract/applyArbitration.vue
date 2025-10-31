<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="申请仲裁" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="margin-sm radius padding bg-white flex flex-direction">
				<view class="padding-tb-sm text-normal text-bold text-black">
					仲裁原因：
				</view>
				<textarea maxlength="-1" v-model="content" placeholder="请输入您的仲裁原因"></textarea>
			</view>

			<view class="margin-sm radius padding bg-white flex flex-direction">
				<view class="padding-tb-sm text-normal text-bold text-black">
					补充相关资料：
				</view>

				<view class="margin-top-sm">
					<upload-img-bar @changed="mediaChanged" :img-list="uploadImgList" :img-length-max="5"
						ref="uploadImgBar" />
				</view>
			</view>
			<view class="blank"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="submitApply">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		baseUrl,active
	} from "@/utils/config";
	import {
		applyArbitration
	} from "@/api/workinfo";
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "applyArbitration",
		components: {
			uploadImgBar,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,

				id: null,
				type: null,

				content: '',

				uploadImgList: [], //图片链接,

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
			this.token = uni.getStorageSync('token');

			this.id = parseInt(options.id);
			this.type = parseInt(options.type);

			if (!this.token) {
				this.toLogin();
				return;
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

			submitApply() {
				if (!this.content) {
					uni.showToast({
						title: "请输入申请仲裁说明文字",
						icon: "none",
						duration: 3000
					})
					return;
				}

				let paramsData = {
					contractId: this.id,
					reason: this.content,
				}
				//图片
				if (this.uploadImgList.length !== 0) {
					paramsData['imgs'] = JSON.stringify(this.uploadImgList);
				} else {
					paramsData['imgs'] = "[]";
				}

				applyArbitration(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '申请仲裁成功！',
							icon: "none",
							duration: 3000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 3000)
					}
				});
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
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
	}

	.blank {
		height: 100rpx;
	}

	::v-deep .uni-textarea-wrapper {
		margin: 20rpx;
	}

	::v-deep uni-textarea,
	textarea {
		background-color: #f2f2f2 !important;
		border-radius: 10rpx;
		padding: 10rpx;
		font-size: 28rpx;
	}

	@media (prefers-color-scheme: dark) {

		::v-deep uni-textarea,
		textarea {
			background-color: #000 !important;
		}
	}
</style>