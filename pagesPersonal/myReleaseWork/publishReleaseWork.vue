<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我发的外发" @action="navAction" @reSize="reSize"
			:img-btn-src1="imgUrl+'/ic_edit_hollow_white.png'" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme"></wuc-tab>

		<!--        信息列表开始-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">
			<!--列表开始-->
			<uni-swipe-action>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false"
						@click="toItemDetail(item.id)">
						<uni-swipe-action-item :options="option" @click="swipeClick($event,index,item.id)"
							:disabled="tabIndex===0">
							<view class="flex-grow">
								<release-work-list-cell :release-work="item" :show-admin-bar="true"
									:show-status-bar="false" :show-footer="false">
									<view
										class="padding-top-sm margin-top-sm gray-border-top flex align-center justify-end">
										<!--  活信息状态 审核中(1), 已拒绝(2),已通过(3),已过期(4),已删除(5) 已确定报价(6),已下架(7),已完成(8);-->

										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
											v-if="item.verifyStatus ===4 || item.verifyStatus ===8"
											@click.stop="toEdit(item.id,1)">重发
										</view>

										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
											v-if="item.verifyStatus ===1 || item.verifyStatus === 2 || item.verifyStatus === 3 || item.verifyStatus === 7"
											@click.stop="toEdit(item.id,0)">编辑
										</view>

										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
											v-if="item.verifyStatus ===2" @click.stop="toReason(item.id)">原因
										</view>

										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
											v-if="item.verifyStatus ===3 " @click.stop="offReleaseWork(item.id,index)">
											下架
										</view>

										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
											v-if="item.verifyStatus ===3" @click.stop="toStick(item)">置顶
										</view>

										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
											v-if="item.verifyStatus ===7 " @click.stop="onReleaseWork(item.id,index)">上架
										</view>
										<view
											class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-theme text-sm"
											@click.stop="toContactList(item.id)">联系记录
										</view>
									</view>
								</release-work-list-cell>
							</view>
						</uni-swipe-action-item>
					</uni-list-item>
				</uni-list>
			</uni-swipe-action>

			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
			<!--列表结束-->
		</scroll-view>

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5 -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" />
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->
	</view>

</template>

