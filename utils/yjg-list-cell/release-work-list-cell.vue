<template>
	<view class="container">
		<view class="flex flex-direction flex-grow padding radius bg-white">
			<view class="flex padding-bottom-xs margin-bottom-sm gray-border-bottom justify-between"
				v-if="showAdminBar">
				<view class="text-theme text-df text-bold">{{ releaseWork.verifyStatus | filterStatus(that) }}</view>
				<view class="text-gray-4 text-sm">{{ releaseWork.updateTimeStamp | formatDate(that) }}</view>
			</view>
			<view class="flex" v-if="showStatusBar">
				<view class="flex position-relative margin-right-sm">
					<view class="radius-xl gray-border flex align-center justify-center"
						style="width:60rpx;height:60rpx;">
						<image style="width:60rpx;height:60rpx;border-radius:60rpx;"
							:src="(releaseWork.userDetailsInfo && releaseWork.userDetailsInfo.avatar)?releaseWork.userDetailsInfo.avatar:defaultUserAvatar"
							mode="scaleToFill" />
					</view>
					<view class="position-absolute text-xss" style="top:20px;left:20px;z-index:2;">
						<view class="color-white radius-x text-center gray-border-1 bg-theme"
							style="width:26rpx;height:26rpx;" v-if="releaseWork.userDetailsInfo.userVerifyStatus === 2">
							个
						</view>
						<view class="color-white radius-x text-center gray-border-1 bg-blue"
							style="width:26rpx;height:26rpx;" v-if="releaseWork.userDetailsInfo.userVerifyStatus === 3">
							企
						</view>
					</view>
				</view>
				<view class="flex-grow">
					<view class="text-sm text-black-4">{{ releaseWork.userDetailsInfo.realName }}</view>
					<view class="text-xs text-grey">
						<span>{{ releaseWork.updateTimeStamp | formatDate(that) }}</span>
						<span class="padding-lr-xss">•</span>
						<span>{{releaseWork.type | typeFilter(that)}}</span>
					</view>
				</view>

				<view @click.stop="onPhoneCall">
					<image style="width:60rpx;height:60rpx;" :src="imgUrl+'/index/phone.png'" />
				</view>
			</view>

			<!-- 信息、图片开始 -->
			<view class="flex padding-tb-sm">
				<view class="position-relative" style="width: 160rpx;height:160rpx;min-width:160rpx;">
					<view class="position-absolute" style="top:0;left:0;width:60rpx;height:60rpx;z-index:2"
						v-show="releaseWork.isStick">
						<image style="width:60rpx;height:60rpx;" :src="imgUrl+'/index/zhiding.png'" />
					</view>
					<view>
						<image class="radius-s" style="width:160rpx;height:160rpx;"
							:src="(!releaseWork.img || releaseWork.img.length ===0)?releaseWorkThumb:releaseWork.img[0]" />
					</view>
				</view>
				<view class="margin-left-sm">
					<!-- 信息标题开始 -->
					<view class="details-title text-black margin-bottom-xs text-normal text-bold">
						<span v-if="!showAdminBar && (releaseWork.hasContacted || releaseWork.hasChecked)"
							class="check-or-contact text-ssm text-theme theme-border radius-s padding-lr-xs margin-right-xs">
							{{releaseWork.hasContacted?'已联系':'已查看'}}
						</span>
						<span v-if="releaseWork.hasChecked" class="text-gray-4">{{ releaseWork.title }}</span>
						<span v-else-if="releaseWork.hasContacted" class="text-gray-4">{{ releaseWork.title }}</span>
						<span v-else>{{ releaseWork.title }}</span>
					</view>
					<!-- 信息标题结束-->
					<view class="text-sm">
						<view class="flex justify-between">
							<view class="margin-bottom-xs text-black" v-show="releaseWork.unitPrice">
								<text>单价：</text>
								<text class="margin-right-xs" v-if="releaseWork.unitPrice">
									{{ releaseWork.unitPrice | formatPrice }}元/{{ releaseWork.unit }}
								</text>
								<text class="margin-right-xs" v-else>待议</text>
							</view>

							<view class="text-black margin-right-sm" v-show="releaseWork.count">
								<text>数量：</text>
								<text
									v-if="Number(releaseWork.count)">{{ Number(releaseWork.count) | formatQuantity }}{{
                                        releaseWork.unit
                                    }}
								</text>
								<text v-else>待议</text>
							</view>
						</view>

						<view v-show="releaseWork.totalPrice">
							<text>总价：</text>
							<text class="text-theme"
								v-if="releaseWork.totalPrice">{{ releaseWork.totalPrice | formatPrice}}元</text>
							<text v-else>待议</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 信息、图片结束 -->
			<view class="text-sm text-gray-4 padding-top-sm flex align-center gray-border-top" v-if="showFooter">
				<view class="flex align-center flex-sub">
					<image :src="imgUrl+'/index/dizhi.png'" style="width:25rpx;height:25rpx;" mode="widthFix" />
					<view class="margin-left-xs">{{ releaseWork.address }}</view>
				</view>
				<view class="flex align-center flex-sub">
					<image style="width:25rpx;height:25rpx;" :src="imgUrl+'/index/trade.png'" />
					<view class="margin-left-xs">{{ releaseWork.industry }}</view>
				</view>
				<view class="flex align-center flex-twice justify-end">
					<span>查看数(</span>
					<span class="text-theme">{{ releaseWork.checkedCnt }}</span>
					<span>)</span>
					<span class="padding-left-sm">联系数(</span>
					<span class="text-theme">{{ releaseWork.contactedCnt }}</span>
					<span>)</span>
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
	} from '../config';

	export default {
		name: "releaseWorkListCell",
		props: {
			releaseWork: {
				type: Object,
				default: function() {
					return {};
				},
			},
			showStatusBar: {
				type: Boolean,
				default: true,
			},
			showFooter: {
				type: Boolean,
				default: true,
			},
			showAdminBar: {
				type: Boolean,
				default: false,
			},
			dateShort: {
				type: Boolean,
				default: false,
			}
		},
		filters: {
			formatDate(time, that) {
				if (!that.dateShort) {
					return formatTime6(new Date(time));
				} else {
					return toDate(time);
				}
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
			filterStatus(status, that) {
				const [obj] = that.statusList.filter(v => v.value === status)
				return !!obj ? obj.label : '';
			},
		},
		created() {
			let defaultResource = uni.getStorageSync("defaultResource");
			this.releaseWorkThumb = defaultResource[2].resourceUrl[0];
			this.defaultUserAvatar = defaultResource[4].resourceUrl[0];
		},
		mounted() {
			this.releaseWorkTypeList = uni.getStorageSync("releaseWorkTypeList");
			this.statusList = uni.getStorageSync("releaseWorkStatusList");

			setTimeout(() => {
				this.statusList.forEach(v => {
					if (v.label.indexOf("已通过") > -1) {
						v.label = "展示中";
					}
				})
			}, 200);
		},
		data() {
			return {
				that: this,

				imgUrl: imgUrl,
				releaseWorkTypeList: [],
				statusList: [],
				releaseWorkThumb: null,
				defaultUserAvatar: null,
			}
		},
		methods: {
			onPhoneCall() {
				this.$emit("onPhoneCall", {
					item: this.releaseWork
				});
			},

		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;

		.details-title {
			overflow: hidden;
			line-height: 1.5;
			display: -webkit-box;
			text-overflow: ellipsis;
			word-wrap: break-word;
			white-space: normal !important;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;

			.check-or-contact {
				font-weight: normal;
				position: relative;
				top: -2rpx;
			}
		}
	}
</style>