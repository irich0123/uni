<template>
	<view class="main no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="审核管理" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<view :style="'padding-top:'+contentTop+'px;'" class="flex align-center">
			<view class="performance">
				<view class="btn-line-box">
					<view class="box back-light-blue " @click="to(s_release_audit)">
						<uni-icons type="work-release" size="30" color="green" style="line-height: 1;"></uni-icons>
						<view class="text text-black-5">外发审核</view>
					</view>
					<view class="box bg-white " @click="to(s_factory_audit)">
						<uni-icons type="factory" size="26" color="red" style="line-height: 1;"></uni-icons>
						<view class="text text-black-5">承接审核</view>
					</view>
					<view class="box bg-white " @click="to(s_cert_per)">
						<uni-icons type="code" size="26" color="red" style="line-height: 1;"></uni-icons>
						<view class="text text-black-5">个人认证审核</view>
					</view>
					<view class="box back-light-blue" @click="to(s_cert_com)">
						<uni-icons type="code" size="26" color="blue" style="line-height: 1;"></uni-icons>
						<view class="text text-black-5">企业认证审核</view>
					</view>
					<view class="box back-light-blue " @click="to(s_commodity_audit)">
						<uni-icons type="cart" size="28" color="green" style="line-height: 1;"></uni-icons>
						<view class="text text-black-5">商品审核</view>
					</view>
					<view class="box bg-white" @click="to(s_exit)">
						<uni-icons type="close" size="28" color="red" style="line-height: 1;"></uni-icons>
						<view class="text text-black-5">退出管理</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	export default {
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				statusbarHeight: 0,
				contentTop: 0,

				s_release_audit: 0,
				s_factory_audit: 1,
				s_cert_per: 2,
				s_cert_com: 3,
				s_commodity_audit: 4,
				s_exit: 5,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					//#endif
					// #ifdef H5
					this.contentTop = 0
					//#endif
				},
				immediate: true,
			}
		},
		methods: {
			navAction(e) {
				if (e.action === 'back') {
					uni.navigateBack({
						delta: 1 // 返回的页面数
					});
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},
			to(which) {
				let page = "";
				switch (which) {
					case this.s_release_audit:
						page = "/pagesAdmin/admin/audit-release-work";
						break;
					case this.s_factory_audit:
						page = "/pagesAdmin/admin/audit-work-order";
						break;
					case this.s_cert_per:
						page = "/pagesAdmin/admin/cert-personal";
						break;
					case this.s_cert_com:
						page = "/pagesAdmin/admin/cert-company";
						break;
					case this.s_commodity_audit:
						page = "/pagesAdmin/admin/audit-commodity";
						break;
					case this.s_exit:
						uni.removeStorageSync("adminToken");
						page = "/pages/index/index";
						uni.switchTab({
							url: page,
						})
						return;
				}

				uni.navigateTo({
					url: page
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.main {
		width: 100%;
		height: 100%;
		background-color: #f2f2f2;
	}
	
	.performance {
		width: 100%;
		margin: 20rpx 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.btn-line-box {
			width: 100%;
			margin-bottom: 30rpx;
			display: flex;
			flex-wrap: wrap;
			align-items: center;

			.box {
				margin: 0 12rpx 20rpx 12rpx;
				min-height: 200rpx;
				min-width: 45%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				border-radius: 30rpx;

				.text {
					margin-top: 30rpx;
					font-size: 28rpx;
				}
			}
		}
	}


	.back-light-blue {
		background-color: #E5FFF3;
	}

	.back-light-yellow {
		background-color: #FFFFaa;
	}

	/* #ifdef APP-PLUS  */
	@media (prefers-color-scheme: dark) {
		.main {
			background-position: top;
		}

		.back-light-blue {
			background-color: #336666;
		}

		.back-light-yellow {
			background-color: #414141;
		}
	}

	/* #endif  */
</style>