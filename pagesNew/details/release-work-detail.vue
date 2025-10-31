<template>
	<view class="container">
		<!-- #ifndef H5 -->
		<my-nav-bar title="外发详情" @action="navAction" @reSize="reSize" :clear-title="clearTitle" class="my-nav-bar" />
		<!-- #endif -->

		<uni-transition class="top-notify-tips" :duration="2000" :mode-class="modeClass" :styles="transformClass"
			:show="transShow">
			<uni-notice-bar :showClose="true" :show="isShowNotice" moreText="详情" :showGetMore="true"
				:style="'width:100%;margin-top:'+ tipsTop +'px;'" text="把此信息分享给好友，有免费金豆赠送哦！" @close="closeNotice"
				@getmore="getNoticeMore" />
		</uni-transition>

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			@scroll="scrollHandle">
			<info-banner :adv-pic="releaseWorkBannerImg" :img-urls="releaseWork.img" style="height: 456rpx;" />

			<view class="detail bg-white padding-tb-sm padding-lr-lg">
				<view class="info-title text-xl padding-top-ssm">
					<text
						class="check-or-contact text-ssm text-theme padding-lr-ssm theme-border radius-s margin-right-xs"
						v-if="releaseWork.hasContacted">已联系</text>
					<text
						:class="(releaseWork.hasContacted || releaseWork.hasChecked)?'text-gray-1 text-bold':'text-black text-bold'">{{ releaseWork.title }}</text>
				</view>
				<view class="text-ssm text-gray-1 margin-top-sm flex align-center justify-between">
					<view class="text-gray-1 text-ssm">发布时间：{{ releaseWork.createTimeStamp | formatDate }}</view>
					<view class="flex align-center justify-start">
						<view class="margin-right-sm" @click.stop="openStatistic(0)">查看数(
							<text class="text-theme">
								{{ releaseWork.checkedCnt | formatQuantity }}
							</text>
							)
						</view>
						<view @click.stop="openStatistic(1)">联系数(
							<text class="text-theme">
								{{ releaseWork.contactedCnt | formatQuantity }}
							</text>
							)
						</view>
					</view>
				</view>
			</view>

			<!--            详细信息开始-->
			<view class="bg-white margin-top-sm padding-bottom-sm padding-lr-lg">
				<view class="flex flex-wrap padding-tb gray-border-top gray-border-bottom"
					v-if="!!releaseWork.count || !!releaseWork.unitPrice || !!releaseWork.totalPrice">
					<view class="flex flex-direction justify-center align-center" style="width:33%"
						v-if="!!releaseWork.count">
						<view class="text-gray-5 text-ssm">数量</view>
						<view class="text-theme text-df padding-top-xss">
							{{ releaseWork.count | formatQuantity }}{{ releaseWork.unit }}
						</view>
					</view>

					<view class="flex flex-direction justify-center align-center" style="width:33%"
						v-if="!!releaseWork.unitPrice">
						<view class="text-gray-5 text-ssm">单价</view>
						<view class="text-theme text-df padding-top-xss">{{ releaseWork.unitPrice | formatPrice }}元
						</view>
					</view>

					<view class="flex flex-direction justify-center align-center" style="width:33%"
						v-show="!!releaseWork.totalPrice">
						<view class="text-gray-5 text-ssm">总价</view>
						<view class="text-theme text-df padding-top-xss">{{ releaseWork.totalPrice | formatPrice }}元
						</view>
					</view>
				</view>

				<view class="flex text-df padding-top padding-bottom-xs">
					<text class="text-gray-1">编号：</text>
					<text class="text-black margin-left-sm">{{ releaseWork.no }}</text>
				</view>
				<view class='flex text-df padding-top padding-bottom-xs'>
					<view class='flex-sub'>
						<text class='text-gray-1'>交货期:</text>
						<text class='text-black margin-left-sm'>
							{{ releaseWork.deliveryTimeStamp | formatDate }}
						</text>
					</view>
					<view class='flex-sub'>
						<text class='text-gray-1'>有效期:</text>
						<text class='text-black margin-left-sm'>{{ releaseWork.usefulTimeStamp | formatDate }}</text>
					</view>
				</view>

				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">行业：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.industry }}</text>
					</view>
					<view class="flex-sub">
						<text class="text-gray-1">类型：</text>
						<text class="text-black margin-left-sm">{{releaseWork.type | typeFilter(that)}}</text>
					</view>
				</view>

				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub" v-if="releaseWork.type !== 1">
						<text class="text-gray-1">保证金：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.depositRequire | formatPrice }}元</text>
					</view>
					<view class="flex-sub">
						<text class="text-gray-1">加工方式：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.workingWay }}</text>
					</view>
				</view>

				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">工厂地域要求：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.address }}</text>
					</view>
				</view>
			</view>
			<!--            详细信息结束-->

			<view class="bg-white padding-lr-lg" v-if="releaseWork.type === 3 && !!releaseWork.offerBeanPre">
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">最小接单数量：</text>
						<text class="text-black margin-left-sm">{{
                                releaseWork.offerBeanPre.count | formatQuantity
                            }}{{ releaseWork.unit }}
						</text>
					</view>
				</view>
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">是否打样：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.offerBeanPre.sampleWay }}</text>
					</view>
				</view>
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">验收标准：</text>
						<text class="text-black margin-left-sm" v-if="releaseWork.offerBeanPre.sampleWay === '无需样品'">
							{{ releaseWork.offerBeanPre.acceptanceDetails }}
						</text>
						<text class="text-black margin-left-sm" v-else>
							<text v-if="releaseWork.offerBeanPre.acceptanceType === '按样品'">
								{{
                                    releaseWork.offerBeanPre.acceptanceType
                                }}的{{ releaseWork.offerBeanPre.acceptanceDetails }}%
							</text>
							<text v-else>{{ releaseWork.offerBeanPre.acceptanceType }}</text>
						</text>
					</view>
				</view>
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">验收方式：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.offerBeanPre.acceptanceWay }}</text>
					</view>
				</view>
				<view class="flex text-df padding-top padding-bottom-xs">
					<view class="flex-sub">
						<text class="text-gray-1">结算：</text>
						<text class="text-black margin-left-sm">
							{{ releaseWork.offerBeanPre.settlementWay }}
							<text v-if="releaseWork.offerBeanPre.settlementWay === '账期'">
								{{ releaseWork.offerBeanPre.accountPeriod }}天
							</text>
						</text>
					</view>
					<view class="flex-sub">
						<text class="text-gray-1">大货运费：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.offerBeanPre.goodsFreightWay }}</text>
					</view>
				</view>
				<view class="flex text-df padding-top padding-bottom-xs"
					v-if="releaseWork.offerBeanPre.sampleWay !== '无需样品'">
					<view class="flex-sub">
						<text class="text-gray-1">样品运费：</text>
						<text class="text-black margin-left-sm">{{ releaseWork.offerBeanPre.sampleFreightWay }}</text>
					</view>
				</view>
			</view>

			<!--  联系说明开始-->
			<view class="bg-white margin-top-sm text-df padding-tb padding-lr-lg"
				v-if="!!releaseWork.desc || releaseWork.promptInfo">
				<view class="text-gray-5 text-sm text-bold margin-top-sm" v-if="!!releaseWork.desc">备注</view>
				<view class="margin-top-sm" v-if="!!releaseWork.desc">
					<text>{{ releaseWork.desc }}</text>
				</view>
				<view class="margin-top-sm" v-if="releaseWork.promptInfo">
					<text>{{ releaseWork.promptInfo }}</text>
				</view>
			</view>
			<!--   联系说明结束-->

			<view class="margin-lr-sm margin-top-sm" v-if="releaseWork.type !== 1 ">
				<view v-if="releaseWork.type === 2" class="flex">
					<view class="flex align-center justify-center margin-lr-xs radius-l bg-theme text-white text-df"
						style="height:88rpx; width:100%" v-if="releaseWork.userId === userData.id && fromAdmin"
						@click="goToOfferDetails(releaseWork.id)">查看报价
					</view>
					<view class="flex align-center justify-center margin-lr-xs radius-l bg-theme text-white text-df"
						style="height:88rpx; width:100%" v-if="releaseWork.userId !== userData.id && fromAdmin"
						@click="handleWorkOffer(releaseWork)">
						{{(releaseWork.offerList && releaseWork.offerList.length>0)?'修改报价':'去报价'}}
					</view>
				</view>
				<view v-if="releaseWork.type === 3 && releaseWork.userId !== userData.id" class="flex">
					<view class="flex align-center justify-center margin-lr-xs radius-l bg-theme text-white text-df"
						style="height:88rpx; width:100%" v-if="releaseWork.contractList.length>0"
						@click.stop="toTransaction(releaseWork)">已接单情况</view>
					<view class="flex align-center justify-center margin-lr-xs radius-l bg-theme text-white text-df"
						style="height:88rpx; width:100%" @click.stop="pickupTask(releaseWork)">
						{{releaseWork.contractList.length>0?'再接单':'接单'}}
					</view>
				</view>
			</view>

			<!--            用户信息开始-->
			<view class="bg-white padding margin-top-sm">
				<user-bar-normal :user="releaseWork.userDetailsInfo" @onCall="phoneClick" :userDetailOn="true"
					:statisticsOn="true" />
			</view>
			<!--            用户信息结束-->

			<!--  图片展示  开始-->
			<view class="margin-top-ssm" style="width: 100%;" v-if="releaseWork.img.length>0">
				<view class="padding-tb-ssm padding-lr-sm" v-for="(itemPhoto,indexPhotos) in releaseWork.img"
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
						@click="goToReleaseWorkDetail(item.id)">
						<view class="radius-s" style="width: 210rpx;height: 210rpx;">
							<image style="width: 210rpx;height: 210rpx;border-radius: 8rpx;"
								:src="(!item.img || item.img.length === 0)?releaseWorkThumb:item.img[0]" />
						</view>
						<view class="like-list-title text-gray-5 text-sm">{{ item.title }}</view>
					</view>
				</view>
			</view>

			<view class="bg-white margin-tb padding-lr-lg"
				v-if="!!releaseWork.offerList && releaseWork.type === 2 && isShowMyOperationButton">
				<view class="text-xl text-bold padding-tb">
					已参与的报价({{ offerCount }})
				</view>
				<view class="padding-bottom" @click.stop="goToOfferDetailsByPoster(releaseWork.id,itemOffer.id)"
					v-for="(itemOffer,indexOffer) in releaseWork.offerList" :key="indexOffer">
					<view class="padding-tb gray-border-top gray-border-bottom">
						<user-bar-normal :user="itemOffer.userDetailsInfo" :userDetailOn="true" :statisticsOn="true" />
					</view>
					<view class="padding-tb flex justify-between">
						<view class="text-lg">
							<view class="padding-bottom">
								数量：{{ itemOffer.count | formatQuantity }}{{ releaseWork.unit }}
							</view>
							<view class="padding-bottom">
								报价：{{ itemOffer.price | formatPrice }}元
								<text v-if="itemOffer.priceType === 1">/单价</text>
								<text v-if="itemOffer.priceType === 2">/总价</text>
							</view>
							<view class="padding-bottom">
								样品：{{ itemOffer.sampleWay }}
							</view>
							<view class="padding-bottom">
								发活方需冻结保证金：{{ itemOffer.depositRequire | formatPrice }}元
							</view>
							<view>
								交货日期：{{ itemOffer.deliveryTime | formatDate }}
							</view>
						</view>
						<image style="width:140rpx;height:140rpx;" v-if="itemOffer.sampleImg"
							:src="itemOffer.sampleImg[0]" />
					</view>

					<view>
						<!--   `status` int(1) NOT NULL DEFAULT '0' COMMENT '状态 0 已报价 1已接受 2已取消',-->
						<button v-if="itemOffer.status === 0 && !offerSigned" class="text-white bg-theme text-lg"
							@click.stop="goToSignContract(itemOffer.id,releaseWork.id)">与他签约
						</button>
						<button v-if="itemOffer.status === 1" class="text-gray-5 bg-theme text-lg">已签约 </button>
					</view>
				</view>

			</view>

			<view v-if="releaseWork.contractList && releaseWork.contractList.length>0">
				<view class="padding-lr-lg padding-top-ssm text-df text-bold">已成交（{{ contractCount }}）</view>
				<view v-for="(itemContract,indexContract) in releaseWork.contractList"
					@click.stop="goToContractByPoster(itemContract.id)" :key="indexContract">
					<view class="bg-white padding-lr-lg padding-tb-ssm flex margin-top-xs align-center justify-between">
						<view class="flex-twice gray-border-right margin-tb">
							<view class="text-df text-gray-5 padding-bottom">
								时间：{{ itemContract.updateTime | formatDate }}
							</view>
							<view class="text-df text-gray-5 padding-bottom">
								数量：{{ itemContract.count | formatQuantity }}{{ releaseWork.unit }}
							</view>
							<view class="text-lg text-black flex align-center justify-between">
								<view>
									{{ itemContract.secondPartUserName }}
								</view>
								<image class="margin-right" style="width:60rpx;height:60rpx;"
									:src="imgUrl+'/index/phone.png'"
									@click.stop="callPhoneContract(itemContract.secondPartUserMobile)" />
							</view>
						</view>
						<view class="flex-sub">
							<view class="text-ssm padding-lr-lg text-theme text-center">
								{{ itemContract.statusDesc }}
							</view>
						</view>
					</view>
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
						@click="makeFavorite">
						<image class="margin-right-xs" style="width:38rpx;height:38rpx;"
							:src="releaseWork.hasMarked?(imgUrl+'/collected.png'):(imgUrl+'/collection.png')" />
						<view class="text-ssm margin-top-xss" :class="releaseWork.hasMarked?'text-theme':'text-black'">
							收藏</view>
					</view>
					<view class="flex align-center justify-start text-df margin-left-ssm margin-right-xs"
						@click="goToComplaint" v-if="releaseWork.userId!==userData.id">
						<image class="margin-right-xs" style="width:40rpx;height:40rpx;"
							:src="imgUrl+'/mall/complaint.png'" />
						<view class="text-ssm margin-top-xss text-black">投诉</view>
					</view>
				</view>

				<view class="flex align-center justify-end">
					<view class="text-center text-normal color-white padding-tb-ssm padding-lr-lg radius-xl"
						style="min-width: 120rpx;background: linear-gradient(to right, #ff6d00, #fb5318);"
						@click="callPhone">打电话</view>
				</view>
			</view>

			<view v-if="isShowMyOperationButton" class="gray-border-top bg-white flex justify-end align-center"
				style="width: 100%;">
				<!--活信息状态 审核中(1), 已拒绝(2),已通过(3),已过期(4),已删除(5) 已确定报价(6),已下架(7)已完成(8);-->
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="releaseWork.verifyStatus ===4 || releaseWork.verifyStatus === 8" plain
					@click="toEdit(releaseWork.id,1)">重发
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini"
					v-if="releaseWork.verifyStatus ===1 || releaseWork.verifyStatus === 2 || releaseWork.verifyStatus === 3 || releaseWork.verifyStatus === 7"
					plain @click="toEdit(releaseWork.id,0)">编辑
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="releaseWork.verifyStatus ===2" plain @click="toReason(releaseWork.id)">原因
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="releaseWork.verifyStatus === 3" plain @click="offReleaseWork(releaseWork.id)">下架
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="releaseWork.verifyStatus ===3" plain @click="toStick(releaseWork)">置顶
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" v-if="releaseWork.verifyStatus ===7 " plain @click="onReleaseWork(releaseWork.id)">上架
				</button>
				<button class="bg-theme margin-lr-xs padding-tb-xss padding-lr-lg radius-xl no-border text-white"
					size="mini" plain @click="toContactList(releaseWork.id)">联系记录
				</button>
			</view>

		</view>
		<!--        底部按钮结束-->

		<!--        左侧悬浮按钮开始-->
		<!-- #ifdef H5 -->
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical"
			:direction="direction" @trigger="trigger" @fabClick="fabClick" v-show="isShowFab"></uni-fab>
		<!-- #endif  -->
		<!--       左侧悬浮按钮结束-->

		<!-- 提交信息 -->
		<uni-popup ref="dialogInput" type="dialog">
			<uni-popup-dialog-tip mode="input" title="小二提示" :value="tips" @close="dialogInputCancel"
				@confirm="dialogInputConfirm">
			</uni-popup-dialog-tip>
		</uni-popup>

		<!--        最新联系-->
		<view v-show="isShowStatistic">
			<beat-panel :node-id="releaseWork.id" :tab-index="tabIndex" :type="0" @close="closeStatistic" />
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
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTip from '@/components/uni-popup/uni-popup-dialog-tip.vue'
	import uniNoticeBar from '@/components/uni-notice-bar/uni-notice-bar.vue'
	import uniTransition from "@/components/uni-transition/uni-transition.vue"
	import infoBanner from "@/pagesNew/components/info-banner";
	import beatPanel from "@/pagesNew/components/beat-panel";
	import shareRulePanel from "@/pagesNew/components/share-rule-panel";
	import {
		confirmTaskWork,
		contactReleaseWork,
		createCheckReleaseWork,
		addMarkReleaseWork,
		cancelMarkReleaseWork,
		getReleaseWorkDetailsByIdAnon,
		getFailureReasonReleaseWork,
		offReleaseWork,
		onReleaseWork,
		guessULikeReleaseWork,
	} from "@/api/workinfo";
	import {
		calculateMath,
		formatTime,
		priceTranslate,
		parseActionConsume,
	} from "@/utils/myUtil";
	import wucTab from '@/components/wuc-tab/wuc-tab'
	import {
		imgUrl,
		active
	} from "@/utils/config";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	// #ifdef APP-PLUS
	import UniShare from '@/components/uni-share/js_sdk/uni-share.js';
	import {
		h5WebUrl
	} from '@/utils/config';
	const uniShare = new UniShare();
	// #endif

	export default {
		name: "releaseWorkDetail",
		components: {
			// #ifdef H5
			UniFab,
			// #endif
			uniPopup,
			uniPopupDialogTip,
			uniNoticeBar,
			uniTransition,
			wucTab,
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

				that: this,

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

				releaseWorkBannerImg: null,
				releaseWorkThumb: null,

				releaseWork: {
					img: [],
					userDetailsInfo: {
						id: null,
						avatar: '',
					},
					contractList: [],
					offerList: [],
					itemOffer: [],
				},
				guessLikeList: [],
				likeTitle: '猜您喜欢',

				releaseWorkTypeList: [],

				token: null,
				userData: {},
				tips: "",

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

				infoOwner: null, //信息发布者ID
				infoSharer: null, //信息分享者的ID

				offerCount: 0,
				contractCount: 0,
				offerSigned: false, //是否有已签约

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
						this.releaseWork.id = newVal;
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
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			},
			typeFilter(type, that) {
				const [obj] = that.releaseWorkTypeList.filter(v => v.value === type);
				return !!obj ? obj.label : '';
			},
		},
		created() {
			this.releaseWorkTypeList = uni.getStorageSync("releaseWorkTypeList");

			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			this.releaseWork.id = this.nodeId;

			this.initAnimation();

			this.isShowLike = !this.fromAdmin && this.guessLikeList && this.guessLikeList
				.length > 0
			//#ifdef H5
			this.isShowFab = !!this.directOpen;
			//#endif
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
			initAnimation() {
				if (!this.o && !this.fromAdmin) {
					let tipShareLastShowTime = uni.getStorageSync("tipShareLastShowTime");
					if (!tipShareLastShowTime || (new Date().getTime() - tipShareLastShowTime) > 2 * 60 * 60 *
						1000) { //超过2小时
						let tipShareForceCloseTime = uni.getStorageSync("tipShareForceCloseTime");
						//超过二十四小时或者tipShareForceCloseTime为空的时候，都需要显示分享提示
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
				//获取默认图片
				let defaultResource = uni.getStorageSync("defaultResource");
				this.releaseWorkThumb = defaultResource[2].resourceUrl[0];
				this.releaseWorkBannerImg = defaultResource[0].resourceUrl[0];

				if (!!this.directOpen || this.fromAdmin) { //分享或者通知进入页面，不需要登录
					this.getReleaseWorkByIdAnon();
				} else {
					this.createCheckReleaseWork()
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
					url: '/pagesNew/stick/stickList?id=' + item.id + '&type=0'
				})
			},

			closeStatistic() {
				this.isShowStatistic = false;
			},
			openStatistic(index) {
				this.tabIndex = index + '';
				this.isShowStatistic = true;
			},

			goToReleaseWorkDetail(id) {
				if (!this.token) {
					this.toLogin()
				} else {
					uni.navigateTo({
						url: '/pagesNew/details/sendDetails?id=' + id,
					})
				}
			},
			//跳转到信息编辑页面
			toEdit(id, renew) {
				uni.navigateTo({
					url: '/pagesNew/dosend/dosend?id=' + id + '&renew=' + renew
				})
			},
			//跳转到联系记录页面
			toContactList(id) {
				uni.navigateTo({
					url: '/pagesPersonal/contacted/contactedList?id=' + id + '&type=0'
				})
			},
			//获取外发失败原因
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

			//根据id获取活信息详情
			createCheckReleaseWork() {
				let paramsData = {
					id: this.releaseWork.id,
				}
				let self = this;
				createCheckReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						self.releaseWorkHandle(res);
					}
				});
			},

			//根据id获取活信息详情,匿名获取，主要用于分享后被点击打开
			getReleaseWorkByIdAnon() {
				let paramsData = {
					id: this.releaseWork.id,
				}
				let self = this;
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.releaseWorkHandle(res);
					}
				}).catch(() => {
					uni.showToast({
						title: '外发活已下架！',
						icon: 'none',
						duration: 3000,
					})
				});
			},

			releaseWorkHandle(res) {
				let releaseWork = res.data;
				if (releaseWork.verifyStatus !== 3 && !this.fromAdmin) {
					uni.showToast({
						title: '此信息未生效或已失效！',
						icon: "none",
						duration: 1000
					})
					setTimeout(() => {
						if (!this.directOpen) {
							uni.navigateBack({
								delta: 1
							});
						} else {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}
					}, 1000)
				} else {
					if (!!releaseWork.img) {
						releaseWork.img = JSON.parse(releaseWork.img);
					} else {
						releaseWork.img = [];
					}

					if (!!releaseWork.count) {
						releaseWork.count = Number(releaseWork.count);
					} else {
						releaseWork.count = 0;
					}

					if (this.userData && this.userData.id && releaseWork.userId === this.userData.id) {
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
					if (!!releaseWork.promptInfo) {
						releaseWork.promptInfo = releaseWork.promptInfo.replace(/\\r\\n/g, "\n");
					} else {
						releaseWork.promptInfo = '';
					}
					let resContractList = releaseWork.contractList
					if (!!resContractList && resContractList.length > 0) {
						this.contractCount = resContractList.length
						resContractList.forEach(v => {
							if (v.statusDesc) {
								if (v.statusDesc.indexOf("甲方") > -1) {
									v.statusDesc = v.statusDesc.replace('甲方', '我方')
								} else if (v.statusDesc.indexOf("乙方") > -1) {
									v.statusDesc = v.statusDesc.replace('乙方', '对方')
								}
							}
							if (!!v.count) {
								v.count = parseInt(v.count);
							} else {
								v.count = 0;
							}
						});
					} else {
						releaseWork.contractList = [];
					}
					if (releaseWork.offerBeanPre == null) {
						releaseWork.offerBeanPre = {};
					}
					if (!!releaseWork.offerBeanPre.count) {
						releaseWork.offerBeanPre.count = parseInt(releaseWork.offerBeanPre.count);
					} else {
						releaseWork.offerBeanPre.count = 0;
					}

					if (releaseWork.userDetailsInfo.userAverageScoreAVG) {
						releaseWork.userDetailsInfo.userAverageScoreAVG = parseInt(releaseWork.userDetailsInfo
							.userAverageScoreAVG);
					} else {
						releaseWork.userDetailsInfo.userAverageScoreAVG = 0;
					}
					let offerList = releaseWork.offerList
					if (!!offerList && offerList.length > 0) {
						this.offerCount = offerList.length
						offerList.forEach(v => {
							if (!!v.sampleImg) {
								v.sampleImg = JSON.parse(v.sampleImg)
							} else {
								v.sampleImg = [];
							}
							if (!!v.count) {
								v.count = parseInt(v.count);
							} else {
								v.count = 0;
							}
							if (v.status === 1) {
								this.offerSigned = true // 是否有签约
							}
						})
					}

					this.releaseWork = releaseWork;

					if (this.directOpen === 's') { //由点击分享信息而来
						// #ifdef H5
						this.isShowFab = true
						// #endif
					}

					//获取猜你喜欢数据
					if (!!releaseWork.industry && !this.fromAdmin) {
						this.guessULike(releaseWork.industry);
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
					workinfoId: this.releaseWork.id
				}
				let self = this;
				guessULikeReleaseWork(paramsData).then(res => {
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
				if (this.releaseWork.userId === this.userData.id) {
					uni.showToast({
						title: "不能拨打您自己的电话！",
						icon: "none",
						duration: 2000
					})
					return;
				}
				if (!this.releaseWork.hasOffered && !this.releaseWork.hasContacted) {
					this.confirmDialogShow();
				} else {
					this.getPhoneNumberAndCall()
				}
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
					workInfoId: this.releaseWork.id,
				}
				let self = this;
				if (!this.releaseWork.hasMarked) {
					addMarkReleaseWork(paramsData).then(res => {
						if (res.retCode === 0) {
							self.releaseWork.hasMarked = true;
						}
						self.isMarking = false;
					}).catch(() => {
						self.isMarking = false;
					});
				} else {
					cancelMarkReleaseWork(paramsData).then(res => {
						if (res.retCode === 0) {
							self.releaseWork.hasMarked = false;
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
					url: '/pages/personal/newComplaint?id=' + this.releaseWork.id + '&type=2&work=0'
				})
			},

			//外发活信息下架
			offReleaseWork(id) {
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

						self.releaseWorkHandle(res);
					}
				});
			},
			//外发活信息上架
			onReleaseWork(id) {
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
						});

						self.releaseWorkHandle(res);
					}
				});
			},

			confirmDialogShow() {
				let goldCount = parseActionConsume("发起联系外发信息", this.userData.userVerifyStatus, this.userData
					.withValidBeanCard);

				if (!!goldCount) {
					this.tips = "拨打电话会扣除金豆" + goldCount + "颗，确认要拨打电话吗？系统智能计费，同一条信息不会重复收费！"
					this.$refs.dialogInput.open()
				} else {
					this.getPhoneNumberAndCall();
				}
			},

			dialogInputConfirm(done, value) {
				done();
				if (!!value && value > 0) {
					uni.setStorageSync("gold_bean_tipped", value);
				};
				this.getPhoneNumberAndCall()
			},

			//打电话
			callPhoneContract(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				}).catch(e => {});
			},
			dialogInputCancel(done) {
				done();
			},
			getPhoneNumberAndCall() {
				let self = this;
				let params = {
					id: this.releaseWork.id
				}
				contactReleaseWork(params).then(res => {
					if (res.retCode === 0) {
						self.releaseWork.hasContacted = true;
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
			//跳转到签订合同页面
			goToSignContract(offerId, id) {
				uni.navigateTo({
					url: '../../pagesOffer/contract/signContract?offerId=' + offerId + '&releaseWorkId=' + id
				})
			},
			//发布者查看接单详情（跳转到交易详情）
			goToContractByPoster(contractId) {
				uni.navigateTo({
					url: '/pagesOffer/contract/transactionDetails?id=' + contractId + '&type=0'
				})
			},
			//发布者查看报价详情
			goToOfferDetailsByPoster(id, offerId) {
				uni.navigateTo({
					url: '../../pagesOffer/offer/offerDetailsByPoster?releaseWorkId=' + id + '&offerId=' + offerId
				})
			},
			//跳转到报价列表页面
			goToOfferDetails(id) {
				uni.navigateTo({
					url: '../../pagesOffer/offer/offerList?releaseWorkId=' + id
				})
			},
			toTransaction(releaseWork) {
				uni.navigateTo({
					url: '/pagesPersonal/myWork/transactionWork',
				})
			},
			//任务型外发接单
			pickupTask(releaseWork) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (releaseWork.userId === this.userData.id) {
					uni.showToast({
						title: "自己的外发单不能接！",
						icon: "none",
						duration: 2000
					})
					return
				}
				if (!!this.userData.userVerifyStatus && this.userData.userVerifyStatus === 1) {
					uni.showModal({
						title: '系统提示',
						content: '请先进行个人认证后，再进行操作',
						showCancel: true,
						cancelText: "取消",
						confirmText: '去认证',
						confirmColor: '#fb5318',
						success: function(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pagesCertification/personal/index',
								})
							}
						},
					})
					return;
				}
				uni.showModal({
					title: '系统提示',
					content: '确定要接单吗？',
					showCancel: true,
					cancelText: "取消",
					confirmText: '接单',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							let paramsData = {
								id: releaseWork.id,
							}
							confirmTaskWork(paramsData).then(res => {
								if (res.retCode === 0) { //这里是有问题的，没有报价的这个步骤 // todo
									uni.showModal({
										title: "系统提示",
										content: '恭喜您接单成功！现在去个人中心查看吗？',
										cancelText: '取消',
										confirmText: '确定',
										confirmColor: '#fb5318',
										success: function(res2) {
											if (res2.confirm) {
												uni.navigateTo({
													url: '/pagesPersonal/myWork/transactionWork'
												})
											}
										}
									})
								}
							});
						}
					},
				})
			},
			//报价型，点击报价按钮
			handleWorkOffer(releaseWork) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (releaseWork.userId === this.userData.id) {
					uni.showToast({
						title: "自己的外发单不能接！",
						icon: "none",
						duration: 2000
					})
					return
				}
				if (!!this.userData.userVerifyStatus && this.userData.userVerifyStatus === 1) {
					uni.showModal({
						title: '系统提示',
						content: '请先进行个人认证后，再进行操作',
						showCancel: true,
						cancelText: "取消",
						confirmText: '去认证',
						confirmColor: '#fb5318',
						success: function(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pagesCertification/personal/index',
								})
							}
						},
					})
					return;
				}
				uni.navigateTo({
					url: '../../pagesOffer/offer/newOffer?releaseWorkId=' + releaseWork.id +
						((releaseWork.offerList && releaseWork.offerList.length > 0) ? "'&id='" + releaseWork
							.offerList[0].id : ""),
				})
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

						let img = (self.releaseWork.img.length === 0) ? (self.imgUrl + '/login/logo.png') :
							self.releaseWork.img[0];
						uniShare.show({
							content: { //公共的分享参数配置  类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
								type: 0,
								href: h5WebUrl + 'pagesNew/details/sendDetails?id=' + self.releaseWork
									.id,
								title: self.releaseWork.title,
								summary: '没活干就上云加工',
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

	.cover-box {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #000;
		opacity: 0.3;
		z-index: 99;
	}

	.content-box {
		opacity: 1;
		width: 90%;
		padding-right: 20rpx;
		position: fixed;
		top: 30%;
		left: 3%;
		border-radius: 15rpx;
		z-index: 99999;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}


	::v-deep .uni-dialog-input {
		text-align: left;
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