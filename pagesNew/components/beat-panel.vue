<template>
	<view class="container">
		<view class="cover-box" @click="close"></view>
		<view class="content-box bg-white gray-border">
			<view class="flex align-center justify-between">
				<view class="flex-sub text-lg padding-tb text-center" v-for="(item,index) in tabList" :key="index"
					:class="index===currentIndex?'theme-border-bottom-2 margin-lr text-bold':'margin-lr'"
					@click="tabClicked(index)">
					{{tabList[index].name}}
				</view>
			</view>
			<view v-if="!isNaN(currentIndex) && tabList[currentIndex] && tabList[currentIndex].userList 
				&& tabList[currentIndex].userList.length>0">
				<view v-for="(user,idx) in tabList[currentIndex].userList" :key="idx"
					class="flex align-center justify-between user-line">
					<view class="flex align-center">
						<image style="width:60rpx;height:60rpx;border-radius:100%"
							:src="(!user.avatar?defaultUserAvatar:user.avatar)" />
						<view class="text-sm text-black-4 margin-left-sm">{{user.mobile}}</view>
					</view>
					<view class="text-xs text-black-4">{{user.time | formatDate2}}</view>
				</view>
			</view>
			<view class="flex flex-direction align-center justify-center" v-else>
				<text class="text-gray-5 padding-top text-df ma-boo">暂无相关信息</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatTime6
	} from "@/utils/myUtil";
	import {
		filterCheckWorkOrder,
		filterContactWorkOrder,
		filterCheckReleaseWork,
		filterContactReleaseWork,

	} from "@/api/workinfo";

	export default {
		name: "beat-panel",
		data() {
			return {
				token: null,
				defaultUserAvatar: null,

				currentIndex: 0,
				tabList: [{
					type: 1,
					name: '最新查看',
					userList: [],
					fn: this.listCheckWorkOrder,
				}, {
					type: 1,
					name: '最新联系',
					userList: [],
					fn: this.listContactWorkOrder,
				}, {
					type: 0,
					name: '最新查看',
					userList: [],
					fn: this.listCheckReleaseWork,
				}, {
					type: 0,
					name: '最新联系',
					userList: [],
					fn: this.listContactReleaseWork,
				}],
			}
		},
		props: {
			nodeId: {
				type: Number,
				default: null,
			},
			tabIndex: {
				type: String,
				default: null,
			},
			type: {
				type: Number,
				default: 1,
			}
		},
		computed: {
			comTabIndex() {
				return parseInt(this.tabIndex);
			},
			comNodeId() {
				return this.nodeId;
			}
		},
		filters: {
			formatDate2(time) {
				return formatTime6(new Date(time));
			},
		},
		watch: {
			comTabIndex: {
				handler(newVal) {
					this.currentIndex = newVal;
					this.loadData();
				},
			},
			comNodeId: {
				handler(newVal) {
					this.tabList.forEach(v => {
						v.userList.splice(0, v.userList.length);
					});
				},
			},
			currentIndex: {
				handler(newVal) {
					if (!isNaN(newVal) && newVal != null) {
						this.loadData();
					}
				}
			}
		},
		created() {
			this.token = uni.getStorageSync("token");

			let defaultResource = uni.getStorageSync("defaultResource");
			this.defaultUserAvatar = defaultResource[4].resourceUrl[0];

			this.tabList = this.tabList.filter(v => v.type === this.type);
		},
		mounted() {},
		methods: {
			close() {
				this.$emit("close", {});
			},
			tabClicked(index) {
				this.currentIndex = index;
			},
			loadData() {
				if (!isNaN(this.currentIndex) && this.tabList[this.currentIndex].userList.length === 0) {
					this.tabList[this.currentIndex].fn();
				}
			},
			//获取最新查看信息
			listCheckWorkOrder() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					workId: this.nodeId,
					hidePhone: 1,
					page: 1,
					size: 5
				}
				let self = this;
				filterCheckWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						self.tabList[self.currentIndex].userList.splice(0, self.tabList[self.currentIndex].userList
							.length);
						res.data.list.forEach(v => {
							v.userDetailsInfo['time'] = v.createTime;
							self.tabList[self.currentIndex].userList.push(v.userDetailsInfo);
						})
					}
				}).catch(() => { //必须有
				});
			},

			//获取最新查看信息
			listContactWorkOrder() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					workId: this.nodeId,
					hidePhone: 1,
					page: 1,
					size: 5
				}
				let self = this;
				filterContactWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						self.tabList[self.currentIndex].userList.splice(0, self.tabList[self.currentIndex].userList
							.length);
						res.data.list.forEach(v => {
							v.userDetailsInfo['time'] = v.createTime;
							self.tabList[self.currentIndex].userList.push(v.userDetailsInfo);
						})
					}
				}).catch(() => { //必须有
				});
			},
			//获取最新查看信息
			listCheckReleaseWork() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					workId: this.nodeId,
					hidePhone: 1,
					page: 1,
					size: 5
				}
				let self = this;
				filterCheckReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						self.tabList[self.currentIndex].userList.splice(0, self.tabList[self.currentIndex].userList
							.length);
						res.data.list.forEach(v => {
							v.userDetailsInfo['time'] = v.createTime;
							self.tabList[self.currentIndex].userList.push(v.userDetailsInfo);
						})
					}
				}).catch(() => { //必须有
				});
			},

			//获取最新查看信息
			listContactReleaseWork() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					workId: this.nodeId,
					hidePhone: 1,
					page: 1,
					size: 5
				}

				let self = this;
				filterContactReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						self.tabList[self.currentIndex].userList.splice(0, self.tabList[self.currentIndex].userList
							.length);
						res.data.list.forEach(v => {
							v.userDetailsInfo['time'] = v.createTime;
							self.tabList[self.currentIndex].userList.push(v.userDetailsInfo);
						})
					}
				}).catch(() => { //必须有
				});
			},

			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},

		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;

		.cover-box {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: #000;
			opacity: 0.3;
			z-index: 99;
		}

		.content-box {
			opacity: 1;
			width: 90%;
			position: fixed;
			top: 30%;
			left: 5%;
			border-radius: 15rpx;
			z-index: 99999;
		}

	}

	.user-line {
		padding: 20rpx 30rpx;
	}
</style>