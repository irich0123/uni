<template>
	<view>
		<!-- mask层 -->
		<view :class="['mask', show ? '' : 'visible']"></view>
		<!-- 金额 -->
		<view :class="['content', show ? '' : 'contenthide']">
			<view class="title">
				<view class="close" @click="close()">
					<uni-icons type="closeempty" size="20" color="#333" style="line-height: 1;"></uni-icons>
				</view>
				<view>请输入支付密码</view>
				<view class="close"></view>
			</view>
			<view class="pay-money">
				<view class="money" :style="payType==5 ? 'color:#fb5318' : ''">￥
					<text class="text">{{amount}}</text>
				</view>
			</view>
			<view class="pay-way" v-if="payType!=5">
				<view>支付方式</view>
				<view class="pay-img" v-if="payType == 3">
					<image class="img-box" :src="imgUrl+'/mall/balance.png'" />余额
				</view>
				<view class="pay-img" v-if="payType == 4">
					<image class="img-box" :src="imgUrl+'/mall/bean.png'" />金豆
				</view>
			</view>
			<view :class="['code', show ? '' : 'visible']">
				<view class="code-box">
					<block v-for="(item, index) in 6" :key="index">
						<view class="code-box-item">{{ (password[index] && '●') || '' }}</view>
					</block>
				</view>
				<input type="number" v-model="password" />
			</view>
		</view>
		<!-- 键盘 -->
		<view :class="['keyboard', show ? '' : 'active', isIphoneX ? 'isIphone' : '']">
			<block v-for="(item, index) in 9" :key="index">
				<view class="keyboard-item" @tap="key(index + 1)">{{index + 1}}</view>
			</block>
			<view class="keyboard-item hide"></view>
			<view class="keyboard-item" @tap="key(0)"><text>0</text></view>
			<view class="keyboard-item delte" @tap="del()">
				<image class="img" :src="imgUrl+ '/mall/del.png'" mode="aspectFill" />
			</view>
		</view>

	</view>
</template>

<script>
	import {
		imgUrl,
	} from "@/utils/config";

	export default {
		props: {
			show: {
				type: Boolean,
				default: false
			},
			isIphoneX: {
				type: Boolean,
				default: false
			},
			payType: {
				type: Number,
				default: 3
			},
			money: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				password: '',
				trantision: false,
				imgUrl: imgUrl,
				amount: '',
			};
		},
		watch: {
			money: {
				handler(n){
					this.amount = n.toFixed(2);
				}
			}
		},
		methods: {
			key(key) {
				if (this.password.length < 6) {
					this.password += key;
					if (this.password.length == 6) {
						this.$emit('password', this.password)
						this.$emit('close', true);
						this.password = ''
						// uni.showToast({	title: '输入完成' });
					}
				}
			},
			clear() {
				this.password = '';
			},
			close() {
				this.password = '';
				this.trantision = false;
				this.$emit('close', false);
			},
			del() {
				if (this.password.length > 0) {
					this.password = this.password.substring(0, this.password.length - 1);
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	input {
		display: none;
	}

	.mask {
		position: fixed;
		width: 100%;
		height: 100vh;
		left: 0;
		top: 0;
		transition: all 0.3s ease;
		background: rgba(102, 102, 102, 0.3);
		opacity: 1;
		z-index: 2;
	}

	.content {
		border-radius: 15rpx;
		position: fixed;
		left: 0;
		top: 30%;
		background: #fff;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		z-index: 2;
		margin: 0 40rpx;

		.title {
			width: 100%;
			padding: 20rpx 10rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 30rpx;
			color: #333;
			line-height: 1;

			.close {
				width: 50rpx;
			}
		}
	}

	.contenthide {
		visibility: hidden;
	}

	.visible {
		opacity: 0;
		z-index: 2;
		visibility: hidden;
	}

	.pay-money {
		width: 100%;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #EBEBEB;
		display: flex;
		justify-content: center;
		align-items: center;

		.money {
			font-size: 45rpx;
			font-weight: 600;

			.text {
				font-size: 60rpx;
				margin-left: 10rpx;
			}
		}
	}

	.pay-way {
		width: 100%;
		padding: 20rpx 50rpx;
		margin-top: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #8A8A8A;
		font-size: 28rpx;

		.pay-img {
			color: #333333;
			display: flex;
			justify-content: center;
			align-items: center;

			.img-box {
				width: 35rpx;
				height: 35rpx;
				margin-right: 10rpx;
			}
		}
	}

	.code {
		width: 100%;
		padding: 0 0 30rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
	}

	.code-box {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		border: 1px solid #d0d0d0;
	}

	.code-box-item {
		width: 94rpx;
		height: 94rpx;
		background: #fff;
		font-size: 40rpx;
		line-height: 90rpx;
		text-align: center;
	}

	.code-box-item:not(:last-child) {
		border-right: 1px solid #d0d0d0;
	}

	.keyboard {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #EBEBEB;
		display: flex;
		justify-content: center;
		z-index: 2;
		flex-wrap: wrap;
		transition: all 0.2s ease-in 0.2s;
	}

	.active {
		bottom: -400rpx;
	}

	.keyboard-item {
		box-sizing: border-box;
		width: 250rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: #fff;
		font-size: 40rpx;
		color: #333;
		height: 99rpx;
		border: 1rpx solid #EBEBEB;
		border-top: none;
		border-left: none;
	}

	.hide {
		opacity: 0;
	}

	.delte {
		background: none;
		box-shadow: none;
	}

	.delte image {
		width: 60rpx;
		height: 60rpx;
	}

	.isIphone {
		padding-bottom: 68rpx !important;
	}
</style>