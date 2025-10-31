<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的银行卡" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" v-if="list.length>0" scroll-y
			:style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
			@refresherrestore="onRestore" refresher-background="transparent">
			<view style="content: ''; overflow: hidden;"></view>
			
			<view class="margin-sm" v-for="(item,index) in list" :key="index" :show-arrow="false">
				<bank-card-cell :item="item" @onTrash="onDelete" @onItem="onItem" />
			</view>

			<text class="loading-text">{{
			        loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			    }}
			</text>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="newBankCard">添加银行卡</button>
		</view>
	</view>
</template>

<script>
	import {
		deleteAccountBank,
		filterAccountBank
	} from "@/api/finance";
	import BankCardCell from "../components/bank-card-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "list",
		components: {
			BankCardCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				list: [],
				triggered: false,
				page: 1,
				size: 10,

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

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
		onLoad() {
			this.token = uni.getStorageSync('token');
			
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
			initData() {
				//获取信息列表
				this.loadData()
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
			//编辑
			onItem(e) {
				uni.navigateTo({
					url: './bankCardInfo?id=' + e.id,
				})
			},
			//添加
			newBankCard() {
				uni.navigateTo({
					url: './bankCardInfo'
				})
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
			//获取地址信息列表
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					page: this.page,
					size: this.size,
					status: 1,
				}
				let self = this;
				filterAccountBank(paramsData).then(res => {
					if (res.retCode === 0) {
						let rows = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						rows.forEach(row => {
							self.list.push(row);
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
			onDelete(e) {
				let self = this
				uni.showModal({
					title: "小二提示",
					content: '确定要删除这条银行卡信息吗？',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							let param = {
								id: e.id,
							}
							deleteAccountBank(param).then(res => {
								if (res.retCode === 0) {

									let idx = self.list.findIndex(v => {
										return v.id === e.id
									});
									if (idx > -1) {
										self.list.splice(idx, 1);
									}
								}
							});
						}
					}
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
		display: flex;
	}


</style>