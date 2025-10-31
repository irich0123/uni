<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="签合同" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--        外发活基本信息开始-->
			<view class="margin-sm">
				<uni-list>
					<uni-list-item :show-arrow="false" title="合同编号">
						<template v-slot:right>
							<text>{{contractInfo.contractNo}}</text>
						</template>
					</uni-list-item>
					<uni-list-item :show-arrow="false" title="信息编号">
						<template v-slot:right>
							{{contractInfo.workInfoNo}}
						</template>
					</uni-list-item>
				</uni-list>
			</view>

			<view class="bg-white margin-sm">
				<release-work-list-cell :releaseWork="releaseWork" :showStatusBar="false" />
			</view>
			<!-- 外发活基本信息结束-->

			<view class="bg-white padding-sm margin-sm radius-s">
				<user-bar-normal :user="firstUser" :userDetailOn="true" :statisticsOn="true" />
			</view>

			<view class="bg-white padding-sm margin-sm radius-s">
				<user-bar-normal :user="secondUser" :userDetailOn="true" :statisticsOn="true" />
			</view>

			<uni-forms :modelValue="contractInfo" labelPosition="left" validateTrigger="bind" labelWidth="120" border>
				<view class="bg-white radius-s">
					<uni-forms-item label="数量：" required class="text-df padding-lr-sm" style="padding:0;"
						labelWidth="120">
						<uni-easyinput type="digit" v-model="contractInfo.quantity" :clearable="false"
							:inputBorder="false" />
						<view class="margin-left-ssm flex align-center">
							{{ releaseWork.unit }}
						</view>
					</uni-forms-item>

					<uni-forms-item class="text-df padding-lr-sm" style="padding:0;" labelWidth="150">
						<template v-slot:left>
							<radio-group class="flex align-center" @change="radioChange">
								<view class="flex align-center margin-right-xxs text-df"
									v-for="(item, index) in priceTypeList" :key="index">
									<radio :value="item.value" color="#fb5318" :checked="index === priceTypeIndex" />
									<view>{{item.name}}</view>
								</view>
							</radio-group>
						</template>
						<template v-slot:default>
							<view class="flex align-center">
								<uni-easyinput type="number" style="width: 300rpx" placeholder="请输入您的报价"
									v-model="contractInfo.offerPrice" />
								<text style="padding-left: 6rpx">{{unit}}</text>
							</view>
						</template>
					</uni-forms-item>

					<uni-forms-item label="加工方式：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<picker mode="selector" @change="changeWorkingWay" :range="workingWayList"
							:value="workingWayIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.workingWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="交货日期：" required class="text-df padding-lr-sm" style="padding:0;"
						labelWidth="120">
						<picker mode="date" class="margin-left-ssm flex align-center" :value="currentTime"
							:start="startTime" :end="endTime" @change="bindDateChange">
							<view class="flex align-center">
								<view>{{ contractInfo.deliveryTime | formatDate }}</view>
								<uni-icons type="forward" size="22" color="#999999"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>
			</uni-forms>

			<uni-forms :modelValue="contractInfo" labelPosition="left" validateTrigger="bind" labelWidth="120" border>
				<view class="bg-white radius-s">
					<uni-forms-item label="发活方保证金：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="150">
						<uni-easyinput type="digit" v-model="contractInfo.firstPartDepositRequire" :clearable="false"
							:inputBorder="false" />
						<view class="margin-left-ssm flex align-center">
							元
						</view>
					</uni-forms-item>
					<uni-forms-item label="接活方保证金：" required class="text-df padding-lr-sm" style="padding:0;"
						labelWidth="150">
						<uni-easyinput type="digit" v-model="contractInfo.secondPartDepositRequire" :clearable="false"
							:inputBorder="false" />
						<view class="margin-left-ssm flex align-center">
							元
						</view>
					</uni-forms-item>
				</view>
			</uni-forms>

			<uni-forms :modelValue="contractInfo" labelPosition="left" validateTrigger="bind" labelWidth="120" border>
				<view class="bg-white radius-s">
					<uni-forms-item label="样品：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<picker mode="selector" @change="changeSampleWay" :range="sampleWayList"
							:value="sampleWayIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.sampleWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
					<uni-forms-item label="验收标准：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120"
						v-if="contractInfo.sampleWay==='无需样品'">
						<uni-easyinput type="text" v-model="contractInfo.acceptanceCriteria" :clearable="false"
							:inputBorder="false" />
					</uni-forms-item>
					<uni-forms-item label="验收标准：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120"
						v-if="contractInfo.sampleWay!=='无需样品'">
						<picker mode="selector" @change="changeAcceptanceType" :range="acceptanceTypeList"
							:value="acceptanceTypeIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.acceptanceType }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="合格率：" required class="text-df padding-lr-sm" style="padding:0;"
						labelWidth="120" v-if="acceptanceType === '按样品' && contractInfo.sampleWay !=='无需样品' ">
						<uni-easyinput type="number" v-model="contractInfo.acceptanceDetails" :clearable="false"
							placeholder="请输入合格率" :inputBorder="false" />
					</uni-forms-item>

					<uni-forms-item label="质量级别：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120"
						v-if="acceptanceType === '按AQL标准'">
						<picker mode="selector" @change="changeQualityLevel" :range="qualityLevelList"
							:value="qualityLevelIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.qualityLevel }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="验收方式：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<picker mode="selector" @change="changeAcceptanceWay" :range="acceptanceWayList"
							:value="acceptanceWayIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.acceptanceWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>
			</uni-forms>


			<uni-forms :modelValue="contractInfo" labelPosition="left" validateTrigger="bind" labelWidth="120" border>
				<view class="bg-white radius-s">
					<uni-forms-item label="结算：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<picker mode="selector" @change="changeSettlementWay" :range="settlementWayList"
							:value="settlementWayIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.settlementWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="账期天数：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120"
						v-if="settlementWay === '账期'">
						<uni-easyinput type="number" v-model="contractInfo.accountPeriod" :clearable="false"
							placeholder="请输入账期天数" :inputBorder="false" />
						<view class="margin-left-ssm">
							天
						</view>
					</uni-forms-item>

					<uni-forms-item label="样品运费：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120"
						v-if="contractInfo.sampleWay !== '无需样品'">
						<picker mode="selector" @change="changeSampleFreightWay" :range="sampleFreightWayList"
							:value="sampleFreightWayIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.sampleFreightWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="大货运费：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<picker mode="selector" @change="changeGoodsFreightWay" :range="goodsFreightWayList"
							:value="goodsFreightWayIndex">
							<view class="flex align-center">
								<view>{{ contractInfo.goodsFreightWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>
			</uni-forms>

			<uni-forms :modelValue="contractInfo" labelPosition="left" validateTrigger="bind" labelWidth="120" border>
				<view class="bg-white radius-s">
					<uni-forms-item label="说明：" class="text-df padding-lr-sm" style="padding:0;" labelWidth="120">
						<uni-easyinput type="textarea" v-model="contractInfo.offerDesc" :clearable="false" auto-height
							style="width:100%;" placeholder="是否开发票？是否含税" :inputBorder="false" />
					</uni-forms-item>
				</view>
			</uni-forms>

			<!--        图片开始-->
			<view class="margin-sm radius-s bg-white flex flex-direction padding text-df">
				<view class="padding-tb-sm flex">
					样品图片
				</view>
				<upload-img-bar @changed="mediaChanged" :img-list="uploadImgList" :img-length-max="5"
					ref="uploadImgBar" />
			</view>
			<!--        图片结束-->

			<view class="blank"></view>
		</scroll-view>
		<!--        底部按钮开始-->

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<view class="bg-light-yellow text-sm flex align-center justify-start padding-tb-ssm padding-lr">
				<checkbox-group @change="checkChanged">
					<checkbox :checked="isAgree" shape="square" :value="'1'" />
				</checkbox-group>
				<text class="text-theme margin-top-xss padding-left-xs">请勾选确认愿意承担相关法律责任</text>
			</view>
			<button class="bg-theme theme-border text-xl text-white radius-0" @click="confirmOffer">确认并发送合同</button>
		</view>
		<!--        底部按钮结束-->
	</view>
</template>

<script>
	import {
		formatTime,
		regexDateStringToTimestamp
	} from '@/utils/myUtil';
	import {
		getUserInfoByUserId,
	} from "@/api/user";
	import {
		getReleaseWorkDetailsByIdAnon,
		initContract,
		filterWorkInfoOffer,
		confirmContract
	} from '@/api/workinfo';
	import {
		regex,active
	} from "@/utils/config";
	import releaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import uploadImgBar from "../../utils/yjg-upload/upload-img-bar";

	let reg = /-/g
	let firstReg = (new RegExp(regex.decimal_begin_with_dot)); //不能以小数点开头
	let reg1 = (new RegExp(regex.decimal_two_digit)); //小数点后只能有两位只能输入数字
	let regExp = (new RegExp(regex.mobile));


	export default {
		name: "signContract",
		components: {
			releaseWorkListCell,
			UserBarNormal,
			uploadImgBar,
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				releaseWork: {
					id: null,
				}, //外发详情
				contractInfo: {
					sampleWay: '',
				}, //详情数据

				offerId: null, //信息id
				firstUser: {},
				secondUser: {},

				startTime: '',
				endTime: '',
				currentTime: '',

				workingWayList: ["来料加工", "带料加工"],
				workingWayIndex: null,

				sampleWayList: ['发活方出样', '接活方出样', '无需样品'],
				sampleWayIndex: null,

				acceptanceTypeList: ['按样品', '按AQL标准'],
				acceptanceTypeIndex: null,

				acceptanceCriteria: '', //无需样品的验收标准

				qualityLevelList: ['AQL2.5', 'AQL1.5', 'AQL1.0'],
				qualityLevelIndex: null,

				acceptanceWayList: ['验完发货', '到货验收'],
				acceptanceWayIndex: null,

				sampleFreightWayList: ['发活方承担', '接活方承担'],
				sampleFreightWayIndex: null,

				goodsFreightWayList: ['发活方承担', '接活方承担'],
				goodsFreightWayIndex: null,

				acceptanceDetails: '97', //合格率
				accountPeriod: '', //账期天数

				uploadImgList: [],

				settlementWayIndex: '',
				settlementWayList: ['款到发货', '货到付款', '账期'],

				unit: '元/件',
				priceTypeList: [{
						name: '单价',
						value: 0
					},
					{
						name: '总价',
						value: 1
					}
				],
				priceTypeIndex: 0,

				isLoadingSuccess: false, //防止重复点击
				isAgree: true,

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
				return formatTime(time);
			},
		},
		onLoad(options) {
			this.userData = uni.getStorageSync("user");

			this.offerId = options.offerId
			this.releaseWork.id = options.releaseWorkId
			//根据信息id获取信息详情
			this.getDetailsByReleaseWorkId()
		},
		onShow() {
			this.token = uni.getStorageSync('token')

			if (!this.token) {
				uni.navigateTo({
					url: '/pages/login/login'
				})
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

			//是否同意
			checkChanged(e) {
				if (!!e.detail.value && !!e.detail.value[0]) {
					this.isAgree = true;
				} else {
					this.isAgree = false;
				}
			},
			validation() {
				//数量
				if (this.releaseWork && this.releaseWork.type === 3) {
					if (!this.contractInfo.quantity) {
						uni.showToast({
							title: '数量不能为空',
							icon: "none",
							duration: 3000
						})
						return false;
					} else {
						if (firstReg.test(this.contractInfo.quantity)) {
							uni.showToast({
								icon: 'none',
								title: '输入的数量第一位不能为小数点',
								duration: 3000
							})
							return false;
						}
						if (!reg1.test(this.contractInfo.quantity)) {
							uni.showToast({
								icon: 'none',
								title: '数量只能输入数字和一位小数点且小数点只保留两位',
								duration: 3000
							})
							return false;
						}
						if (!((new RegExp(regex.decimal_positive)).test(this.contractInfo.quantity))) {
							uni.showToast({
								icon: 'none',
								title: '请输入正数',
								duration: 3000
							})
							return false;
						}
						if (this.contractInfo.quantity < 0) {
							uni.showToast({
								icon: 'none',
								title: '数量不能小于0',
								duration: 3000
							})
							return false;
						}
					}
				}
				//报价
				if (!this.contractInfo.offerPrice) {
					uni.showToast({
						title: '报价不能为空',
						icon: "none",
						duration: 3000
					})
					return false;
				} else {
					if (firstReg.test(this.contractInfo.offerPrice)) {
						uni.showToast({
							icon: 'none',
							title: '输入的报价第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!reg1.test(this.contractInfo.offerPrice)) {
						uni.showToast({
							icon: 'none',
							title: '报价只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.contractInfo.offerPrice))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
					if (this.contractInfo.offerPrice < 0) {
						uni.showToast({
							icon: 'none',
							title: '报价不能小于0',
							duration: 3000
						})
						return false;
					}
				}

				//对方保证金
				if (!this.contractInfo.firstPartDepositRequire) {
					this.contractInfo.firstPartDepositRequire = 0
				} else {
					if (firstReg.test(this.contractInfo.firstPartDepositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '输入的发活方保证金第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!reg1.test(this.contractInfo.firstPartDepositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '发活方保证金只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.contractInfo.firstPartDepositRequire))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
				}
				if (!this.contractInfo.secondPartDepositRequire) {
					uni.showToast({
						title: '承接方保证金不能为空',
						icon: "none",
						duration: 3000
					})
					return false;
				} else {
					if (firstReg.test(this.contractInfo.secondPartDepositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '输入的承接方保证金第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!reg1.test(this.contractInfo.secondPartDepositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '承接方保证金只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.contractInfo.secondPartDepositRequire))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
					if (this.contractInfo.secondPartDepositRequire < 0) {
						uni.showToast({
							icon: 'none',
							title: '承接方保证金不能小于0',
							duration: 3000
						})
						return false;
					}

				}

				if (!this.isAgree) {
					uni.showToast({
						title: '请勾选确认愿意承担相关法律责任',
						icon: "none",
						duration: 3000
					})
					return false;
				}
				return true;
			},
			//确认合同
			confirmOffer() {
				if (this.isLoadingSuccess) {
					return;
				}
				if (!this.validation()) {
					return;
				}

				let paramsData = JSON.parse(JSON.stringify(this.contractInfo));
				paramsData["count"] = Number(this.contractInfo.quantity);
				paramsData["firstPartDepositRequire"] = this.contractInfo.firstPartDepositRequire * 1000;
				paramsData["secondPartDepositRequire"] = this.contractInfo.secondPartDepositRequire * 1000;
				paramsData["price"] = this.contractInfo.offerPrice * 1000;
				paramsData["priceType"] = this.priceTypeList[this.priceTypeIndex].value;

				if (this.contractInfo.settlementWay === '账期') {
					paramsData['accountPeriod'] = this.accountPeriod;
				}
				if (this.contractInfo.sampleWay === '无需样品') {
					paramsData['acceptanceDetails'] = this.contractInfo.acceptanceCriteria
					paramsData['sampleFreightWay'] = ''
					paramsData['acceptanceType'] = ''
				} else {
					if (this.contractInfo.acceptanceType === '按样品') {
						paramsData['acceptanceDetails'] = this.contractInfo.acceptanceDetails + '%'
						paramsData['sampleFreightWay'] = this.contractInfo.sampleFreightWay
						paramsData['acceptanceType'] = this.contractInfo.acceptanceType
					} else {
						paramsData['acceptanceDetails'] = this.contractInfo.qualityLevel
						paramsData['sampleFreightWay'] = this.contractInfo.sampleFreightWay
						paramsData['acceptanceType'] = this.contractInfo.acceptanceType
					}
				}

				paramsData['sampleImg'] = JSON.stringify(this.uploadImgList);

				paramsData["isChange"] = this.contractInfo.id != null ? true : false;

				// return
				if (!this.isLoadingSuccess) {
					uni.showLoading()
				}

				let self = this

				confirmContract(paramsData).then(res => {
					self.isLoadingSuccess = true

					if (res.retCode == 0) {
						uni.hideLoading()
						uni.showToast({
							title: '确认并发送合同成功！',
							icon: "none",
							duration: 3000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 500)
					}
				});


			},
			//交货日期
			bindDateChange(e) {
				let chooseTime = e.detail.value
				chooseTime = chooseTime.replace(/-/g, '/')
				this.contractInfo.deliveryTime = regexDateStringToTimestamp(chooseTime + "T00:00:00");
			},
			//大货运费
			changeGoodsFreightWay(e) {
				this.contractInfo.goodsFreightWay = this.goodsFreightWayList[e.detail.value];
				this.goodsFreightWayIndex = e.detail.value
			},
			//样品运费
			changeSampleFreightWay(e) {
				this.contractInfo.sampleFreightWay = this.sampleFreightWayList[e.detail.value];
				this.sampleFreightWayIndex = e.detail.value
			},
			//质量等级
			changeQualityLevel(e) {
				this.contractInfo.qualityLevel = this.qualityLevelList[e.detail.value];
				this.qualityLevelIndex = e.detail.value
			},
			//结算方式
			changeSettlementWay(e) {
				this.contractInfo.settlementWay = this.settlementWayList[e.detail.value];
				this.settlementWayIndex = e.detail.value
			},
			//验收标准
			changeAcceptanceType(e) {
				this.contractInfo.acceptanceType = this.acceptanceTypeList[e.detail.value];
				this.acceptanceTypeIndex = e.detail.value
			},
			//验收方式
			changeAcceptanceWay(e) {
				this.contractInfo.acceptanceWay = this.acceptanceWayList[e.detail.value];
				this.acceptanceWayIndex = e.detail.value
			},
			//样品选择
			changeSampleWay(e) {
				this.contractInfo.sampleWay = this.sampleWayList[e.detail.value];
				this.sampleWayIndex = e.detail.value
			},
			//切换加工方式
			changeWorkingWay(e) {
				this.contractInfo.workingWay = this.workingWayList[e.detail.value];
				this.workingWayIndex = e.detail.value
			},
			radioChange(e) {
				this.priceTypeIndex = parseInt(e.detail.value);
				if (this.priceTypeIndex === 0) {
					this.unit = '元/' + this.releaseWork.unit
				} else {
					this.unit = '元'
				}
			},

			//根据id获取活信息详情
			getDetailsByReleaseWorkId() {
				let self = this;
				let paramsData = {
					id: this.releaseWork.id
				}
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.releaseWork = res.data;
						if (self.releaseWork.img) {
							self.releaseWork.img = JSON.parse(self.releaseWork.img);
						} else {
							self.releaseWork.img = [];
						}

						self.initContract()
					}
				});
			},

			initContract() {
				let self = this;
				let paramsData = {
					id: this.offerId
				}
				initContract(paramsData).then(res => {
					if (res.retCode === 0) {
						self.contractInfo = res.data;
						if (self.contractInfo.workingWay) {
							let idx = self.workingWayList.findIndex(v => v === self.contractInfo.workingWay);
							if (idx > -1) {
								self.workingWayIndex = idx;
							}
						}

						if (self.contractInfo.sampleWay) {
							let idx = self.sampleWayList.findIndex(v => v === self.contractInfo.sampleWay);
							if (idx > -1) {
								self.sampleWayIndex = idx;
							}
						}

						if (self.contractInfo.acceptanceType) {
							let idx = self.acceptanceTypeList.findIndex(v => v === self.contractInfo
								.acceptanceType);
							if (idx > -1) {
								self.acceptanceTypeIndex = idx;
							}
						}

						if (self.contractInfo.qualityLevel) {
							let idx = self.qualityLevelList.findIndex(v => v === self.contractInfo.qualityLevel);
							if (idx > -1) {
								self.qualityLevelIndex = idx;
							}
						}

						if (self.contractInfo.acceptanceWay) {
							let idx = self.acceptanceWayList.findIndex(v => v === self.contractInfo.acceptanceWay);
							if (idx > -1) {
								self.acceptanceWayIndex = idx;
							}
						}

						if (self.contractInfo.settlementWay) {
							let idx = self.settlementWayList.findIndex(v => v === self.contractInfo.settlementWay);
							if (idx > -1) {
								self.settlementWayIndex = idx;
							}
						}

						if (self.contractInfo.sampleFreightWay) {
							let idx = self.sampleFreightWayList.findIndex(v => v === self.contractInfo
								.sampleFreightWay);
							if (idx > -1) {
								self.sampleFreightWayIndex = idx;
							}
						}

						if (self.contractInfo.goodsFreightWay) {
							let idx = self.goodsFreightWayList.findIndex(v => v === self.contractInfo
								.goodsFreightWay);
							if (idx > -1) {
								self.goodsFreightWayIndex = idx;
							}
						}

						self.startTime = formatTime(new Date().getTime());

						if (!self.contractInfo.deliveryTime) {
							self.contractInfo.deliveryTime = new Date().getTime();
						}
						self.currentTime = formatTime(self.contractInfo.deliveryTime);
						self.endTime = formatTime(self.contractInfo.deliveryTime + 180 * 24 * 3600 * 1000);

						self.contractInfo.quantity = Number(self.contractInfo.count)




						if (self.contractInfo.firstPartDepositRequire) {
							self.contractInfo.firstPartDepositRequire = self.contractInfo.firstPartDepositRequire /
								1000;
						}
						if (self.contractInfo.secondPartDepositRequire) {
							self.contractInfo.secondPartDepositRequire = self.contractInfo
								.secondPartDepositRequire / 1000;
						}


						if (self.contractInfo.firstPartUserId === self.userData.id) {
							self.firstUser = self.userData;
						} else {
							self.getUserInfo(self.contractInfo.firstPartUserId, "first");
						}

						if (self.contractInfo.secondPartUserId === self.userData.id) {
							self.secondUser = self.userData;
						} else {
							self.getUserInfo(self.contractInfo.secondPartUserId, "second");
						}
					}
				});
			},

			getUserInfo(userId, which) {
				let self = this;
				getUserInfoByUserId({
					userId: userId
				}).then(res => {
					if (res.retCode === 0) {
						if (which === "first") {
							self.firstUser = res.data;
						} else if (which === "second") {
							self.secondUser = res.data;
						}
					}
				});
			},
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
		},
	}
</script>

<style scoped lang="scss">
	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		margin: 20rpx 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 10rpx 30rpx !important;
		background-color: white;
		margin-bottom: 2rpx;
		font-size: 28rpx;

		&:first-child {
			border-top-left-radius: 10rpx;
			border-top-right-radius: 10rpx;
		}

		&:last-child {
			border-bottom-left-radius: 10rpx;
			border-bottom-right-radius: 10rpx;
		}
	}

	::v-deep .uni-list-item__content-title {
		font-size: 28rpx;
	}


	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		::v-deep .uni-forms {
			background-color: transparent;
			margin: 20rpx;

			.uni-forms-item {
				display: flex;
				flex-direction: column;
				font-size: 28rpx;
				padding: 10rpx 0;
				background-color: transparent !important;

				.uni-forms-item__box {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;

					.uni-forms-item__inner {
						width: 100%;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-between;
						padding: 10rpx 0;

						.uni-forms-item__label {
							padding-left: 20rpx;
							font-size: 28rpx;

							.label-icon {
								margin-right: 5px;
								margin-top: -1px;
							}

							.is-required {
								padding-right: 4rpx;
							}
						}

						.uni-forms-item__content {
							display: flex;
							align-items: center;
							justify-content: flex-end;
							padding-right: 20rpx;

						}
					}
				}
			}
		}

	}

	::v-deep .uni-easyinput__content {
		min-height: 72rpx;
		border-radius: 6rpx;
		padding-right: 10rpx;
		background: #f2f2f2;
	}

	::v-deep .uni-easyinput__content-input {
		font-size: 28rpx;
		padding-right: 0;
	}

	::v-deep .uni-easyinput__content-textarea {
		font-size: 28rpx;
		padding: 10rpx;
	}

	::v-deep .is-disabled {
		padding-right: 0 !important;
		text-align: right;
		text-align: -webkit-right;
		background-color: transparent !important;
		color: #999999;
	}

	::v-deep .uni-input-placeholder {
		color: #acacac;
	}


	checkbox {
		zoom: 65%;
	}

	.blank {
		height: 200rpx;
	}
</style>