<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="争议" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-white margin-sm padding radius-s">
				<view class="padding-bottom text-normal">详细说明</view>
				<view class="radius-s">
					<textarea maxlength="200" placeholder="请输入不少于50字的描述" v-model="desc" />
					<view class="text-right text-df padding-top-sm">
						{{ number }}
						<text class="text-gray-4">/{{ descLengthMax }}</text>
					</view>
				</view>
			</view>
			<view class="margin-bottom-sm margin-lr-sm bg-white padding radius-s">
				<view class="padding-bottom text-normal">请提供相关图片或照片</view>
				<view class="radius-s margin-top-sm">
					<upload-img-bar @changed="mediaChanged" :img-list="uploadImgList" :img-length-max="10"
						ref="uploadImgBar" />
				</view>
			</view>

			<view class="blank"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="bg-theme text-lg color-white radius-0" :disabled="number<50"
				@click.stop="submitAddDispute">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		addDispute
	} from "@/api/mall";
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "newDispute",
		components: {
			uploadImgBar,
			// #ifndef H5
			myNavBar
			// #endif
		},
		computed: {
			number() {
				if (this.desc.length > this.descLengthMax) {
					return 200
				} else {
					return this.desc.length
				}
			}
		},
		data() {
			return {
				token: null,
				userData: {},

				id: null, //交易id
				initiatorType: null, //0---买家，1---卖家

				desc: '',
				uploadImgList: [],

				imgLengthMax: 10, //最多上次的图片数
				descLengthMax: 200, //最多说明文字数,

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

			this.id = parseInt(options.id);
			this.initiatorType = parseInt(options.initiatorType);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');

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
			initData() {},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.redirectTo({
					url: '/pages/login/login'
				})
			},
			//争议提交
			submitAddDispute() {
				if (this.desc.length < 50) {
					uni.showToast({
						title: '描述信息不能少于50字',
						icon: "none",
						duration: 1500
					})
					return
				}

				let paramsData = {
					initiatorType: this.initiatorType,
					transactionId: this.id,
					disputeLog: {
						description: this.desc,
						photos: JSON.stringify(this.uploadImgList)
					},
					userId: this.userData.id,
				}
				addDispute(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "提交成功",
							icon: "none",
							duration: 1500
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 1500)
					}
				});
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
		min-height: 120rpx;
	}

	::v-deep uni-textarea,
	textarea {
		background-color: #f2f2f2 !important;
		border-radius: 10rpx;
		padding: 10rpx;
		font-size: 28rpx;
		width: 630rpx;
	}

	@media (prefers-color-scheme: dark) {

		::v-deep uni-textarea,
		textarea {
			background-color: #000 !important;
		}
	}
</style>