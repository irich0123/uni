<template>
	<view class="container">
		<view class="padding-tb-xs radius-l">
			<view class="user-box padding-sm">
				<view class="flex position-relative margin-right-sm">
					<view class="radius-xl gray-border flex align-center justify-center"
						style="width:60rpx;height:60rpx;">
						<image style="width:60rpx;height:60rpx;border-radius:60rpx;"
							:src="(cert.user && cert.user.avatar)?cert.user.avatar:defaultUserAvatar"
							mode="scaleToFill" />
					</view>
					<view class="position-absolute text-xss" style="top:20px;left:20px;z-index:2;">
						<view class="color-white radius-x text-center gray-border-1 bg-theme"
							style="width:26rpx;height:26rpx;" v-if="cert.user.userVerifyStatus === 2">个
						</view>
						<view class="color-white radius-x text-center gray-border-1 bg-blue"
							style="width:26rpx;height:26rpx;" v-if="cert.user.userVerifyStatus === 3">
							企
						</view>
					</view>
				</view>
				<view class="flex-grow">
					<view class="text-sm text-black-4">{{ cert.user.realName }}</view>
					<view class="text-xs text-grey">
						<span>{{ cert.updatetime | formatDate(that) }}</span>
					</view>
				</view>
				<view class="user-box-right" @click.stop="toAction('call')">
					<view class="phone-icon">
						<uni-icons type="phone-filled" size="18" color="#fb5318" style="height: 1;" />
					</view>
				</view>
			</view>
			<view class="flex justify-start padding-lr gray-border-bottom flex-wrap">
				<image class="flex-sub card-image radius-s" mode="widthFix" :src="cert.idCardImgFront"
					@tap.stop='gotoPreview(cert,0)' />
				<image class="flex-sub margin-left card-image radius-s" mode="widthFix" :src="cert.idCardImgBack"
					@tap.stop='gotoPreview(cert,1)' />
				<image class="flex-sub margin-left avatar-image radius-s" mode="widthFix" :src="cert.avatar"
					@tap.stop='gotoPreview(cert,2)' />
			</view>

			<!-- //待审核(0), 审核通过(1), 审核失败(2), 失效(3), 待付款(4); -->
			<view class="flex justify-between padding-sm text-sm align-center">
				<view>{{cert.auditStatus | filterStatus(that)}}</view>
				<view class="btn-line flex align-center justify-end">
					<view class="btn flex align-center" @click.stop="toAction('swap','1|2')">
						1-2
					</view>
					<view class="btn flex align-center" @click.stop="toAction('swap','1|3')">
						1-3
					</view>
					<view class="btn flex align-center" @click.stop="toAction('swap','2|3')">
						2-3
					</view>
					<view class="btn flex align-center" @click.stop="toAction('success')"
						v-if="cert.auditStatus==0 || cert.auditStatus==2 ">
						<uni-icons type="checkmarkempty" size="14" color="#555" style="height: 1;margin-right: 10rpx" />
						通过
					</view>
					<view class="btn flex align-center" @click.stop="toAction('fail')"
						v-if="cert.auditStatus==0 || cert.auditStatus==1 ">
						<uni-icons type="closeempty" size="14" color="#555" style="height: 1;margin-right: 10rpx" />
						不通过
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatTime6,
	} from "@/utils/myUtil";
	export default {
		name: "cell-personal-cert",
		data() {
			return {
				that: this,
			}
		},
		props: {
			cert: {
				type: Object,
				default: {},
			},
			certStatus: {
				type: Array,
				default: [],
			}
		},
		filters: {
			filterStatus(status, that) {
				let obj = that.certStatus.find(v => v.value === status);
				return !!obj ? obj.label : '';
			},
			formatDate(time) {
				return formatTime6(new Date(time));
			},
		},
		methods: {
			toAction(action, param) {
				this.$emit("action", {
					cert: this.cert,
					swap: param,
					action: action,
				})
			},
			gotoPreview(item, index) {
				uni.previewImage({
					current: index,
					urls: [item.avatar, item.idCardImgFront, item.idCardImgBack],
					loop: true
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}

	.avatar-image {
		width: 200upx;
		height: 200upx;
	}

	.card-image {
		width: 300upx;
		height: 200upx;
	}
	
	.user-box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;


		.user-box-right {
			display: flex;
			flex-flow: row;
			align-items: flex-start;
			justify-content: flex-start;

			.phone-icon {
				width: 60rpx;
				height: 60rpx;
				border: 2rpx solid #fb5318;
				border-radius: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
			}

		}
	}

	.btn-line {

		.btn {
			padding: 10rpx 24rpx;
			border-radius: 40rpx;
			font-size: 26rpx;
			margin-left: 20rpx;
			border: 2rpx #999999 solid;
		}
	}
</style>