<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="更多服务" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="margin-tb margin-lr-sm">
				<uni-list>
					<uni-list-item title="我的消息" :show-arrow="true" @click.native="toNotify"
						v-if="userData && userData.id" />
					<uni-list-item title="活动" :show-arrow="true" @click.native="toPromotionList" />
					<uni-list-item title="使用帮助" :show-arrow="true" @click.native="tohelp" />
					<uni-list-item title="意见反馈" :show-arrow="true" @click.native="toAdvice" />
					<uni-list-item title="我投诉的" :show-arrow="true" @click.native="toComplaint"
						v-if="userData && userData.id" />
					<uni-list-item title="关于我们" :show-arrow="true" @click.native="toAboutUs" />
					<uni-list-item title="联系客服" :show-arrow="true" @click.native="toService" />
				</uni-list>

				<!-- #ifdef APP-PLUS -->
				<uni-list>
					<uni-list-item title="推送设置" :show-arrow="true" @click.native="toPushConfig" />
				</uni-list>
				<!-- #endif -->
			</view>

			<view class='margin-tb margin-lr-sm flex'>
				<view class='flex-grow flex align-center justify-center text-xl bg-white text-theme text-bold radius-l'
					style="min-height:100rpx" v-if="!!token" @click="logout">
					退出登录
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import UniList from "@/components/uni-list/uni-list";
	import {
		userLogout
	} from '@/api/user';

	import {
		webUrl
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from "@/utils/config";
	
	// #ifdef APP-PLUS 
	import {
		gotoAppPermissionSetting
	} from "@/js_sdk/wa-permission/permission.js";
	// #endif

	export default {
		name: "moreServiceIndex",
		components: {
			UniListItem,
			UniList,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

				webUrl: webUrl,
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
		onLoad() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");
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

			toNotify() {
				uni.navigateTo({
					url: '/pagesMore/message/messageList',
				})
			},
			toPushConfig() {
				gotoAppPermissionSetting();
			},
			toPromotionList() {
				uni.navigateTo({
					url: '/pagesMore/promotion/promotionList',
				})
			},
			tohelp() {
				uni.navigateTo({
					url: '/pagesMore/help/helpful',
				})
			},
			toAdvice() {
				uni.navigateTo({
					url: '/pagesMore/advice/newAdvice',
				})
			},
			toComplaint() {
				uni.navigateTo({
					url: '/pages/personal/myComplaint',
				})
			},
			toAboutUs() {
				uni.navigateTo({
					url: '/pages/common/webview?url=' + encodeURIComponent(this.webUrl + "/aboutus/index.html?t=" +
						new Date().getTime()),
				})
			},
			toService() {
				uni.navigateTo({
					url: './service/serviceList',
				})
			},
			logout() {
				let self = this
				uni.showModal({
					content: "确定退出当前登录吗？",
					confirmColor: '#ff5300',
					cancelText: '取消',
					confirmText: '确定',
					success: function(res1) {
						if (res1.confirm) {
							if (!!self.token) {
								userLogout().then(res => {
									if (res.retCode === 0) {
										uni.removeStorageSync('token');
										uni.removeStorageSync('user');
										uni.removeStorageSync('deviceInfo');
										self.token = null;
										self.userData = {}
										uni.showToast({
											title: '退出登录成功',
											icon: 'none',
											duration: 2000
										})
									}
								});
							} else {
								uni.removeStorageSync('token')
								uni.removeStorageSync('user')
								uni.removeStorageSync('deviceInfo');
								self.token = null;
								self.userData = {}
							}
						}
					}
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		margin: 20rpx 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 20rpx !important;
		background-color: white;
		margin-bottom: 2rpx;
	}

	::v-deep .uni-list-item__content-title {
		font-size: 30rpx;
		color: #777;
	}

	/* #ifdef APP-PLUS */
	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}

	/* #endif */
</style>