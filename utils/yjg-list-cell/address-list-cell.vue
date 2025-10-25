<template>
	<view class="container">
		<view class="flex align-center justify-start">
			<view class="padding-right-lg flex-grow flex" v-if="radio">
				<radio color="#fb5318" :value="address.id+''" :checked="checked">
					<view class="flex-grow padding-tb-sm" @click="onItemClick">
						<view class="text-xs1 text-theme text-center theme-border margin-bottom-sm"
							style="width: 60rpx;border-radius: 8rpx;padding: 4rpx 8rpx;"
							v-show="!!address.isDefaultAddress && showDefault">
							首选
						</view>
						<view class="flex align-end justify-start">
							<view class="text-black-4 text-xl">{{ address.realName }}</view>
							<view class="text-black-4 text-df padding-left">{{ address.mobile }}</view>
						</view>
						<view class="flex align-start justify-center margin-top-sm">
							<view class="text-df text-black-4" style="line-height: 1.8;">
								{{ address.addr }}
							</view>
							<view class="text-df text-black-4" style="line-height: 1.8;">
								{{ address.addressDetail }}
							</view>
						</view>
					</view>
				</radio>
			</view>
			<view class="flex-grow flex align-center justify-between" v-else>
				<view class="flex-grow padding-tb-sm" @click="onItemClick">
					<view class="text-xs1 text-theme text-center theme-border margin-bottom-sm"
						style="width: 60rpx;border-radius: 8rpx;padding: 4rpx 8rpx;" 
						v-show="!!address.isDefaultAddress && showDefault">
						首选
					</view>
					<view class="flex align-end justify-start">
						<view class="text-black-4 text-xl">{{ address.realName }}</view>
						<view class="text-black-4 text-df padding-left">{{ address.mobile }}</view>
					</view>
					<view class="flex align-start justify-center margin-top-sm">
						<view class="text-df text-black-4" style="line-height: 1.8;">
							{{ address.addr }}
						</view>
						<view class="text-df text-black-4" style="line-height: 1.8;">
							{{ address.addressDetail }}
						</view>
					</view>
				</view>
				<view class="padding-left-sm">
					<uni-icons color="#999999" size="22" type="trash" v-show="trash" @click="onTrash"></uni-icons>
					<uni-icons color="#999999" size="22" type="forward" v-show="forward"></uni-icons>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	import UniIcons from "../../components/uni-icons/uni-icons";

	export default {
		name: "addressListCell",
		components: {
			UniIcons
		},
		props: {
			checked: {
				type: Boolean,
				default: false,
			},
			address: {
				type: Object,
				default: {
					id: null,
					realName: "",
					mobile: "",
					addr: null,
					addressDetail: null,
					isDefaultAddress: null,
				}
			},
			radio: {
				type: Boolean,
				default: false,
			},
			trash: {
				type: Boolean,
				default: false,
			},
			forward: {
				type: Boolean,
				default: false,
			},
			showDefault: {
				type: Boolean,
				default: true,
			}
		},
		methods: {
			onItemClick() {
				this.$emit("onItem", {
					id: this.address.id
				});
			},
			onTrash() {
				this.$emit("onDelete", {
					id: this.address.id
				});
			},

		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}

	::v-deep .uni-radio-wrapper {
		width: 100%;

		.uni-radio-input {
			margin-right: 40rpx;
		}
	}

	::v-deep uni-radio {
		flex-grow: 1;
	}
</style>