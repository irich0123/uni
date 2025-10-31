<template>
	<view class="container no-scroll">
		<!-- #ifndef H5 -->
		<view class="bg-theme position-fixed" style="top:0;left:0;right:0;z-index: 999;">
			<view :style="'height:'+statusbarHeight+'px'" style="width:100%"></view>
			<view class="flex align-center" :style="'width:' +menubarLeftPosition+'px;height:40px'">
				<!-- #ifdef MP-WEIXIN -->
				<view class="flex-twice text-lg color-white padding-left-lg">找外发</view>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<view class="flex-sub"></view>
				<view class="flex-twice text-center text-lg color-white">找外发</view>
				<!-- #endif -->
				<!-- #ifdef APP-PLUS -->
				<view class="flex-sub flex justify-end padding-right margin-right-sm">
				<!-- #endif -->
				<!-- #ifndef APP-PLUS -->
				<view class="flex-sub flex justify-end margin-right-xs">
				<!-- #endif -->
					<uni-icons class="nav-right-btn" type="search" color="white" size="23" @click="toSearch" />
					<uni-icons class="nav-right-btn" type="compose" color="white" size="23" @click="toPost" />
				</view>
			</view>
		</view>
		<!-- #endif -->

		<!--        顶部选项卡开始-->
		<view class="tab-choose bg-white text-black flex align-center text-df"
			:class="active==='debug'?'debug-tab-choose':''" :style="'padding-top:'+contentTop+'px;'">
			<view v-for="(item,index) in menuList" :key="item.label" class="flex-sub flex align-center justify-center"
				@click.stop="showMenu(item)">
				<view :class="item.class">
					{{ item.label }}
				</view>
				<view>
					<img v-if="!item.panelShow" :src="down" alt="" class="tab-item-img" />
					<img v-else :src="up" alt="" class="tab-item-img" />
				</view>
			</view>

			<view class='cover' v-if="menuList[index].panelShow" v-for="(menu,index) in menuList" :key="index"
				:style="'top:'+contentTop+'px'" @click.stop="coverClicked(index)">
				<view class="bg-white text-black flex flex-wrap" v-if="index===0" style="z-index:10;">
					<block> <!-- 使用这个可以达到自动转行的排列效果 -->
						<template>
							<view class="flex flex-direction align-center justify-center padding-tb-sm"
								style="width: calc(20% - 2rpx);"
								v-for="(childMenuItem,childMenuIndex) in menu.menuItems" :key="childMenuIndex"
								:class="childMenuItem.label===menu.label?'text-theme theme-border':'gray-border-bottom'"
								@click.stop="onMenuItem(index,childMenuIndex)">
								<image class="industry-item-img" :src="childMenuItem.icon" />
								<view class="text-sm margin-top-sm">{{ childMenuItem.label }}</view>
							</view>
						</template>
					</block>
				</view>
				<view class="text-df text-black bg-menu" v-if="index===1" style="z-index:10;">
					<view class="gray-border-bottom padding-tb-sm flex justify-center"
						v-for="(childMenuItem,childMenuIndex1) in menu.menuItems" :key="childMenuIndex1"
						:class="childMenuItem.label===menu.label?'text-theme text-bold':''"
						@click.stop="onMenuItem(index,childMenuIndex1)">
						{{ childMenuItem.label }}
					</view>
				</view>
			</view>
		</view>
		<!--        顶部选项卡结束-->

		<!--        信息列表开始-->
		<scroll-view class="bg-gray-1" v-if="list.length>0" scroll-y
			 :style="'padding-top:'+ (contentTop +40) +'px;height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
				refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
				@refresherrestore="onRestore" refresher-background="transparent">
				
			<!--列表开始-->
			<view class="margin-top-ssm" v-for="(item,index1) in list" :key="index1" @click.stop="showReleaseDetail(item)">
				<release-work-list-cell :release-work="item" @onPhoneCall="callBtnClicked(item)" />
			</view>
			<!--列表结束-->

			<text class="loading-text blank">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>

		<view class="flex-grow flex flex-direction align-center justify-center" v-if="list.length===0 && !isLoading">
			<view class="flex flex-direction align-center justify-center" style="padding-top: 160rpx;">
				<image style="width: 500rpx;height: 315rpx;opacity:0.5;" :src="imgUrl+'/bg_biaoqing.png'" />
				<text class="text-black-5 padding-top text-df margin-bottom-150">暂无相关信息,试试其他城市吧</text>
			</view>

			<view class='margin-lr-sm flex'>
				<view class='flex align-center justify-center text-lg bg-white text-theme gray-border-1 padding-tb-sm padding-lr-xl'
					style="border-radius:50rpx;" @click="toPost">
					发布一条吧
				</view>
			</view>
		</view>

		<!--        信息列表结束-->
		<!-- 提交信息 -->
		<uni-popup ref="dialogInput" type="dialog">
			<uni-popup-dialog-tip mode="input" title="小二提示" :value="tips" @close="dialogInputCancel"
				@confirm="dialogInputConfirm">
			</uni-popup-dialog-tip>
		</uni-popup>

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5 -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick"></uni-fab>
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->

	</view>
