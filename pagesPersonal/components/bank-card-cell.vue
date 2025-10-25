<template>
    <view class="container">
        <view @click="onItemClick" style="width: 100%;">
            <view class="title-line padding-tb-sm bg-gold flex align-center justify-between">
                <view style="display: flex">
                    <uni-icons color="#fb5318" size="26" type="checkbox-filled" v-if="!!item.primary"
                               style="padding: 0 20rpx"></uni-icons>
                </view>
                <view @click.stop="onTrash" v-show="!!item.status">
                    <uni-icons color="#999999" size="22" type="trash" style="padding: 0 20rpx"></uni-icons>
                </view>
            </view>

			<uni-list>
				<uni-list-item title="银行" :right-text="item.accountBankName" :show-arrow="false" />
				<uni-list-item title="持有人" :right-text="item.accountHolder" :show-arrow="false" />
				<uni-list-item title="账号" :right-text="item.accountBankNo" :show-arrow="false" />
				<uni-list-item title="状态" :right-text="!!item.status?'正常':'停用'" :show-arrow="false" />
			</uni-list>

            <view class="footer-line bg-gold">
            </view>
        </view>
    </view>
</template>

<script>
import UniIcons from "@/components/uni-icons/uni-icons";
import UniList from "@/components/uni-list/uni-list";
import UniListItem from "@/components/uni-list-item/uni-list-item";

export default {
    name: "bank-card-cell",
	options: { styleIsolation: 'shared' },
    components: {UniIcons, UniList, UniListItem},
    props: {
        item: {
            type: Object,
            default: function () {
                return {};
            },
        }
    },
    methods: {
        onTrash() {
            this.$emit("onTrash", {id: this.item.id});
        },
		onItemClick(){
			this.$emit("onItem", {id: this.item.id});
		}
    }
}
</script>

<style scoped lang="scss">
.container {
    width: 100%;
	
	.title-line {
	    width: 100%;
	    border-top-left-radius: 10rpx;
	    border-top-right-radius: 10rpx;
	}
	
	.footer-line {
	    width: 100%;
	    height: 30rpx;
	    border-bottom-left-radius: 10rpx;
	    border-bottom-right-radius: 10rpx;
	}
	
	
	::v-deep .uni-list {
		background-color: transparent !important;
	}
	
	::v-deep .uni-list-item {
		padding: 30rpx !important;
		background-color: #fff !important;
	}
	
	::v-deep .uni-list-item__container {
	    padding-top: 0rpx;
	    padding-bottom: 0rpx;
	}
	
	::v-deep .uni-list-item__content-title {
		font-size: 30rpx;
		color: #999;
	}
	
	::v-deep .uni-list-item__extra-text {
		font-size: 30rpx;
		color: #777;
	}
	
	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}
}

</style>
