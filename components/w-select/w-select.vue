<template>
	<view
		class="w-select"
		id="wSelect"
		:style="{
			'--select-wrap-width': width,
			'--select-wrap-height': height,
			'--select-bg-color': bgColor
		}"
	>
		<view
			:class="isShow ? 'select-wrap-active' : ''"
			class="select-wrap"
			@click="changeShow"
		>
			<view v-if="multiple" class="select-content">
				<view
					class="select-content-item-default"
					v-if="multiSelectList.length === 0"
				>
					{{ defaultValue }}
				</view>
				<view
					class="select-content-item"
					v-if="multiSelectList.length > 0"
				>
					{{ multiSelectList[0][valueName] }}
				</view>
				<view
					class="select-content-item"
					v-if="multiSelectList.length > 1"
				>
					{{ multiLength }}
				</view>
			</view>
			<view>
				<view v-if="!multiple && filterable">
					<input
						type="text"
						@input="inputChange"
						:placeholder="defaultValue"
						:disabled="!filterable"
						v-model="inputData"
					/>
				</view>
				<view class="rich-text" v-else>{{inputData}}</view>
			</view>
			<view @click.stop="refreshValue" class="close-icon" v-if="showClose && value.length > 0">
				<image :src="refreshUrl" mode=""></image>
			</view>
<!-- 			<view
				v-if="value.length <= 0 || !showClose"
				:class="isShow ? 'w-select-arrow-up' : ''"
				class="w-select-arrow "
			/> -->
			<view class="option-box">
				<img v-if="value.length <= 0 || !showClose" :class="isShow ? 'w-select-arrow-up' : ''"
					class="w-select-arrow " src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAUCAYAAADskT9PAAABi0lEQVRIib2UP0vDUBTFf5YEBMWhILiIowiurrp08gv0S3Xp1kno1qGDghUqDq2Di8XJpSA4FCFLM+iY4cmVE0hD2ubVtgcetPe+3H/nvLvjnGsB18Ax28UEeKgAbWAgw7YwUc52AIyAJ2APOALCDReRAK/KOQpkuJfzYgtURMCdciamgdRRBU6B4QanYM1eAWMgNkMl4/yR42ZDepgo9li5/hDkqrOqusChNFFdU/JYvHfTzlNUCi6bOPrA+5qSo1h9xZ6FaaDghM65mnNu6P6PoWKFRbmKJoDo+ACaGlmyQtcppU3FKowRFBmFL+BbC2OV5xmJ90FWdHnMm0C2gwbw6TmFRN80lk5wjgbyxzhseaihpW+Wxl5EQRam4gPgDLhccvcZeCz7ihZRkIXx+QZ0Fow0payju1GZwNlVXAah3vJ5wZKK1XXNRy9lJ5DCAteBXm6jxbLVfZ+sbwGGKXCrhIlOT7apb7CyIszCEr4A+8CJHEaL2bwX1ioFGExgpvZd/bffpUQ3A+AX+fRI1AmoncgAAAAASUVORK5CYII=" />
			</view>
			<scroll-view
				scroll-y
				v-show="optionsShow"
				:class="[
					isShow
						? showPosition === 'bottom'
							? 'animation-bottom-in'
							: 'animation-top-in'
						: showPosition === 'bottom'
						? 'animation-bottom-out'
						: 'animation-top-out',
					showPosition === 'bottom'
						? 'position-bottom'
						: 'position-top'
				]"
				class="select-options"
			>
				<view
					@click.stop="handleClickItem(item)"
					:class="
						multiple &&
						multiSelectList.find(
							res => res[keyName] === item[keyName]
						)
							? 'item-active'
							: value === item[keyName]
							? 'item-active'
							: ''
					"
					v-for="(item, i) in filterList" :key="i" 
					class="select-option-item"
				>
					{{ item[valueName] }}
				</view>
				<view
					class="options-no-data"
					v-if="filterList.length < 1"
				>
					无匹配数据~
				</view>
			</scroll-view>
		</view>
		<view
			v-if="isShow"
			@click="closeContentSelect"
			class="contentMask"
		></view>
	</view>
</template>

