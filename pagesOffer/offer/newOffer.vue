<template>
	<view class="container">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view class="bg-white margin-sm">
				<release-work-list-cell :releaseWork="releaseWork" :showStatusBar="false" />
			</view>

			<uni-forms :rules="rules" labelPosition="left" validateTrigger="bind" :modelValue="offerData"
				labelWidth="120" border>
				<view class="bg-white radius-s">
					<uni-forms-item required label="数量：" class="text-df padding-lr-sm" style="padding:0;" name="count">
						<uni-easyinput type="digit" v-model="offerData.count" :clearable="false" placeholder="请输入接单数量"
							:inputBorder="false" />
						<view class="margin-left-ssm flex align-center">{{ releaseWork.unit }}</view>
					</uni-forms-item>

					<uni-forms-item class="text-df padding-lr-sm" style="padding:0;" labelWidth="150" name="price">
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
								<uni-easyinput type="digit" style="width: 300rpx" v-model="offerData.price"
									:clearable="false" placeholder="请输入您的报价" :inputBorder="false" />
								<text style="padding-left: 6rpx">{{unit}}</text>
							</view>
						</template>
					</uni-forms-item>

					<uni-forms-item label="加工方式：" class="text-df padding-lr-sm" style="padding:0;">
						<template v-slot:default>
							<picker mode="selector" @change="changeWorkingWay" :range="workingWayList"
								:value="workingWayIndex">
								<view class="flex align-center">
									<view>{{ offerData.workingWay }}</view>
									<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>

					<uni-forms-item label="交货日期：" required class="text-df padding-lr-sm" style="padding:0;">
						<picker mode="date" class="margin-left-ssm flex align-center" :value="currentTime"
							:start="startTime" :end="endTime" @change="bindDateChange">
							<view class="flex align-center">
								<view>{{ offerData.deliveryTime | formatDate }}</view>
								<uni-icons type="forward" size="22" color="#999999"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

				</view>

				<view class="bg-white radius-s">
					<uni-forms-item label="对方保证金：" name="depositRequire" labelWidth="150" class="text-df padding-lr-sm"
						style="padding:0;">
						<template v-slot:help>
							<uni-icons class="label-icon" size="18" type="help" @click="helpClicked(0)" />
						</template>
						<template v-slot:default>
							<uni-easyinput type="digit" v-model="offerData.depositRequire" :clearable="false"
								placeholder="请输入保证金金额" :inputBorder="false" />
							<view class="margin-left-ssm">元</view>
						</template>
					</uni-forms-item>

					<uni-forms-item label="说明：" name="offerDesc" class="text-df padding-lr-sm" style="padding:0;">
						<template v-slot:default>
							<uni-easyinput type="textarea" v-model="offerData.offerDesc" :clearable="false"
								style="width:100%;" auto-height placeholder="如发票或含税等" :inputBorder="false" />
						</template>
					</uni-forms-item>
				</view>

				<view class="bg-white radius-s">
					<uni-forms-item label="样品：" class="text-df padding-lr-sm" style="padding:0;">
						<template v-slot:default>
							<picker mode="selector" @change="changeSampleWay" :range="sampleWayList"
								:value="sampleWayIndex">
								<view class="flex align-center">
									<view>{{ offerData.sampleWay }}</view>
									<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>

					<uni-forms-item label="验收标准：" class="text-df padding-lr-sm" style="padding:0;"
						v-if="offerData.sampleWay==='无需样品'">
						<uni-easyinput type="text" v-model="offerData.acceptanceDetails" :clearable="false"
							:inputBorder="false" />
						<view class="margin-left-ssm">%</view>
					</uni-forms-item>

					<uni-forms-item label="验收标准：" class="text-df padding-lr-sm" style="padding:0;"
						v-if="offerData.sampleWay !== '无需样品'">
						<picker mode="selector" @change="changeAcceptanceType" :range="acceptanceTypeList"
							:value="acceptanceTypeIndex">
							<view class="flex align-center">
								<view>{{ offerData.acceptanceType }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="合格率：" required class="text-df padding-lr-sm" style="padding:0;"
						v-if="offerData.acceptanceType === '按样品' && offerData.sampleWay !=='无需样品' ">
						<template v-slot:default>
							<uni-easyinput type="number" v-model="offerData.acceptanceDetails" :clearable="false"
								placeholder="请输入合格率" :inputBorder="false" />
							<text>%</text>
						</template>
					</uni-forms-item>

					<uni-forms-item label="质量级别：" class="text-df padding-lr-sm" style="padding:0;"
						v-if="offerData.acceptanceType === '按AQL标准' && offerData.sampleWay !== '无需样品'">
						<template v-slot:default>
							<picker mode="selector" @change="changeQualityLevel" :range="qualityLevelList"
								:value="qualityLevelIndex">
								<view class="flex align-center">
									<view>{{ offerData.qualityLevel }}</view>
									<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>

					<uni-forms-item label="验收方式：" class="text-df padding-lr-sm" style="padding:0;">
						<template v-slot:default>
							<picker mode="selector" @change="changeAcceptanceWay" :range="acceptanceWayList"
								:value="acceptanceWayIndex">
								<view class="flex align-center">
									<view>{{ offerData.acceptanceWay }}</view>
									<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>
				</view>

				<view class="bg-white radius-s">
					<uni-forms-item label="结算：" class="text-df padding-lr-sm" style="padding:0;">
						<picker mode="selector" @change="changeSettlementWay" :range="settlementWayList"
							:value="settlementWayIndex">
							<view class="flex align-center">
								<view>{{ offerData.settlementWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="账期天数：" class="text-df padding-lr-sm" style="padding:0;"
						v-if="offerData.settlementWay === '账期'">
						<template v-slot:default>
							<uni-easyinput type="number" v-model="offerData.accountPeriod" :clearable="false"
								placeholder="请输入账期天数" :inputBorder="false" />
							<view class="margin-left-ssm">天</view>
						</template>
					</uni-forms-item>

					<uni-forms-item label="样品运费：" class="text-df padding-lr-sm" style="padding:0;"
						v-if="offerData.sampleWay !== '无需样品'">
						<picker mode="selector" @change="changeSampleFreightWay" :range="sampleFreightWayList"
							:value="sampleFreightWayIndex">
							<view class="flex align-center">
								<view>{{ offerData.sampleFreightWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="大货运费：" class="text-df padding-lr-sm" style="padding:0;">
						<picker mode="selector" @change="changeGoodsFreightWay" :range="goodsFreightWayList"
							:value="goodsFreightWayIndex">
							<view class="flex align-center">
								<view>{{ offerData.goodsFreightWay }}</view>
								<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>

				<view class="margin-top-sm radius-s bg-white flex flex-direction padding text-df">
					<view class="padding-tb-sm flex">添加样品图片</view>
					<upload-img-bar @changed="mediaChanged" :img-list="uploadImgList" :img-length-max="5"
						ref="uploadImgBar" />
				</view>

			</uni-forms>
			<view class="blank"></view>
		</scroll-view>
		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="submitOffer">提交</button>
		</view>

	</view>
</template>

<script>
	import UniEasyInput from "@/components/uni-easyinput/uni-easyinput";
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	import UniIcons from '@/components/uni-icons/uni-icons.vue';
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		formatTime,
		regexDateStringToTimestamp
	} from '@/utils/myUtil'
	import {
		regex,
	} from "@/utils/config";
	import {
		createWorkInfoOffer,
		getWorkInfoOfferById,
		getReleaseWorkDetailsByIdAnon
	} from '@/api/workinfo';
	import releaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";

	let firstReg = (new RegExp(regex.decimal_begin_with_dot)); //不能以小数点开头
	let reg1 = (new RegExp(regex.decimal_two_digit)); //小数点后只能有两位只能输入数字


	export default {
		name: "index",
		components: {
			UniForms,
			uniFormsItem,
			UniIcons,
			UniEasyInput,
			uploadImgBar,
			releaseWorkListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				title: '',

				releaseWork: {},
				offerData: {
					id: null,
					workInfoId: null,
					count: null,
					price: null,
					priceType: 1,
					workingWay: '',
					deliveryTime: new Date().getTime(),
					depositRequire: null,
					offerDesc: null,
					sampleWay: null,
					qualityLevel: 'AQL2.5',
					acceptanceType: null,
					acceptanceWay: null,
					settlementWay: null,
					accountPeriod: 0,
					sampleFreightWay: null,
					goodsFreightWay: null,
					acceptanceDetails: '', //合格率
				},

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

				isLoading: false, //防止重复点击

				rules: {
					count: {
						rules: [{
								format: 'number',
								errorMessage: '只能输入数字'
							},
							{
								pattern: regex.digit_non_negative,
								errorMessage: '请输入正整数或零'
							},
							{
								minimum: 0,
								maximum: 100000000,
								errorMessage: '数量不能超过1亿',
							}
						]
					},
					price: {
						rules: [{
								format: 'number',
								errorMessage: '只能输入数字'
							},
							{
								minimum: 0,
								maximum: 10000000,
								errorMessage: '单价范围{minimum} - {maximum}'
							},
							{
								pattern: regex.decimal_two_digit,
								errorMessage: '最多2位小数'
							},
						]
					},
					depositRequire: {
						rules: [{
								format: 'number',
								errorMessage: '只能输入数字'
							},
							{
								minimum: 0,
								maximum: 10000000,
								errorMessage: '保证金范围{minimum} - {maximum}'
							},
							{
								pattern: regex.decimal_two_digit,
								errorMessage: '最多2位小数'
							},
						]
					},
					acceptanceDetails: {
						rules: [{
								format: 'number',
								errorMessage: '只能输入数字'
							},
							{
								pattern: regex.digit_positive,
								errorMessage: '请输入正整数'
							},
							{
								minimum: 0,
								maximum: 100,
								errorMessage: '合格率范围{minimum} - {maximum}',
							}
						]
					}
				},

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		filters: {
			formatDate(time) {
				return formatTime(time);
			},
		},
		onLoad(options) {
			// #ifdef H5
			this.listHeight = uni.getWindowInfo().safeArea.height;
			// #endif

			this.releaseWork.id = parseInt(options.releaseWorkId);
			this.offerData.workInfoId = this.releaseWork.id;
			if (!!options.id) {
				this.offerData.id = parseInt(options.id);
			}

			this.initData();

		},
		onShow() {
			this.title = this.offerData.id ? '修改报价' : '我要报价';

			// #ifdef H5
			uni.setNavigationBarTitle({
				title: this.title,
			});
			// #endif
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
				this.getDetailsByReleaseWorkId()
			},
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

						if (self.offerData.id) {
							self.getWorkInfoOffer();
						} else {
							self.offerData.workingWay = self.releaseWork.workingWay;
							self.offerData.sampleWay = self.releaseWork.sampleWay || '无需样品';
							self.offerData.acceptanceType = self.releaseWork.acceptanceType || '按样品';
							self.offerData.acceptanceWay = self.releaseWork.acceptanceWay || '验完发货';
							self.offerData.settlementWay = self.releaseWork.settlementWay || '款到发货';
							self.offerData.sampleFreightWay = self.releaseWork.sampleFreightWay || '发活方承担';
							self.offerData.goodsFreightWay = self.releaseWork.goodsFreightWay || '发活方承担';
						}
					}

				});
			},

			getWorkInfoOffer() {
				let self = this;
				getWorkInfoOfferById({
					id: this.offerData.id
				}).then(res => {
					if (res.retCode === 0) {
						let offer = res.data;

						if (offer.sampleImg) {
							self.uploadImgList = JSON.parse(offer.sampleImg);
						} else {
							self.uploadImgList = [];
						}

						self.offerData = res.data;

						self.offerData.price = self.offerData.price / 1000;
						self.offerData.depositRequire = self.offerData.depositRequire / 1000;

						if (self.offerData.acceptanceDetails.indexOf("%") > -1) {
							self.offerData.acceptanceDetails = self.offerData.acceptanceDetails.substring(0, self
								.offerData.acceptanceDetails.length - 1);
						}

						if (self.offerData.workingWay) {
							let idx = self.workingWayList.findIndex(v => v === self.offerData.workingWay);
							if (idx > -1) {
								self.workingWayIndex = idx;
							}
						}

						if (self.offerData.sampleWay) {
							let idx = self.sampleWayList.findIndex(v => v === self.offerData.sampleWay);
							if (idx > -1) {
								self.sampleWayIndex = idx;
							}
						}

						if (self.offerData.acceptanceType) {
							let idx = self.acceptanceTypeList.findIndex(v => v === self.offerData
								.acceptanceType);
							if (idx > -1) {
								self.acceptanceTypeIndex = idx;
							}
						}

						if (self.offerData.qualityLevel) {
							let idx = self.qualityLevelList.findIndex(v => v === self.offerData.qualityLevel);
							if (idx > -1) {
								self.qualityLevelIndex = idx;
							}
						}

						if (self.offerData.acceptanceWay) {
							let idx = self.acceptanceWayList.findIndex(v => v === self.offerData.acceptanceWay);
							if (idx > -1) {
								self.acceptanceWayIndex = idx;
							}
						}

						if (self.offerData.settlementWay) {
							let idx = self.settlementWayList.findIndex(v => v === self.offerData.settlementWay);
							if (idx > -1) {
								self.settlementWayIndex = idx;
							}
						}

						if (self.offerData.sampleFreightWay) {
							let idx = self.sampleFreightWayList.findIndex(v => v === self.offerData
								.sampleFreightWay);
							if (idx > -1) {
								self.sampleFreightWayIndex = idx;
							}
						}

						if (self.offerData.goodsFreightWay) {
							let idx = self.goodsFreightWayList.findIndex(v => v === self.offerData
								.goodsFreightWay);
							if (idx > -1) {
								self.goodsFreightWayIndex = idx;
							}
						}

						self.startTime = formatTime(new Date().getTime());

						if (!self.offerData.deliveryTime) {
							self.offerData.deliveryTime = new Date().getTime();
						}
						self.currentTime = formatTime(self.offerData.deliveryTime);
						self.endTime = formatTime(self.offerData.deliveryTime + 180 * 24 * 3600 * 1000);
					}
				});
			},
			validation() {
				if (!this.offerData.count) {
					uni.showToast({
						title: '数量不能为空',
						icon: "none",
						duration: 3000
					})
					return false;
				} else {
					if (firstReg.test(this.offerData.count)) {
						uni.showToast({
							icon: 'none',
							title: '输入的数量第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!reg1.test(this.offerData.count)) {
						uni.showToast({
							icon: 'none',
							title: '数量只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.offerData.count))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
					if (this.offerData.count < 0) {
						uni.showToast({
							icon: 'none',
							title: '数量不能小于0',
							duration: 3000
						})
						return false;
					}
					if (this.offerData.count > parseInt(this.releaseWork.count)) {
						uni.showToast({
							icon: 'none',
							title: '报价数量不可大于发活方的发活数量',
							duration: 3000
						})
						return false;
					}
				}
				//报价
				if (!this.offerData.price) {
					uni.showToast({
						title: '报价不能为空',
						icon: "none",
						duration: 3000
					})
					return false;
				} else {
					if (firstReg.test(this.offerData.price)) {
						uni.showToast({
							icon: 'none',
							title: '输入的报价第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!reg1.test(this.offerData.price)) {
						uni.showToast({
							icon: 'none',
							title: '报价只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.offerData.price))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
					if (this.offerData.price < 0) {
						uni.showToast({
							icon: 'none',
							title: '报价不能小于0',
							duration: 3000
						})
						return false;
					}
				}

				if (this.offerData.depositRequire) {
					if (firstReg.test(this.depositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '输入的对方保证金第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!reg1.test(this.offerData.depositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '对方保证金只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.offerData.depositRequire))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
					if (this.offerData.depositRequire < 0) {
						uni.showToast({
							icon: 'none',
							title: '对方保证金不能小于0',
							duration: 3000
						})
						return false;
					}
				} else {
					this.offerData.depositRequire = 0
				}

				return true;
			},

			submitOffer() {
				if (!this.validation()) {
					return
				}

				let self = this
				if (this.id) {
					this.submitWorkInfoOffer()
				} else {
					if (!this.releaseWork.hasOffered && !this.releaseWork.hasContacted) {
						uni.showModal({
							title: "系统提示",
							content: '本次报价将会扣除1颗金豆，是否继续报价？',
							cancelText: '取消',
							confirmText: '确定',
							confirmColor: '#fb5318',
							success: async function(res1) {
								if (res1.confirm) {
									self.submitWorkInfoOffer()
								} else if (res1.cancel) {
									console.log("用户取消")
								}
							}
						})
					} else {
						self.submitWorkInfoOffer()
					}
				}
			},

			//参与报价
			submitWorkInfoOffer() {
				if (this.isLoading) {
					return
				}

				let paramsData = JSON.parse(JSON.stringify(this.offerData));

				paramsData.price = paramsData.price * 1000;
				paramsData.depositRequire = paramsData.depositRequire * 1000;
				paramsData["priceType"] = this.priceTypeList[this.priceTypeIndex].value;

				if (this.offerData.settlementWay === '账期') {
					paramsData['accountPeriod'] = this.accountPeriod;
				}

				if (this.offerData.sampleWay === '无需样品') {
					paramsData['acceptanceDetails'] = this.offerData.acceptanceDetails
					paramsData['sampleFreightWay'] = ''
					paramsData['acceptanceType'] = ''
				} else {
					if (this.offerData.acceptanceType === '按样品') {
						paramsData['acceptanceDetails'] = this.offerData.acceptanceDetails + '%'
					} else {
						paramsData['acceptanceDetails'] = this.offerData.qualityLevel
					}
					paramsData['sampleFreightWay'] = this.offerData.sampleFreightWay
					paramsData['acceptanceType'] = this.offerData.acceptanceType
				}

				paramsData.sampleImg = JSON.stringify(this.uploadImgList);

				console.log(paramsData)

				let self = this

				createWorkInfoOffer(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '报价成功！',
							icon: "none",
							duration: 3000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 500)
					}
					this.isLoading = false;
				}).catch(() => {
					this.isLoading = false;
				});

			},
			//交货日期
			bindDateChange(e) {
				let chooseTime = e.detail.value
				chooseTime = chooseTime.replace(/-/g, '/')
				this.offerData.deliveryTime = regexDateStringToTimestamp(chooseTime + "T00:00:00");
			},
			//大货运费
			changeGoodsFreightWay(e) {
				this.goodsFreightWayIndex = e.detail.value
				this.offerData.goodsFreightWay = this.goodsFreightWayList[e.detail.value];
			},
			//样品运费
			changeSampleFreightWay(e) {
				this.offerData.sampleFreightWay = this.sampleFreightWayList[e.detail.value];
				this.sampleFreightWayIndex = e.detail.value
			},
			//质量等级
			changeQualityLevel(e) {
				this.offerData.qualityLevel = this.qualityLevelList[e.detail.value];
				this.qualityLevelIndex = e.detail.value;
			},
			//结算方式
			changeSettlementWay(e) {
				this.offerData.settlementWay = this.settlementWayList[e.detail.value];
				this.settlementWayIndex = e.detail.value
			},
			//验收标准
			changeAcceptanceType(e) {
				this.offerData.acceptanceType = this.acceptanceTypeList[e.detail.value];
				this.acceptanceTypeIndex = e.detail.value
			},
			//验收方式
			changeAcceptanceWay(e) {
				this.offerData.acceptanceWay = this.acceptanceWayList[e.detail.value];
				this.acceptanceWayIndex = e.detail.value
			},
			//样品选择
			changeSampleWay(e) {
				this.offerData.sampleWay = this.sampleWayList[e.detail.value];
				this.sampleWayIndex = e.detail.value
			},
			//切换加工方式
			changeWorkingWay(e) {
				this.contractInfo.workingWay = this.workingWayList[e.detail.value];
				this.workingWayIndex = e.detail.value
			},
			radioChange(e) {
				console.log(e);
				this.priceTypeIndex = parseInt(e.detail.value);
				if (this.priceTypeIndex === 0) {
					this.unit = '元/' + this.releaseWork.unit
				} else {
					this.unit = '元'
				}
			},
			helpClicked(index) {
				let message = "";
				if (index === 0) {
					message = '您要求对方缴纳的担保金额，若交易过程中产生纠纷时，该担保金额可作为赔偿金额赔付给您。';
				}
				uni.showModal({
					title: '帮助信息',
					content: message,
					confirmText: '知道了',
					showCancel: false,
					confirmColor: "#fb5318",
				})
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

	::v-deep .uni-easyinput {

		.uni-easyinput__content {
			border-radius: 6rpx;
			display: flex;

			.uni-easyinput__content-input {
				font-size: 28rpx;

				.uni-input-wrapper {

					.uni-input-placeholder {
						font-size: 28rpx;
					}
				}
			}

			.uni-easyinput__content-textarea {
				min-width: 450rpx;
				min-height: 100rpx;
				padding: 16rpx 20rpx;

				.uni-textarea-wrapper {
					min-height: 120rpx;

					.uni-textarea-placeholder {
						font-size: 28rpx;
					}

					.uni-textarea-textarea {
						font-size: 28rpx;
					}
				}
			}
		}

		.is-disabled {
			padding-right: 0 !important;
			text-align: right;
			text-align: -webkit-right;
			background-color: transparent !important;
			color: #999999;
		}
	}

	.blank {
		height: 200rpx;
	}

	radio {
		scale: 0.7
	}
</style>