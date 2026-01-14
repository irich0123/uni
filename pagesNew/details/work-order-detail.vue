<template>
	<view class="container no-scroll">
		<!-- #ifndef H5 -->
		<my-nav-bar title="承接详情" @action="navAction" @reSize="reSize" class="my-nav-bar" :clear-title="clearTitle" />
		<!-- #endif -->

		<uni-transition class="top-notify-tips" :duration="2000" :mode-class="modeClass" :styles="transformClass"
			:show="transShow">
			<uni-notice-bar :showClose="true" :show="isShowNotice" moreText="详情" :showGetMore="true"
				:style="'width:100%;margin-top:'+ tipsTop +'px;'" text="把此信息分享给好友，有免费金豆赠送哦！" @close="closeNotice"
				@getmore="getNoticeMore" />
		</uni-transition>

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			@scroll="scrollHandle">
			<info-banner :adv-pic="workOrderBannerImg" :img-urls="workOrder.img" style="height: 456rpx;" />

			<view class="bg-white padding-tb-sm padding-lr-lg">
				<view class="info-title text-xl padding-top-ssm">
					<text
						class="check-or-contact text-xs text-theme padding-lr-ssm theme-border radius-s margin-right-xs"
						v-if="workOrder.hasContacted">已联系</text>
					<text
						:class="(workOrder.hasContacted || workOrder.hasChecked)?'text-gray-1 text-bold':'text-black text-bold'">{{ workOrder.title }}</text>
				</view>
				<view class="text-ssm text-gray-1 margin-top-sm flex align-center justify-between">
					<view class="text-gray-1 text-ssm">发布时间：{{ workOrder.createTimeStamp  | formatDate }}</view>
					<view class="flex align-center justify-start">
						<view class="margin-right-sm" @click.stop="openStatistic(0)">查看数(
							<text class="text-theme">
								{{ workOrder.checkedCnt  | formatQuantity }}
							</text>
							)
						</view>
						<view @click.stop="openStatistic(1)">联系数(
							<text class="text-theme">
								{{ workOrder.contactedCnt  | formatQuantity }}
							</text>
							)
						</view>
					</view>
				</view>
			</view>

			<!--            详细信息开始-->
			<view class="bg-white margin-top-sm padding-bottom-sm padding-lr-lg">
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="text-gray-1">编号：</view>
					<text class="text-black margin-left-sm">{{ workOrder.no }}</text>
				</view>
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="text-gray-1">有效时间：</view>
					<text class="text-black margin-left-sm">{{ workOrder.usefulTimeStamp | formatDate }}</text>
				</view>

				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="text-gray-1">行业：</view>
					<text class="text-black margin-left-sm">{{ workOrder.industry }}</text>
				</view>
			</view>
			<!--            详细信息结束-->

			<!--            联系说明开始-->
			<view class="bg-white margin-top-sm text-df padding-tb padding-lr-lg"
				v-if="!!workOrder.desc || workOrder.promptInfo">
				<view class="text-gray-5 text-sm text-bold margin-top-sm" v-if="!!workOrder.desc">备注</view>
				<view class="margin-top-sm" v-show="!!workOrder.desc">
					<text>{{ workOrder.desc }}</text>
				</view>
				<view class="margin-top-sm">
					<text>{{ workOrder.promptInfo }}</text>
				</view>
			</view>
			<!--            联系说明结束-->


			<!--            用户信息开始-->
			<view class="bg-white padding margin-top-sm">
				<user-bar-normal :user="workOrder.userDetailsInfo" @onCall="phoneClick" :userDetailOn="true"
					:statisticsOn="true" />
			</view>
			<!--            用户信息结束-->

			<!--  图片展示  开始-->
			<view class="margin-top-ssm" style="width: 100%;" v-if="workOrder.img.length>0">
				<view class="padding-tb-ssm padding-lr-sm" v-for="(itemPhoto,indexPhotos) in workOrder.img"
					:key="indexPhotos">
					<image style="width: 100%" :src="itemPhoto" mode="widthFix" />
				</view>
			</view>
			<!--  图片展示  结束-->

			<!--        猜你喜欢开始-->
			<view class="bg-white margin-tb-sm padding-tb padding-lr-lg" v-if="isShowLike">
				<view class="text-lg text-black text-bold margin-bottom">{{ likeTitle }}</view>
				<view class="flex">
					<view class="flex-sub" v-for="(item,index) in guessLikeList" :key="index"
						@click.stop="goToWorkOrderDetail(item.id)">
						<view class="radius-s" style="width: 210rpx;height: 210rpx;">
							<image style="width: 210rpx;height: 210rpx;border-radius: 8rpx;"
								:src="(!item.img || item.img.length === 0)?workOrderThumb:item.img[0]" />
						</view>
						<view class="like-list-title text-gray-5 text-sm">{{ item.title }}</view>
					</view>
				</view>
			</view>
			<!--        猜你喜欢结束-->

			<view class="blank" v-if="isShowUserOperationButton || isShowMyOperationButton"></view>
		</scroll-view>
		<!--        底部按钮开始-->
		<view class="gray-border-top bg-white flex align-center justify-start padding-top-xs"
			:class="!!safeAreaTop?'':'padding-bottom-xs'" v-if="isShowUserOperationButton || isShowMyOperationButton"
			:style="'width:100%;position:fixed;left:0;bottom:'+safeAreaTop+'px;min-height:92rpx'">
			<view class="flex-grow padding-lr-sm flex align-center justify-between" v-if="isShowUserOperationButton">
				<view class="flex align-center justify-start">
					<!-- #ifdef APP-PLUS -->
					<view class="flex align-center justify-start text-df margin-left-ssm margin-right-xs"
						@click="toShare">
						<image style="width:38rpx;height:38rpx;" class="margin-right-xs"
							:src="imgUrl+'/ic_share.png'" />
						<view class="text-ssm margin-top-xss text-black">分享</view>
					</view>
					<!-- #endif -->

					<view class="flex align-center justify-start text-df margin-left-ssm margin-right-xs"
						@click="makeFavorite">
						<image class="margin-right-xs" style="width:38rpx;height:38rpx;"
							:src="workOrder.hasMarked?(imgUrl+'/collected.png'):(imgUrl+'/collection.png')" />
						<view class="text-ssm margin-top-xss" :class="workOrder.hasMarked?'text-theme':'text-black'">收藏
						</view>
					</view>
					<view class="flex align-center justify-start text-df margin-left-ssm margin-right-xs"
						@click="goToComplaint" v-if="workOrder.userId!==userData.id">
						<image class="margin-right-xs" style="width:40rpx;height:40rpx;"
							:src="imgUrl+'/mall/complaint.png'" />
						<view class="text-ssm margin-top-xss text-black">投诉</view>
					</view>
				</view>
				<view class="flex align-center justify-end">
					<view class="text-center text-normal color-white padding-tb-ssm padding-lr-lg radius-xl"
						style="min-width: 100rpx;background: linear-gradient(to right, #ff6d00, #fb5318);"
						@click="callPhone">打电话</view>
				</view>
			</view>

			<view v-if="isShowMyOperationButton" class="gray-border-top bg-white flex justify-end align-center"
				style="width: 100%;">
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini"
					v-if="workOrder.verifyStatus ===1 || workOrder.verifyStatus === 2 || workOrder.verifyStatus === 3"
					plain @click="toEdit(workOrder.id,0)">编辑
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="workOrder.verifyStatus ===2" plain @click="toReason(workOrder.id)">原因
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="workOrder.verifyStatus ===3" plain @click="toStick(workOrder)">置顶
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="workOrder.verifyStatus ===4" plain @click="toEdit(workOrder.id,1)">重发
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" plain @click="toContactList(workOrder.id)">联系记录
				</button>
			</view>
		</view>
		<!--        底部按钮结束-->

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5  -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" v-show="isShowFab"></uni-fab>
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->

		<!--        最新联系-->
		<view v-show="isShowStatistic">
			<beat-panel v-if="workOrder && workOrder.id" :node-id="workOrder.id" :tab-index="tabIndex" :type="1"
				@close="closeStatistic" />
		</view>

		<uni-popup class="notice_popup" ref="popup1" type="center" :animation="true">
			<share-rule-panel />
		</uni-popup>
	</view>

