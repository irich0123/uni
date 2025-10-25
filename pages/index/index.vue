<template>
	<view class="container">
		<view v-if="!mock" class="normal-content">
			<!-- #ifdef H5 -->
			<view class='tool-bar flex align-center justify-between' :class="scrollOverBanner?'bg-theme':''">
				<view class='flex align-center' @click='toSelectCity'>
					<image style="width:25rpx;" :src="imgUrl+'/index/city.png'" mode="widthFix" />
					<view class='text-df color-white margin-left-ssm '> {{ cityShow }}</view>
				</view>
				<view class='flex align-center' @click='toHelp'>
					<image style="width:40rpx;" :src="imgUrl+'/index/wenhao.png'" mode="widthFix" />
				</view>
			</view>
			<!-- #endif -->

			<view>
				<!-- #ifdef MP-WEIXIN -->
				<view class="position-fixed" style="top:0;left:0;right:0;z-index: 999;"
					:class="scrollOverBanner?'bg-theme':''">
					<view :style="'height:'+statusbarHeight+'px'" style="width:100%"></view>
					<view class="flex align-center" :style="'width:' +menubarLeftPosition+'px;height:40px'">
						<view class='flex flex-twice align-center margin-left-sm' @click='toSelectCity'>
							<image style="width:25rpx;" :src="imgUrl+'/index/city.png'" mode="widthFix" />
							<view class='color-white text-df margin-left-xs'> {{ cityShow }}</view>
						</view>

						<view class="flex-treble text-lg color-white justify-center text-center">云加工</view>

						<view class="flex-sub flex justify-end margin-right-xs" @click="toHelp">
							<image style="width:40rpx;" :src="imgUrl+'/index/wenhao.png'" mode="widthFix" />
						</view>
					</view>
				</view>
				<!-- #endif -->

				<!-- #ifdef APP-PLUS -->
				<view class="custom-nav-bar flex align-center justify-center" :class="scrollOverBanner?'bg-theme':''">
					<view class="flex flex-sub align-center justify-start padding-right-xss margin-left"
						@click="toSelectCity">
						<view class="color-white text-df padding-right-xss">{{cityShow}}</view>
						<image style="width:16rpx;height:10rpx;" :src="imgUrl+'/ic_xiala_bai.png'" />
					</view>
					<view class="search-bar flex flex-treble align-center justify-start">
						<view class="type-choose-box">
							<w-select v-model="searchType" defaultValue="外发" :width="'46px'" bgColor="#00000000"
								@change="typeChange" :list='searchOptionList' valueName='label' :value="0"
								:keyName="'id'" />
						</view>
						<view class="input-box">
							<input v-model="searchText" confirm-type="search" @confirm="toSearch" />
						</view>
						<view class="search-btn" @click="toSearch">
							<uni-icons type="search" color="white" size="20"></uni-icons>
						</view>
					</view>
					<view class="help-btn flex-sub flex align-center justify-end margin-right" @click="toHelp">
						<img :src="imgUrl+'/ic_help.png'" alt="" />
						<!-- <img :src="imgUrl+'/ic_rank.png'" alt="" class="margin-left-ssm"/> -->
					</view>
				</view>
				<!-- #endif -->

				<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
					@scroll="scrollHandle">
					<!-- 轮播图开始 -->
					<view>
						<home-banner :city="cityShow" />
					</view>
					<!-- 轮播图结束 -->

					<!-- 额外的按钮 开始 -->
					<view>
						<quick-access @action="quickAccessHandle" :extra="showExtraBtn" :key="timer" />
					</view>
					<!-- 额外的按钮 结束  -->

					<!-- 公告开始 -->
					<view>
						<notice-panel />
					</view>
					<!-- 公告结束 -->

					<view class="advert-box" v-show="showAdvert">
						<advert-panel :city="cityShow" @withData="advertHandle" />
					</view>

					<view class="margin-top-ssm">
						<view class="padding-lr-sm bg-white flex align-center justify-between">
							<view class="text-xl text-bold padding-tb-df">最新外发信息</view>
							<view class="text-sm color-blue" @click="toSwitch(0)">全部 >></view>
						</view>
						<view class="padding-bottom-sm">
							<view class="padding-lr-ssm padding-top-ssm" v-for="(item,index) in releaseWorkList"
								:key="index" @click.stop="showReleaseDetail(item)">
								<release-work-list-cell :release-work="item" :dateShort="true"
									@onPhoneCall="releaseWorkCall(item,index)" />
							</view>
						</view>
					</view>

					<!-- 最新承接开始 -->
					<view>
						<view class="padding-lr-sm bg-white flex align-center justify-between">
							<view class="text-xl text-bold padding-tb-df">最新承接信息</view>
							<view class="text-sm color-blue" @click="toSwitch(1)">全部 >></view>
						</view>
						<!-- 承接数据循环开始 -->
						<view class="padding-bottom-sm">
							<view class="padding-lr-ssm padding-top-ssm" @click.stop="showOrderDetail(item)"
								v-for="(item,index) in workOrderList" :key="index">
								<work-order-list-cell :work-order="item" :dateShort="true"
									@onPhoneCall="workOrderCall" />
							</view>
						</view>
					</view>
					<!--  最新承接结束 -->

					<view class="_blank">&nbsp;</view>
				</scroll-view>
			</view>
		</view>

		<!-- #ifdef MP-WEIXIN -->
		<view v-else class="mock-content" @click="showMockInfo">
			<image mode="widthFix" style="width:100%;height:100%;" :src="imgUrl+'/mock.png'" />
		</view>
		<!-- #endif -->

		<!-- 提交信息 -->
		<uni-popup ref="dialogInput" type="dialog">
			<uni-popup-dialog-tip mode="input" title="小二提示" :value="tips" @close="dialogInputCancel"
				@confirm="dialogInputConfirm">
			</uni-popup-dialog-tip>
		</uni-popup>
	</view>
