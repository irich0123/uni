<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商品详情" @action="navAction" @reSize="reSize" :clear-title="clearTitle" class="my-nav-bar"/>
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			@scroll="scrollHandle">
			<info-banner :img-urls="commodity.photos" style="height:456rpx" />

			<view>
				<!--            用户信息开始-->
				<view class="bg-white padding margin-top-sm">
					<user-bar-normal :user="commodity.userDetailsInfo" @onCall="phoneClick" :user-booth-on="true" />
				</view>
				<!--            用户信息结束-->

				<view class="bg-white padding-tb-sm padding-lr-lg">
					<view class="info-title text-xl text-bold">
						{{ commodity.title }}
					</view>
					<view class="text-ssm text-gray-1 margin-top-sm flex align-center justify-between">
						<view class="text-gray-1 text-ssm">发布时间：{{ commodity.createTime | formatDate }}</view>
						<view class="flex align-center justify-start">
							<view class="text-ssm text-gray-1">有效期：{{ commodity.endShowTime | formatDate }}</view>
						</view>
					</view>
				</view>
				<view class="bg-white padding-lr-lg">
					<view class="flex gray-border-top padding-tb-sm">
						<view class="flex-sub text-left">
							<view class="text-gray-5 text-ssm">
								<text>行业：</text>
								<text class="text-black">{{ commodity.industryName }}</text>
							</view>
						</view>
						<view class="flex-sub text-left">
							<view class="text-gray-5 text-ssm">
								<text>品类：</text>
								<text class="text-black">{{ commodity.commodityTypeName }}</text>
							</view>
						</view>
						<view class="flex-sub text-left">
							<view class="text-gray-5 text-ssm">
								<text>性质：</text>
								<text class="text-black">{{ commodity.commodityClassName }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="bg-white margin-top-sm padding-tb padding-lr-lg text-df">
					<view class="flex align-start justify-start text-df padding-top padding-bottom-xs">
						<view class="flex-sub flex align-start justify-between">
							<text class="text-gray-4">销售方式：</text>
							<!-- saleType` smallint(6) NOT NULL DEFAULT '0' COMMENT '0=整批出售 1=分批出售 2=零售',-->
							<text class="text-black margin-right-sm" v-if="commodity.saleType === 0">整单</text>
							<text class="text-black margin-right-sm" v-if="commodity.saleType === 1">批发</text>
							<text class="text-black margin-right-sm" v-if="commodity.saleType === 2">零售</text>
						</view>
						<view class="flex-sub flex align-start justify-between">
							<view class="text-gray-4">库存数量：</view>
							<view class="text-black">{{ commodity.qtyInStock }}
								<span class="padding-left-xs">{{ commodity.unit }}</span>
							</view>
						</view>
					</view>
					<view v-if="commodity.saleType === 0">
						<view class="flex align-start justify-start text-df padding-top padding-bottom-xs">
							<view class="flex-sub flex align-start justify-between">
								<view class="text-gray-4">起售数量：</view>
								<view class="text-black margin-right-sm"
									v-if="!!commodity.unitPriceBreakdown && commodity.unitPriceBreakdown.length>0">
									{{ commodity.unitPriceBreakdown[0].n }}
									<span class="padding-left-xs">{{ commodity.unit }}</span>
								</view>
								<view class="text-black margin-right-sm" v-else>
									{{ commodity.qtyInStock | formatQuantity }}
									<span class="padding-left-xs">{{ commodity.unit }}</span>
								</view>
							</view>
							<view class="flex-sub flex align-start justify-between">
								<view class="text-gray-4">
									<text v-show="commodity.isPriceNegotiable" class="theme-border-bottom">可议</text>
									单价：
								</view>
								<view class="text-black">{{ commodity.unitPriceMin | formatPrice }}
									<span class="padding-left-xs">元/{{ commodity.unit }}</span>
								</view>
							</view>
						</view>
						<view class="flex align-start justify-start text-df padding-top padding-bottom-xs">
							<view class="text-gray-4">货值：</view>
							<view class="text-black">{{ commodity.totalPrice | formatPrice }}
								<span class="padding-left-xs">元</span>
							</view>
						</view>
					</view>

					<view v-if="commodity.saleType !== 0 && commodity.unitPriceBreakdown">
						<view v-if="commodity.unitPriceBreakdown.length < 2">
							<view class="flex align-start justify-start text-df padding-top padding-bottom-xs"
								v-for="(item1,index1) in commodity.unitPriceBreakdown" :key="index1">
								<view class="flex-sub flex align-start justify-between">
									<view class="text-gray-4">起售数量：</view>
									<view class="text-black margin-right-sm">{{ item1.n  | formatQuantity }}
										<span class="padding-left-xs">{{ commodity.unit }}</span>
									</view>
								</view>
								<view class="flex-sub flex align-start justify-between">
									<view class="text-gray-4">
										<span class="theme-border-bottom" v-if="commodity.isPriceNegotiable">可议</span>
										单价：
									</view>
									<view class="text-black">{{ item1.p | formatPrice }}<span
											class="padding-left-xs">元/{{ commodity.unit }}</span></view>
								</view>
							</view>
						</view>
						<view v-if="commodity.unitPriceBreakdown.length >= 2">
							<view class="flex align-start justify-start text-df padding-top padding-bottom-xs"
								v-for="(item2,index2) in commodity.unitPriceBreakdown" :key="index2">
								<view class="flex-sub flex align-start justify-between">
									<text class="text-gray-4">
										{{ item2.n | formatQuantity }}
										<span class="padding-left-xs">{{ commodity.unit }}以上</span>
									</text>
								</view>
								<view class="flex-sub flex align-start justify-between">
									<text class="text-gray-4">
										{{ item2.p | formatPrice }}
										<span class="padding-left-xs">元/{{ commodity.unit }}</span>
									</text>
								</view>
							</view>
						</view>
					</view>

					<view class="flex align-start justify-start text-df padding-top padding-bottom-xs">
						<text class="text-gray-4">商品编号：</text>
						<text class="text-black">{{ commodity.identifier }}</text>
					</view>
				</view>

				<view class="bg-white margin-top-sm padding-tb padding-lr-lg text-df">
					<view class="flex align-start justify-between text-df padding-top padding-bottom-xs">
						<view class="text-gray-4">发货地：</view>
						<view class="text-black">{{ commodity.shortAddress }}</view>
					</view>
					<view class="flex align-start justify-between text-df padding-top padding-bottom-xs">
						<view class="text-gray-4">承运商：</view>
						<view class="text-black">{{ commodity.carrierName }}</view>
					</view>
					<view class="flex align-start justify-between text-df padding-top padding-bottom-xs">
						<view class="text-gray-4">运费：</view>
						<view class="text-black"
							v-if="commodity.shippingCost === 0 && !commodity.isPrepaidShippingCost"> 免
						</view>
						<view class="text-black" v-else>{{ commodity.shippingCost | formatPrice }}<span
								class="padding-left-xs">元</span></view>
					</view>
					<view class="flex align-start justify-start text-df padding-top padding-bottom-xs">
						<view class="flex-sub flex align-start justify-between">
							<view class="text-gray-4">运费支付：</view>
							<view class="text-black margin-right-sm" v-if="!commodity.isPrepaidShippingCost">到付</view>
							<view class="text-black margin-right-sm" v-if="commodity.isPrepaidShippingCost">预付</view>
						</view>
						<view class="flex-sub flex align-start justify-between">
							<view class="text-gray-4">付款方：</view>
							<view class="text-black" v-if="commodity.isShippingCostIncluded">卖家承担</view>
							<view class="text-black" v-if="!commodity.isShippingCostIncluded">买家承担</view>
						</view>
					</view>
				</view>

				<!--            联系说明开始-->
				<view class="bg-white margin-top-sm padding-tb padding-lr-lg text-df"
					v-if="commodity.description || commodity.promptInfo">
					<view class="text-lg text-bold text-gray-5 margin-bottom-sm">详情及说明</view>
					<view class="text-df" v-if="!!commodity.description">
						{{ commodity.description }}
					</view>
					<view class="text-df margin-top-sm">
						{{ commodity.promptInfo }}
					</view>
				</view>
				<!--            联系说明结束-->

			</view>

			<view class="margin-top-ssm" v-if="!!commodity.photos && commodity.photos.length>0">
				<view class="padding-tb-ssm" v-for="(itemPhotos,indexPhotos) in commodity.photos" :key="indexPhotos">
					<image style="width:100%;" :src="itemPhotos" mode="widthFix"></image>
				</view>
			</view>

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
						@click.stop="makeFavorite">
						<image class="margin-right-xs" style="width:38rpx;height:38rpx;"
							:src="commodity.marked?(imgUrl+'/collected.png'):(imgUrl+'/collection.png')" />
						<view class="text-ssm margin-top-xss" :class="commodity.marked?'text-theme':'text-black'">收藏
						</view>
					</view>
					<view class="flex align-center justify-start text-df margin-left-ssm margin-right-xs"
						@click.stop="goToComplaint">
						<image class="complaint-image margin-right-xs" style="width:40rpx;height:40rpx;"
							:src="imgUrl+'/mall/complaint.png'" />
						<view class="text-ssm margin-top-xss text-black">投诉</view>
					</view>
				</view>
				<view class="flex align-center justify-end">
					<view class="text-center text-normal color-white padding-tb-ssm padding-left padding-right-sm"
						style="min-width: 90rpx;background: linear-gradient(to right, #ff8d00, #ff6d00);border-radius: 60rpx 0 0 60rpx;"
						@click="callPhone">打电话</view>

					<view class="text-center text-normal color-white padding-tb-ssm padding-left-sm padding-right"
						style="min-width: 80rpx;background: linear-gradient(to right, #ff6d00, #fb5318);border-radius: 0 60rpx 60rpx 0;"
						@click="goToBuyCommodity">购买</view>
				</view>
			</view>

			<view v-if="isShowMyOperationButton"
				class="bg-gray-1 flex justify-end align-center text-black text-sm padding-right-sm"
				style="width: 100%;">
				<!--  0--待审核。1---待付款，2---展示中，3---审核失败，4---手动下架，5---已过期，6---已删除，7---已失效，8---待退款，13---自动下架-->
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 0 || commodity.status === 3 || commodity.status === 4 || commodity.status ===1"
					@click.stop="goToEditMallDetails(commodity.id)">编辑
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 0" @click.stop="commodityCancelAudit(commodity.id)">取消
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 3" @click.stop="getAuditFailureReason(commodity.id)">原因
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 3" @click.stop="commodityPostRefund(commodity.id)">退款
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 2 " @click.stop="commodityPullOffOrPutOnShelves(commodity.id,0)">下架
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 4" @click.stop="commodityPullOffOrPutOnShelves(commodity.id,1)">上架
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 2" @click.stop="commodityExtend(commodity.id)">展期
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 5 ||commodity.status === 7 || commodity.status === 13"
					@click.stop="renewCommodity(commodity.id,1)">重发
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 5 ||commodity.status === 7" @click.stop="deleteCommodity(commodity.id)">
					删除
				</view>
				<view class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1"
					v-if="commodity.status === 1" @click.stop="getPaymentForCommodityPost(commodity.id)">展示支付
				</view>
			</view>

		</view>
		<!--        底部按钮结束-->

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5  -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" v-show="isShowFab"></uni-fab>
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->

	</view>
</template>

<script>
	// #ifdef H5 
	import UniFab from "@/components/uni-fab/uni-fab";
	// #endif
	import {
		calculateMath,
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		cancelCommodity,
		commodityPostRefund,
		deleteCommodity,
		getCommodityById,
		getFailureReasonCommodity,
		getPrivilegeInfo,
		onOffCommodity,
		setCommodityMarkedOff,
		setCommodityMarkedOn
	} from "@/api/mall";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import infoBanner from "@/pagesNew/components/info-banner";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		h5WebUrl,
		imgUrl,
		active
	} from '@/utils/config';

	// #ifdef APP-PLUS
	import UniShare from '@/components/uni-share/js_sdk/uni-share.js';
	const uniShare = new UniShare();
	// #endif

	export default {
		name: "commodityDetail",
		components: {
			UserBarNormal,
			infoBanner,
			// #ifdef H5
			UniFab,
			// #endif
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				clearTitle: true,

				isShowUserOperationButton: true, //从列表页跳转到详情页显示的按钮
				isShowMyOperationButton: false, //从我的发布中跳转到详情页显示的按钮

				commodity: {
					photos: [],
					userDetailsInfo: {},
					unitPriceBreakdown: [],
				},
				token: null,
				userData: {},

				isMarking: false,

				id: null,
				industry: null,

				horizontal: 'left',
				vertical: 'top',
				direction: 'horizontal',
				pattern: {
					color: '#fb5318',
					backgroundColor: '#ffffff',
					selectedColor: '#fb5318',
					buttonColor: "#ff510099"
				},
				content: [{
						iconPath: imgUrl + '/personal/ic_cart_hollow.png',
						selectedIconPath: imgUrl + '/personal/ic_cart_hollow.png',
						text: '购物车',
						active: false
					},
					{
						iconPath: imgUrl + '/personal/ic_portrait_hollow.png',
						selectedIconPath: imgUrl + '/personal/ic_portrait_hollow.png',
						text: '我的',
						active: false,
					},
					{
						iconPath: '/static/images/more.png',
						selectedIconPath: '/static/images/more.png',
						text: '查看更多',
						active: false,
					}
				],

				isShowFab: false, //浮层是否显示
				fabMenuPopped: false,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

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
						this.id = newVal;
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
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		created() {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			// #ifdef H5
			this.listHeight = uni.getWindowInfo().safeArea.height;
			// #endif

			this.id = this.nodeId;

			this.isShowLike = !this.fromAdmin
			this.isShowFab = !!this.directOpen;
		},
		methods: {
			navAction(e) {
				if (e.action === 'back') {
					let pages = getCurrentPages();
					if (pages.length < 2) {
						uni.switchTab({
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
			initData() {
				this.getCommodityDetailsById();
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
			//根据商品id获取商品详情信息
			getCommodityDetailsById() {
				let paramsData = {
					id: this.id,
				}
				let self = this;
				getCommodityById(paramsData).then(res => {
					if (res.retCode === 0) {
						let commodity = res.data;

						if (self.fromAdmin) {
							uni.setNavigationBarTitle({
								title: commodity.statusName
							});
						}

						if (commodity.sellerId === self.userData.id) {
							self.isShowUserOperationButton = false;
							self.isShowMyOperationButton = !!self.fromAdmin;
						} else {
							self.isShowUserOperationButton = true;
							self.isShowMyOperationButton = false;
						}

						self.industry = commodity.industryName

						commodity.totalPrice = parseFloat(commodity.unitPriceMin) * parseFloat(commodity
							.qtyInStock);

						if (!!commodity.photos) {
							commodity.photos = JSON.parse(commodity.photos);
						} else {
							commodity.photos = [];
						}

						if (commodity.unitPriceBreakdown) {
							commodity.unitPriceBreakdown = JSON.parse(commodity.unitPriceBreakdown)
						}

						if (!!commodity.promptInfo) {
							commodity.promptInfo = commodity.promptInfo.replace("\r\n", "\n")
						} else {
							commodity.promptInfo = '';
						}

						self.commodity = commodity
					}
				}).catch(() => {
					uni.showToast({
						title: '商品已下架！',
						icon: 'none',
						duration: 3000,
					})
				});
			},

			//跳转到商品购买页面
			goToBuyCommodity() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (this.commodity.sellerId === this.userData.id) {
					uni.showToast({
						title: '不能自己购买自己发布的商品！',
						icon: "none",
						duration: 2000
					})
					return;
				}
				uni.navigateTo({
					url: '../domall/buyCommodity?id=' + this.commodity.id
				})
			},
			//跳转到商品发布支付页面
			getPaymentForCommodityPost(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '../../pagesPersonal/pay/payCommodity?id=' + id
				})
			},
			//商品重发
			renewCommodity(id, type) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesNew/domall/postCommodity?id=' + id + '&renew=' + type
				})
			},
			//删除
			deleteCommodity(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					id: id,
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '确认删除该商品吗？删除后，将不会在列表显示！',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							deleteCommodity(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '商品删除成功！',
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										self.getCommodityDetailsById()
									}, 1500)
								}
							});
						}
					}
				})
			},
			//跳转到商品展期页面
			commodityExtend(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesPersonal/myMall/commodityExtend?id=' + id
				})
			},
			//商品下架/上架
			commodityPullOffOrPutOnShelves(id, status) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let content;
				let title;
				if (status === 0) {
					content = '确定要把此商品下架吗？'
					title = '商品下架成功'
				} else {
					content = '确定要把此商品上架吗？'
					title = '商品上架成功'
				}
				let paramsData = {
					id: id,
					commodityShelfStatus: status
				}

				let self = this
				uni.showModal({
					title: '小二提醒',
					content: content,
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							onOffCommodity(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: title,
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										self.getCommodityDetailsById()
									}, 1500)
								}
							});
						}
					}
				})
			},
			//商品编辑
			goToEditMallDetails(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesNew/domall/postCommodity?id=' + id
				})
			},
			//取消审核
			commodityCancelAudit(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					id: id
				}
				let self = this
				uni.showModal({
					title: '小二提醒',
					content: '确定要取消此商品的发布吗？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							cancelCommodity(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '取消审核成功!',
										icon: "none",
										duration: 1500
									})
									setTimeout(() => {
										self.getCommodityDetailsById()
									}, 1500)
								}
							});
						}
					}
				})
			},
			//退款申请
			commodityPostRefund(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					id: id
				}
				uni.showModal({
					title: '小二提醒',
					content: '确定要退款吗？注意如果商品展示过，将不支持退款哦！',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							commodityPostRefund(paramsData).then(res => {
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
						}
					}
				})

			},
			//获取审核失败原因
			getAuditFailureReason(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					id: id
				}
				getFailureReasonCommodity(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showModal({
							title: '失败原因',
							content: res.data,
							showCancel: false,
							confirmText: '我知道了',
							confirmColor: '#fb5318',
							success: function(res1) {
								if (res1.confirm) {}
							}
						})
					}
				});
			},
			goToComplaint() {
				if (!this.token) {
					this.toLogin();
					return;
				}

				if (this.commodity.sellerId === this.userData.id) {
					uni.showToast({
						title: '不能投诉自己！',
						icon: "none",
						duration: 2000
					})
					return;
				}

				uni.navigateTo({
					url: '/pages/personal/newComplaint?id=' + this.id + '&type=3'
				})
			},

			//收藏
			makeFavorite() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (this.commodity.sellerId === this.userData.id) {
					uni.showToast({
						title: '无需收藏自己的商品！',
						icon: "none",
						duration: 2000
					})
					return;
				}
				if (this.isMarking) {
					return;
				}
				this.isMarking = true;
				let paramsData = {
					commodityId: this.id
				}
				let self = this;
				if (!this.commodity.marked) {
					setCommodityMarkedOn(paramsData).then(res => {
						if (res.retCode === 0) {
							self.commodity.marked = true;
						}
						self.isMarking = false;
					}).catch(() => {
						self.isMarking = false;
					});
				} else {
					setCommodityMarkedOff(paramsData).then(res => {
						if (res.retCode === 0) {
							self.commodity.marked = false;
						}
						self.isMarking = false;
					}).catch(() => {
						self.isMarking = false;
					});
				}
			},
			//打电话
			callPhone() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (this.commodity.sellerId === this.userData.id) {
					uni.showToast({
						title: '不能给自己打电话！',
						icon: "none",
						duration: 2000
					})
					return;
				}
				let self = this;
				//先检查该用户是否有尾货通卡
				let paramsData = {
					id: this.userData.id
				}
				getPrivilegeInfo(paramsData).then(res => {
					if (res.retCode === 0) {
						if (!res.data.isCallFree) {
							uni.showModal({
								title: '系统提示',
								content: '暂无尾货通卡，不能拨打电话，现在去购买吗？',
								showCancel: true,
								confirmText: '购买',
								confirmColor: '#fb5318',
								success: function(res1) {
									if (res1.confirm) {
										uni.navigateTo({
											url: '/pagesPersonal/pay/payBeanGoods',
										})
									}
								},
							})
							return
						}
						uni.makePhoneCall({
							phoneNumber: self.commodity.phone,
						}).catch(e => {});
					}
				});
			},
			trigger(e) {
				this.content[e.index].active = !e.item.active;
				if (e.index === 1) {
					if (!this.token) {
						this.toLogin();
						return;
					}
					uni.switchTab({
						url: '/pages/personal/personal'
					})
				} else if (e.index === 0) {
					if (!this.token) {
						this.toLogin();
						return;
					}
					uni.navigateTo({
						url: '/pagesPersonal/myMall/myCommodityBuyTransaction'
					})
				} else if (e.index === 2) {
					uni.switchTab({
						url: '/pages/mall/mall'
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
				if (this.commodity.sellerId === this.userData.id) {
					uni.showToast({
						title: '不能给自己打电话！',
						icon: "none",
						duration: 2000
					})
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
				if (!this.token) {
					this.toLogin();
					return;
				}

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

						let img = (self.commodity.photos.length === 0) ? (self.imgUrl + '/login/logo.png') :
							self.commodity.photos[
								0];
						uniShare.show({
							content: { //公共的分享参数配置  类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
								type: 0,
								href: h5WebUrl + 'pagesNew/details/mallDetails?id=' + self.commodity
									.id,
								title: self.commodity.title,
								summary: '尾货通一手库存尾货信息',
								imageUrl: img,
							},
							menus: menu,
							cancelText: "取消分享",
						}, e => { //callback
							console.log(e);
						})
					},
				});
			}
			// #endif

		},
	}
</script>

<style scoped lang="scss">
	@import '@/static/css/fab.css';

	.complaint-image {
		width: 40rpx;
		height: 40rpx;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.swiper {
			height: 456rpx;
			width: 100%;
		}

		.blank {
			height: 120rpx;
		}
	}

	::v-deep .uni-scroll-view-content {
		/* #ifdef H5 */
		height: auto;
		/* #endif */
	}
</style>