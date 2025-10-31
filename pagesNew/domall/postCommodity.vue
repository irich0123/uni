<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商品发布" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view
				class="radius-s margin-lr-sm margin-top-sm bg-white flex padding-top padding-bottom-sm text-df justify-center flex-wrap">
				<uni-steps :options="stepList" direction="row" :active="active" style="width:100%" />
			</view>

			<uni-forms :modelValue="commodity" labelPosition="left" validateTrigger="bind" border
				:rules="commodityRules">
				<!--        商品发布开始-->
				<view v-if="stepList[active].value===0">
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="标题：" name="title" required>
							<uni-easyinput type="textarea" v-model="commodity.title" :clearable="false"
								placeholder="请输入商品标题" autoHeight maxlength="500" :inputBorder="false" />
						</uni-forms-item>

						<uni-forms-item label="数量：" required name="qtyInStock" label-width="120">
							<uni-easyinput type="digit" v-model="commodity.qtyInStock" :clearable="false"
								placeholder="请输入数量" :inputBorder="false" />
							<picker mode="selector" @change="unitChange" :value="unitIndex" :range="unitList">
								<view class="flex">
									<text class="text-black-4 margin-left-xs">{{ unit }}</text>
									<uni-icons color="#cccccc" size="18" type="bottom"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>
					</view>

					<!--        图片开始-->
					<view class="margin-bottom-sm radius-s bg-white flex flex-direction padding text-df">
						<view class="padding-tb-sm flex">
							<text class="text-theme margin-right-xxs text-bold">*</text>
							<text class="padding-right-sm">添加产品图片：</text>
							<uni-icons type="help" size="18" @click="helpClicked(0)" :color="theme?'#333':'#ccc'" />
						</view>
						<upload-img-bar @changed="mediaChanged" :img-list="uploadImgList" :img-length-max="5"
							ref="uploadImgBar" />
					</view>
					<!--        图片结束-->

					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="详情：" name="description">
							<uni-easyinput type="textarea" v-model="commodity.description" :clearable="false"
								placeholder="请输入商品详细说明" autoHeight maxlength="980" :inputBorder="false" />
						</uni-forms-item>
					</view>

					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="整单出售：" name="isRefresh0">
							<switch :checked="commodity.saleType===0" color="#fb5318" @change="switchSaleType"
								:data-id="0" />
						</uni-forms-item>
						<uni-forms-item label="批发 以量定价：" name="isRefresh1" label-width="180">
							<switch :checked="commodity.saleType===1" color="#fb5318" @change="switchSaleType"
								:data-id="1" />
						</uni-forms-item>
						<uni-forms-item label="零售：" name="isRefresh2">
							<switch :checked="commodity.saleType===2" color="#fb5318" @change="switchSaleType"
								:data-id="2" />
						</uni-forms-item>
					</view>

					<view class="blank"></view>

					<!--        底部按钮开始-->
					<view class="bg-white flex" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
						<view class="flex align-center flex-grow">
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-grow"
								:style="!showBaseForward?'border: 2rpx solid #ccccccc !important;':''"
								:disabled="!showBaseForward" @click="navigateForward">下一步</button>
						</view>
					</view>
					<!--        底部按钮结束-->
				</view>
				<!--        商品发布结束-->

				<!--        设置整单单价开始-->
				<view v-if="stepList[active].value===1 && (commodity.saleType===0 || commodity.saleType===2)">
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="起售数量：" required name="minQuantity" label-width="120">
							<uni-easyinput type="number" v-model="commodity.minQuantity" :clearable="false"
								placeholder="请输入起售数量" :disabled="disableMinQuantity" :inputBorder="false" />
							<text class="text-black-4 margin-left-xs">{{ unit }}</text>
						</uni-forms-item>

						<uni-forms-item label="单价：" required name="unitPrice">
							<uni-easyinput type="digit" v-model="commodity.unitPrice" :clearable="false"
								placeholder="请输入单价" :inputBorder="false" />
							<text class="text-black-4 margin-left-xs">元</text>
						</uni-forms-item>

						<uni-forms-item label="货物总价：" name="totalPrice" v-show="commodity.saleType===0">
							<view class="total-price">{{ commodity.totalPrice }}</view>
							<text class="text-black-4 margin-left-xs">元</text>
						</uni-forms-item>

						<uni-forms-item label="可议价：" name="isPriceNegotiable">
							<switch :checked="commodity.isPriceNegotiable" color="#fb5318"
								@change="switchPriceNegotiable" />
						</uni-forms-item>
					</view>

					<view class="blank"></view>
					<!--        底部按钮开始-->
					<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
						<view class="flex align-center flex-grow">
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-sub"
								@click="navigateBack">上一步</button>
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-twice"
								:style="!showBaseForward?'border: 2rpx solid #ccccccc !important;':''"
								:disabled="!showPriceForward" @click="navigateForward">
								下一步
							</button>
						</view>
					</view>
					<!--        底部按钮结束-->
				</view>
				<!--         设置整单单价结束-->
				<!--        批发价格设置开始-->
				<view v-if="stepList[active].value===1 && commodity.saleType === 1">
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="可议价：" name="isPriceNegotiable">
							<switch :checked="commodity.isPriceNegotiable" color="#fb5318"
								@change="switchPriceNegotiable" />
						</uni-forms-item>
					</view>

					<view class="bg-white radius margin-bottom-sm">
						<view class="text-df padding-sm gray-border-bottom bg-white radius-l">
							<view class="padding-top-sm text-lg">
								<text class="text-theme padding-lr-xss">*</text>
								<text>批发价格配置:</text>
							</view>
							<view>
								<view class="flex text-gray padding-tb-sm gray-border-bottom"
									style="line-height: 35px;">
									<view class="padding-lr-sm text-white">≥</view>
									<view style="width:30%;">数量</view>
									<view class="flex">单价</view>
								</view>
								<view class="price_box flex text-gray padding-tb-sm gray-border-bottom"
									style="line-height: 35px;" v-for="(item,index) in wholePriceList" :key="index">
									<view class="padding-lr-sm text-white">≥</view>
									<view class="flex">
										<input
											class="gray-border-1 radius-s text-black padding-right-xs margin-right-xs text-right"
											style="height: 60rpx;width: 100rpx;" type="number"
											v-model="item.quantity" />
										<view class="text-black">
											{{ unit }}
										</view>
									</view>
									<view class="flex margin-left-xl2">
										<input
											class="gray-border-1 radius-s text-black padding-right-xs margin-right-xs text-right"
											style="height: 60rpx;width: 100rpx;" type="number" v-model="item.price" />
										<view class="text-black">
											元/{{ unit }}
										</view>
									</view>
									<view class="flex margin-left-sm">
										<view class="radius-s gray-border-1 text-center text-lg margin-left-xs"
											style="height: 60rpx;width: 60rpx;line-height: 60rpx;" v-if="item.plus"
											@click.stop="addNode(index)">
											+
										</view>
										<view class="radius-s gray-border-1 text-center text-lg margin-left-xs"
											style="height: 60rpx;width: 60rpx;line-height: 60rpx;" v-if="item.deduct"
											@click.stop="deleteNode(index)">
											-
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<view class="blank"></view>
					<!--        底部按钮开始-->
					<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
						<view class="flex align-center flex-grow">
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-sub"
								@click="navigateBack">上一步</button>
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-twice"
								:style="!showPriceForward?'border: 2rpx solid #ccccccc !important;':''"
								:disabled="!showPriceForward" @click="navigateForward">下一步
							</button>
						</view>

					</view>
					<!--        底部按钮结束-->
				</view>
				<!--        批发价格设置结束-->


				<!--        物流相关开始-->
				<view v-if="stepList[active].value===2">
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="发货城市：" required name="city" labelWidth="120" @click.native="loadCity">
							<uni-easyinput type="text" v-model="cityLabel.name" :clearable="false" disabled
								placeholder="请选择" :inputBorder="false" />
							<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
						</uni-forms-item>

						<uni-forms-item label="承运商：" required name="carrier">
							<picker mode="selector" @change="carrierChange" :value="carrierIndex" :range-key="'name'"
								:range="carrierList">
								<view class="flex">
									<view class="text-black-4">{{ carrierName }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>
					</view>

					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="运费到付：" name="isShippingCostIncluded">
							<switch :checked="!commodity.isShippingCostIncluded" color="#fb5318"
								@change="switchShippingCostIncluded"></switch>
						</uni-forms-item>

						<uni-forms-item label="卖方包运费：" name="isShippingCostBySeller"
							v-show="commodity.isShippingCostIncluded">
							<switch :checked="commodity.isShippingCostBySeller" color="#fb5318"
								@change="switchShippingCostBySeller"></switch>
						</uni-forms-item>

						<uni-forms-item label="运费：" required name="shippingCost" labelWidth="120"
							v-if="commodity.isShippingCostIncluded && !commodity.isShippingCostBySeller">
							<uni-easyinput type="number" v-model="commodity.shippingCost" :clearable="false"
								placeholder="请输入运费" :inputBorder="false" />
							<view class="margin-left-ssm">元</view>
						</uni-forms-item>


					</view>

					<view class="blank"></view>
					<!--        底部按钮开始-->
					<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
						<view class="flex align-center flex-grow">
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-sub"
								@click="navigateBack">上一步</button>
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-twice"
								:style="!showLogisticForward?'border: 2rpx solid #ccccccc !important;':''"
								:disabled="!showLogisticForward" @click="navigateForward">
								下一步
							</button>
						</view>
					</view>
					<!--        底部按钮结束-->
				</view>
				<!--        物流相关结束-->

				<!--        商品分类及展示开始-->
				<view v-if="stepList[active].value===3">
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="行业：" required name="industry">
							<picker mode="selector" @change="industryChange" :value="industryIndex"
								:range-key="'industry'" :range="industryList">
								<view class="flex">
									<view class="text-black-4">{{ industry }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>
					</view>

					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="商品类别：" name="commodityType">
							<picker mode="selector" @change="commodityTypeChange" :value="commodityTypeIndex"
								:range-key="'commodityTypeName'" :range="commodityTypeList">
								<view class="flex">
									<view class="text-black-4">{{ commodityTypeName }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>

						<uni-forms-item label="商品性质：" name="commodityClass">
							<picker mode="selector" @change="commodityClassChange" :value="commodityClassIndex"
								:range-key="'commodityClassName'" :range="commodityClassList">
								<view class="flex">
									<view class="text-black-4">{{ commodityClassName }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>

					</view>
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="展示日期：" name="exhibitionDate">
							<picker mode="date" :disabled="disableShowDate" :value="exhibitionDate"
								:class="disableShowDate?'date-disable':''" :start="exhibitionStartDate"
								:end="exhibitionEndDate" @change="exhibitionDateChanged">
								<view class="flex">
									<view class="text-black-4">{{ exhibitionDate }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>

						<uni-forms-item label="结束日期：" name="expireDate">
							<picker mode="date" :disabled="disableShowDate" :value="expireDate"
								:class="disableShowDate?'date-disable':''" :start="expireStartDate" :end="expireEndDate"
								@change="expireStartDateChanged">
								<view class="flex">
									<view class="text-black-4">{{ expireDate }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</uni-forms-item>
					</view>
					<view class="bg-white radius margin-bottom-sm">
						<uni-forms-item label="联系方式：" required name="phone" labelWidth="100">
							<uni-easyinput type="number" v-model="commodity.phone" :clearable="false"
								:inputBorder="false" />
						</uni-forms-item>
						<uni-forms-item label="公开联系方式：" name="isPhoneOpenedToPublic" labelWidth="120">
							<switch :checked="commodity.isPhoneOpenedToPublic" color="#fb5318"
								@change="switchPhoneOpenedToPublic"></switch>
						</uni-forms-item>

						<uni-forms-item label="自动刷新：" name="isRefresh">
							<switch :checked="commodity.isRefresh" color="#fb5318" disabled="true"
								@change="switchRefresh">
							</switch>
						</uni-forms-item>

					</view>
					<view class="blank"></view>
					<!--        底部按钮开始-->
					<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
						<view class="flex align-center flex-grow">
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-sub"
								@click="navigateBack">上一步</button>
							<button class="bg-theme theme-border text-xl color-white radius-0 flex-twice"
								:style="!showSubmitBtn?'border: 2rpx solid #ccccccc !important;':''"
								:disabled="!showSubmitBtn" @click="submitCommodity">发布商品
							</button>
						</view>
					</view>
					<!--        底部按钮结束-->
				</view>
				<!--        商品分类及展示结束-->
			</uni-forms>
		</scroll-view>
		<mpvue-city-picker ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault"
			@onConfirm="onConfirmCity"></mpvue-city-picker>
	</view>
</template>

<script>
	import uniSteps from '../components/uni-steps-row.vue'
	import {
		platform,
		imgUrl,
		regex,
		active
	} from "@/utils/config";
	import UniEasyInput from "../../components/uni-easyinput/uni-easyinput";
	import UniForms from "../../components/uni-forms/uni-forms";
	import uniFormsItem from "../../components/uni-forms-item/uni-forms-item";
	import UniIcons from '../../components/uni-icons/uni-icons.vue'
	import mpvueCityPicker from '../../components/mpvue-citypicker/src/mpvueCityPicker';
	import {
		calculateMath,
		formatTime,
		formatTimeNoHour,
		priceTranslate,
		regexDateStringToTimestamp
	} from "@/utils/myUtil";
	import provinceData from "../../components/mpvue-citypicker/src/city-data/province";
	import cityData from "../../components/mpvue-citypicker/src/city-data/city";
	import areaData from "../../components/mpvue-citypicker/src/city-data/area";
	import {
		getCarrierList,
		getCommodityById,
		postCommodity,
		updateCommodity
	} from "@/api/mall";
	import {
		getCommodityClassEnum,
		getCommodityTypeEnum,
	} from "@/api/basic";
	import uploadImgBar from "../../utils/yjg-upload/upload-img-bar";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "postCommodity",
		components: {
			uniSteps,
			UniForms,
			uniFormsItem,
			UniIcons,
			UniEasyInput,
			mpvueCityPicker,
			uploadImgBar,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				active: 0,

				commodity: {
					id: null,
					saleType: 0, //销售类型
					title: null,
					description: null,
					qtyInStock: null,
					unit: null,
					isPriceNegotiable: false,
					carrierId: null, //承运商id
					industryId: null,
					shippingCost: null,
					commodityType: null,
					commodityClass: null,
					phone: null,
					isPhoneOpenedToPublic: false,
					isShippingCostIncluded: null, //TRUE==预付  false=到付
					isShippingCostBySeller: false,

					minQuantity: null,
					unitPrice: null,

					totalPrice: '',
				},

				unitIndex: 0,
				unitList: ["件", "米", "只", "套", "吨", "个", "条", "对", "双"],
				unit: '件',

				cityLabel: {
					nane: null,
					code: null,
				},
				cityPickerValueDefault: [0, 0, 0],

				carrierIndex: null,
				carrierList: [],
				carrierName: '',

				industryList: [], //所有行业数据
				industryIndex: 2,
				industry: null,

				commodityTypeList: [], //所有行业数据
				commodityTypeIndex: 0,
				commodityTypeName: null,

				commodityClassList: [], //所有行业数据
				commodityClassIndex: 0,
				commodityClassName: null,

				uploadImgList: [],

				showBaseForward: true,
				showPriceForward: false,
				showLogisticForward: false,
				showSubmitBtn: false,

				disableMinQuantity: false,

				isShowWholesale: false,
				isShowSaleType0: false, //整单和零售销售显示div
				isShowTotalPrice: false, //整单销售显示，零售不显示
				disableQuantity: true,
				isShowCarrier: false,
				isShowMallType: false, //分批出售显示的div

				deduct: false,
				plus: true,

				token: null,
				userData: {},

				addressId: '', //地址id
				showAddress: '请选择',

				updateImgList: [], //图片链接

				exhibitionDate: '', //显示的展示日期
				exhibitionStartDate: '',
				exhibitionEndDate: '',
				expireStartDate: '', //结束日期
				showEndDate: '', //显示的结束日期
				expireEndDate: '',
				expireDate: '',

				id: null,
				renew: null, //1---说明是重发

				wholePriceList: [],
				disableShowDate: false,


				titleName: '',

				stepList: [{
					title: '商品',
					value: 0,
				}, {
					title: '定价',
					value: 1,
				}, {
					title: '物流',
					value: 2,
				}, {
					title: '提交',
					value: 3,
				}],
				isSubmitting: false,

				commodityRules: {
					qtyInStock: {
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
					minQuantity: { //这个校验不生效，不知道哪里出错了
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
					phone: {
						rules: [{
								format: 'number',
								errorMessage: '只能输入数字'
							},
							{
								pattern: regex.mobile,
								errorMessage: '请输入正确的手机号码'
							},
						]
					}
				},

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

				theme: null,
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
		computed: {
			'calTotalPrice': function() {
				let result = {};
				result.unitPrice = !this.commodity.unitPrice ? 0 : Number(this.commodity.unitPrice);
				result.qtyInStock = !this.commodity.qtyInStock ? 0 : Number(this.commodity.qtyInStock);
				return result;
			},
			price1: function() { //批发
				let result = {};
				result.wholePriceList = this.wholePriceList;
				return result;
			},
			price0: function() { //整单
				let result = {};
				result.unitPrice = !this.commodity.unitPrice ? 0 : Number(this.commodity.unitPrice);
				return result;
			},
			price2: function() { //零售
				let result = {};
				result.qtyInStock = !this.commodity.qtyInStock ? 0 : Number(this.commodity.qtyInStock);
				result.unitPrice = !this.commodity.unitPrice ? 0 : Number(this.commodity.unitPrice);
				result.minQuantity = !this.commodity.minQuantity ? 0 : (Number(this.commodity.minQuantity));
				// result.minQuantity = Number(this.yjg-commodity.minQuantity);
				return result;
			},
			shipping: function() {
				let result = {};
				result.cityLabel = this.cityLabel;
				result.isShippingCostIncluded = this.commodity.isShippingCostIncluded;
				result.isShippingCostBySeller = this.commodity.isShippingCostBySeller;
				result.shippingCost = !this.commodity.shippingCost ? 0 : this.commodity.shippingCost;
				result.carrierIndex = this.carrierIndex;
				return result;
			},
			submitting: function() {
				let {
					industryId,
					phone
				} = this.commodity;
				return {
					industryId,
					phone
				};
			}
		},
		watch: {
			//计算整批出售的货物总价
			calTotalPrice: function(val) {
				if (!!val.qtyInStock && !!val.unitPrice) {
					this.commodity.totalPrice = (val.qtyInStock * val.unitPrice).toFixed(2)
				} else {
					this.commodity.totalPrice = ''
				}
			},
			price1: {
				handler(newValue) {
					if (this.commodity.saleType === 1) {
						console.log(newValue);
						let BreakException = {};
						if (!!newValue && newValue.length > 0) {
							try {
								newValue.forEach(v => {
									if (!this.quantityValidate(Number(v.quantity)) || !this.unitPriceValidate(
											Number(v.price))) {
										throw BreakException;
									}
								})
							} catch (e) {
								this.showPriceForward = false;
								return;
							}
						}
						this.showPriceForward = true;
					}
				},
				deep: true
			},
			price0: function(val) {
				if (this.commodity.saleType === 0) {
					this.showPriceForward = (!!val.unitPrice && this.unitPriceValidate(val.unitPrice, true));
				}
			},
			price2: function(newVal) {
				console.log(newVal);
				if (this.commodity.saleType === 2) {
					if (!this.quantityValidate(newVal.minQuantity, false)) {
						this.showPriceForward = false;
						return;
					}
					if (newVal.qtyInStock < newVal.minQuantity) {
						uni.showToast({
							title: "起售数量不能超过库存数量！",
							icon: "none",
							duration: 2000
						})
						this.showPriceForward = false;
						return;
					}

					this.showPriceForward = (!!newVal.minQuantity && !!newVal.unitPrice);
				}
			},
			shipping: function(val) {
				console.log(val);
				let needShippingCost = val.isShippingCostIncluded && !val.isShippingCostBySeller;
				if (needShippingCost && !val.shippingCost) {
					this.showLogisticForward = false;
				} else this.showLogisticForward = !!val.cityLabel.name && !!val.carrierIndex;
			},
			submitting: function(val) {
				this.showSubmitBtn = !!val.phone && new RegExp(regex.mobile).test(val.phone) && !!val.industryId;
			},
			statusbarHeight: {
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
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

			// #ifdef APP-PLUS
			this.theme = uni.getStorageSync("theme");
			// #endif

			this.commodity.phone = this.userData.mobile;

			this.id = parseInt(options.id);
			this.renew = parseInt(options.renew)

			if (!!this.id) {
				this.getCommodityDetailsById(this.id);
				if (!!this.renew) {
					this.id = null;
				}
			}
			this.disableShowDate = !!this.id;

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

			if (!this.token) {
				this.toLogin();
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
				this.getIndustryAll();
				this.getCarrierList();

				this.getCommodityTypeList();
				this.getCommodityClassesList();

				setTimeout(() => {
					this.initView();
				}, 1000);
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
			initView() {
				this.initUnitPicker();
				this.submitInit();
			},
			initCarrierPicker() {
				if (this.carrierIndex != null) {
					this.carrierName = this.carrierList[this.carrierIndex].name;
				} else {
					this.carrierName = '请选择';
				}
			},
			initCityPicker() {
				if (!this.cityLabel || !this.cityLabel.name) {
					let location = uni.getStorageSync('locationMap');
					if (location) {
						this.cityLabel.name = location.province + (location.city ? '-' + location.city : '') + (location
							.area ?
							'-' + location.area : '');
						this.commodity.addressCityId = location.code;
					}
					//初始化城市
					this.loadCityPickerDefault({
						province: location.province,
						city: location.city,
						area: location.area ? location.area : location.city,
					});
				}
			},
			initIndustryPicker() {
				if (this.industryIndex != null) {
					this.industry = this.industryList[this.industryIndex].industry;
					this.commodity.industryId = this.industryList[this.industryIndex].id;
				} else {
					this.industry = '请选择';
					this.commodity.industryId = 0;
				}
			},
			initUnitPicker() {
				if (this.unitIndex == null) {
					this.unitIndex = 0;
				}
				this.unit = this.unitList[this.unitIndex];
				this.commodity.unit = this.unitList[this.unitIndex];
			},
			carrierChange(e) {
				this.carrierIndex = e.detail.value;
				this.carrierName = this.carrierList[this.carrierIndex].name;
				this.commodity.carrierId = this.carrierList[this.carrierIndex].id;
			},
			initCommodityTypePicker() {
				if (this.commodityTypeIndex != null) {
					this.commodityTypeName = this.commodityTypeList[this.commodityTypeIndex].commodityTypeName;
					this.commodity.commodityType = this.commodityTypeList[this.commodityTypeIndex].id;
				}
			},
			initCommodityClassPicker() {
				if (this.commodityClassIndex != null) {
					this.commodityClassName = this.commodityClassList[this.commodityClassIndex].commodityClassName;
					this.commodity.commodityClass = this.commodityClassList[this.commodityClassIndex].id;
				}
			},
			getCarrierList() {
				let self = this;
				getCarrierList().then(res => {
					if (res.retCode === 0) {
						self.carrierList.splice(0, self.carrierList.length);
						self.carrierList.push({
							id: 0,
							name: '请选择',
						})
						res.data.forEach(v => {
							self.carrierList.push({
								id: v.id,
								name: v.name
							})
						})

						if (self.commodity.carrierId) {
							self.carrierIndex = (self.carrierList || []).findIndex(v => v.id === self.commodity
								.carrierId);
							self.initCarrierPicker();
						}
					}
				});
			},

			//整单或者零售上一步
			navigateBack() {
				if (this.active > 0) {
					this.active--;
				}
			},

			validate(id) {
				if (id === 0) {
					if (!this.commodity.title) {
						uni.showToast({
							title: '商品标题不能为空！',
							icon: 'none',
							duration: 2000,
						})
						return false;
					}
					if (!this.commodity.qtyInStock) {
						uni.showToast({
							title: '请输入库存数量！',
							icon: 'none',
							duration: 2000,
						})
						return false;
					}
					if (Number(this.commodity.qtyInStock) === 0) {
						uni.showToast({
							title: '库存数量不能为零！',
							icon: 'none',
							duration: 2000,
						})
						return false;
					}
					if (!new RegExp(regex.digit_positive).test(this.commodity.qtyInStock)) {
						uni.showToast({
							title: '库存数量只能是正整数！',
							icon: 'none',
							duration: 2000,
						})
						return false;
					}
					if (this.uploadImgList.length === 0) {
						uni.showToast({
							title: '请至少上传一张图片！',
							icon: 'none',
							duration: 2000,
						})
						return false;
					}
				}
				return true;
			},
			//设置批发价格下一步
			navigateForward() {
				if (this.active === 0) {
					if (!this.validate(0)) {
						return;
					}
				}
				if (this.active === 1 && this.commodity.saleType === 1) {
					this.wholePriceList = this.sort(this.wholePriceList);
				}

				if (this.active < 4) {
					this.active++;
				}
				//后
				if (this.active === 1) { //进入价格
					this.priceViewInit();
				} else if (this.active === 2) { //进入物流
					this.logisticInit();
				} else if (this.active === 3) {
					this.submitInit();
				}
			},

			priceViewInit() {
				if (this.commodity.saleType === 0) { //整单销售
					this.commodity.minQuantity = this.commodity.qtyInStock;
					this.disableMinQuantity = true;
				} else if (this.commodity.saleType === 1) {
					if (this.wholePriceList.length === 0) {
						this.wholePriceList.push({
							quantity: 1,
							price: null,
							plus: true,
							deduct: false
						});
					}
				} else if (this.commodity.saleType === 2) {
					if (!this.commodity.minQuantity) {
						this.commodity.minQuantity = 1;
					}
					this.disableMinQuantity = false;
				}
			},
			logisticInit() {
				if (this.commodity.saleType === 0 || this.commodity.saleType === 1) { //整单 和 批发
					if (this.commodity.isShippingCostIncluded === null) {
						this.commodity.isShippingCostIncluded = false; //是否到付
					}
				} else if (this.commodity.saleType === 2) { //零售
					if (this.commodity.isShippingCostIncluded === null) {
						this.commodity.isShippingCostIncluded = true;
					}
				}

				this.initCarrierPicker();
				this.initCityPicker();

			},
			submitInit() {
				this.generateTimeDuration();
				this.initIndustryPicker();
				this.initCommodityTypePicker();
				this.initCommodityClassPicker();
			},

			generateTimeDuration() {
				let day = 24 * 3600 * 1000;
				if (!this.disableShowDate) {
					if (!this.exhibitionDate) {
						this.exhibitionDate = formatTimeNoHour(new Date());
						this.exhibitionStartDate = this.exhibitionDate;
						this.exhibitionEndDate = formatTimeNoHour(new Date(regexDateStringToTimestamp(this.exhibitionDate +
							"T00:00:00") + 7 * day));
					} else {
						//不空的时候，一般就不让改
					}

					if (!this.expireDate) {
						this.expireDate = formatTimeNoHour(new Date(new Date().getTime() + 10 * day));
						this.expireStartDate = formatTimeNoHour(new Date());
						this.expireEndDate = formatTimeNoHour(new Date(new Date().getTime() + 365 * day));
					} else {
						//不空的时候，一般就不让改
					}
				}
			},
			loadCityPickerDefault(locationMap) {
				let cityPickerValueDefault = [];
				console.log(locationMap);
				if (locationMap.province) {
					let provinceId = provinceData.findIndex(item => {
						return item.label.indexOf(locationMap.province) > -1;
					});
					console.log(provinceId);
					if (provinceId < 0) {
						provinceId = 0;
					}
					cityPickerValueDefault.push(provinceId);
					if (locationMap.city) {
						let cityId = cityData[provinceId].findIndex(item => {
							return item.label.indexOf(locationMap.city) > -1;
						});
						console.log(cityId);
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
							console.log(areaId);
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
			industryChange: function(e) {
				this.industryIndex = e.target.value;
				this.commodity.industryId = this.industryList[this.industryIndex].id;
				this.industry = this.industryList[this.industryIndex].industry;
			},
			//获取所有行业
			getIndustryAll() {
				let array = uni.getStorageSync("allIndustry");
				if (array) {
					this.industryList.splice(0, this.industryList.length);
					this.industryList.push({
						id: null,
						industry: "请选择",
					});
					array.splice(0, 1);
					array.forEach(v => {
						this.industryList.push({
							id: v.id,
							industry: v.industry,
						});
					})
				}
				if (this.commodity.industryId) {
					this.industryIndex = (this.industryList || []).findIndex((item) => item.id === this.commodity
						.industryId)
				}
				this.initIndustryPicker();
			},
			//根据商品id获取商品详情信息
			getCommodityDetailsById(id) {
				let paramsData = {
					id: id
				}
				let self = this;
				getCommodityById(paramsData).then(res => {
					if (res.retCode === 0) {
						let commodity = res.data;

						self.unit = commodity.unit;

						if (self.unit) {
							self.unitIndex = self.unitList.findIndex(v => v === self.unit);
							self.initUnitPicker();
						}

						if (!commodity.photos) {
							self.uploadImgList = [];
						} else {
							let uploadImgList = JSON.parse(commodity.photos);
							uploadImgList.forEach(v => {
								self.uploadImgList.push(v.webPath);
							})
						}

						if (commodity.unitPriceBreakdown) {
							self.wholePriceList.splice(0, self.wholePriceList.length);
							let priceBreakDown = JSON.parse(commodity.unitPriceBreakdown);
							priceBreakDown.forEach(v => {
								self.wholePriceList.push({
									quantity: v.n,
									price: v.p != null ? (v.p / 1000) : null,
									plus: true,
									deduct: true,
								});
							});
						}
						console.log(self.wholePriceList);


						if (!self.wholePriceList || self.wholePriceList.length === 0) {
							self.wholePriceList.push({
								quantity: 1,
								price: null,
								plus: true,
								deduct: false
							});
						}
						if (self.wholePriceList.length > 0) {
							self.wholePriceList[0].deduct = false;
						}

						if (self.wholePriceList.length > 0) {
							if (commodity.saleType === 0) {
								commodity.minQuantity = commodity.qtyInStock;
								commodity.unitPrice = self.wholePriceList[self.wholePriceList.length - 1].price;
							}
							if (commodity.saleType === 1 || commodity.saleType === 2) {
								commodity.minQuantity = self.wholePriceList[0].quantity;
								commodity.unitPrice = self.wholePriceList[0].price;
							}
						} else {
							commodity.unitPrice = commodity.unitPriceMin / 1000;
							if (commodity.saleType === 0) {
								commodity.minQuantity = commodity.qtyInStock;
							}
							if (commodity.saleType === 2) {
								commodity.minQuantity = 1;
							}
						}

						console.log("minQuantity", commodity.minQuantity);
						console.log("qtyInStock", commodity.qtyInStock);
						console.log("unitPrice", commodity.unitPrice);

						//展示中，不能修改展示时间
						self.disableShowDate = commodity.status === 1;

						//承运商
						if (commodity.carrierId) {
							self.carrierIndex = (self.carrierList || []).findIndex((item) => item.id === commodity
								.carrierId);
							self.initCarrierPicker();
						}

						if (commodity.industryId) {
							self.industryIndex = (self.industryList || []).findIndex((item) => item.id ===
								commodity.industryId);
							self.initIndustryPicker();
						}

						if (commodity.commodityClass) {
							self.commodityClassIndex = (self.commodityClassList || []).findIndex(v => v.id ===
								commodity.commodityClass);
							self.initCommodityClassPicker();
						}

						if (commodity.commodityType) {
							self.commodityTypeIndex = (self.commodityTypeList || []).findIndex(v => v.id ===
								commodity.commodityType);
							self.initCommodityTypePicker();
						}

						commodity.shippingCost = commodity.shippingCost / 1000;

						if (!this.renew) {
							this.exhibitionDate = formatTimeNoHour(new Date(res.data.startShowTime))
							this.expireDate = formatTimeNoHour(new Date(res.data.endShowTime))
						} else {
							commodity.id = null;
						}

						if (!!commodity.addressCityId) {
							let cityPickerValueDefault = [];
							let provinceIndex = provinceData.findIndex(v => v.value === (commodity.addressCityId
								.substring(0, 2)));
							cityPickerValueDefault.push(provinceIndex);
							let cityIndex = null,
								areaIndex = null;
							if (provinceIndex !== -1) {
								cityIndex = cityData[provinceIndex].findIndex(v => v.value === (commodity
									.addressCityId.substring(0, 4)));
								cityPickerValueDefault.push(cityIndex);
								if (cityIndex !== -1) {
									areaIndex = areaData[provinceIndex][cityIndex].findIndex(v => v.value === (
										commodity.addressCityId));
									cityPickerValueDefault.push(areaIndex);

									self.cityLabel.name = (provinceIndex >= 0 ? provinceData[provinceIndex].label :
											'') +
										(cityIndex >= 0 ? '-' + cityData[provinceIndex][cityIndex].label : '') +
										(areaIndex >= 0 ? '-' + areaData[provinceIndex][cityIndex][areaIndex]
											.label : '');
								}
							}
							self.cityPickerValueDefault = cityPickerValueDefault;
						} else {
							self.cityPickerValueDefault = [0, 0, 0];
						}

						self.cityLabel.code = areaData[self.cityPickerValueDefault[0]][self.cityPickerValueDefault[
							1]][self.cityPickerValueDefault[2]].value;

						self.commodity = commodity;
					}
				});
			},
			dataTransfer(wholePriceList) {
				let result = [];
				if (!wholePriceList || wholePriceList.length === 0) {
					return result;
				}
				let lastN = this.commodity.qtyInStock;
				for (let i = wholePriceList.length - 1; i >= 0; i--) {
					if (i === wholePriceList.length - 1) {
						let m;
						if (wholePriceList[i].quantity < lastN) {
							m = lastN
						} else {
							m = wholePriceList[i].quantity * 5; //5倍默认
						}
						lastN = wholePriceList[i].quantity;
						result.push({
							n: wholePriceList[i].quantity,
							m: m,
							p: wholePriceList[i].price * 1000,
						})
					} else {
						result.push({
							n: wholePriceList[i].quantity,
							m: lastN - 1,
							p: wholePriceList[i].price * 1000,
						})
					}
				}
				return result;
			},
			//商品发布
			submitCommodity() {
				if (this.isSubmitting) {
					return
				}

				let paramData = this.commodity;
				paramData["totalPrice"] = 0;
				paramData["minQuantity"] = 0;
				paramData["id"] = !!this.renew ? null : this.commodity.id;
				paramData["sellerId"] = this.userData.id;
				paramData["qtyInStock"] = Number(this.commodity.qtyInStock);
				paramData["unitPriceMin"] = Number(this.commodity.unitPrice) * 1000;
				paramData["shippingCost"] = this.commodity.shippingCost * 1000;
				if (this.commodity.saleType === 0) {
					paramData["unitPriceBreakdown"] = JSON.stringify([{
						n: this.commodity.qtyInStock,
						m: this.commodity.qtyInStock,
						p: this.commodity.unitPrice * 1000
					}]);
				} else {
					paramData["unitPriceBreakdown"] = JSON.stringify(this.dataTransfer(this.wholePriceList));
				}
				paramData["startShowTime"] = regexDateStringToTimestamp(this.exhibitionDate + "T00:00:00") + 10000;
				paramData["endShowTime"] = regexDateStringToTimestamp(this.expireDate + "T00:00:00") + 10000;
				paramData["photos"] = JSON.stringify(this.uploadImgList);
				paramData["deviceId"] = platform === 'h5' ? 2 : 3;
				paramData["addressCityId"] = this.cityLabel.code;

				// deviceId:2 //安卓0，苹果1，微信公众号=2 微信小程序=3 头条小程序4

				console.log(paramData);
				// return;

				let self = this;
				this.isSubmitting = true;
				if (!this.id) {
					postCommodity(paramData).then(res => {
						self.isSubmitting = false;
						if (res.retCode === 0) {
							if (res.data.amountPayForShow > 0) {
								uni.redirectTo({
									url: '/pagesPersonal/pay/payCommodity?id=' + res.data.id
								})
							} else {
								uni.showToast({
									icon: 'none',
									title: '信息提交成功，待平台审核通过后，将在平台展示',
									duration: 3000,
								})
								setTimeout(function() {
									uni.navigateBack({
										delta: 1,
									})
								}, 3000);
							}
						}
					}).catch(() => {
						self.isSubmitting = false;
					});
				} else {
					updateCommodity(paramData).then(res => {
						self.isSubmitting = false;
						if (res.retCode === 0) {
							if (res.data.amountPayForShow > 0) {
								uni.redirectTo({
									url: '/pagesPersonal/pay/payCommodity?id=' + res.data.id
								})
							} else {
								uni.showToast({
									icon: 'none',
									title: '信息提交成功',
									duration: 2000,
								})
								setTimeout(function() {
									uni.navigateBack({
										delta: 1,
									})
								}, 2000);
							}
						}
					}).catch(() => {
						self.isSubmitting = false;
					});
				}
			},
			//展示日期
			exhibitionDateChanged(e) {
				this.exhibitionDate = e.detail.value;
				let a = regexDateStringToTimestamp(this.exhibitionDate + "T00:00:00");
				let b = regexDateStringToTimestamp(this.expireDate + "T00:00:00");
				if (a + 7 * 24 * 60 * 60 * 1000 > b) {
					this.expireDate = formatTimeNoHour(new Date(a + 7 * 24 * 60 * 60 * 1000));
				}
			},
			//结束日期
			expireStartDateChanged(e) {
				let chooseTime = e.detail.value
				let a = regexDateStringToTimestamp(chooseTime + "T00:00:00")
				let b = regexDateStringToTimestamp(this.exhibitionDate + "T00:00:00") + 7 * 24 * 60 * 60 * 1000

				if (a < b) {
					uni.showToast({
						title: '抱歉，最少展示时间不能低于七天哦！',
						icon: "none",
						duration: 3000
					})
					this.expireDate = formatTimeNoHour(new Date(b));
				} else {
					this.expireDate = chooseTime;
				}
			},
			commodityClassChange(e) {
				this.commodityClassIndex = e.target.value
				this.commodity.commodityClass = this.commodityClassList[this.commodityClassIndex].id;
				this.commodityClassName = this.commodityClassList[this.commodityClassIndex].commodityClassName;
			},
			commodityTypeChange(e) {
				this.commodityTypeIndex = e.target.value
				this.commodity.commodityType = this.commodityTypeList[this.commodityTypeIndex].id;
				this.commodityTypeName = this.commodityTypeList[this.commodityTypeIndex].commodityTypeName;
			},

			//获取所有性质
			getCommodityClassesList() {
				let self = this;
				getCommodityClassEnum().then(res => {
					if (res.retCode === 0) {
						self.commodityClassList.splice(0, self.commodityClassList.length);
						res.data.forEach(v => {
							if (v.id < 100) {
								self.commodityClassList.push({
									id: v.id,
									commodityClassName: v.commodityClassName,
								})
							}
						})

						if (self.commodity.commodityClass) {
							self.commodityClassIndex = (self.commodityClassList || []).findIndex(v => v.id === self
								.commodity.commodityClass);
						} else {
							self.commodityClassIndex = 0;
						}
						self.initCommodityClassPicker();
					}
				});
			},
			//获取所有类别
			getCommodityTypeList() {
				let self = this;
				getCommodityTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.commodityTypeList.splice(0, self.commodityTypeList.length);
						res.data.forEach(v => {
							if (v.id < 100) {
								self.commodityTypeList.push({
									id: v.id,
									commodityTypeName: v.commodityTypeName,
								})
							}
						})
						if (self.commodity.commodityType) {
							self.commodityTypeIndex = (self.commodityTypeList || []).findIndex(v => v.id === self
								.commodity.commodityType);
						} else {
							self.commodityTypeIndex = 0;
						}
						self.initCommodityTypePicker();
					}
				});
			},

			switchSaleType(e) {
				this.commodity.saleType = e.currentTarget.dataset.id;
			},

			switchPriceNegotiable() {
				this.commodity.isPriceNegotiable = !this.commodity.isPriceNegotiable;
			},
			switchShippingCostIncluded() {
				this.commodity.isShippingCostIncluded = !this.commodity.isShippingCostIncluded; //是否到付
			},
			switchShippingCostBySeller() {
				this.commodity.isShippingCostBySeller = !this.commodity.isShippingCostBySeller;
			},
			switchPhoneOpenedToPublic() {
				this.commodity.isPhoneOpenedToPublic = !this.commodity.isPhoneOpenedToPublic;
			},
			switchRefresh() {
				this.commodity.isRefresh = !this.commodity.isRefresh;
			},

			quantityValidate(quantity, silent) {
				if (!quantity) {
					if (!silent) {
						uni.showToast({
							title: '请输入数量',
							icon: 'none',
							duration: 2000
						})
					}
					return false;
				}
				if (!(new RegExp(regex.digit_positive).test(quantity))) {
					if (!silent) {
						uni.showToast({
							icon: 'none',
							title: '数量只能为正整数',
							duration: 2000
						})
					}
					return false;
				}
				return true;
			},
			unitPriceValidate(price, silent) {
				if (!price) {
					if (!silent) {
						uni.showToast({
							title: '请输入单价',
							icon: 'none',
							duration: 2000
						})
					}
					return false;
				}
				if (new RegExp(regex.decimal_begin_with_dot).test(price)) {
					if (!silent) {
						uni.showToast({
							icon: 'none',
							title: '输入的单价第一位不能为小数点',
							duration: 2000
						})
					}
					return false;
				}
				if (!(new RegExp(regex.decimal_two_digit).test(price))) {
					if (!silent) {
						uni.showToast({
							icon: 'none',
							title: '单价只能输入数字和且小数点只保留两位',
							duration: 2000
						})
					}
					return false;
				}
				if (!(new RegExp(regex.decimal_positive).test(price))) {
					if (!silent) {
						uni.showToast({
							icon: 'none',
							title: '请输入正数',
							duration: 3000
						})
					}
					return false;
				}
				return true;
			},
			wholePriceItemValidate(i) {
				if (!this.quantityValidate(this.wholePriceList[i].quantity, false)) {
					return false;
				}
				return this.unitPriceValidate(this.wholePriceList[i].price, false);

			},

			//添加标本div
			addNode(i) {
				if (!this.wholePriceItemValidate(i)) {
					return;
				}

				this.wholePriceList[i].plus = false
				this.wholePriceList[i].deduct = true

				//删除重复项
				let quantityList = [];
				//获取本条之外的数量素组
				this.wholePriceList.forEach(v => {
					quantityList.push(v.quantity);
				})

				let indexDuplicated = quantityList.findIndex(v => v === this.wholePriceList[i].quantity);

				if (indexDuplicated != null && indexDuplicated < i) {
					this.wholePriceList.splice(indexDuplicated, 1);
				}

				this.wholePriceList = this.sort(this.wholePriceList);
				this.wholePriceList.push({
					quantity: null,
					price: null,
					plus: true,
					deduct: true,
				});
			},

			//删除样本div
			deleteNode(i) {
				this.wholePriceList.splice(i, 1);
				if (this.wholePriceList.length === 0) {
					this.wholePriceList.push({
						quantity: 1,
						price: null,
						plus: true,
						deduct: false
					});
				} else {
					this.wholePriceList[this.wholePriceList.length - 1].deduct = true;
					this.wholePriceList[this.wholePriceList.length - 1].plus = true;
				}
			},
			//排序
			sort(arr) {
				/** 1、 插入法排序
				 * 插入发排序，即那数组的后边一项和前面一项对比，如果后面一项小于前面
				 * 一项，则将两者位置互换，从数组第2个元素开始对比；如下示例
				 */
				for (let i = 0; i < arr.length - 1; i++) {
					for (let j = 0; j < arr.length - 1 - i; j++) {
						if (Number(arr[j].quantity) > Number(arr[j + 1].quantity)) {
							let temp = arr[j];
							arr[j] = arr[j + 1];
							arr[j + 1] = temp;
						}
					}
				}
				//去重
				for (let k = 0; k < arr.length; k++) {
					let c = arr[k];
					for (let l = k + 1; l < arr.length; l++) {
						if (arr[l].quantity === c.quantity && arr[l].price === c.price) {
							arr.splice(l, 1);
							l--;
						}
					}
				}
				return arr
			},

			//选择单位
			unitChange(e) {
				this.unitIndex = e.detail.value;
				this.unit = this.unitList[this.unitIndex];
				this.commodity.unit = this.unit;
			},
			helpClicked(index) {
				let message = "";
				if (index === 0) {
					message = '添加多张商品图片，买家更容易下单购买！'
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
		}
	}
</script>

<style scoped lang="scss">
	.price_box:first-child {
		padding: 0;
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


	::v-deep .uni-steps__row-title {
		font-size: 26rpx !important;
		line-height: 50rpx !important;
	}
</style>