</template>


<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTip from '@/components/uni-popup/uni-popup-dialog-tip.vue'
	import homeBanner from '@/pages/index/components/home-banner.vue'
	import quickAccess from '@/pages/index/components/quick-access.vue'
	import advertPanel from '@/pages/index/components/advert-panel.vue'
	import noticePanel from '@/pages/index/components/notice-panel.vue'
	import releaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import workOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";

	import {
		active,
		imgUrl
	} from '@/utils/config'
	import {
		parseRegionSimple
	} from "@/api/api";
	import {
		recordShareTasknonH5
	} from "@/api/user";
	import {
		wxMPSubscribeInfoCheck
	} from "@/api/push";
	import {
		contactWorkOrder,
		contactReleaseWork,
		getRecommendList
	} from '@/api/workinfo'
	import {
		getIndustryAll,
	} from "@/api/api.js";
	import {
		deleteStringVal,
		parseActionConsume
	} from '@/utils/myUtil.js';
	// #ifdef H5			
	import {
		wxShareHomePage
	} from "@/utils/wxPortalShare.js";
	// #endif
	// #ifdef APP-PLUS
	import wSelect from '@/components/w-select/w-select.vue'
	// #endif

	export default {
		components: {
			uniPopup,
			homeBanner,
			noticePanel,
			quickAccess,
			advertPanel,
			uniPopupDialogTip,
			releaseWorkListCell,
			workOrderListCell,
			// #ifdef APP-PLUS
			wSelect,
			// #endif
		},
		data() {
			return {
				active: active,
				imgUrl: imgUrl,
				statusbarHeight: 0,
				menubarLeftPosition: 375,
				contentTop: 0,
				listHeight: 0,
				scrollOverBanner: false,

				mock: false,

				userData: null,
				token: null,
				tips: "",

				cityShow: '上海', //可选择城市列表里的名字
				location: null,
				showExtraBtn: false,
				timer: 0,

				showAdvert: false,

				industryList: [],

				releaseWorkList: [],
				workOrderList: [],

				locationCity: {},

				longitude: null,
				latitude: null,

				currentReleaseWork: null,

				weChatCode: '',
				openId: '',

				action: '', //动作
				type: null,

				searchType: 0,
				searchText: "",
				searchOptionList: [{
						id: 0,
						label: "外发",
						url: "/pagesNew/dosend/searchReleaseWork?search=",
					},
					{
						id: 1,
						label: "承接",
						url: "/pagesNew/dowork/searchWorkOrder?search=",
					},
					{
						id: 2,
						label: "商品",
						url: "/pagesNew/domall/searchCommodity?search=",
					}
				],

				theme: 1,

			}
		},
		onShow() {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			if (!!uni.getStorageSync("needRefresh")) {
				uni.removeStorageSync("needRefresh");
				this.initData();
			}
		},
		onLoad(options) {
			// #ifdef APP-PLUS
			this.theme = uni.getStorageSync("theme");
			// #endif

			// #ifdef APP-PLUS
			uni.onThemeChange((res) => {
				this.theme = (res.theme === 'light' ? 1 : 0);
				uni.setStorageSync("theme", this.theme);
			})
			// #endif

			this.getSystemStatusBarHeight();

			//小程序分享被点击，打开Mock页面
			// #ifdef MP-WEIXIN
			let object = uni.getLaunchOptionsSync();

			if (object.scene === 1154) {
				this.mock = true;
				return;
			}
			this.miniShare();
			// #endif

			// #ifdef H5	
			wxShareHomePage();
			// #endif

			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			let currentType;
			// #ifdef APP-PLUS
			currentType = 0;
			// #endif
			// #ifdef H5							
			currentType = 2;
			// #endif
			// #ifdef MP-WEIXIN
			currentType = 1;
			// #endif
			uni.setStorageSync("appType", currentType);

			if (active === 'debug') { //测试环境打开
				// #ifdef MP-WEIXIN
				this.openId = 'oZavb4m04csOOrqzpeLdFraHN8_c'
				// #endif

				// #ifdef H5
				this.openId = "oZBpa0_mSriNHO5slDbg4x0cGKFk";
				// #endif

				// #ifndef APP-PLUS
				uni.setStorageSync("openId", this.openId);
				// #endif
			} else { //生产环境
				// #ifndef APP-PLUS
				this.openId = uni.getStorageSync('openId');
				// #endif
			}

			// #ifdef H5 || MP-WEIXIN
			let urlParam = '';
			for (var key in options) {
				var value = options[key]
				urlParam += key + '=' + value + '&'
			}
			if (urlParam.length > 0) {
				urlParam = urlParam.slice(0, -1);
			}
			console.log("home index urlParam=", urlParam);
			// #endif

			// #ifdef H5 || MP-WEIXIN
			if (!this.openId) {
				uni.redirectTo({
					url: "/pages/wxCode/index?" + urlParam,
				})
				return;
			}
			// #endif


			//有openId 直接跳转
			// #ifdef H5 || MP-WEIXIN
			this.action = options.o;
			this.type = options.type;

			if (this.action === 's') { //分享
				let url;
				if (this.type === '0') {
					url = '/pagesNew/details/sendDetails?' + urlParam;
				} else if (this.type === '1') {
					url = '/pagesNew/details/workDetails?' + urlParam;
				} else if (this.type === '2') {
					url = '/pagesNew/details/mallDetails?' + urlParam;
				}
				if (!!url) {
					uni.redirectTo({
						url: url,
					})
					return;
				}
			} else if (this.action === 't') { //任务列表分享后获取金豆
				let userId = parseInt(options.u);
				this.recordShareTask(userId);
			}
			// #endif

			//检查是不是别人推荐过来的
			if (!this.userData || !this.userData.id) {
				let uId = uni.getStorageSync("uId");
				if (!uId && options.uId) {
					uni.setStorageSync("uId", parseInt(options.uId));
				}
			} else {
				uni.removeStorageSync("uId");
			}

			this.initData();
		},
		// 监听用户下拉动作，一般用于下拉刷新
		onPullDownRefresh() {
			this.initData();

			this.$nextTick(() => {
				uni.stopPullDownRefresh();
			});
		},
		onUnload() {
			// 移除监听事件
			// #ifdef APP-PLUS
			uni.$off('connectStatusChange');
			// #endif
		},
		methods: {
			//获取系统状态栏高度
			getSystemStatusBarHeight() {
				// #ifdef APP-PLUS
				this.contentTop = 0; //加上标题栏高度
				// #endif

				// #ifdef MP-WEIXIN
				var rec = uni.getMenuButtonBoundingClientRect();
				this.statusbarHeight = rec.top - (40 - rec.height) / 2;
				this.menubarLeftPosition = rec.left - 5;
				this.contentTop = 0;
				// #endif

				// #ifdef H5
				this.contentTop = this.statusbarHeight;
				// #endif

				//#ifdef APP-PLUS
				this.listHeight = uni.getWindowInfo().safeArea.bottom + uni.getWindowInfo().safeArea.top - this.contentTop;
				// #endif

				//#ifndef APP-PLUS
				this.listHeight = uni.getWindowInfo().safeArea.bottom - this.contentTop;
				// #endif
			},
			initData() {
				//获取公告
				this.initLocation();
				this.getIndustryAll();
			},
			getIndustryAll() {
				let industryLoadTime = uni.getStorageSync('industryLoadTime');
				// let industryList = uni.getStorageSync("allIndustry");
				let industryList = [];

				if (!industryLoadTime || ((new Date().getTime()) - industryLoadTime) > 60 * 60 * 1000 || !industryList ||
					industryList.length === 0) { //超时
					let self = this;
					getIndustryAll({
						isshow: 1
					}).then(res => {
						if (res.retCode === 0) {
							self.industryList.splice(0, self.industryList.length);
							self.industryList.push({
								icon: self.imgUrl + "/trademore.png",
								id: null,
								industry: "全行业",
							});
							res.data.forEach(v => {
								self.industryList.push({
									icon: v.icon,
									id: v.id,
									industry: v.industry,
								});
							});
							uni.setStorageSync("allIndustry", self.industryList);
							uni.setStorageSync("industryLoadTime", new Date().getTime());
							self.getRecommendList();
						}
					});
				} else {
					this.industryList = industryList;
					this.getRecommendList();
				}
			},

			advertHandle(e) {
				this.showAdvert = e;
			},

			//获取最新活信息列表
			getRecommendList() {
				let self = this;
				getRecommendList({}).then(res => {
					if (res.retCode === 0) {
						let releaseWorkList = res.data.releaseWorks
						let workOrderList = res.data.workOrders
						releaseWorkList.forEach(item => {
							if (item.img) {
								item.img = JSON.parse(item.img);
							}
							self.refreshTitleColor(item);
						});

						workOrderList.forEach(item => {
							if (!!item.img) {
								item.img = JSON.parse(item.img);
							}
							self.refreshTitleColor(item);
						});
						self.releaseWorkList = releaseWorkList
						self.workOrderList = workOrderList

					}
				});
			},
			initLocation() {
				let cityShow = uni.getStorageSync("cityShow");
				if (cityShow) {
					this.cityShow = cityShow;
					this.refreshComponents();
				}

				//城市切换后的时间戳
				let locationMapConfirmTime = uni.getStorageSync('locationMapConfirmTime');
				//判断当前时间是否大于最后一次选择城市的时间，如果大于，则请求定位;以及是否第一次进入，是的话则定位；以及同意不同意切换之后是否超过24小时。是则定位

				if (!locationMapConfirmTime || (new Date().getTime() - parseInt(locationMapConfirmTime)) > 24 * 60 * 60 *
					1000 ||
					!this.cityShow || this.cityShow.indexOf("定位失败") > -1) {
					setTimeout(() => {
						this.parseRegionOnIp();
					}, this.active === 'debug' ? 1000 : 0);
				} else {
					console.log("没到24小时")
				}

				// #ifdef H5			
				this.wxSubscribeInfoCheck();
				// #endif

			},

			parseRegionOnIp() {
				let self = this;
				parseRegionSimple({}).then(res => {
					if (res.retCode === 0) {
						let region = {
							province: res.data.province,
							city: res.data.city,
							area: res.data.district,
						}

						let cityShow = self.parseCityShow(region);

						if (!!cityShow) {
							self.cityShow = cityShow;
							uni.setStorageSync('cityShow', self.cityShow);
							uni.setStorageSync('locationMap', region);
							uni.setStorageSync('locationMapConfirmTime', new Date().getTime());
						} else {
							self.setDefaultCity();
						}
						self.refreshComponents();
					}
				}).catch(() => {
					self.setDefaultCity();
					self.refreshComponents();
				});
			},

			parseCityShow(region) {
				let showNameStr = '';
				if (region.province.indexOf("市") > -1) {
					showNameStr = region.province;
				} else if (!!region.city && region.city.indexOf("市辖") > -1) {
					showNameStr = region.province;
				} else if (!!region.area) {
					if (region.area.indexOf("区") > -1) { //包含区
						showNameStr = region.province + "," + region.city
					} else {
						showNameStr = region.province +
							(!!region.city ? (',' + region.city) : '') +
							(!!region.area ? (',' + region.area) : '');
					}
				} else {
					showNameStr = region.province +
						(!!region.city ? (',' + region.city) : '');
				}
				showNameStr = deleteStringVal(showNameStr)
				let cityArr = showNameStr.split(',');
				return cityArr[cityArr.length - 1];
			},

			setDefaultCity() {
				let locationDefault = {
					province: '上海市',
					city: '市辖区',
					area: '黄浦区',
					code: '310101',
				}

				this.cityShow = "上海";
				uni.setStorageSync('cityShow', this.cityShow);
				uni.setStorageSync('locationMap', locationDefault);
			},

			refreshComponents() {
				// this.showExtraBtn = this.cityShow.indexOf("东莞") > -1;
				this.timer++;
			},

			//查询用户是否关注云加工公众号
			wxSubscribeInfoCheck() {
				let lastCheckTime = uni.getStorageSync("wxMPSubscribeTime");
				if (lastCheckTime && lastCheckTime > new Date().getTime() - 2 * 24 * 60 * 60 * 1000) {
					return;
				}
				uni.setStorageSync("wxMPSubscribeTime", new Date().getTime());

				let param = {
					openId: this.openId,
					projectName: 'YJG'
				}
				wxMPSubscribeInfoCheck(param).then(res => {
					if (res.retCode === 0) {
						if (!res.data) {
							uni.showModal({
								title: '系统提示',
								content: '请关注『云加工』公众号，方便您收到相关信息的消息通知哦！',
								confirmText: '我知道了',
								showCancel: false,
								confirmColor: '#fb5318'
							})
						}
					}
				});
			},
			quickAccessHandle(e) {
				if (!!e.login && !this.token) {
					this.toLogin();
					return;
				}

				let to = e.to;

				if (to.indexOf("i=") > -1) {
					uni.setStorageSync("industryId", to.split("i=")[1]);
					uni.switchTab({
						url: to,
					})
				} else {
					uni.navigateTo({
						url: to,
					})
				}
			},

			/**
			 * 打开提交信息
			 */
			confirmDialogShow() {
				let goldCount = parseActionConsume("发起联系外发信息", this.userData.userVerifyStatus, this.userData
					.withValidBeanCard);

				if (!!goldCount) {
					this.tips = "拨打电话会扣除金豆" + goldCount + "颗，确认要查看电话吗？系统智能计费，同一条信息不会重复收费！"
					this.$refs.dialogInput.open()
				} else {
					this.checkGoldBeanThenCall();
				}
			},
			/**
			 * 输入对话框的确定事件
			 */
			dialogInputConfirm(done, value) {
				done();
				if (!!value && value > 0) {
					uni.setStorageSync("gold_bean_tipped", value);
				};
				this.checkGoldBeanThenCall();
			},
			dialogInputCancel(done) {
				done();
				this.currentReleaseWork = {};
			},

			toSelectCity() {
				uni.navigateTo({
					url: '/pagesChoose/city/cityIndex'
				})
			},
			toHelp() {
				uni.navigateTo({
					url: '/pagesMore/help/helpful'
				})
			},
			//获取活信息详情
			showReleaseDetail(item) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				item.hasChecked = true;
				this.refreshTitleColor(item);

				setTimeout(() => {
					uni.navigateTo({
						url: '/pagesNew/details/sendDetails?id=' + item.id,
					})
				}, 500)
			},
			//获取承接信息详情
			showOrderDetail(item) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				item.hasChecked = true;
				this.refreshTitleColor(item);

				setTimeout(() => {
					uni.navigateTo({
						url: '/pagesNew/details/workDetails?id=' + item.id,
					})
				}, 500)
			},
			//外发信息拨打电话
			releaseWorkCall(item, index) {
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
					index: index
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
						let item = self.releaseWorkList[self.currentReleaseWork.index];
						item.hasContacted = true;
						self.refreshTitleColor(item);
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
			refreshTitleColor(item) {
				if (item.hasContacted) {
					item.titleClass = "has-contacted";
				} else if (item.hasChecked) {
					item.titleClass = "has-checked";
				} else {
					item.titleClass = "";
				}
			},
			//承接信息拨打电话
			workOrderCall(item) {
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

				let params = {
					id: item.id
				}
				let self = this;
				contactWorkOrder(params).then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							item.hasContacted = true;
							self.refreshTitleColor(item);

							uni.makePhoneCall({
								phoneNumber: res.data
							}).catch(e => {});
						}
					}
				});
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
			miniShare() {
				uni.showShareMenu({
					withShareTicket: true,
					menus: ['shareAppMessage', 'shareTimeline']
				})
			},
			showMockInfo() {
				uni.showToast({
					title: '请点击【前往小程序】按钮，查看更多信息！',
					icon: 'none',
					duration: 3000,
				})
			},
			typeChange(e) {
				this.searchType = e.id;
			},
			toSearch() {
				if (!!this.searchText) {
					uni.navigateTo({
						url: this.searchOptionList[this.searchType].url + this.searchText
					})
				}
			},
			toSwitch(index) {
				if (index === 0) {
					uni.setStorageSync("industryId", 0);
					uni.switchTab({
						url: '/pages/waifa/waifa',
					})
				} else if (index === 1) {
					uni.setStorageSync("industryId", 0);
					uni.switchTab({
						url: '/pages/chengjie/chengjie',
					})
				}
			},
			scrollHandle(e) {
				this.scrollOverBanner = e.detail.scrollTop > 240;
			},
			recordShareTask(userId) {
				recordShareTasknonH5({
					userId: userId
				}).then();
			}
		},
		// #ifdef MP-WEIXIN
		onShareAppMessage: function(ops) {
			if (ops.from === 'menu') {
				// 来自右上角转发菜单
			}
			if (ops.from === 'button') {
				// 页面内转发按钮
				console.log(ops.target)
			}
			return {
				title: '云加工小程序',
				path: '/pages/index/index',
				imageUrl: this.imgUrl + '/share.png',
				success: function(res) {
					console.log("转发成功:" + JSON.stringify(res));
				},
				fail: function(res) {
					// 转发失败
					console.log("转发失败:" + JSON.stringify(res));
				}
			}
		},
		onShareTimeline() {
			return {
				title: '没活干，就上云加工',
				query: 'uId==' + this.userData.id,
				imageUrl: this.imgUrl + '/share.png',
			}
		},
		// #endif
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		overflow-x: hidden;

		.normal-content {
			width: 100%;
			height: 100vh;
		}
	}

	.mock-content {
		width: 100%;
		height: 100%;
	}

	/*<!--	城市选择条 开始-->*/
	.tool-bar {
		height: 80rpx;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.1);
		z-index: 99;
		padding: 0 30rpx 0 30rpx;
	}

	.custom-nav-bar {
		width: 100%;
		position: absolute;
		top: 0;
		padding-top: 80rpx;
		z-index: 99;

		.search-bar {
			min-height: 76rpx;
			border: 1rpx solid #cccccc;

			background-color: #00000011;

			margin: 0 10rpx 10rpx 10rpx;
			border-radius: 20rpx;

			.type-choose-box {
				padding-left: 10rpx;
			}

			.input-box {
				flex-shrink: 0;

				input {
					width: 200rpx;
					height: 76rpx;
					background-color: #f2f2f222;
					margin-left: 10rpx;
					margin-right: 10rpx;
					border-radius: 6rpx;
					color: #fff;
					font-size: 28rpx;
					padding: 0 6rpx;
				}
			}

			.search-btn {
				margin: 0 20rpx 0 10rpx;
			}
		}

		.help-btn {
			margin-left: 10rpx;
			width: 44rpx;
			height: 44rpx;
			display: flex;
			flex-direction: row;
			align-items: center;

			img {
				width: 44rpx;
				height: 44rpx;
			}
		}


	}

	/*<!--	城市选择条 结束-->*/


	/*	广告信息样式开始*/
	.advert-box {
		background: #FFFFFF;
		padding: 0;
	}

	/*	广告信息样式结束*/


	.has-checked {
		color: #777777;
	}

	.has-contacted {
		color: #999999;
	}


	/*	红包弹出层样式开始*/
	.body-a {
		width: 650rpx;
		height: 808rpx;
	}

	.alert-img {
		width: 100%;
		height: 100%;
	}

	.redBonusMoney_class {
		color: yellow;
		position: absolute;
		bottom: 27%;
		font-size: 120rpx;
		text-align: center;
		height: 120rpx;
		width: 650rpx;
	}

	.beanMoney_class {
		color: #ffffff;
		position: absolute;
		bottom: 13%;
		right: 40%;
		font-size: 30rpx;
		line-height: 30rpx;
		text-align: center;
		height: auto;
		width: 90rpx;
	}

	/*	红包弹出层样式结束*/

	._blank {
		min-height: 50rpx;
	}

	@media (prefers-color-scheme: dark) {
		.index-header {
			position: fixed;
			width: 100%;
			z-index: 9;

			.notice {
				background-color: #2d2d2d;
				color: #fefefe;
				height: 72rpx;
				line-height: 72rpx;
				padding-left: 20rpx;

				.scroll-text {
					color: #ffffff;
				}
			}
		}
	}
</style>