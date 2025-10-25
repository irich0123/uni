<template>
	<view class="search padding-tb-sm radius">
		<view class="content theme-border flex-grow"
			:style="'border-top-left-radius:'+radius+'px;border-bottom-left-radius:'+radius+'px'">
			<!-- HM修改 增加进入输入状态的点击范围 -->
			<view class="content-box bg-white">
				<text class="icon icon-search"></text>
				<input :placeholder="placeholder" @input="inputChange" confirm-type="search" @confirm="triggerConfirm"
					class="input" :focus="isFocus" v-model="inputVal" @focus="focus" @blur="blur" />
				<text v-if="!!inputVal && !!isFocus" class="icon icon-del" @click.stop="clear"></text>
			</view>
		</view>
		<view class="searchBtn bg-theme color-white padding-lr flex align-center" @click.stop="search"
			:style="'border-top-right-radius:'+radius+'px;border-bottom-right-radius:'+radius+'px;'">
			搜索
		</view>

	</view>
</template>

<script>
	export default {
		props: {
			placeholder: {
				value: String,
				default: '请输入搜索内容'
			},
			initVal: {
				value: String,
				default: ''
			},
			radius: {
				value: String,
				default: 8
			},
		},
		data() {
			return {
				active: false,
				inputVal: '',
				searchName: '取消',
				isFocus: false,
			};
		},
		watch: {
			initVal: {
				handler(newVal){
					this.inputVal = newVal;
				},
				immediate: true,
			}
		},
		mounted() {
		},
		methods: {
			//HM修改 触发组件confirm事件
			triggerConfirm() {
				this.search();
			},
			//HM修改 触发组件input事件
			inputChange(event) {
				this.isFocus = true;
				var keyword = event.detail.value;
				this.$emit('input', keyword);
				this.inputVal = keyword;
			},
			focus() {
				this.active = true;
			},
			blur() {
				this.$emit('blur', false);
			},
			clear() {
				this.inputVal = "";
				uni.hideKeyboard();
				this.$emit('inputClear', {
					clear: ''
				});
			},
			search() {
				this.$emit('search', this.inputVal);
			}
		},
	};
</script>

<style lang="scss">
	.search {
		display: flex;
		flex-direction: row;
		width: 100%;
		//border-bottom: 1px #f5f5f5 solid; //HM修改 去掉边框
		box-sizing: border-box;
		font-size: $uni-font-size-base;

		.content {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			//border: 1px #ccc solid; //HM修改 去掉边框
			overflow: hidden;

			// transition: all 0.2s linear;
			/*border-radius: 30px;*/
			.content-box {
				width: 100%;
				display: flex;
				align-items: center;

				&.center {
					justify-content: center;
				}

				.icon {
					padding: 0 18upx;

					&.icon-del {
						font-size: 38upx;

						&:before {
							content: "\e644";
						}
					}

					&.icon-search:before {
						content: "\e61c";
					}
				}

				.input {
					font-size: 28rpx;
					width: 100%;
					line-height: 60upx;
					height: 70upx;
					transition: all 0.2s linear;
					background-color: transparent;

					&.center {
						width: 300upx;
					}
				}
			}
		}
	}

	//HM修改 把字体改成本地加载
	@font-face {
		font-family: "iconfont";
		src: url('data:application/x-font-woff;charset=utf-8;base64,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');
	}

	.icon {
		font-family: iconfont;
		font-size: 32upx;
		font-style: normal;
		color: #999;

	}
</style>