</template>

<script>
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif

	import {
		imgUrl,
		active
	} from "@/utils/config";
	import uniNoticeBar from "@/components/uni-notice-bar/uni-notice-bar";
	import uniTransition from "@/components/uni-transition/uni-transition";
	import uniPopup from "@/components/uni-popup/uni-popup";
	import infoBanner from "@/pagesNew/components/info-banner";
	import beatPanel from "@/pagesNew/components/beat-panel";
	import shareRulePanel from "@/pagesNew/components/share-rule-panel";
	import {
		calculateMath,
		formatTime,
		priceTranslate,
	} from "@/utils/myUtil";
	import {
		addMarkWorkOrder,
		cancelMarkWorkOrder,
		contactWorkOrder,
		createCheckWorkOrder,
		getWorkOrderDetailsByIdAnon,
		guessULikeWorkOrder,
		getFailureReasonWorkOrder,
	} from "@/api/workinfo";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	// #ifdef APP-PLUS
	import UniShare from '@/components/uni-share/js_sdk/uni-share.js';
	import {
		getInfoPageShareConfigApp
	} from '@/api/wx_api.js';
	const uniShare = new UniShare();
	// #endif

	export default {
		name: "workOrderDetail",
		components: {
			// #ifdef H5
			UniFab,
			// #endif
			uniPopup,
			uniNoticeBar,
			uniTransition,
			UserBarNormal,
			infoBanner,
			beatPanel,
			shareRulePanel,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				clearTitle: true,

				transShow: false,
				modeClass: ['fade', 'slide-top'],
				transformClass: {
					'position': 'fixed',
					'bottom': 0,
					'top': 0,
					'left': 0,
					'right': 0,
					'display': 'flex',
				},

				isShowStatistic: false,
				isShowNotice: false,

				isShowLike: true,
				isShowUserOperationButton: true,
				isShowMyOperationButton: false,

				tabIndex: '',

				workOrderBannerImg: '', //活信息详情默认图
				workOrderThumb: null, //承接列表默认图

				workOrder: {
					img: [],
					userDetailsInfo: {
						id: null,
						avatar: '',
					},
				},
				guessLikeList: [],
				likeTitle: '猜您喜欢',

				token: null,
				userData: {},

				isMarking: false,

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
					iconPath: '/static/images/more.png',
					selectedIconPath: '/static/images/more.png',
					text: '更多',
					active: false
				}],
				isShowFab: false, //浮层是否显示
				fabMenuPopped: false,

				shareRuleList: [],

				infoOwner: null, //信息发布者ID
				infoSharer: null, //信息分享者的ID

				isLoading: false,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
				tipsTop: 0,

				safeAreaTop: 0,
			}
		},
		props: {
			nodeId: {
				type: [String, Number],
				default: null,
			},
			fromAdmin: { //是否从个人中心到该页面
				type: [String, Number],
				default: 0,
			},
			directOpen: {
				type: [String, Number],
				default: '',
			}
		},
		watch: {
			nodeId: {
				handler(newVal, oldVal) {
					if (!!newVal && newVal != oldVal) {
						this.workOrder.id = newVal;
						this.tabIndex = '';
						this.initData();
					}
				},
				immediate: true,
			},
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					let windowInfo = uni.getWindowInfo();
					this.safeAreaTop = windowInfo.safeAreaInsets.bottom;
					this.listHeight = windowInfo.safeArea.bottom;
					this.tipsTop = newVal + 40;
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
				return formatTime(time);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		created() {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			this.workOrder.id = this.nodeId;

			this.initAnimation();

			this.isShowLike = !this.fromAdmin && this.guessLikeList && this.guessLikeList.length > 0;

			this.isShowFab = !!this.directOpen;
		},
		methods: {
			navAction(e) {
				if (e.action === 'back') {
					if (!!this.directOpen) {
						uni.reLaunch({
							url: '/pages/index/index',
						})
					} else {
						uni.navigateBack({
							delta: 1 // 返回的页面数
						});
					}
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},
			initAnimation() {
				if (!this.directOpen && !this.fromAdmin) {
					let tipShareLastShowTime = uni.getStorageSync("tipShareLastShowTime");
					if (!tipShareLastShowTime || (new Date().getTime() - tipShareLastShowTime) > 2 * 60 * 60 *
						1000) { //超过2小时
						let tipShareForceCloseTime = uni.getStorageSync("tipShareForceCloseTime");
						if (!tipShareForceCloseTime || (new Date().getTime() - tipShareForceCloseTime) > 24 * 60 * 60 *
							1000) {
							uni.setStorageSync("tipShareLastShowTime", new Date().getTime());
							this.isShowNotice = true
							this.aniHandle();
						}
					}
				}
			},
			aniHandle() {
				this.transShow = true;
				setTimeout(() => {
					this.transShow = false;
				}, 5000)
			},
			//关闭分享信息显示
			closeNotice() {
				this.isShowNotice = false
				uni.setStorageSync('tipShareForceCloseTime', new Date().getTime())
			},
			//点击详情
			getNoticeMore() {
				this.$refs.popup1.open();
			},
			initData() {
				let defaultResource = uni.getStorageSync("defaultResource");
				this.workOrderThumb = defaultResource[3].resourceUrl[0];
				this.workOrderBannerImg = defaultResource[1].resourceUrl[0];

				if (!!this.directOpen || this.fromAdmin) { //分享或者通知进入页面，不需要登录
					this.getWorkOrderByIdAnon();
				} else {
					this.checkWorkOrder()
				}
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
			//置顶申请
			toStick(item) {
				if (item.address === '不限') {
					uni.showToast({
						title: "该地区不可置顶",
						icon: "none",
						duration: 2000
					})
					return
				}
				uni.navigateTo({
					url: '/pagesNew/stick/stickList?id=' + item.id + '&type=1',
				})
			},

			closeStatistic() {
				this.isShowStatistic = false;
			},
			openStatistic(index) {
				this.tabIndex = index + '';
				this.isShowStatistic = true;
			},
			//查看承接详情
			goToWorkOrderDetail(id) {
				if (!this.token) {
					this.toLogin()
				} else {
					uni.navigateTo({
						url: '/pagesNew/details/workDetails?id=' + id,
					})
				}
			},

			//跳转到信息编辑页面
			toEdit(id, type) {
				uni.navigateTo({
					url: '/pagesNew/dowork/dowork?id=' + id + '&renew=' + type,
				})
			},
			//跳转到联系记录页面
			toContactList(id) {
				uni.navigateTo({
					url: '/pagesPersonal/contacted/contactedList?id=' + id + '&type=1'
				})
			},
			//获取承接失败原因
			toReason(id) {
				let paramsData = {
					workInfoId: id
				}
				getFailureReasonWorkOrder(paramsData).then(res => {
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

			//根据承接id获取详情
			checkWorkOrder() {
				let paramsData = {
					id: this.workOrder.id,
				}
				let self = this;
				createCheckWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						self.workOrderHandle(res);
					}
				});
			},

			//根据id获取承接信息详情,匿名获取，主要用于分享后被点击打开
			getWorkOrderByIdAnon() {
				let paramsData = {
					id: this.workOrder.id,
				}
				let self = this;
				getWorkOrderDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.workOrderHandle(res);
					}
				}).catch(() => {
					uni.showToast({
						title: '承接信息已下架！',
						icon: 'none',
						duration: 3000,
					})
				});
			},

			workOrderHandle(res) {
				let workOrder = res.data;
				if (workOrder.verifyStatus !== 3 && !this.fromAdmin) {
					uni.showToast({
						title: '此信息未生效或已失效！',
						icon: "none",
						duration: 3000
					})
					setTimeout(() => {
						if (!this.directOpen) {
							uni.navigateBack({
								delta: 1
							});
						} else {
							uni.reLaunch({
								url: '/pages/index/index'
							})
						}
					}, 3000)
				} else {
					if (!!workOrder.img) {
						workOrder.img = JSON.parse(workOrder.img);
					} else {
						workOrder.img = [];
					}

					if (workOrder.userId === this.userData.id) {
						this.isShowMyOperationButton = !!this.fromAdmin;
						this.isShowUserOperationButton = false;
					} else {
						let adminToken = uni.getStorageSync("adminToken");
						if (adminToken) {
							this.isShowUserOperationButton = false;
						} else {
							this.isShowUserOperationButton = true;
						}
						this.isShowMyOperationButton = false;
					}

					if (!!workOrder.promptInfo) {
						workOrder.promptInfo = workOrder.promptInfo.replace(/\\r\\n/g, "\n");
					} else {
						workOrder.promptInfo = '';
					}

					this.workOrder = workOrder;

					if (!!this.directOpen) { //由点击分享信息而来
						// #ifdef H5
						this.isShowFab = true
						// #endif
					}

					//获取猜你喜欢数据
					if (!!workOrder.industry && !this.fromAdmin) {
						this.guessULike(workOrder.industry);
					}
				}
			},
			//猜你喜欢数据
			guessULike(industry) {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					industry: industry,
					workinfoId: this.workOrder.id
				}
				let self = this;
				guessULikeWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						res.data.list.forEach(item => {
							if (!!item.img) {
								item.img = JSON.parse(item.img)
							} else {
								item.img = [];
							}
						});
						self.guessLikeList = res.data.list

						self.isShowLike = !self.fromAdmin && self.guessLikeList && self.guessLikeList.length > 0;
					}
					self.isLoading = false;
				}).catch(() => {
					self.isLoading = false;
				});
			},
			//打电话
			callPhone() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (this.workOrder.userId === this.userData.id) {
					uni.showToast({
						title: "不能联系自己发布的信息！",
						icon: "none",
						duration: 2000
					})
					return;
				}
				let paramsData = {
					id: this.workOrder.id
				}
				let self = this;
				contactWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						self.workOrder.hasContacted = true;
						uni.makePhoneCall({
							phoneNumber: res.data
						}).catch(e => {});
					}
				});
			},

			//收藏
			makeFavorite() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (this.isMarking) {
					return;
				}
				this.isMarking = true;
				let paramsData = {
					workInfoId: this.workOrder.id
				}
				let self = this;
				if (!this.workOrder.hasMarked) {
					addMarkWorkOrder(paramsData).then(res => {
						if (res.retCode === 0) {
							self.workOrder.hasMarked = true;
						}
						self.isMarking = false;
					}).catch(() => {
						self.isMarking = false;
					});
				} else {
					cancelMarkWorkOrder(paramsData).then(res => {
						if (res.retCode === 0) {
							self.workOrder.hasMarked = false;
						}
						self.isMarking = false;
					}).catch(() => {
						self.isMarking = false;
					});
				}
			},
			goToComplaint() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pages/personal/newComplaint?id=' + this.workOrder.id + '&type=2&work=1'
				})
			},

			//悬浮按钮的操作
			trigger(e) {
				this.content[e.index].active = !e.item.active;
				if (e.index === 0) {
					uni.switchTab({
						url: '/pages/index/index'
					})
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
			phoneClick(event) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				this.callPhone();
			},
			scrollHandle(e) {
				// #ifndef H5 
				this.clearTitle = e.detail.scrollTop < 190;
				// #endif
			},
			// #ifdef APP-PLUS
			toShare() {
				let menu = [];
				let self = this;

				uni.getProvider({
					service: 'share',
					success: function(res) {
						if (res.provider.indexOf("weixin") > -1) {
							menu.push({
								"img": "/static/app-plus/sharemenu/wechatfriend.png",
								"text": "微信好友",
								"share": { //当前项的分享参数配置。可覆盖公共的配置如下：分享到微信小程序，配置了type=5
									"provider": "weixin",
									"scene": "WXSceneSession"
								}
							});
							menu.push({
								"img": "/static/app-plus/sharemenu/wechatmoments.png",
								"text": "微信朋友圈",
								"share": {
									"provider": "weixin",
									"scene": "WXSceneTimeline"
								}
							});
						}
						if (res.provider.indexOf("qq") > -1) {
							menu.push({
								"img": "/static/app-plus/sharemenu/qq.png",
								"text": "QQ",
								"share": {
									"provider": "qq"
								}
							})
						}

						if (menu.length === 0) {
							uni.showToast({
								title: '您的设备未安装微信或QQ',
								icon: 'none',
								duration: 2000,
							})
							return;
						}

						getInfoPageShareConfigApp({
							pageType: 1, // 0= 外发，1=承接 
							infoId: self.workOrder.id,
						}).then(res => {
							if (res.retCode === 0) {
								let result = res.data;
								uniShare.show({
									content: { //公共的分享参数配置  类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
										type: 5, //分享到小程序
										miniProgram: {
											id: "gh_fff781253752",
											path: result.path,
											type: 0,
											webUrl: result.url,
										},
										imageUrl: result.icon,
										href: result.url,
										title: result.title,
										summary: '没活干就上云加工',
									},
									menus: menu,
									cancelText: "取消分享",
								}, e => { //callback
									console.log(e);
								})
							}
						});
					},
				});
			}
			// #endif
		},
	}
</script>

<style scoped lang="scss">
	@import url('@/static/css/noticeBar.css');
	@import url('@/static/css/fab.css');

	.info-title {
		line-height: 1.5;
		display: -webkit-box;
		text-overflow: ellipsis;
		word-wrap: break-word;
		white-space: normal !important;
		-webkit-box-orient: vertical;

		.check-or-contact {
			line-height: 26rpx;
			position: relative;
			top: -2rpx;
		}
	}

	.like-list-title {
		padding-top: 6rpx;
		height: 72rpx;
		overflow: hidden;
		display: -webkit-box;
		text-overflow: ellipsis;
		word-wrap: break-word;
		white-space: normal !important;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}


	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .popup_contacted ::v-deep .uni-popup__wrapper-box {
		height: 600rpx;
		width: 640rpx;
		background: #fff;
		text-align: center;
		border-radius: 20rpx;
		overflow: auto;
	}

	.blank {
		height: 120rpx;
	}

	::v-deep .uni-scroll-view-content {
		/* #ifdef H5 */
		height: auto;
		/* #endif */
	}
</style>