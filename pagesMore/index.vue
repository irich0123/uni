<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="更多服务" @action="navAction" @reSize="reSize" class="my-nav-bar" />
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
					<uni-list-item title="通知设置" :show-arrow="true" @click.native="toPushConfig" />
					<uni-list-item title="清除角标" :show-arrow="true" @click.native="toClearBadge" v-if="hasBadge" />
				</uni-list>
				<!-- #endif -->
			</view>

			<view class='margin-tb margin-lr-sm flex'>
				<view class='flex-grow flex align-center justify-center text-xl bg-white text-theme text-bold radius-l'
					style="min-height:100rpx" v-if="!!token" @click="logout">
					退出登录
				</view>
			</view>
			<!-- #ifdef APP-PLUS  -->
			<view class='margin-tb margin-lr-sm flex' v-if="withCancel">
				<view class='flex-grow flex align-center justify-center text-xl bg-white text-gray-1 text-bold radius-l'
					style="min-height:100rpx" v-if="!!token" @click="logoff">
					注销账号
				</view>
			</view>
			<!-- #endif -->
		</scroll-view>

		<!-- #ifdef APP-PLUS  -->
		<view class="cu-modal" :class="modalName=='msgDialog'?'show':''">
			<view class="cu-dialog bg-white">
				<view class="flex justify-center padding-tb-df gray-border-bottom">
					<view class="text-theme text-sm">系统提示</view>
				</view>
				<view class="padding-xl text-sm text-black-4 gray-border-bottom text-left" style="line-height: 42upx;">
					警告！！此为不可逆操作！！与退出登录不同，注销帐户后，系统将不再保存您的任何个人信息，您将不能登录原有的帐户，所有过往发布和查看的信息，以及财务等信息将不再可访问！此手机号将在1年内再次注册受限！确认要注销帐户吗？
				</view>
				<view class="flex text-sm">
					<view class="flex-sub text-gray-2 padding-tb-df text-center" @tap="hideModal">取消</view>
					<view class="flex-sub text-theme padding-tb-df gray-border-left text-medium text-center"
						@tap="tologoff">确定</view>
				</view>
			</view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	let jpushModule = uni.requireNativePlugin("JG-JPush");
	import {
		gotoAppPermissionSetting
	} from '@/js_sdk/wa-permission/permission.js'
	// #endif

	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import UniList from "@/components/uni-list/uni-list";
	import {
		userLogout,
		userCancelCheck,
		userLogoff
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
	import permission from "../js_sdk/wa-permission/permission";


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

				withCancel: true,
				modalName: null,

				hasBadge: false,
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

			//#ifdef APP-PLUS
			this.intiData();
			//#endif
		},
		onShow() {},
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
			intiData() {
				if (!!this.token) {
					this.checkCancelUser()
				}

				let platform = uni.getStorageSync("platform");
				if (platform === 'ios') {
					var UIApplication = plus.ios.importClass("UIApplication");
					var app = UIApplication.sharedApplication();
					//获取应用图标的数量
					var oldNum = app.applicationIconBadgeNumber();
					if (oldNum > 0) {
						this.hasBadge = true;
					}
				}
			},
			checkCancelUser() {
				let self = this;
				userCancelCheck({}).then(res => {
					if (res.retCode === 0) {
						self.withCancel = res.data;
					}
				});
			},
			toNotify() {
				uni.navigateTo({
					url: '/pagesMore/message/messageList',
				})
			},
			toPushConfig() {
				let platform = uni.getStorageSync("platform");
				if (platform === 'ios') {
					uni.openAppAuthorizeSetting();
				} else {
					gotoAppPermissionSetting();
				}
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
					url: '/pagesMore/aboutus',
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
								self.token = null;
								self.userData = {}
							}
						}
					}
				})
			},
			logoff() {
				this.modalName = 'msgDialog';
			},
			tologoff() {
				var self = this;
				self.modalName = null;
				userLogoff({}).then(res => {
					if (res.retCode === 0) {
						// #ifdef APP-PLUS
						jpushModule.deleteAlias({
							'sequence': 1
						})
						// #endif
						setTimeout(() => {
							uni.removeStorageSync('token');
							uni.removeStorageSync('user');
							self.token = null;
							self.userData = {}
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1000);
					}
				});
			},
			hideModal(e) {
				this.modalName = null
			},
			toClearBadge() {
				plus.runtime.setBadgeNumber(0);
				uni.showToast({
					title: '清除成功',
					icon: 'none',
					duration: 2000
				})
				setTimeout(() => {
					this.hasBadge = false;
				})
			}
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