<template>
	<view>
		<scroll-view scroll-x="true" class="scroll-view" :scroll-with-animation="true" v-if="showVP">
			<view @touchmove="switchPage" @touchstart="startTouch" @touchend="endTouch">
				<slot />
			</view>
		</scroll-view>
		<slot v-if="!showVP" />
	</view>
</template>

<script>
	export default {
		name: "viewPager",
		data() {
			return {
				nodeId: null,
				idList: [],

				currentPage: 1,
				size: 10,
				lastPage: false,

				innerParams: {},

				startX: 0,
				type: 0,

				showVP: false,
			}
		},
		props: {
			pageDataFun: {
				type: Function,
			},
			singlePage: {
				type: Boolean,
				default: true,
			},
			params: {
				type: Object,
				default () {
					return {};
				},
			}
		},
		mounted() {
			this.showVP = !this.singlePage;
			
			if(this.showVP){
				this.nodeId = this.params.id;
				this.currentPage = this.params.page;
				this.size = this.params.size;
				
				for (let key in this.params) {
					if (key != "page" && key != "size" && key != "id") {
						this.innerParams[key] = this.params[key];
					}
				}
				this.loadList();
			}
		},
		methods: {
			loadList() {
				let self = this;
				let param = {
					page: this.currentPage,
					size: this.size,
				}
				for (let key in this.innerParams) {
					param[key] = this.innerParams[key];
				}
				this.pageDataFun(param).then(res => {
					if (res.retCode === 0) {
						res.data.list.forEach(v => {
							self.idList.push(v.id);
						});

						self.lastPage = res.data.isLastPage;

						let index = self.idList.findIndex(v => {
							return v === self.nodeId
						});
						if (index === -1) {
							self.nodeId = self.idList[0];
						}
					}
				});
			},

			switchPage(event) {
				event.preventDefault();
				let moveEndX = event.changedTouches[0].pageX
				var X = moveEndX - this.startX

				if (X > 100) {
					// console.log("this.type==", 1)
					this.type = 1;
				} else if (X < -100) {
					// console.log("this.type==", 2)
					this.type = 2;
				} else {
					this.type = 0;
				}
			},
			startTouch(event) {
				// 记录点击坐标
				this.startX = event.changedTouches[0].pageX
			},
			endTouch(event) {
				if (this.type === 1) {
					// 上一页
					this.$nextTick(() => {
						let index = this.idList.findIndex(v => {
							return v === this.nodeId
						});
						if (index > -1) {
							if (index != 0) {
								this.nodeId = this.idList[index - 1];
								this.type = 0; //这里是复位，必须要的
								this.$emit('change', this.nodeId);
							} else if (this.currentPage > 1) {
								this.currentPage--;
								this.loadPrevList();
							}
						}
					});
				} else if (this.type === 2) {
					// 下一页
					this.$nextTick(() => {
						let index = this.idList.findIndex(v => {
							return v === this.nodeId
						});
						if (index > -1) {
							if (index !== (this.idList.length - 1)) {
								this.nodeId = this.idList[index + 1];
								this.type = 0; //这里是复位，必须要的
								this.$emit('change', this.nodeId);
							}

							if (index === (this.idList.length - 2) && !this.lastPage) {
								this.currentPage++;
								this.loadNextList();
							}
						}
					});
				}
			},
			loadPrevList() {
				let self = this;
				let param = {
					page: this.currentPage,
					size: this.size,
				}
				for (let key in this.innerParams) {
					param[key] = this.innerParams[key];
				}
				this.pageDataFun(param).then(res => {
					if (res.retCode === 0) {
						let arr = [];
						res.data.list.forEach(v => {
							if (self.idList.indexOf(v.id) === -1) {
								arr.push(v.id);
							}
						});
						self.idList.unshift(arr);
					}
				});
			},
			loadNextList() {
				let self = this;
				let param = {
					page: this.currentPage,
					size: this.size,
				}
				for (let key in this.innerParams) {
					param[key] = this.innerParams[key];
				}
				this.pageDataFun(param).then(res => {
					if (res.retCode === 0) {
						res.data.list.forEach(v => {
							if (self.idList.indexOf(v.id) === -1) {
								self.idList.push(v.id);
							}
						});

						self.lastPage = res.data.isLastPage;
					}
				});
			}
		},
	}
</script>

<style>
</style>