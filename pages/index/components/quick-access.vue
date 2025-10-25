<template>
	<view class="container">
		<view class=" flex justify-center flex-wrap">
			<view v-for="(item,index) in quickAccessList" :key="index"
				class="grid-item-box bg-white flex flex-direction align-center justify-center " v-if="item.isShow"
				@click="handleClick(index)">
				<image :style="'width:'+item.width+';height:'+item.height" :src="item.url" />
				<view class="text-sm text-gray-4 margin-top-ssm text-center">{{ item.text }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		imgUrl,
		webUrl
	} from '@/utils/config'

	export default {
		name: "quick-access",
		data() {
			return {
				quickAccessList: [{
						url: imgUrl + '/index/ic_release_post.png',
						text: '发活',
						isShow: true,
						login: true,
						width: '88rpx',
						height: '88rpx',
						to: "/pagesNew/dosend/dosend"
					},
					{
						url: imgUrl + '/index/ic_work_post.png',
						text: '发承接',
						isShow: true,
						login: true,
						width: '88rpx',
						height: '88rpx',
						to: "/pagesNew/dowork/dowork"
					},
					{
						url: imgUrl + '/index/ic_commodity_post.png',
						text: '商品发布',
						isShow: true,
						login: true,
						width: '88rpx',
						height: '88rpx',
						to: "/pagesNew/domall/postCommodity"
					},
					{
						url: imgUrl + '/index/ic_item_task.png',
						text: '领金豆',
						isShow: true,
						login: true,
						width: '88rpx',
						height: '88rpx',
						to: "/pagesMore/job/jobList"
					},
					{
						url: imgUrl + '/index/ic_item_enterprise.png',
						text: '企业展台',
						isShow: true,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "/pagesCertification/enterprise/enterpriseList"
					},
					{
						url: imgUrl + '/index/ic_hy_fuzhuang.png',
						text: '服装',
						isShow: true,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "/pages/waifa/waifa?i=2"
					},
					{
						url: imgUrl + '/index/ic_hy_fangzhi.png',
						text: '纺织',
						isShow: true,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "/pages/waifa/waifa?i=1"
					},
					{
						url: imgUrl + '/index/ic_item_gengduo.png',
						text: '更多',
						isShow: true,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "/pagesChoose/industry/industryIndex"
					},
					{
						url: imgUrl + '/ic_register_account.png',
						text: '工商税务',
						isShow: false,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "/pages/common/webview?url=" + webUrl + "/es/register.html&name=公司注册 代理记账"
					},
					{
						url: imgUrl + '/ic_food_out.png',
						text: '餐食管理',
						isShow: false,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "/pages/common/webview?url=" + webUrl + "/es/food/pages/food.html&name=餐食服务"
					},
					{
						url: imgUrl + '/ic_worker_share.png',
						text: '赏金达人',
						isShow: false,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: "", //"/pagesMechanicShare/mechanicShare/index" //暂时取消
					},
					{
						url: imgUrl + '/ic_money_help.png',
						text: '资金扶持',
						isShow: false,
						login: false,
						width: '60rpx',
						height: '60rpx',
						to: ""
					},

				],
			}
		},
		props: {
			extra: {
				type: Boolean,
				default: false,
			}
		},
		watch: {
			extra: {
				handler(newVal) {
					for (let i = this.quickAccessList.length - 4; i < this.quickAccessList.length; i++) {
						this.quickAccessList[i].isShow = newVal
					}
				}
			}
		},
		methods: {
			handleClick(index) {
				this.$emit('action', this.quickAccessList[index]);
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}

	.grid-item-box {
		width: calc(25%);
		padding: 30rpx 0;
		margin-bottom: 2rpx;

		.btn-image {
			width: 60rpx;
			height: 60rpx;
		}
	}
</style>