<template>
    <view class="uni-steps">
        <view :class="[direction==='column'?'uni-steps__column':'uni-steps__row']">
            <view :class="[direction==='column'?'uni-steps__column-text-container':'uni-steps__row-text-container']">
                <view style="display: flex;flex-direction: row" v-for="(item,index) in options" :key="index"
                      :class="[direction==='column'?'uni-steps__column-text':'uni-steps__row-text']">
                    <view style="width: 50rpx;height: 50rpx;padding-top:24rpx;margin-right: 20rpx">
                        <image style="width: 50rpx;height: 50rpx" :src="item.iconGray" v-if="item.gray"></image>
                        <image style="width: 50rpx;height: 50rpx" :src="item.icon" v-else></image>
                    </view>
                    <!-- 手风琴效果 -->
                    <uni-collapse accordion="true">
                        <uni-collapse-item :title="item.title" :open="item.desc.length > 0" :titleTextColor="item.textColor">
                            <view v-if="item.desc.length > 0" v-for="(itemDesc,indexDesc) in item.desc" :key="indexDesc"
                                  class="padding-tb-ssm margin-tb-ssm gray-border-bottom">
                                <view class="flex align-center justify-between">
                                    <view class="text-df text-black-4">
                                        <text v-if="userId === itemDesc.userId">我方</text>
                                        <text v-else>对方</text>
                                        {{ itemDesc.recordDetail }}
                                    </view>
                                    <view class="text-gray-5 text-ssm">
                                        {{ itemDesc.createTime }}
                                    </view>
                                </view>
                              </view>
                        </uni-collapse-item>
                    </uni-collapse>
                    <!--					<text :style="{color:index<=active?activeColor:deactiveColor}" :class="[direction==='column'?'uni-steps__column-title':'uni-steps__row-title']">{{item.title
                    }}</text>-->
                    <!--					<text :style="{color:index<=active?activeColor:deactiveColor}" :class="[direction==='column'?'uni-steps__column-desc':'uni-steps__row-desc']">{{item.desc
                    }}</text>-->
                </view>
            </view>
            <!--			<view :class="[direction==='column'?'uni-steps__column-container':'uni-steps__row-container']">-->
            <!--				<view :class="[direction==='column'?'uni-steps__column-line-item':'uni-steps__row-line-item']" v-for="(item,index) in options"-->
            <!--				 :key="index">-->
            <!--					<view :class="[direction==='column'?'uni-steps__column-line':'uni-steps__row-line',direction==='column'?'uni-steps__column-line&#45;&#45;before':'uni-steps__row-line&#45;&#45;before']"-->
            <!--					 :style="{backgroundColor:index<=active&&index!==0?activeColor:index===0?'transparent':deactiveColor}"></view>-->
            <!--					<view :class="[direction==='column'?'uni-steps__column-check':'uni-steps__row-check']" v-if="index === active">-->
            <!--						<uni-icons :color="activeColor" type="checkbox-filled" size="24"></uni-icons>-->
            <!--					</view>-->
            <!--					<view :class="[direction==='column'?'uni-steps__column-circle':'uni-steps__row-circle']" v-else :style="{backgroundColor:index<active?activeColor:deactiveColor}"></view>-->
            <!--					<view :class="[direction==='column'?'uni-steps__column-line':'uni-steps__row-line',direction==='column'?'uni-steps__column-line&#45;&#45;after':'uni-steps__row-line&#45;&#45;after']"-->
            <!--					 :style="{backgroundColor:index<active&&index!==options.length-1?activeColor:index===options.length-1?'transparent':deactiveColor}"></view>-->
            <!--				</view>-->
            <!--			</view>-->
        </view>
    </view>
</template>

<script>
import UniIcons from '@/components/uni-icons/uni-icons.vue'
import uniCollapse from './uni-collapse.vue'
import uniCollapseItem from './uni-collapse-item.vue'

