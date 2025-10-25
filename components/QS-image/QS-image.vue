<template>
	<view class="position_relative transition_6s display_inline-block over_hidden"
		:class="imgLoadSuccess?'':'backgroundColor_f8f8f8'"
		:style="'width: ' + width + ';height:' + height + ';border-radius: ' + radius + ';'"
		@tap.prevent.stop="onTap()">
		<text class="imgStatusStyle" v-if="!imgLoadSuccess">
			{{imgStatusText}}
		</text>
		<image :src="imagePath" :mode="imageMode" :lazy-load="lazyLoad" @error="imgErr" @load="imgLoad"
			:class="randomAnimationType"
			:style="'width: ' + width + ';height:' + height + ';border-radius: ' + radius + ';' + imageStyle"></image>
		<!-- :class="imgLoadSuccess?animationType + '_loaded':animationType" -->
	</view>
</template>

<script>
	const loading = '图片加载中';
	const nullImg = '图片路径为空';
	const loadErr = '加载失败\r\n点击重试';
	const errPlaceholder = 'errPlaceholder';
	const isErr = 2;
	const isLoading = 1;
	export default {
		props: {
			imageUrl: {
				type: String,
				default: ''
			},
			imageMode: {
				type: String,
				default: 'heightFix'
			},
			lazyLoad: {
				type: Boolean,
				default: false
			},
			imageStyle: {
				type: String,
				default: ''
			},
			passClick: {
				type: Boolean,
				default: true
			},
			width: {
				type: String,
				default: '750rpx'
			},
			height: {
				type: String,
				default: '175rpx'
			},
			radius: {
				type: String,
				default: '16rpx'
			},
			animationType: {
				type: String,
				default: 'fadIn'
			}
		},
		watch: {
			imageUrl: {
				handler(n, o) {
					if (n) this.init();
				},
				immediate: true,
			}
		},
		data() {
			return {
				imagePath: '',
				imgLoadSuccess: false,
				imgStatusText: '',
				imgStatus: 0 ,// 0: 无
				randomAnimationType: '',
				animationTypeList: [
					'fadRotateZ', 'fadIn', 'fadLeft', 'fadTop', 'fadBottom', 'fadRight', 'fadScale', 'fadRotateY'
				],
			}
		},
		methods: {
			init() {
				this.imgLoadSuccess = false;
				if (this.imageUrl) {
					this.imgStatusText = loading;
					this.imagePath = this.imageUrl;
					
					let index = Math.floor((Math.random() * this.animationTypeList.length));
					this.randomAnimationType = this.animationTypeList[index];
				} else {
					this.imgStatusText = nullImg;
				}
			},
			imgErr() {
				this.changeStatus('error')
			},
			imgLoad() {
				this.changeStatus('success');
			},
			changeStatus(type) {
				switch (type) {
					case 'loading':
						this.checkimgLoadSuccessFalse();
						this.imgStatusText = loading;
						this.imgStatus = isLoading;
						break;
					case 'error':
						this.checkimgLoadSuccessFalse();
						if (this.imagePath !== errPlaceholder) {
							this.imgStatusText = loadErr;
							this.imgStatus = isErr;
						}
						break;
					case 'success':
						this.imgLoadSuccess = true;
						break;
				}
				this.$forceUpdate();
			},
			checkimgLoadSuccessFalse() {
				if (this.imgLoadSuccess)
					this.imgLoadSuccess = false
			},
			tryReLoad() {
				if (this.imgLoadSuccess) return;
				if (this.imgStatus === isErr && this.imagePath !== errPlaceholder) {
					this.imagePath = errPlaceholder;
					setTimeout(() => {
						this.changeStatus('loading');
						this.imagePath = this.imageUrl;
					}, 100);
				}
			},
			onTap() {
				if (this.passClick) {
					this.$emit('click');
					if (!this.imgLoadSuccess)
						this.tryReLoad();
				} else {
					if (this.imgLoadSuccess) {
						this.$emit('click');
					} else {
						this.tryReLoad();
					}
				}
			}
		}
	}