<script>
	import wucTab from '@/components/wuc-tab/wuc-tab'
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniSwipeActionItem from '@/components/uni-swipe-action-item/uni-swipe-action-item.vue'
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import {
		getFailureReasonReleaseWork,
		filterReleaseWork,
		offReleaseWork,
		onReleaseWork,
		postReleaseWork
	} from "@/api/workinfo";
	import {
		getReleaseWorkStatusEnum
	} from "@/api/basic";
	import {
		imgUrl,active
	} from '@/utils/config.js';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "publishReleaseWork",
		components: {
			UniList,
			UniListItem,
			uniSwipeAction,
			uniSwipeActionItem,
			wucTab,
			// #ifdef H5 
			UniFab,
			// #endif
			ReleaseWorkListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				option: [{
					text: '移除',
					style: {
						backgroundColor: '#fb5318',
					}
				}],
				tabBars: [{
						name: '进行中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [3, 7],
						list: [],
					},
					{
						name: '审核中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [1, 2],
						list: [],
					},
					{
						name: '已结束',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [4, 6, 8],
						list: [],
					}
				],
				tabIndex: 0,
				triggered: false,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				token: null,
				userData: {},

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
					iconPath: imgUrl + '/ic_edit_hollow.png',
					selectedIconPath: imgUrl + '/ic_edit_hollow.png',
					text: '发布',
					active: false
				}, ],
				fabMenuPopped: false,
				//悬浮层结束

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
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop;
					//#endif
					// #ifdef H5
					this.contentTop = 0;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			let o = options.o
			if (o === 'n') {
				this.tabIndex = 1
			} else {
				this.tabIndex = 0
			}

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
					this.newReleaseWork();
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},
			initData() {
				this.loadData();
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
			//置顶申请
			toStick(item) {
				if (item.address === '不限') {
					uni.showToast({
						title: "该地区不可置顶",
						icon: "none",
						duration: 3000
					})
					return
				}
				uni.navigateTo({
					url: '/pagesNew/stick/stickList?id=' + item.id + '&type=0',
				})
			},
			//外发活信息下架
			offReleaseWork(id, index) {
				let paramsData = {
					id: id
				}
				let self = this;
				offReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '您的信息下架成功！',
							icon: 'none',
							duration: 1000
						})
						self.handleData(res.data);
						self.tabBars[self.tabIndex].list.splice(index, 1, res.data);
					}
				});
			},
			//外发活信息上架
			onReleaseWork(id, index) {
				let paramsData = {
					id: id
				}
				let self = this;
				onReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '您的信息上架成功！',
							icon: 'none',
							duration: 1000
						})
						self.handleData(res.data);
						self.tabBars[self.tabIndex].list.splice(index, 1, res.data);
					}
				});
			},
			//跳转到信息编辑页面
			toEdit(id, renew) {
				uni.navigateTo({
					url: '/pagesNew/dosend/dosend?id=' + id + '&renew=' + renew
				})
			},
			//跳转到联系记录页面
			toContactList(id) {
				// type =1 ----承接；type=0---外发
				uni.navigateTo({
					url: '/pagesPersonal/contacted/contactedList?id=' + id + '&type=0'
				})

			},
			//跳转到外发详情页
			toItemDetail(workId) {
				if (this.tabIndex === 0) {
					uni.navigateTo({
						url: '../../pagesNew/details/sendDetails?id=' + workId + '&fromAdmin=1',
					})
				}
			},
			//点击删除
			swipeClick(e, index, id) {
				let paramsData = {
					id: id,
					verifyStatus: 5
				}
				let self = this
				let {
					content
				} = e
				if (content.text === '移除') {
					uni.showModal({
						title: '提示',
						content: '是否删除?',
						success: (res1) => {
							if (res1.confirm) {
								postReleaseWork(paramsData).then(res => {
									if (res.retCode === 0) {
										uni.showToast({
											title: "删除成功",
											icon: 'none',
											duration: 1000
										})
										self.tabBars[self.tabIndex].list.splice(index, 1);
									}
								});
							}
						}
					});
				}
			},
			//获取承接失败原因
			toReason(id) {
				let paramsData = {
					workInfoId: id
				}
				getFailureReasonReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showModal({
							title: '审核失败原因',
							content: res.data,
							showCancel: false,
							confirmText: '我知道了',
							confirmColor: '#fb5318',
						});
					}
				});
			},
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.loadData();
					}, 300);
				}
			},
			//获取我发布的承接信息列表
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					//审核中(1), 已拒绝(2),已通过(3),已过期(4),已删除（5）;
					userId: this.userData.id,
					statusList: this.tabBars[this.tabIndex].statusList,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					sortSign: 'MY_INFO',
				}
				let self = this;
				filterReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex]
								.list.length);
						}
						res.data.list.forEach(item => {
							self.handleData(item);
							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.tabBars[this.tabIndex].page = 1;
				this.tabBars[this.tabIndex].list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			handleData(item) {
				if (!!item.count) {
					item.count = parseInt(item.count);
				} else {
					item.count = 0;
				}
				if (item.img) {
					item.img = JSON.parse(item.img);
				}
			},
			//点击发布活信息按钮
			newReleaseWork() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesNew/dosend/dosend'
				})
			},
			//悬浮按钮的操作
			trigger(e) {
				this.content[e.index].active = !e.item.active;
				if (e.item.text === '发布') {
					this.newReleaseWork();
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
		},
	}
</script>

<style scoped lang="scss">
	@import "../../static/css/fab.css";
	@import "../../static/css/tabBar.css";
	@import "../../static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}


	::v-deep .uni-swipe_button-group {
		margin: 0;
		border-radius: 0rpx !important;
	}

	::v-deep .uni-swipe_button-group uni-view {
		border-radius: 20rpx;
	}

	::v-deep .uni-swipe_button-group .uni-swipe_button {
		border-radius: 20rpx;
	}
</style>