export default {
    name: 'UniSteps',
    components: {
        UniIcons,
        uniCollapse,
        uniCollapseItem
    },
    props: {
        direction: {
            // 排列方向 row column
            type: String,
            default: 'row'
        },
        activeColor: {
            // 激活状态颜色
            type: String,
            default: '#1aad19'
        },
        deactiveColor: {
            // 未激活状态颜色
            type: String,
            default: '#999999'
        },
        active: {
            // 当前步骤
            type: Number,
            default: 0
        },
        userId: {
            // 激活状态颜色
            type: Number,
            default: null
        },
        options: {
            type: Array,
            default() {
                return []
            }
        } // 数据
    },
    data() {
        return {}
    },
    methods: {
        change(e) {
            console.log("折叠，", e)
        }
    },
    options: {styleIsolation: 'shared'},
}
</script>

<style lang="scss" scoped>
.uni-steps {
    /* #ifndef APP-NVUE */
    display: flex;
    width: 100%;
    /* #endif */
    /* #ifdef APP-NVUE */
    flex: 1;
    /* #endif */
    flex-direction: column;
}

.uni-steps__row {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
}

.uni-steps__column {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row-reverse;
}

.uni-steps__row-text-container {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
}

.uni-steps__column-text-container {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    /*justify-content: space-between;*/
    /*width: 100%;*/
    flex: 1;
}

.uni-steps__row-text {
    /* #ifndef APP-NVUE */
    display: inline-flex;
    /* #endif */
    flex: 1;
    flex-direction: column;
}

.uni-steps__column-text {
    padding: 6px 0px;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: $uni-border-color;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
}

.uni-steps__row-title {
    font-size: $uni-font-size-base;
    line-height: 16px;
    text-align: center;
}

.uni-steps__column-title {
    font-size: $uni-font-size-base;
    text-align: left;
    line-height: 18px;
}

.uni-steps__row-desc {
    font-size: 12px;
    line-height: 14px;
    text-align: center;
}

.uni-steps__column-desc {
    font-size: $uni-font-size-sm;
    text-align: left;
    line-height: 18px;
}

.uni-steps__row-container {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
}

.uni-steps__column-container {
    /* #ifndef APP-NVUE */
    display: inline-flex;
    /* #endif */
    width: 30px;
    flex-direction: column;
}

.uni-steps__row-line-item {
    /* #ifndef APP-NVUE */
    display: inline-flex;
    /* #endif */
    flex-direction: row;
    flex: 1;
    height: 14px;
    line-height: 14px;
    align-items: center;
    justify-content: center;
}

.uni-steps__column-line-item {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    flex: 1;
    align-items: center;
    justify-content: center;
}

.uni-steps__row-line {
    flex: 1;
    height: 1px;
    background-color: $uni-text-color-grey;
}

.uni-steps__column-line {
    width: 1px;
    background-color: $uni-text-color-grey;
}

.uni-steps__row-line--after {
    transform: translateX(1px);
}

.uni-steps__column-line--after {
    flex: 1;
    transform: translate(0px, 1px);
}

.uni-steps__row-line--before {
    transform: translateX(-1px);
}

.uni-steps__column-line--before {
    height: 6px;
    transform: translate(0px, -1px);
}

.uni-steps__row-circle {
    width: 5px;
    height: 5px;
    border-radius: 100px;
    background-color: $uni-text-color-grey;
    margin: 0px 3px;
}

.uni-steps__column-circle {
    width: 5px;
    height: 5px;
    border-radius: 100px;
    background-color: $uni-text-color-grey;
    margin: 4px 0px 5px 0px;
}

.uni-steps__row-check {
    margin: 0px 6px;
}

.uni-steps__column-check {
    height: 14px;
    line-height: 14px;
    margin: 2px 0px;
}

::v-deep .uni-collapse-cell--open {
    background: #FFFFFF !important;
}

::v-deep .uni-collapse-cell {
    border: none !important;
}

::v-deep .uni-collapse-cell__title {
    padding: 24rpx 0;
    width: 100%;
}

::v-deep .uni-collapse-cell__title-text {
    font-size: 34rpx;
    color: #ff5100;
}

::v-deep .uni-steps__column-text {
    border: none;

}

::v-deep .uni-collapse-cell__title-arrow, ::v-deep .uni-collapse-cell__title-arrow-active, ::v-deep .uni-icons {
    color: #ccc !important;

}

.uni-steps__column-text uni-collapse {
    display: flex;
    justify-content: space-between;
    width: 100%;
}
</style>