</script>

<style scoped>
	.over_hidden {
		overflow: hidden;
	}

	.display_inline-block {
		display: inline-block;
	}

	.transition_6s {
		transition: all .6s;
	}

	.position_relative {
		position: relative;
	}

	.position_relative .the_image {
		border-radius: 16rpx;
	}

	/* 	.position_relative uni-image{
		border-radius: 16rp;
	} */

	.imgStatusStyle {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		font-size: 40%;
		color: #ADADAD;
	}

	.backgroundColor_f8f8f8 {
		background-color: #F8F8F8;
	}

	/* 
	.fadIn {
		opacity: 0;
	}

	.fadIn_loaded {
		opacity: 1;
	}

	.fadLeft {
		opacity: 0;
		transform: translateX(-100%);
	}

	.fadLeft_loaded {
		opacity: 1;
		transform: translateX(0);
	}

	.fadTop {
		opacity: 0;
		transform: translateY(-100%);
	}

	.fadTop_loaded {
		opacity: 1;
		transform: translateY(0);
	}

	.fadBottom {
		opacity: 0;
		transform: translateY(100%);
	}

	.fadBottom_loaded {
		opacity: 1;
		transform: translateY(0);
	}

	.fadRight {
		opacity: 0;
		transform: translateY(100%);
	}

	.fadRight_loaded {
		opacity: 1;
		transform: translateY(0);
	}

	.fadRotateZ {
		opacity: 0;
		transform: rotateZ(360deg);
	}

	.fadRotateZ_loaded {
		opacity: 1;
		transform: rotateZ(0deg);
	}

	.fadScale {
		opacity: 0;
		transform: scale(3);
	}

	.fadScale_loaded {
		opacity: 1;
		transform: scale(1);
	}

	.fadRotateY {
		opacity: 0;
		transform: rotateY(180deg);
	}

	.fadRotateY_loaded {
		opacity: 1;
		transform: rotateY(0deg);
	} */

	.fadIn {
		animation-duration: 1s;
		animation-name: fadIn;
		animation-fill-mode: forwards;
	}

	@keyframes fadIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	.fadLeft {
		animation-duration: 1s;
		animation-name: fadLeft;
		animation-fill-mode: forwards;
	}

	@keyframes fadLeft {
		from {
			opacity: 0;
			transform: translateX(-100%);
		}

		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.fadTop {
		animation-duration: 1s;
		animation-name: fadTop;
		animation-fill-mode: forwards;
	}

	@keyframes fadTop {
		from {
			opacity: 0;
			transform: translateY(-100%);
		}

		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.fadBottom {
		animation-duration: 1s;
		animation-name: fadBottom;
		animation-fill-mode: forwards;
	}

	@keyframes fadBottom {
		from {
			opacity: 0;
			transform: translateY(100%);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.fadRight {
		animation-duration: 1s;
		animation-name: fadRight;
		animation-fill-mode: forwards;
	}

	@keyframes fadRight {
		from {
			opacity: 0;
			transform: translateX(100%);
		}

		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.fadRotateZ {
		animation-duration: 1s;
		animation-name: fadRotateZ;
		animation-fill-mode: forwards;
	}

	@keyframes fadRotateZ {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
			transform: rotateZ(360deg);
		}
	}

	.fadScale {
		animation-duration: 1s;
		animation-name: fadScale;
		animation-fill-mode: forwards;
	}

	@keyframes fadScale {
		from {
			opacity: 0;
			transform: scale(3);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.fadRotateY {
		animation-duration: 1s;
		animation-name: fadRotateY;
		animation-fill-mode: forwards;
	}

	@keyframes fadRotateY {
		from {
			opacity: 0;
			transform: rotateY(180deg);
		}

		to {
			opacity: 1;
			transform: rotateY(0deg);
		}
	}
</style>