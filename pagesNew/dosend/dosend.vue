<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="外发活发布" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<uni-forms :rules="rules" labelPosition="left" validateTrigger="bind" :modelValue="releaseWork" border>
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="类型：" name="type" v-if="luxury">
						<template v-slot:help>
							<uni-icons size="18" type="help" @click="helpClicked(0)" :color="theme?'#333':'#ccc'" />
						</template>
						<template v-slot:default>
							<picker mode="selector" @change="typeChange" :value="releaseWork.type-1"
								:range-key="'label'" :range="typeList">
								<view class="flex">
									<view class="text-black-4">{{ releaseWork.type | typeFilter(that) }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>

					<uni-forms-item label="需求：" name="title" required>
						<uni-easyinput type="textarea" v-model="releaseWork.title" :clearable="false"
							placeholder="请输入外发活需求内容" autoHeight maxlength="500" :inputBorder="false" />
					</uni-forms-item>

					<uni-forms-item label="数量：" name="count" label-width="120"
						:required="!!releaseWork.type && releaseWork.type !== 1">
						<uni-easyinput type="number" v-model="releaseWork.count" :clearable="false"
							class="padding-right-sm"
							:placeholder="'加工数量，'+((!!releaseWork.type && releaseWork.type !== 1)?'必填':'选填')"
							:inputBorder="false" />
						<picker mode="selector" @change="unitChange" :value="unitIndex" :range="unitList">
							<view class="flex">
								<text class="text-black-4">{{ releaseWork.unit }}</text>
								<uni-icons color="#cccccc" size="18" type="bottom"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="加工费：" name="unitPrice" label-width="120"
						v-if="!!releaseWork.type && releaseWork.type !== 2"
						:required="!!releaseWork.type && releaseWork.type !== 1">
						<uni-easyinput type="digit" v-model="releaseWork.unitPrice" :clearable="false"
							class="padding-right-sm"
							:placeholder="'加工单价，'+((!!releaseWork.type && releaseWork.type !== 1)?'必填':'选填')"
							:inputBorder="false" />
						<text class="text-black-4" style="margin-right: 18px;">元</text>
					</uni-forms-item>

					<uni-forms-item label="总费用：" name="totalPrice"
						v-if="!!releaseWork.count && !!releaseWork.unitPrice">
						<view class="padding-right-sm text-theme text-df">{{releaseWork.totalPrice}}</view>
						<text style="margin-right: 18px;">元</text>
					</uni-forms-item>

				</view>

				<!--        图片开始-->
				<view class="margin-bottom-sm radius-s bg-white flex flex-direction padding-tb-ssm padding-lr text-df">
					<view class="padding-tb-sm flex">
						<text class="text-theme margin-right-xxs text-bold">*</text>
						<text class="padding-right-sm">添加产品图片：</text>
						<uni-icons size="18" type="help" @click="helpClicked(4)" :color="theme?'#333':'#ccc'" />
					</view>
					<upload-img-bar @changed="mediaChanged" ref="uploadImgBar" :img-list="uploadImgList"
						:img-length-max="5" />
				</view>
				<!--        图片结束-->

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="限地域：" name="factoryRequire" label-width="130">
						<template v-slot:help>
							<uni-icons size="18" type="help" @click="helpClicked(3)" :color="theme?'#333':'#ccc'" />
						</template>
						<template v-slot:default>
							<picker mode="selector" @change="factoryRequireChange" :value="factoryRequireIndex"
								:range="factoryRequireList">
								<view class="flex">
									<view class="text-black-4">{{ releaseWork.factoryRequire }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>

					<uni-forms-item label="城市：" required name="city" labelWidth="120" @click.native="loadCity"
						v-show="showCityOption">
						<uni-easyinput type="text" v-model="cityLabel.name" :clearable="false" disabled
							placeholder="请选择" :inputBorder="false" />
						<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
					</uni-forms-item>
				</view>

				<!--        加工时间地点方式开始-->

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="行业：" required name="industry">
						<picker mode="selector" @change="industryChange" :value="industryIndex" :range="industryList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.industry }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="加工方式：" name="workingWay">
						<picker mode="selector" @change="workingWayChange" :value="workingWayIndex"
							:range="workingWayList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.workingWay }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="有效期：" name="expireDate">
						<picker mode="date" :value="releaseWork.expireDate" :start="expireStartTime"
							:end="expireEndTime" @change="expireDateChange">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.expireDate }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="交货时间：" name="deliveryDate">
						<picker mode="date" :value="releaseWork.deliveryDate" :start="deliveryStartTime"
							:end="deliveryEndTime" @change="deliveryDateChange">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.deliveryDate }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

				</view>
				<!--        加工时间地点方式结束-->

				<view class="bg-white radius margin-bottom-sm" v-if="releaseWork.type === 2">
					<uni-forms-item label="保证金：" name="depositRequire" label-width="120">
						<template v-slot:help>
							<uni-icons size="18" type="help" @click="helpClicked(1)" :color="theme?'#333':'#ccc'" />
						</template>
						<template v-slot:default>
							<uni-easyinput type="number" v-model="releaseWork.depositRequire" :clearable="false"
								placeholder="请输入保证金金额！" :inputBorder="false" />
							<view class="text-black-4 margin-left-xs">元</view>
						</template>
					</uni-forms-item>
				</view>

				<view class="bg-white radius margin-bottom-sm" v-if="releaseWork.type === 3">
					<uni-forms-item label="最低接单：" name="minCount">
						<template v-slot:help>
							<uni-icons size="18" type="help" @click="helpClicked(2)" :color="theme?'#333':'#ccc'" />
						</template>
						<template v-slot:default>
							<uni-easyinput type="number" v-model="releaseWork.offerBeanPre.count" :clearable="false"
								placeholder="若不填则为整单数量" :inputBorder="false" />
							<text>{{ releaseWork.unit }}</text>
						</template>
					</uni-forms-item>

					<uni-forms-item label="样品：" name="sampleWay">
						<picker mode="selector" @change="sampleWayChange" :value="sampleWayIndex"
							:range="sampleWayList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.sampleWay }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="验收标准：" name="acceptanceCriteria"
						v-if="releaseWork.offerBeanPre.sampleWay==='无需样品'">
						<uni-easyinput v-model="releaseWork.offerBeanPre.acceptanceCriteria" :clearable="false"
							placeholder="请输入验收标准" :inputBorder="false" />
					</uni-forms-item>

					<uni-forms-item label="验收标准：" name="acceptanceType"
						v-if="releaseWork.offerBeanPre.sampleWay!=='无需样品'">
						<picker mode="selector" @change="acceptanceTypeChange" :value="acceptanceTypeIndex"
							:range="acceptanceTypeList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.acceptanceType }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="合格率：" name="acceptanceDetails" label-width="120"
						v-show="releaseWork.offerBeanPre.acceptanceType === '按样品' && releaseWork.offerBeanPre.sampleWay !=='无需样品' ">
						<uni-easyinput type="number" v-model="releaseWork.offerBeanPre.acceptanceDetails"
							:clearable="false" placeholder="请输入合格率" :inputBorder="false" />
						<view>%</view>
					</uni-forms-item>

					<uni-forms-item label="质量级别：" name="qualityLevel"
						v-show="releaseWork.offerBeanPre.acceptanceType === '按AQL标准'">
						<picker mode="selector" @change="qualityLevelChange" :value="qualityLevelIndex"
							:range="qualityLevelList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.qualityLevel }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="验收方式：" name="acceptanceWay">
						<picker mode="selector" @change="acceptanceWayChange" :value="acceptanceWayIndex"
							:range="acceptanceWayList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.acceptanceWay }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="结算：" name="settlementWay">
						<picker mode="selector" @change="settlementWayChange" :value="settlementWayIndex"
							:range="settlementWayList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.settlementWay }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="账期天数：" name="accountPeriod"
						v-show="releaseWork.offerBeanPre.settlementWay === '账期'">
						<uni-easyinput type="number" v-model="releaseWork.offerBeanPre.accountPeriod" :clearable="false"
							placeholder="请输入账期天数" :inputBorder="false" />
						<view>天</view>
					</uni-forms-item>

					<uni-forms-item label="样品运费：" name="sampleFreightWay"
						v-if="releaseWork.offerBeanPre.sampleWay !== '无需样品'">
						<picker mode="selector" @change="sampleFreightWayChange" :value="sampleFreightWayIndex"
							:range="sampleFreightWayList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.sampleFreightWay }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="大货运费：" name="goodsFreightWay">
						<picker mode="selector" @change="goodsFreightWayChange" :value="goodsFreightWayIndex"
							:range="goodsFreightWayList">
							<view class="flex">
								<view class="text-black-4">{{ releaseWork.offerBeanPre.goodsFreightWay }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="备注：" name="desc">
						<uni-easyinput type="textarea" v-model="releaseWork.desc" :clearable="false"
							class="text-area-min-width" placeholder="请输入需要说明的内容" autoHeight maxlength="980"
							:inputBorder="false" />
					</uni-forms-item>
				</view>


				<!--        是否自动刷新开始-->
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="联系方式：" name="mobile">
						<uni-easyinput type="number" v-model="releaseWork.mobile" :clearable="false" disabled
							:inputBorder="false" />
					</uni-forms-item>
					<uni-forms-item label="自动刷新：" name="isRefresh">
						<switch :checked="releaseWork.isRefresh" color="#fb5318" @change="switchChange"></switch>
					</uni-forms-item>
				</view>
				<!--        是否自动刷新结束-->

				<view class="blank"></view>

			</uni-forms>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<view class="bg-light-yellow text-sm flex align-center justify-start padding-tb-xss padding-lr">
				<checkbox-group @change="checkChanged">
					<checkbox :checked="isAgree" shape="square" :value="'1'" />
				</checkbox-group>
				<text class="text-theme padding-left-xs">本人确认以上信息真实有效，并愿承担相关法律责任</text>
			</view>
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="submit">确认发布</button>
		</view>
		<!--        底部按钮结束-->

		<mpvue-city-picker ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault"
			@onConfirm="onConfirmCity"></mpvue-city-picker>

	</view>
</template>

<script>
	import {
		luxury,
		imgUrl,
		active,
		regex
	} from "@/utils/config";
	import UniEasyInput from "@/components/uni-easyinput/uni-easyinput";
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	import UniIcons from '@/components/uni-icons/uni-icons.vue';
	import mpvueCityPicker from '../../components/mpvue-citypicker/src/mpvueCityPicker';
	import {
		formatTimeNoHour,
		parseActionConsume,
		shortArea,
		shortCity,
		shortProvince,
		regexDateStringToTimestamp
	} from "@/utils/myUtil";
	import {
		getReleaseWorkDetailsByIdAnon,
		postReleaseWork
	} from "@/api/workinfo";
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	import provinceData from "../../components/mpvue-citypicker/src/city-data/province";
	import cityData from "../../components/mpvue-citypicker/src/city-data/city";
	import areaData from "../../components/mpvue-citypicker/src/city-data/area";

	export default {
		name: "dosend",
		components: {
			UniForms,
			uniFormsItem,
			UniIcons,
			UniEasyInput,
			uploadImgBar,
			mpvueCityPicker,
			// #ifndef H5
			myNavBar
			// #endif
		},

		data() {
			return {
				luxury: luxury,
				regex: regex,

				that: this,

				typeList: [{
						value: 1,
						label: '撮合型',
					},
					{
						value: 2,
						label: '报价型',
					},
					{
						value: 3,
						label: '任务型',
					}
				],

				unitIndex: 0,
				unitList: ["件", "米", "只", "套", "吨", "个", "条", "对", "双"],

				factoryRequireIndex: 0,
				factoryRequireList: ["不限", "同城", "本市", "本省", "自选地区"],
				showCityOption: false,

				releaseWork: {
					id: null,
					no: null,
					type: 1,
					title: null,
					unit: '',
					industry: '',
					workingWay: '',
					desc: null,
					totalPrice: '',
					unitPrice: null,
					count: null,
					expireDate: null,
					deliveryDate: null,
					mobile: '',
					isRefresh: false,
				},

				industryIndex: 0,
				industryList: [],

				workingWayIndex: 0,
				workingWayList: ["来料加工", "带料加工"],

				sampleWayIndex: 0,
				sampleWayList: ['发活方出样', '接活方出样', '无需样品'],

				acceptanceTypeIndex: 0,
				acceptanceTypeList: ['按样品', '按AQL标准'],

				qualityLevelIndex: 0,
				qualityLevelList: ['AQL2.5', 'AQL1.5', 'AQL1.0'],

				acceptanceWayIndex: 0,
				acceptanceWayList: ['验完发货', '到货验收'],

				settlementWayIndex: 0,
				settlementWayList: ['款到发货', '货到付款', '账期'],

				sampleFreightWayIndex: null,
				sampleFreightWayList: ['发活方承担', '接活方承担'],

				goodsFreightWayIndex: 1,
				goodsFreightWayList: ['发活方承担', '接活方承担'],

				expireStartTime: null,
				expireEndTime: null,
				deliveryStartTime: null,
				deliveryEndTime: null,

				isSubmitting: false,

				uploadImgList: [],

				isAgree: true,

				token: null,
				userData: {},
				cityShow: null,
				location: null,

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
					unitPrice: {
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
					minCount: {
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
								errorMessage: '最小承接数量不能超过1亿',
							}
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

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

				theme: null,

				cityLabel: {
					nane: null,
					code: null,
				},
				cityPickerValueDefault: [0, 0, 0],
			}
		},
		//侦听器
		watch: {
			calTotalPrice: function(val) {
				if (!!val) {
					this.releaseWork.totalPrice = (val.count * val.unitPrice).toFixed(2) || ''
				} else {
					this.releaseWork.totalPrice = ''
				}
			},
			isAgree: {
				handler() {
					if (!this.isAgree) {
						this.checkBoxImg = this.imgUrl + '/noagree.png'
					} else {
						this.checkBoxImg = this.imgUrl + '/agree.png'
					}
				}
			},
			statusbarHeight: {
				//scroll-view 带uni-forms组件 需要另外+40, 否则ios真机底部按钮会被遮挡
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal + 40;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		filters: {
			typeFilter(type, that) {
				const [obj] = that.typeList.filter(v => v.value === type)
				return !!obj ? obj.label : '';
			},
		},
		computed: {
			'calTotalPrice': function() {
				let {
					unitPrice,
					count
				} = this.releaseWork;
				return {
					unitPrice,
					count
				};
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");
			this.cityShow = uni.getStorageSync('cityShow');
			this.location = uni.getStorageSync('locationMap');

			cityData.forEach(v => {
				v.unshift({
					label: '全省',
					value: null,
				})
			})

			areaData.forEach(v => {
				v.forEach(u => {
					u.unshift({
						label: '全市',
						value: null,
					})
				})
				v.unshift([{
					label: '',
					value: null,
				}])
			})

			// #ifdef APP-PLUS
			this.theme = uni.getStorageSync("theme");
			// #endif

			//初始化基础数据
			this.getIndustryReal();

			if (!!options.id) {
				this.releaseWork.id = parseInt(options.id);
			}

			if (!this.releaseWork.id) {
				this.initCityPicker();
			}

			this.generateTimeDuration();
			this.initForm();

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");
			this.cityShow = uni.getStorageSync('cityShow');
			this.location = uni.getStorageSync('locationMap');

			if (!this.token) {
				this.toLogin();
				return;
			}

			// #ifdef APP-PLUS
			uni.onThemeChange((res) => {
				this.theme = (res.theme === 'light' ? 1 : 0);
			})
			// #endif

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
				if (!!this.location) {
					this.province = shortProvince(this.location.province);
					this.city = !!this.location.city ? shortCity(this.location.city) : this.location.city;
					this.area = !!this.location.area ? shortArea(this.location.area) : this.location.area;
				}
				if (!!this.releaseWork.id) {
					uni.setNavigationBarTitle({
						title: "外发活编辑"
					});
					this.infoReleaseWork();
				} else {
					this.releaseWork.mobile = this.userData.mobile;
				}
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 100
				});
				uni.navigateTo({
					url: '../login/login'
				})
			},
			helpClicked(index) {
				let message = "";
				if (index === 0) {
					message = '撮合型 - 承接方和发活方的交易线下沟通，不受平台监督和约束\n\n' +
						'报价型 - 可由多个承接方共同来竞价接单，最终只有一个供应商能成交，平台担保交易\n\n' +
						'任务型 - 可分发给多个承接方，同时接单，平台担保交易\n';
				} else if (index === 1) {
					message = "输入您要求对方接单缴纳的保证金。若交易过程中产生纠纷，在此金额范围内，您有权优先获得部分赔偿";
				} else if (index === 2) {
					message = "您要求对方承诺最少供应数量，少于这个数量不发";
				} else if (index === 3) {
					message = "指定对方生产工厂所处城市";
				} else if (index === 4) {
					message = "提交与外发需求相关的图片，让接单方判断能不做，排除沟通障碍";
				}
				uni.showModal({
					title: '帮助信息',
					content: message,
					confirmText: '知道了',
					showCancel: false,
					confirmColor: "#fb5318",
				})
			},
			generateTimeDuration() {
				let day = 24 * 3600 * 1000;
				this.expireStartTime = formatTimeNoHour(new Date(new Date().getTime() + day));
				this.expireEndTime = formatTimeNoHour(new Date(new Date().getTime() + 30 * day));
				this.releaseWork.expireDate = formatTimeNoHour(new Date(new Date().getTime() + 10 * day));

				this.deliveryStartTime = formatTimeNoHour(new Date());
				this.deliveryEndTime = formatTimeNoHour(new Date(new Date().getTime() + 183 * day));
				this.releaseWork.deliveryDate = formatTimeNoHour(new Date());
			},
			initForm() {
				this.releaseWork.offerBeanPre = {};

				if (this.unitIndex != null) {
					this.releaseWork.unit = this.unitList[this.unitIndex];
				}
				if (this.industryIndex != null) {
					this.releaseWork.industry = this.industryList[this.industryIndex];
				}
				if (this.workingWayIndex != null) {
					this.releaseWork.workingWay = this.workingWayList[this.workingWayIndex];
				}
				if (this.factoryRequireIndex != null) {
					this.releaseWork.factoryRequire = this.factoryRequireList[this.factoryRequireIndex];
				} else {
					this.releaseWork.factoryRequire = '';
				}
				if (this.sampleWayIndex != null) {
					this.releaseWork.offerBeanPre.sampleWay = this.sampleWayList[this.sampleWayIndex];
					if (this.sampleFreightWayIndex == null) {
						if (this.releaseWork.offerBeanPre.sampleWay.indexOf("发活方") > -1) {
							this.sampleFreightWayIndex = this.sampleFreightWayList.findIndex(v => v.indexOf("发活方") > -1);
							this.releaseWork.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this
								.sampleFreightWayIndex];
						} else if (this.releaseWork.offerBeanPre.sampleWay.indexOf("接活方") > -1) {
							this.sampleFreightWayIndex = this.sampleFreightWayList.findIndex(v => v.indexOf("接活方") > -1);
							this.releaseWork.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this
								.sampleFreightWayIndex];
						}
					} else {
						this.releaseWork.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this
							.sampleFreightWayIndex];
					}
				} else {
					this.releaseWork.offerBeanPre.sampleWay = '';
				}
				if (this.acceptanceTypeIndex != null) {
					this.releaseWork.offerBeanPre.acceptanceType = this.acceptanceTypeList[this.acceptanceTypeIndex];
				} else {
					this.releaseWork.offerBeanPre.acceptanceType = '';
				}
				if (this.qualityLevelIndex != null) {
					this.releaseWork.offerBeanPre.qualityLevel = this.qualityLevelList[this.qualityLevelIndex];
				} else {
					this.releaseWork.offerBeanPre.qualityLevel = '';
				}
				if (this.acceptanceWayIndex != null) {
					this.releaseWork.offerBeanPre.acceptanceWay = this.acceptanceWayList[this.acceptanceWayIndex];
				} else {
					this.releaseWork.offerBeanPre.acceptanceWay = '';
				}
				if (this.settlementWayIndex != null) {
					this.releaseWork.offerBeanPre.settlementWay = this.settlementWayList[this.settlementWayIndex];
				} else {
					this.releaseWork.offerBeanPre.settlementWay = '';
				}
				if (this.goodsFreightWayIndex != null) {
					this.releaseWork.offerBeanPre.goodsFreightWay = this.goodsFreightWayList[this.goodsFreightWayIndex];
				} else {
					this.releaseWork.offerBeanPre.goodsFreightWay = '';
				}
			},
			initCityPicker() {
				if (!this.cityLabel || !this.cityLabel.name) {
					let location = uni.getStorageSync('locationMap');
					if (location) {
						this.cityLabel.name = location.province + (location.city ? '-' + location.city : '') + (location
							.area ?
							'-' + location.area : '');
					}
					//初始化城市
					this.loadCityPickerDefault({
						province: location.province,
						city: location.city,
						area: location.area ? location.area : location.city,
					});
				}
			},
			typeChange(e) {
				if (e.detail.value > 1 && this.userData.userVerifyStatus <= 1) {
					uni.showToast({
						icon: 'none',
						title: '很抱歉，' + this.typeList[e.detail.value].label + '是个人认证会员的高级功能！',
						duration: 3000
					})
				}
				this.releaseWork.type = this.typeList[e.detail.value].value;
			},
			industryChange(e) {
				this.industryIndex = e.detail.value;
				this.releaseWork.industry = this.industryList[this.industryIndex];
			},
			unitChange(e) {
				this.unitIndex = e.detail.value;
				this.releaseWork.unit = this.unitList[this.unitIndex];
			},
			workingWayChange(e) {
				this.workingWayIndex = e.detail.value;
				this.releaseWork.workingWay = this.workingWayList[this.workingWayIndex];
			},
			factoryRequireChange(e) {
				this.factoryRequireIndex = e.detail.value;
				this.releaseWork.factoryRequire = this.factoryRequireList[this.factoryRequireIndex];
				this.showCityOption = this.releaseWork.factoryRequire.indexOf("自选") > -1;
			},
			loadCityPickerDefault(locationMap) {
				let cityPickerValueDefault = [];
				if (locationMap.province) {
					let provinceId = provinceData.findIndex(item => {
						return item.label.indexOf(locationMap.province) > -1;
					});
					if (provinceId < 0) {
						provinceId = 0;
					}
					cityPickerValueDefault.push(provinceId);
					if (locationMap.city) {
						let cityId = cityData[provinceId].findIndex(item => {
							return item.label.indexOf(locationMap.city) > -1;
						});
						if (cityId == null || cityId < 0) {
							cityId = 0;
						}
						cityPickerValueDefault.push(cityId);
						if (!locationMap.area) {
							locationMap.area = locationMap.city;
						}
						if (locationMap.area) {
							let areaId = areaData[provinceId][cityId].findIndex(item => {
								return item.label.indexOf(locationMap.area) > -1;
							});
							if (areaId == null || areaId < 0) {
								areaId = 0;
							}
							cityPickerValueDefault.push(areaId);
						} else {
							cityPickerValueDefault.push(0);
						}
					} else {
						cityPickerValueDefault.push(0);
						cityPickerValueDefault.push(0);
					}
				} else {
					cityPickerValueDefault.push(0);
					cityPickerValueDefault.push(0);
					cityPickerValueDefault.push(0);
				}

				this.cityPickerValueDefault = cityPickerValueDefault;

				this.cityLabel.name = provinceData[cityPickerValueDefault[0]].label +
					'-' + cityData[cityPickerValueDefault[0]][cityPickerValueDefault[1]].label +
					'-' + areaData[cityPickerValueDefault[0]][cityPickerValueDefault[1]][cityPickerValueDefault[2]].label;
				this.cityLabel.code = areaData[cityPickerValueDefault[0]][cityPickerValueDefault[1]][
						cityPickerValueDefault[2]
					]
					.value;
			},
			loadCity() {
				this.$refs.mpvueCityPicker.show();
			},
			onConfirmCity(e) {
				this.cityPickerValueDefault = e.value;
				this.cityLabel.name = e.label;
				this.cityLabel.code = areaData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]][this
					.cityPickerValueDefault[2]
				].value;
			},
			sampleWayChange(e) {
				this.sampleWayIndex = e.detail.value;
				this.releaseWork.offerBeanPre.sampleWay = this.sampleWayList[this.sampleWayIndex];
				if (this.sampleFreightWayIndex == null) {
					if (this.releaseWork.offerBeanPre.sampleWay.indexOf("发活方") > -1) {
						this.sampleFreightWayIndex = this.sampleFreightWayList.findIndex(v => v.indexOf("发活方") > -1);
						this.releaseWork.offerBeanPre.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this
							.sampleFreightWayIndex];
					} else if (this.releaseWork.offerBeanPre.sampleWay.indexOf("接活方") > -1) {
						this.sampleFreightWayIndex = this.sampleFreightWayList.findIndex(v => v.indexOf("接活方") > -1);
						this.releaseWork.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this
							.sampleFreightWayIndex];
					}
				} else {
					this.releaseWork.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this.sampleFreightWayIndex];
				}
			},
			acceptanceTypeChange(e) {
				this.acceptanceTypeIndex = e.detail.value;
				this.releaseWork.offerBeanPre.acceptanceType = this.acceptanceTypeList[this.acceptanceTypeIndex];
			},
			qualityLevelChange(e) {
				this.qualityLevelIndex = e.detail.value;
				this.releaseWork.offerBeanPre.qualityLevel = this.qualityLevelList[this.qualityLevelIndex];
			},
			acceptanceWayChange(e) {
				this.acceptanceWayIndex = e.detail.value;
				this.releaseWork.offerBeanPre.acceptanceWay = this.acceptanceWayList[this.acceptanceWayIndex];
			},
			settlementWayChange(e) {
				this.settlementWayIndex = e.detail.value;
				this.releaseWork.offerBeanPre.settlementWay = this.settlementWayList[this.settlementWayIndex];
			},
			sampleFreightWayChange(e) {
				this.sampleFreightWayIndex = e.detail.value;
				this.releaseWork.offerBeanPre.sampleFreightWay = this.sampleFreightWayList[this.sampleFreightWayIndex];
			},
			goodsFreightWayChange(e) {
				this.goodsFreightWayIndex = e.detail.value;
				this.releaseWork.offerBeanPre.goodsFreightWay = this.goodsFreightWayList[this.goodsFreightWayIndex];
			},

			getIndustryReal() {
				let industryList = uni.getStorageSync("allIndustry");
				if (!!industryList) {
					this.industryList = industryList.filter(v => !!v.id).map(v => v.industry);
				}
			},
			//根据id获取信息详情
			infoReleaseWork() {
				let paramsData = {
					id: this.releaseWork.id
				}
				let self = this;
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						let releaseWork = res.data;

						if (releaseWork.factoryRequire.indexOf("自选") > -1) {

							let arr = releaseWork.addressDetails.split(",");
							if (arr.length > 0) {
								self.loadCityPickerDefault({
									province: arr[0],
									city: arr.length > 1 ? arr[1] : '',
									area: arr.length > 2 ? arr[2] : '',
								});
							}
							self.showCityOption = true;
						}

						if (!releaseWork.deliveryTimeStamp || releaseWork.deliveryTimeStamp < new Date()
							.getTime()) {
							releaseWork.deliveryTimeStamp = new Date().getTime();
						}
						releaseWork.deliveryDate = formatTimeNoHour(new Date(releaseWork.deliveryTimeStamp));

						if (!releaseWork.usefulTimeStamp || releaseWork.usefulTimeStamp < new Date().getTime()) {
							releaseWork.usefulTimeStamp = new Date().getTime();
						}
						releaseWork.expireDate = formatTimeNoHour(new Date(releaseWork.usefulTimeStamp));

						if (!!releaseWork.img) {
							self.uploadImgList = JSON.parse(releaseWork.img);
						}

						if (releaseWork.depositRequire) {
							releaseWork.depositRequire = releaseWork.depositRequire / 1000;
						}

						if (releaseWork.unit) {
							this.unitIndex = this.unitList.findIndex(v => {
								return v === releaseWork.unit
							});
							if (this.unitIndex == null) {
								this.unitList.push(releaseWork.unit);
								this.unitIndex = this.unitList.length - 1;
							}
						}

						if (releaseWork.industry) {
							this.industryIndex = this.industryList.findIndex(v => {
								return v === releaseWork.industry
							});
							if (this.industryIndex == null) {
								this.industryList.push(releaseWork.industry);
								this.industryIndex = this.industryList.length - 1;
							}
						}

						if (releaseWork.unitPrice) {
							releaseWork.unitPrice = releaseWork.unitPrice / 1000;
						}

						releaseWork.mobile = self.userData.mobile;

						if (releaseWork.type === 3) {
							let offerBeanPre = releaseWork.offerBeanPre;
							self.acceptanceTypeIndex = self.acceptanceTypeList.findIndex(item => item ===
								offerBeanPre.acceptanceType)

							if (!offerBeanPre.sampleWay || offerBeanPre.sampleWay === '无需样品') {
								// offerBeanPre.acceptanceCriteria = offerBeanPre.acceptanceDetails
							} else {
								if (offerBeanPre.acceptanceType === '按样品') {
									offerBeanPre.acceptanceDetails = offerBeanPre.acceptanceDetails.replace('%',
										'')
								} else if (offerBeanPre.acceptanceType === '按AQL标准') {
									offerBeanPre.qualityLevel = offerBeanPre.acceptanceDetails
									self.qualityLevelIndex = self.qualityLevelList.findIndex(item => item ===
										offerBeanPre.qualityLevel)
								}
							}

							self.acceptanceWayIndex = self.acceptanceWayList.findIndex(item => item ===
								offerBeanPre.acceptanceWay)
							self.goodsFreightWayIndex = self.goodsFreightWayList.findIndex(item => item ===
								offerBeanPre.goodsFreightWay)
							self.sampleFreightWayIndex = self.sampleFreightWayList.findIndex(item => item ===
								offerBeanPre.sampleFreightWay)
							self.settlementWayIndex = self.settlementWayList.findIndex(item => item ===
								offerBeanPre.settlementWay)

							releaseWork.offerBeanPre = offerBeanPre;
						} else {
							releaseWork.offerBeanPre = {
								count: 0,
								sampleWay: '发活方出样',
								acceptanceCriteria: '',
								acceptanceType: '按样品',
								qualityLevel: 'AQL2.5',
								acceptanceWay: '验完发货',
								settlementWay: '款到发货',
								accountPeriod: '',
								sampleFreightWay: '发活方承担',
								goodsFreightWay: '接活方承担',
								acceptanceDetails: '97',
							}
						}

						self.releaseWork = releaseWork;
					}
				});
			},

			//选择有效期
			expireDateChange(e) {
				this.releaseWork.expireDate = e.detail.value;
			},
			//交货日期
			deliveryDateChange(e) {
				this.releaseWork.deliveryDate = e.detail.value;
			},
			//两小时自动刷新
			switchChange(e) {
				let self = this
				this.releaseWork.isRefresh = !this.releaseWork.isRefresh;
				let goldCount = parseActionConsume("信息自动两小时刷新", this.userData.userVerifyStatus, this.userData
					.withValidBeanCard);

				if (!!e.target.value) {
					uni.showModal({
						title: '小二提示',
						content: '开通每两小时刷新一次功能，将扣除' + (!!goldCount ? goldCount : 5) + '颗金豆，是否开通？',
						confirmText: '确认',
						cancelText: "取消",
						cancelColor: "#999999",
						confirmColor: "#fb5318",
						success: function(res) {
							if (res.confirm) {
								self.releaseWork.isRefresh = true
							} else if (res.cancel) {
								self.releaseWork.isRefresh = false
							}
						}
					})
				} else {
					self.releaseWork.isRefresh = false
				}
			},
			//是否同意
			checkChanged(e) {
				if (!!e.detail.value && !!e.detail.value[0]) {
					this.isAgree = true;
				} else {
					this.isAgree = false;
				}
			},
			validate() {
				if (!this.releaseWork.title) {
					uni.showToast({
						icon: 'none',
						title: '请输入外发需求信息',
						duration: 3000
					})
					return false;
				}

				//数量校验
				if (this.releaseWork.type !== 1) {
					if (!this.releaseWork.count) {
						uni.showToast({
							title: "请输入数量！",
							icon: "none",
							duration: 3000
						})
						return false;
					}
				}
				if (!!this.releaseWork.count) {
					if (!((new RegExp(regex.digit_positive)).test(this.releaseWork.count))) {
						uni.showToast({
							icon: 'none',
							title: '数量只能为正整数',
							duration: 3000
						})
						return false;
					}
					if ((new RegExp(regex.decimal_begin_with_dot)).test(this.releaseWork.count)) {
						uni.showToast({
							icon: 'none',
							title: '输入的数量第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
				}
				//单价校验
				if (this.releaseWork.type === 3) {
					if (!this.releaseWork.unitPrice) {
						uni.showToast({
							title: "请输入单价！",
							icon: "none",
							duration: 3000
						})
						return false;
					}
				}
				if (!!this.releaseWork.unitPrice) {
					if ((new RegExp(regex.decimal_begin_with_dot)).test(this.releaseWork.unitPrice)) {
						uni.showToast({
							icon: 'none',
							title: '输入的单价第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!(new RegExp(regex.decimal_two_digit)).test(this.releaseWork.unitPrice)) {
						uni.showToast({
							icon: 'none',
							title: '单价只能输入数字和一位小数点且小数点只保留两位',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.decimal_positive)).test(this.releaseWork.unitPrice))) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
						return false;
					}
					if (this.releaseWork.unitPrice === '0.') {
						uni.showToast({
							icon: 'none',
							title: '单价格式错误',
							duration: 3000
						})
						return false;
					}
				}

				//图片校验
				if (this.uploadImgList.length === 0) {
					uni.showToast({
						icon: 'none',
						title: '至少上传一张产品图片',
						duration: 3000
					})
					return false;
				}

				if (!!this.releaseWork.depositRequire) {
					if ((new RegExp(regex.decimal_begin_with_dot)).test(this.releaseWork.depositRequire)) {
						uni.showToast({
							icon: 'none',
							title: '输入的保证金第一位不能为小数点',
							duration: 3000
						})
						return false;
					}
					if (!((new RegExp(regex.digit_positive)).test(this.releaseWork.depositRequire))) {
						uni.showToast({
							icon: 'none',
							title: '保证金只能为正整数',
							duration: 3000
						})
						return false;
					}
				}

				if (!!this.releaseWork.offerBeanPre) {
					if (!!this.releaseWork.offerBeanPre.count) {
						if (!((new RegExp(regex.digit_positive)).test(this.releaseWork.offerBeanPre.count))) {
							uni.showToast({
								icon: 'none',
								title: '请输入正数',
								duration: 3000
							})
							return false;
						}
						if (this.releaseWork.offerBeanPre.count > this.releaseWork.count) {
							this.releaseWork.offerBeanPre.count = this.releaseWork.count;
						}
					} else {
						this.releaseWork.offerBeanPre.count = this.releaseWork.count;
					}
				}

				if (this.releaseWork.offerBeanPre.sampleWay === '无需样品') {
					if (!this.acceptanceCriteria) {
						uni.showToast({
							title: '请输入无需样品时的验收标准!',
							icon: "none",
							duration: 3000,
						})
						return false;
					}
				}

				if (this.releaseWork.offerBeanPre.settlementWay === '账期') {
					if (!this.releaseWork.accountPeriod) {
						uni.showToast({
							title: '请输入账期天数!',
							icon: "none",
							duration: 3000,
						})
						return false;
					}
				}

				if (!this.isAgree) {
					uni.showToast({
						icon: 'none',
						title: '请勾选确认信息真实有效！',
						duration: 3000
					})
					return false;
				}
				return true;
			},

			submit() {
				if (!this.validate()) {
					return;
				}
				if (this.isSubmitting) {
					return
				}
				this.isSubmitting = true


				let paramsData = JSON.parse(JSON.stringify(this.releaseWork));
				paramsData["unitPrice"] = this.releaseWork.unitPrice * 1000;
				paramsData["totalPrice"] = this.releaseWork.unitPrice * 1000 * this.releaseWork.count;
				paramsData["usefulTimeStamp"] = regexDateStringToTimestamp(this.releaseWork.expireDate + 'T00:00:00'),
					paramsData["deliveryTimeStamp"] = !!this.releaseWork.deliveryDate ? regexDateStringToTimestamp(this
						.releaseWork.deliveryDate + 'T00:00:00') : null;
				paramsData["depositRequire"] = !!this.releaseWork.depositRequire ? this.releaseWork.depositRequire * 1000 :
					null;

				if (this.releaseWork.factoryRequire.indexOf("自选") > -1) {
					paramsData["addressDetails"] = shortProvince(provinceData[this.cityPickerValueDefault[0]].label) +
						(!cityData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]].value ? '' : (',' +
							shortCity(cityData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]].label))) +
						(!areaData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]][this
							.cityPickerValueDefault[2]
						].value ? '' : (',' +
							shortArea(areaData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]][this
								.cityPickerValueDefault[2]
							].label)));
				} else {
					if (!!this.location) {
						paramsData["addressDetails"] = shortProvince(this.location.province) +
							(this.location.city ? ',' + shortCity(this.location.city) : '') +
							(this.location.area ? ',' + shortArea(this.location.area) : '');
					}
				}

				paramsData['img'] = JSON.stringify(this.uploadImgList);

				if (this.releaseWork.type === 3) {
					paramsData['offerBean'] = {
						workingWay: this.releaseWork.workingWay,
						acceptanceWay: this.releaseWork.offerBeanPre.acceptanceWay,
						count: this.releaseWork.offerBeanPre.count,
						goodsFreightWay: this.releaseWork.offerBeanPre.goodsFreightWay,
						price: parseFloat(this.releaseWork.totalPrice) * 1000,
						priceType: 1,
						sampleWay: this.releaseWork.offerBeanPre.sampleWay,
						settlementWay: this.releaseWork.offerBeanPre.settlementWay,
						secondPartDepositRequire: this.releaseWork.depositRequire * 1000,
						firstPartDepositRequire: 0
					}
					if (this.releaseWork.offerBeanPre.settlementWay === '账期') {
						paramsData['offerBean']['accountPeriod'] = this.releaseWork.offerBeanPre.accountPeriod
					}
					if (this.releaseWork.offerBeanPre.sampleWay === '无需样品') {
						paramsData['offerBean']['acceptanceDetails'] = this.releaseWork.offerBeanPre.acceptanceCriteria
						paramsData['offerBean']['sampleFreightWay'] = ''
						paramsData['offerBean']['acceptanceType'] = ''

					} else {
						if (this.releaseWork.offerBeanPre.acceptanceType === '按样品') {
							paramsData['offerBean']['acceptanceDetails'] = this.releaseWork.offerBeanPre
								.acceptanceDetails +
								'%'
							paramsData['offerBean']['sampleFreightWay'] = this.releaseWork.offerBeanPre.sampleFreightWay
							paramsData['offerBean']['acceptanceType'] = this.releaseWork.offerBeanPre.acceptanceType
						} else {
							paramsData['offerBean']['acceptanceDetails'] = this.releaseWork.offerBeanPre.qualityLevel
							paramsData['offerBean']['sampleFreightWay'] = this.releaseWork.offerBeanPre.sampleFreightWay
							paramsData['offerBean']['acceptanceType'] = this.releaseWork.offerBeanPre.acceptanceType
						}
					}
				}

				let self = this
				postReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: '信息提交成功，待平台审核通过后，即会展出',
							duration: 3000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1,
							})
						}, 3000)
					} else {
						self.isSubmitting = false;
					}
				}).catch(() => {
					self.isSubmitting = false;
				});
			},
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
		},
		/**
		 * 用户点击右上角分享 ---小程序
		 */
		onShareAppMessage: function(ops) {
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

	}
</script>

<style scoped lang="scss">
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

				color: #191919;
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

		.blank {
			height: 240rpx;
		}
	}

	/* #ifdef MP-WEIXIN  */
	::v-deep checkbox .wx-checkbox-input {
		border-color: #fb5318 !important;
		color: #fb5318 !important;
		border-radius: 8rpx;
	}

	::v-deep checkbox {
		transform: scale(0.65);
	}

	/* #endif  */

	/* #ifndef MP-WEIXIN  */
	/* checkbox 边框颜色 */
	::v-deep uni-checkbox .uni-checkbox-input {
		border-color: #fb5318 !important;
		transform: scale(0.45);
		padding: 6rpx !important;
		border-radius: 80rpx !important;
	}

	/* checkbox 选中后的边框颜色 */
	::v-deep uni-checkbox .uni-checkbox-input-checked {
		border-color: #fb5318 !important;
	}

	/* checkbox 选中后的样式 */
	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked {
		background-color: #fb5318 !important;
		border-color: #fb5318 !important;
		background-clip: content-box !important;
		padding: 6rpx !important;
	}

	/* checkbox 选中后的图标样式*/
	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked::before {
		display: none !important;
	}

	/* #endif  */
</style>