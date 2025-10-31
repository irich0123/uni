<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商品搜索" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<view class="margin-lr-sm bg-gray-1" :style="'padding-top:'+contentTop+'px;'">
			<mSearch class="bg-white" :placeholder="defaultKeyword" :initVal="keyword" :radius="18" @search="doSearch"
				@inputClear="inputClear" />
		</view>

		<view class="margin-lr-sm margin-tb-ssm radius" v-if="!withSearchData">
			<view class="padding-tb-ssm padding-lr bg-white">
				<view class="flex align-center justify-between">
					<view class="text-df text-gray-5">历史搜索</view>
					<image style="width:40rpx;height:40rpx" @tap="oldDelete" :src="imgUrl+'/index/empty.png'" />
				</view>
				<view class="padding-top-sm flex flex-wrap">
					<view class="flex justify-center align-center radius-l padding-lr padding-tb-ssm margin-tb-ssm margin-right-sm bg-gray-1 
						text-gray-5 text-df" v-for="(keyword,index) in historyKeywordList" @tap="doHistorySearch(keyword)" :key="index">
						{{ keyword }}
					</view>
				</view>
			</view>
		</view>

		<view class="flex-grow flex flex-direction align-center justify-center" v-if="!list.length && withSearchData">
			<view class="flex flex-direction align-center justify-center">
				<image style="width: 500rpx;height: 315rpx;opacity:0.5;" :src="imgUrl+'/bg_biaoqing.png'" />
				<text class="text-black-5 padding-top text-df margin-bottom-150">暂无相关信息，换个关键词试试吧</text>
			</view>
			<view class='margin-lr-sm flex'>
				<view
					class='flex align-center justify-center text-lg bg-white text-theme gray-border-1 padding-tb-sm padding-lr-xl'
					style="border-radius:50rpx;" @click="toPost">
					发布一条吧
				</view>
			</view>
		</view>

		<scroll-view class="text-df bg-gray-1" v-if="list.length>0 && withSearchData" scroll-y
			:style="'height:'+listHeight+'px;'" @scrolltolower="loadMoreData" refresher-enabled="true"
			:refresher-triggered="triggered" @refresherrefresh="onRefresh" @refresherrestore="onRestore"
			refresher-background="transparent">
			
			<!--列表开始-->
			<view class="margin-top-ssm" @click.stop="goToMallDetails(item.id)" v-for="(item,index) in list"
				:key="index">
				<view class="padding-tb-sm padding-lr bg-white radius">
					<commodity-list-cell :commodity="item" />
				</view>
			</view>
			<!--列表结束-->
			<text class="loading-text">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>

	</view>
</template>

<script>
	import mSearch from '../components/mehaotian-search-revision.vue';
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import {
		filterCommodity
	} from "@/api/mall";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "searchCommodity",
		components: {
			mSearch,
			CommodityListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				defaultKeyword: "搜商品",
				keyword: "",
				historyKeywordList: [],

				withSearchData: false,

				list: [],
				triggered: false,
				page: 1,
				size: 10,

				token: null,
				userData: {},

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

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
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - 10;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - 40 - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(query) {
			
			this.initData();

			this.keyword = query.search;

			if (!!this.keyword) {
				this.loadData();
			}
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')
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
				this.loadOldKeyword();
			},
			//加载历史搜索,自动读取本地Storage
			loadOldKeyword() {
				this.historyKeywordList = uni.getStorageSync('historyCommodityKeywords');
				if (!this.historyKeywordList) {
					this.historyKeywordList = [];
				}
			},
			//清除历史搜索
			oldDelete() {
				uni.showModal({
					content: '确定清除历史搜索记录？',
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确定');
							this.historyKeywordList = [];
							uni.removeStorage({
								key: 'historyCommodityKeywords'
							});
						}
					}
				});
			},
			doHistorySearch(keyword) {
				this.page = 1;
				this.keyword = keyword;
				this.$forceUpdate();
				this.loadData();
			},
			doSearch(e) {
				if (!e || e.length === 0) {
					this.withSearchData = false;
					this.$forceUpdate();
				} else {
					this.page = 1;
					this.saveKeyword(e); //保存为历史
					this.keyword = e;
					this.loadData();
				}
			},
			//保存关键字到历史记录
			saveKeyword(keyword) {
				let index = this.historyKeywordList.findIndex(v => {
					return v === keyword
				});
				if (index === -1) {
					this.historyKeywordList.unshift(keyword);
				} else {
					this.historyKeywordList.splice(index, 1);
					this.historyKeywordList.unshift(keyword);
				}
				uni.setStorageSync('historyCommodityKeywords', this.historyKeywordList);
			},
			inputClear(e) {
				this.keyword = e.clear;
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
			//获取所有商品信息
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					page: this.page,
					size: this.size,
					status: 2,
					orderByClause: 'updateTime desc',
					keyWords: this.keyword,
				}
				let self = this;
				filterCommodity(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						list.forEach(item => {
							item.shortAddress = item.shortAddress.replace(/,/g, ' ')
							if (item.unitPriceBreakdown) {
								item.unitPriceBreakdown = JSON.parse(item.unitPriceBreakdown)
							}
							if (item.photos) {
								item.photos = JSON.parse(item.photos);
							} else {
								item.photos = [];
							}
							self.list.push(item);
						});

						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
						}
						
						self.withSearchData = true;
					}
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.withSearchData = false;
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if(!this.keyword) return;
				if (this.triggered) return;
				this.triggered = true;

				this.page = 1;
				this.list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			//跳转到商品详情
			goToMallDetails(id) {
				let param = {
					id: id,
					page: this.page,
					size: this.size,
					status: 2,
					orderByClause: 'updateTime desc',
					keyWords: this.keyword,
				};

				uni.navigateTo({
					url: '/pagesNew/details/mallDetails?p=' + encodeURIComponent(JSON.stringify(param)),
				})
			},
			toPost() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesNew/domall/postCommodity',
				})
			}

		},
	}
</script>

<style scoped lang="scss">
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
	}

</style>