<script>
export default {
	props: {
		width: {
			type: String,
			default: '200px'
		},
		height: {
			type: String,
			default: '30px'
		},
		bgColor: {
			type: String,
			default: '#fff'
		},
		//是否多选
		multiple: {
			type: Boolean,
			default: false
		},
		//是否可搜索
		filterable: {
			type: Boolean,
			default: false
		},
		//是否显示关闭按钮
		showClose: {
			type: Boolean,
			default: false
		},
		//渲染列表
		list: {
			type: Array,
			default: () => [],
			required: true
		},
		//双向绑定的值
		value: {
			type: [Array, String, Number],
			default: ''
		},
		//默认显示的内容
		defaultValue: {
			type: String,
			default: '请选择'
		},
		//显示的内容
		valueName: {
			type: String,
			default: 'label',
			required: true
		},
		// 绑定的内容
		keyName: {
			type: String,
			default: 'value',
			required: true
		}
	},
	watch: {
		list: {
			immediate: true,
			deep: true,
			handler(news) {
				this.filterList = news
				const findItem = news.find(
					item => item[this.keyName] === this.value
				)
				if (findItem) {
					this.inputData = findItem[this.valueName]
				}
			}
		}
	},
	computed: {
		multiLength() {
			const length = this.multiSelectList.length - 1
			return '+' + length
		},
		bottomDistance() {
			return (
				this.windowHeight -
				this.distanceTop -
				this.curHeight
			) // 当前元素距离可视屏幕底部的距离
		}
	},
	data() {
		return {
			inputData: '',
			multiSelectList: this.multiple ? this.value : [],
			isShow: false,
			optionsShow: false,
			windowHeight: null,
			curHeight: null,
			distanceTop: null,
			showPosition: 'bottom',
			filterList: [],
			refreshUrl:
				'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0yNCA0NEMzNS4wNDU3IDQ0IDQ0IDM1LjA0NTcgNDQgMjRDNDQgMTIuOTU0MyAzNS4wNDU3IDQgMjQgNEMxMi45NTQzIDQgNCAxMi45NTQzIDQgMjRDNCAzNS4wNDU3IDEyLjk1NDMgNDQgMjQgNDRaIiBmaWxsPSJub25lIiBzdHJva2U9IiM3YzZlNmUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yOS42NTY5IDE4LjM0MzFMMTguMzQzMiAyOS42NTY4IiBzdHJva2U9IiM3YzZlNmUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE4LjM0MzIgMTguMzQzMUwyOS42NTY5IDI5LjY1NjgiIHN0cm9rZT0iIzdjNmU2ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='
		}
	},
	mounted() {
		this.$nextTick(() => {
			const res = uni.getSystemInfoSync()
			this.windowHeight = res.windowHeight // 当前设备屏幕高度
			uni
				.createSelectorQuery()
				.in(this)
				.select('#wSelect')
				.boundingClientRect(data => {
					this.distanceTop = data.top // 当前元素距离顶部的距离
					this.curHeight = data.height
				})
				.exec()
		})
	},
	methods: {
		showPositon() {
			this.showPosition = 'bottom'
			if (this.bottomDistance < this.windowHeight / 3) {
				this.showPosition = 'top'
			}
		},
		changeShow() {
			this.isShow = !this.isShow
			if (this.isShow === false) {
				this.filterList = this.list
				setTimeout(() => {
					this.optionsShow = false
				}, 200)
			} else {
				this.showPositon()
				this.optionsShow = this.isShow
			}
		},
		closeContentSelect() {
			this.isShow = false
			setTimeout(() => {
				this.optionsShow = false
			}, 200)
		},
		inputChange(e) {
			const value = e.detail.value
			this.$emit('input', value)
			this.filterList = this.list.filter(item =>
				item[this.valueName].includes(value)
			)
		},
		refreshValue() {
			this.$emit('input', '')
			this.inputData = ''
			this.$emit('change', '')
			this.filterList = this.list
			if (this.multiple) {
				this.multiSelectList = []
			}
		},
		handleClickItem(e) {
			if (this.multiple) {
				this.multiSelect(e)
			} else {
				this.$emit('input', e[this.keyName])
				this.inputData = e[this.valueName]
				this.$emit('change', e)
				this.changeShow()
			}
		},
		multiSelect(item) {
			let index = this.multiSelectList.findIndex(
				res => res[this.valueName] === item[this.valueName]
			)
			if (index > -1) {
				this.multiSelectList.splice(index, 1)
			} else {
				this.multiSelectList.push(item)
			}
			this.inputData = ''
			this.filterList = this.list
			this.$emit('input', this.multiSelectList)
			this.$emit('change', item)
		}
	}
}
</script>
<style lang="scss" scoped>
.w-select {
	// --select-wrap-width: 200px;
	--select-wrap-height: 30px;
	--select-border-radius: 4px;
	--select-border: 0px solid #dcdfe6;
	--select-active-border: 1px solid #409eff;
	--select-options-max-height: 150px;
	--select-option-item-font-size: 14px;
	--select-input-font-size: 14px;
	--no-data-default-color: #999999;
	--select-options-box-shadow: 0px 0px 12px
		rgba(0, 0, 0, 0.12);
	--select-bg-color: #fff;

	.select-wrap {
		position: relative;
		width: var(--select-wrap-width);
		height: var(--select-wrap-height);
		border-radius: var(--select-border-radius);
		transition: all 0.2s;
		border: var(--select-border);
		background-color: var(--select-bg-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		input, .rich-text {
			flex: 1;
			min-width: 0;
			width: 100%;
			height: 100%;
			padding: 0 2px;
			font-size: var(--select-input-font-size);
			color: white;
		}
		.select-content {
			font-size: var(--select-option-item-font-size);
			display: flex;
			align-items: center;
			.select-content-item {
				background-color: #f4f4f5;
				border-radius: var(--select-border-radius);
				color: #aa93b1;
				margin-left: 5px;
				padding: 2px 6px;
			}
			.select-content-item-default {
				color: var(--no-data-default-color);
				margin-left: 5px;
			}
		}
		.close-icon {
			width: 10px;
			height: 15px;
			position: absolute;
			right: 7px;
			top: 50%;
			z-index: 1000;
			transform: translateY(-50%);
			image {
				width: 100%;
				height: 100%;
			}
		}
		.position-bottom {
			top: calc(var(--select-wrap-height) + 10px);
		}
		.position-top {
			bottom: calc(var(--select-wrap-height) + 10px);
		}
		.select-options {
			position: absolute;
			left: 0;
			right: 0;
			border-radius: var(--select-border-radius);
			background-color: var(--select-bg-color);
			box-shadow: var(--select-options-box-shadow);
			z-index: 999;
			max-height: var(--select-options-max-height);
			overflow: scroll;
			padding: 10rpx 0;
			color: white;
			font-weight: normal;
			
			.select-option-item {
				transition: background-color 0.2s;
				padding: 5px;
				font-size: var(--select-option-item-font-size);
				margin-bottom: 5px;
			}
			.item-active {
				background-color: #f5f7fa22;
				color: #fb5318;
				font-weight: 700;
			}
			.options-no-data {
				color: var(--no-data-default-color);
				text-align: center;
				font-size: var(--select-option-item-font-size);
			}
		}
		.option-box {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 10rpx;
			.w-select-arrow {
				width: 16rpx;
				height: 10rpx;
			}
			.w-select-arrow-up {
				transform: rotate(-180deg);
			}
		}
	}
	.select-wrap-active {
		border: var(--select-active-border);
	}
	.animation-bottom-in {
		animation-name: bottom-in;
		animation-duration: 0.4s;
		animation-timing-function: ease-out;
		animation-fill-mode: both;
	}
	.animation-bottom-out {
		animation-name: bottom-out;
		animation-duration: 0.2s;
		animation-timing-function: ease-out;
		animation-fill-mode: both;
	}
	.animation-top-in {
		animation-name: top-in;
		animation-duration: 0.4s;
		animation-timing-function: ease-out;
		animation-fill-mode: both;
	}
	.animation-top-out {
		animation-name: top-out;
		animation-duration: 0.2s;
		animation-timing-function: ease-out;
		animation-fill-mode: both;
	}

	@keyframes bottom-in {
		0% {
			opacity: 0;
			transform: translateY(-15%);
		}

		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes bottom-out {
		0% {
			opacity: 1;
			transform: translateY(0);
		}

		100% {
			opacity: 0;
			transform: translateY(-20%);
		}
	}
	@keyframes top-in {
		0% {
			opacity: 0;
			transform: translateY(15%);
		}

		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes top-out {
		0% {
			opacity: 1;
			transform: translateY(0);
		}

		100% {
			opacity: 0;
			transform: translateY(20%);
		}
	}
	.contentMask {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 100%;
		z-index: 998;
	}
}
</style>
