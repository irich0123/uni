<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="争议情况" @action="navAction" @reSize="reSize" class="my-nav-bar"
			:img-btn-src1="imgUrl+'/mall/ic_servant_white.png'" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<uni-list :border="false">
				<uni-list-item :show-arrow="false" class="bg-white margin-top-sm margin-lr-sm radius-s margin-top-xs"
					v-for="(item,index) in list" :key="index">
					<view class="margin-lr flex justify-between align-center text-sm color-black gray-border-bottom"
						v-if="item.operatorId !== userData.id">
						<view class="text-sm text-gray-4">
							{{ item.createTime  | formatDate }}
						</view>
						<view class="padding-tb flex align-center justify-between">
							<image class="round" style="height: 60rpx;width: 60rpx;"
								:src="item.opposite.avatar?item.opposite.avatar:defaultUserAvatar" />
							<view class="margin-left-sm text-sm text-black">
								{{ item.opposite.realName }}
							</view>
						</view>
					</view>
					<view class="margin-lr flex justify-between align-center text-sm color-black gray-border-bottom"
						v-else>
						<view class="padding-tb flex align-center justify-between">
							<view class="margin-right-sm text-sm text-black">
								{{ item.initiator.realName }}
							</view>
							<image class="round" style="height: 60rpx;width: 60rpx;"
								:src="item.initiator.avatar?item.initiator.avatar:defaultUserAvatar" />
						</view>
						<view class="text-sm text-gray-4">
							{{ item.createTime | formatDate }}
						</view>
					</view>
					<view class="padding">
						<view class="text-df text-black">
							{{ item.description }}
						</view>
						<view class="margin-top-sm flex">
							<view class="flex margin-right-xs" v-if="!!item.photos && item.photos.length > 0"
								v-for="(itemImg,indexImg) in item.photos" :key="indexImg"
								@click.native="previewImg(indexImg,item)">
								<image style="width: 120rpx;height: 120rpx;" :src="itemImg"></image>
							</view>
						</view>
					</view>
				</uni-list-item>
			</uni-list>

			<text class="loading-text">{{
                loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
            }}
			</text>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<view v-if="status === 1 || status === null">
				<button class="bg-theme text-xl color-white radius-0" @click="goToNewDispute">发起争议</button>
			</view>
			<view class="flex" v-if="status === 0">
				<button class="flex-sub bg-white text-xl text-black radius-0"
					@click="closeDisputeByInitiator">关闭争议</button>
				<button class="flex-sub bg-theme text-xl color-white radius-0" @click="goToNewDispute">我有异议</button>
			</view>
		</view>

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5  -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" v-show="isShowFab"></uni-fab>
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->
	</view>
</template>

<script>
	import {
		closeDisputeByInitiator,
		getDisputeByTransactionId,
		getPagedDisputeLogList
	} from "@/api/mall";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import {
		calculateMath,
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "dispute",
		components: {
			UniList,
			UniListItem,
			// #ifdef H5
			UniFab,
			// #endif
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {
					id: null
				},

				id: null, //争议id
				initiatorType: null,
				transactionId: null,

				list: [],
				page: 1,
				size: 10,
				triggered: false,

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				status: null,
				statusName: '无争议',
				defaultUserAvatar: '', //默认头像图片

				//悬浮层开始
				horizontal: 'left',
				vertical: 'top',
				direction: 'horizontal',
				pattern: {
					color: '#fb5318',
					backgroundColor: '#ffffff',
					selectedColor: '#fb5318',
					buttonColor: "#fb531899"
				},
				content: [{
					iconPath: imgUrl + '/mall/ic_servant.png',
					selectedIconPath: imgUrl + '/mall/ic_servant.png',
					text: '小二',
					active: false
				}, ],
				isShowFab: true, //浮层是否显示
				fabMenuPopped: false,
				//    悬浮层结束

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
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.userData = uni.getStorageSync("user");

			this.transactionId = parseInt(options.id);
			this.initiatorType = parseInt(options.initiatorType);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

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
				} else if (e.action === 'btn1') {
					this.adminRequest();
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},
			initData() {
				let defaultResource = uni.getStorageSync("defaultResource");
				this.defaultUserAvatar = defaultResource[4].resourceUrl[0];

				//根据交易id获取争议, 了解当前争议的状态
				this.getDispute();
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1500
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}, 1500);
			},
			//请求小二干预
			adminRequest() {
				if (!this.id) {
					uni.showToast({
						title: '暂无争议，无需平台干预',
						icon: "none",
						duration: 1500
					})
					return;
				}
				let paramsData = {
					id: this.id,
					userId: this.userData.id,
					nextTransactionStatus: 17
				}
				uni.showModal({
					title: '小二提醒',
					content: '确定要让小二干预争议过程吗？小二仲裁的结果会影响会员的信誉度哦！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							closeDisputeByInitiator(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: res.data,
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
						}
					}
				})
			},
			//发起者关闭争议
			closeDisputeByInitiator() {
				let paramsData = {
					id: this.id,
					userId: this.userData.id,
				}
				uni.showModal({
					title: '小二提醒',
					content: '确定要关闭争议吗？关闭争议后，交易将转换为进入争议时的状态！',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							closeDisputeByInitiator(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: res.data,
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
						}
					}
				})
			},
			//跳转到发起争议页面
			goToNewDispute() {
				uni.navigateTo({
					url: '/pagesPersonal/myMall/newDispute?id=' + this.transactionId + '&initiatorType=' + this
						.initiatorType
				})
			},
			//根据交易id获取争议信息
			getDispute() {
				let paramsData = {
					transactionId: this.transactionId
				}
				let self = this;
				getDisputeByTransactionId(paramsData).then(res => {
					if (res.retCode === 0) {
						self.id = res.data.id
						self.status = res.data.status
						if (res.data.status === 0) {
							self.statusName = '争议状态：争议中';
						} else if (res.data.status === 1) {
							self.statusName = '争议状态：小二干预中';
						} else if (res.data.status === 2) {
							self.statusName = '争议状态：已关闭';
						} else {
							self.statusName = '无争议';
						}
						uni.setNavigationBarTitle({
							title: self.statusName,
						});
						self.loadData();
					}
				}).catch((error) => {
					if (error.message.indexOf("信息不存在") > -1) {
						uni.setNavigationBarTitle({
							title: '无争议',
						});
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
			//获取争议日志
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					disputeId: this.id,
					page: this.page,
					size: this.size
				}
				let self = this;
				getPagedDisputeLogList(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						res.data.list.forEach(item => {
							if (item.photos) {
								item.photos = JSON.parse(item.photos)
							}
							self.list.push(item);
						})
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
						}
					}
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.page = 1;
				this.list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			trigger(e) {
				this.content[e.index].active = !e.item.active;
				if (e.item.text === '小二') {
					this.adminRequest();
				}
			},
			fabClick() {
				if (!this.fabMenuPopped) {
					this.fabMenuPopped = true;
					setTimeout(() => {
						if (!!this.$refs.fab) {
							this.$refs.fab.close();
						}
						this.fabMenuPopped = false;
					}, 3000);
				}
			},
			previewImg(index, item) {
				uni.previewImage({
					current: index,
					urls: item.photos,
					loop: true
				});
			},
		},

	}
</script>

<style scoped lang="scss">
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__content {
		text-align: left;
	}

	::v-deep .uni-list-item__icon-img {
		border-radius: 100px;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx;
		margin-top: 20rpx;
	}

	::v-deep .uni-list-item {
		padding: 0rpx !important;
	}
</style>