</template>

<script>
	import {
		active,
		imgUrl
	} from '@/utils/config'
	import {
		parseActionConsume
	} from '@/utils/myUtil.js'
	import UniIcons from '@/components/uni-icons/uni-icons.vue'
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTip from '@/components/uni-popup/uni-popup-dialog-tip.vue'
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import {
		contactReleaseWork,
		filterReleaseWork,
	} from "@/api/workinfo";
	import {
		getSortTypeEnum
	} from "@/api/common";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';

	export default {
		name: "waifa",
		components: {
			myNavBar,
			UniIcons,
			uniPopup,
			uniPopupDialogTip,
			ReleaseWorkListCell,
			// #ifdef H5 
			UniFab
			// #endif
		},
		data() {
			return {
				imgUrl: imgUrl,
				statusbarHeight: 0,
				menubarLeftPosition: 375,
				contentTop: 0,
				listHeight: 0,
				
				active: active,

				up: imgUrl + '/ic_shangla_hei.png',
				down: imgUrl + '/ic_xiala_hei.png',

				menuList: [{
						name: 'industry',
						label: '全行业',
						index: 0,
						panelShow: false,
						menuItems: [],
						init: () => this.getIndustryAll(),
					},
					{
						name: 'sort',
						label: '智能排序',
						index: 2,
						panelShow: false,
						menuItems: [],
						init: () => this.loadSortData(),
					}
				],

				page: 1,
				size: 10,
				triggered: false,
				list: [],
				currentReleaseWork: null,

				token: null,
				userData: null,
				tips: "",

				isLoading: true,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				cityShow: '上海',
				industryId: null,

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
						iconPath: imgUrl + '/ic_searh_hollow.png',
						selectedIconPath: imgUrl + '/ic_searh_hollow.png',
						text: '搜索',
						active: false
					},
					{
						iconPath: imgUrl + '/ic_edit_hollow.png',
						selectedIconPath: imgUrl + '/ic_edit_hollow.png',
						text: '发布',
						active: false
					},
				],
				fabMenuPopped: false,
				//    悬浮层结束
			}
		},
		onLoad() {
			this.getSystemStatusBarHeight();
		},
		onShow() {
			this.token = uni.getStorageSync("token");
			this.userData = uni.getStorageSync("user");
			this.cityShow = uni.getStorageSync('cityShow')

			let needInitData = false;
			let industryId = uni.getStorageSync("industryId");
			if (industryId === 0) {
				needInitData = true;
				this.industryId = null;
				uni.removeStorageSync("industryId");
			} else if (!!industryId) {
				if (!this.industryId || industryId !== this.industryId) {
					needInitData = true;
				}
				this.industryId = parseInt(industryId);
				uni.removeStorageSync("industryId");
			}


			if (this.list.length === 0 || needInitData) {
				this.initData();
			}else if (!!uni.getStorageSync("needRefresh") || !!uni.getStorageSync("releaseWorkList_refresh")) {
				uni.removeStorageSync("needRefresh");
				uni.removeStorageSync("releaseWorkList_refresh");
				this.initData();
			}
		},
		methods: {
			//获取系统状态栏高度
			getSystemStatusBarHeight: function() {
				// #ifdef APP-PLUS
				var height = plus.navigator.getStatusbarHeight();
				this.statusbarHeight = height;
				this.contentTop = this.statusbarHeight + 40; //加上标题栏高度
				// #endif

				// #ifdef MP-WEIXIN
				var rec = uni.getMenuButtonBoundingClientRect();
				this.statusbarHeight = rec.top - (40 - rec.height) / 2;
				this.menubarLeftPosition = rec.left - 5;
				this.contentTop = this.statusbarHeight + 40; //加上标题栏高度
				// #endif

				// #ifdef H5
				this.contentTop = this.statusbarHeight; //加上标题栏高度
				// #endif
				
				//#ifdef APP-PLUS
				this.listHeight = uni.getWindowInfo().safeArea.bottom + uni.getWindowInfo().safeArea.top - this
					.contentTop - 44;
				// #endif

				//#ifndef APP-PLUS
				this.listHeight = uni.getWindowInfo().safeArea.bottom - this.contentTop - 84;
				// #endif
			},

			coverClicked(index) {
				this.menuList[index].panelShow = false;
			},
			initData() {
				this.menuList.forEach(v => {
					v.init();
				})
				setTimeout(() => {
					this.page = 1;
					this.isLoading = false;
					this.loadData() //获取找外发信息列表
				}, 1000);
			},
			getIndustryAll() {
				let array = uni.getStorageSync("allIndustry");
				if (array) {
					let idx = this.menuList.findIndex(v => {
						return v.name === "industry"
					});
					this.menuList[idx].menuItems.splice(0, this.menuList[idx].menuItems.length);
					array.forEach(v => {
						this.menuList[idx].menuItems.push({
							value: v.id,
							icon: v.icon,
							label: v.industry,
						});
					});
					let i = 0;
					if (!!this.industryId) {
						i = this.menuList[idx].menuItems.findIndex(v => {
							return v.value === this.industryId;
						});

						if (i === -1) {
							i = 0;
						}
					}
					this.menuList[idx].index = i;
					this.menuList[idx].label = this.menuList[idx].menuItems[i].label;
				}
			},

			confirmDialogShow() {
				let goldCount = parseActionConsume("发起联系外发信息", this.userData.userVerifyStatus, this.userData
					.withValidBeanCard);

				if (!!goldCount) {
					this.tips = "拨打电话会扣除金豆" + goldCount + "颗，确认要拨打电话吗？系统智能计费，同一条信息不会重复收费！"
					this.$refs.dialogInput.open()
				} else {
					this.checkGoldBeanThenCall();
				}
			},
			dialogInputConfirm(done, value) {
				done();
				if (!!value && value > 0) {
					uni.setStorageSync("gold_bean_tipped", value);
				};
				this.checkGoldBeanThenCall()
			},
			dialogInputCancel(done) {
				done();
				this.currentReleaseWork = {};
			},
			//点击发布活信息按钮
			toPost() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesNew/dosend/dosend'
				})
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			showMenu(item) {
				item.panelShow = !item.panelShow;
			},
			onMenuItem(index, childIndex) {
				this.menuList[index].panelShow = false;
				this.menuList[index].label = this.menuList[index].menuItems[childIndex].label;
				if (this.menuList[index].index !== childIndex) {
					this.menuList[index].index = childIndex;
					this.page = 1;
					this.loadData()
				}
			},

			//获取排序列表
			loadSortData() {
				let self = this;
				getSortTypeEnum().then(res => {
					if (res.retCode === 0) {
						let idx = self.menuList.findIndex(v => {
							return v.name === "sort"
						});
						self.menuList[idx].menuItems.splice(0, self.menuList[idx].menuItems.length);
						res.data.forEach(v => {
							self.menuList[idx].menuItems.push({
								value: v.id,
								sign: v.sortSign,
								label: v.content,
							})
						});
						self.menuList[idx].index = self.menuList[idx].menuItems.findIndex(v => v.label === "智能排序");
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
			//获取活信息列表
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;

				let paramsData = {
					page: this.page,
					size: this.size,
					address: this.cityShow,
					sortSign: this.menuList[1].menuItems[this.menuList[1].index].sign,
					industry: this.menuList[0].index === 0 ? null : this.menuList[0].menuItems[this.menuList[0].index]
						.label,
					verifyStatus: 3,
				}

				let self = this;
				filterReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						list.forEach(item => {
							if (!!item.img) {
								item.img = JSON.parse(item.img);
							} else {
								item.img = [];
							}
							self.list.push(item);
						});

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
			//获取活信息详情
			showReleaseDetail(item) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				item.hasChecked = true;

				let param = {
					id: item.id,
					page: this.page,
					size: this.size,
					address: this.cityShow,
					sortSign: this.menuList[1].menuItems[this.menuList[1].index].value,
					industry: this.menuList[0].index === 0 ? null : this.menuList[0].menuItems[this.menuList[0].index]
						.label,
					verifyStatus: 3,
				};

				uni.navigateTo({
					url: '/pagesNew/details/sendDetails?p=' + encodeURIComponent(JSON.stringify(param)),
				})
			},

			//打电话
			callBtnClicked(item) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (item.userId === this.userData.id) {
					uni.showToast({
						title: "不能拨打您自己的电话！",
						icon: "none",
						duration: 2000
					})
					return;
				}
				
				this.currentReleaseWork = {
					item: item,
					index: this.list.findIndex(v => v.id === item.id),
				};
				if (!!uni.getStorageSync("gold_bean_tipped")) {
					this.checkGoldBeanThenCall();
				} else {
					this.confirmDialogShow();
				}
			},

			checkGoldBeanThenCall() {
				let self = this;
				let params = {
					id: this.currentReleaseWork.item.id,
				}
				contactReleaseWork(params).then(res => {
					if (res.retCode === 0) {
						let item = self.list[self.currentReleaseWork.index];
						item.hasContacted = true;
						self.currentReleaseWork = {};
						uni.makePhoneCall({
							phoneNumber: res.data
						}).catch(e => {});
					}
				}).catch(res => {
					if (res.message.indexOf("金豆不足") > -1) {
						uni.showModal({
							title: '系统提示',
							content: '金豆数不足,现在去补充金豆吗？',
							showCancel: true,
							confirmText: '确认',
							success: function(res1) {
								if (res1.confirm) {
									uni.navigateTo({
										url: '/pagesPersonal/pay/payBeanGoods',
									})
								}
							},
						})
					}
				});
			},

			//悬浮按钮的操作
			trigger(e) {
				this.content[e.index].active = !e.item.active;
				if (e.item.text === '发布') {
					this.toPost();
				} else if (e.item.text === '搜索') {
					this.toSearch();
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

			toSearch() {
				uni.navigateTo({
					url: '/pagesNew/dosend/searchReleaseWork'
				})
			},

		},
		/**
		 * 用户点击右上角分享 ---小程序
		 */
		// #ifdef MP-WEIXIN
		onShareAppMessage: function() {
			return {
				title: '最新外发信息-云加工',
				path: '/pages/waifa/waifa',
				imageUrl: this.imgUrl + '/share.png',
				success: function(res) {
					// console.log("转发成功:" + JSON.stringify(res));
				},
				fail: function(res) {
					// 转发失败
					// console.log("转发失败:" + JSON.stringify(res));
				}
			}
		},
		onShareTimeline() {
			return {
				title: '最新外发信息-云加工',
				query: '',
				imageUrl: this.imgUrl + '/share.png',
			}
		},
		// #endif
	}
</script>

<style scoped lang="scss">
	@import "/static/css/nav-bar.css";
	@import "/static/css/menu-bar.css";
	@import "/static/css/fab.css";
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.blank {
		margin-bottom: 120rpx;
	}
</style>