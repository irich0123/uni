<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="领任务" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--列表开始-->
			<view class="padding-tb-ssm">
				<view class="padding-tb-ssm padding-lr-sm text-gray-4 text-df">每日任务</view>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in task1List" :key="index" :show-arrow="false">
						<view class="flex align-center justify-start bg-white padding-tb-lg padding-lr-sm radius"
							@click="toDetail(item)">
							<view class="flex">
								<image style="min-width:140rpx;width:140rpx;height:140rpx" :src="item.icon"
									mode="widthFix" />
								<view class="flex flex-direction align-start padding-right padding-left-sm">
									<view class="text-theme text-df text-bold padding-bottom-xs">{{item.title}}</view>
									<view class="text-gray-5 text-sm">{{item.details}}</view>
								</view>
							</view>
							<view class="flex flex-direction align-center justify-center">
								<view class="bg-theme color-white radius-xl text-sm padding-tb-sm padding-lr"
									style="min-width: 80rpx;">
									{{item.btnName}}
								</view>
							</view>
						</view>
					</uni-list-item>
				</uni-list>
			</view>

			<view class="padding-tb-ssm">
				<view class="padding-tb-ssm padding-lr-sm text-gray-4 text-df">认证任务</view>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in task2List" :key="index" :show-arrow="false">
						<view class="flex align-center justify-start bg-white padding-tb-lg padding-lr-sm radius"
							@click="toDetail(item)">
							<view class="flex">
								<image style="min-width:140rpx;width:140rpx;height:140rpx" :src="item.icon"
									mode="widthFix" />
								<view class="flex flex-direction align-start padding-right padding-left-sm">
									<view class="text-theme text-df text-bold padding-bottom-xs">{{item.title}}</view>
									<view class="text-gray-5 text-sm">{{item.details}}</view>
								</view>
							</view>
							<view class="flex flex-direction align-center justify-center">
								<view class="color-white radius-xl text-sm padding-tb-sm padding-lr"
									:class="item.status!==null?'bg-gray-2':'bg-theme'" style="min-width: 80rpx;">
									{{item.status===null?'item.btnName':(item.status===0?'已领取':'已完成')}}
								</view>
							</view>
						</view>
					</uni-list-item>
				</uni-list>
			</view>
			<!--列表结束-->
		</scroll-view>
	</view>
</template>

<script>
	import {
		imgUrl,active
	} from "@/utils/config";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		toDate,
	} from "@/utils/myUtil";
	import {
		getTasksList,
		pickupTask
	} from "@/api/user"
	import {
		getModuleConfig
	} from "@/api/common";
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';

	export default {
		name: "messageList",
		components: {
			UniList,
			UniListItem,
			myNavBar
		},
		data() {
			return {
				token: null,

				task1List: [],
				task2List: [],
				isShowSignModule: false,

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
				immediate: true
			}
		},
		onLoad(query) {
			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync("token")

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

			initData() {
				this.getModuleConfig();
			},
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
			getModuleConfig() {
				let self = this;
				getModuleConfig().then(res => {
					if (res.retCode === 0) {
						self.isShowSignModule = !!res.data.signModuleStatus;

						self.getTaskList();
					}
				});
			},
			getTaskList() {
				let self = this;
				getTasksList({}).then(res => {
					if (res.retCode === 0) {
						res.data.forEach(v => {
							if (v.type === 1) {
								if (v.title.indexOf("签到") < 0) {
									self.task1List.push(v);
								} else {
									if (self.isShowSignModule) {
										self.task1List.push(v);
									}
								}
							} else if (v.type === 2) {
								self.task2List.push(v);
							}
						});
					}
				});
			},
			toDetail(task) {
				if (task.type === 1) { //每日任务
					if (task.toUrl.indexOf("http") > -1) {
						//todo 小程序和公众号分享 及APP分享功能
						uni.navigateTo({
							url: '/pages/common/webview?url=' + encodeURIComponent(task.toUrl + "?t=" + new Date().getTime()),
						})
					} else {
						uni.navigateTo({
							url: task.toUrl,
						})
					}
				} else if (task.type === 2) {
					let self = this;
					pickupTask({
						id: task.id
					}).then(res => {
						if (res.retCode === 0 && !!res.data) {
							uni.navigateTo({
								url: task.toUrl,
							})
						}
					});
				}
			}
		},

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
		align-items: flex-start;
	}

	::v-deep .uni-list-item {
		padding: 0 !important;
		margin-bottom: 20rpx;
	}
</style>