<template>
	<view class="container">
		<view class="flex flex-direction">
			<view class="flex padding-bottom-xs margin-bottom-sm gray-border-bottom justify-between"
				v-if="showAdminBar">
				<view class="text-theme text-df text-bold">{{ commodity.status | filterStatus(that) }}</view>
				<view class="text-gray-4 text-sm">{{ commodity.updateTime | formatDate }}</view>
			</view>
			<view class="flex justify-between gray-border-bottom padding-bottom-xs" v-if="showStatusBar">
				<view class="text-gray-4 text-ssm">
					{{ commodity.shortAddress }} • {{ commodity.updateTime | shortDate }}
				</view>
				<view class="text-theme text-ssm" v-if="!!commodity.isPriceNegotiable">可议价</view>
			</view>
			<view class="flex padding-tb-sm">
				<view>
					<image class="radius-s" style="width:160rpx;height:160rpx;"
						:src="(!commodity.photos || commodity.photos.length === 0)?defaultImg:commodity.photos[0]"
						mode="aspectFill" />
				</view>
				<view class="margin-left-sm">
					<view class="details-title text-black margin-bottom-xs text-normal text-bold">
						{{ commodity.title }}
					</view>
					<view class="text-sm padding-tb-sm text-gray-4"
						v-if="commodity.saleType === 0 && (!commodity.unitPriceBreakdown || commodity.unitPriceBreakdown==='[]')">
						<view>
							<text>数量：</text>
							<text>
								{{ commodity.qtyInStock | formatQuantity }}{{ commodity.unit }}
							</text>
						</view>
						<view>
							<text>单价：</text>
							<text>
								{{ commodity.unitPriceMax | formatPrice }}元/{{ commodity.unit }}
							</text>
						</view>
					</view>
					<view class="flex align-start text-ssm text-gray-4" v-else style="overflow: scroll;display: -webkit-box;">
						<view class="overflow_price gray-border-right padding-lr-sm" v-for="(itemPrice,indexPrice) in commodity.unitPriceBreakdown"
							:key="indexPrice">
							<view v-if="commodity.unitPriceBreakdown.length >= 2">
								<view class="number_box">
									<text>{{ itemPrice.n | formatQuantity }}</text>
									<text>{{ commodity.unit }}以上</text>
								</view>
								<view>
									<text>{{ itemPrice.p | formatPrice }}</text>
									<text>元/{{ commodity.unit }}</text>
								</view>
							</view>
							<view v-else>
								<view>
									<text>起售数量：</text>
									<text>
										{{ itemPrice.n | formatQuantity }}{{ commodity.unit }}
									</text>
								</view>
								<view>
									<text>单价：</text>
									<text>
										{{ itemPrice.p | formatPrice }}元/{{ commodity.unit }}
									</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="text-ssm text-gray-4 padding-top-sm flex align-center gray-border-top justify-between"
				v-if="showFooter">
				<view>
					{{ commodity.industryName }} •
					{{ commodity.commodityTypeName }} •
					{{ commodity.commodityClassName }}
				</view>
				<view>
					<text v-if="commodity.saleType === 0">整单</text>
					<text v-if="commodity.saleType === 1">批发</text>
					<text v-if="commodity.saleType === 2">零售</text>
				</view>
			</view>
			<slot />
		</view>
	</view>
</template>

<script>
	import {
		calculateMath,
		formatTime6,
		priceTranslate,
		toDate
	} from '@/utils/myUtil.js';
	import {
		imgUrl
	} from '@/utils/config.js'

	export default {
		name: "commodityListCell",
		props: {
			// 自定义内容
			commodity: {
				type: Object,
				default: function() {
					return {};
				},
			},
			mode: {
				type: String,
				default: "normal",
			},
			showAdminBar: {
				type: Boolean,
				default: false,
			},
			showStatusBar: {
				type: Boolean,
				default: true,
			},
			showFooter: {
				type: Boolean,
				default: true,
			},
		},
		data(){
			return {
				that: this,
				defaultImg: imgUrl + "/work.png",
				statusList: [],
			}
		},
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
			shortDate(time) {
				return toDate(time);
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			},
			filterStatus(status, that) {
				const [obj] = that.statusList.filter(v => v.id === status)
				return !!obj ? obj.statusName : '';
			},
		},
		mounted() {
			this.statusList = uni.getStorageSync("commodityStatusList");
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;

		.overflow_price {
			width: auto;
			text-align: start;
		}

		.overflow_price:first-child {
			padding-left: 0;
		}

		.overflow_price:last-child {
			border-right: none;
		}

		.details-title {
			overflow: hidden;
			line-height: 1.5;
			display: -webkit-box;
			text-overflow: ellipsis;
			word-wrap: break-word;
			white-space: normal !important;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}
</style>