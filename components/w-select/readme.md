#### props

|名称					|类型		|默认值		|说明																										|
|-						|-			|-				|-																											|
|width				|string	|'200px'	|选择框宽度																							|
|height				|string	|'30px'		|选择框高度																							|
|bgColor			|string	|'#fff'		|选择框背景颜色																					|
|round				|boolean|true			|是否开启圆角																						|
|defaultValue			|string				|'请选择'|默认显示的名称|																												|
|valueName		|string	|'label'	|显示的内容字段名,必传																	|
|keyName			|string	|'value'	|绑定的内容字段名,必传																	|
|list					|array	|[]				|展示的内容列表																					|
|showClose		|boolean|true			|是否显示删除按钮																				|
|multiple			|boolean|false		|是否开启多选																						|
|filterable		|boolean|false		|是否开启搜索功能，开启后直接输入值不选择也可以保存内容	|


#### events

|事件名|说明|
|-|-|
|change|选择的内容改变时触发，返回的参数为列表的item|


#### 使用举例

需要绑定的值通过`v-model`绑定，如下面的`chooseValue`，需要获取item的值可以监听`@change`事件

开启多选`multiple`时，双向绑定的值为数组类型，在change事件中根据自己需求进行处理。

`valueName`属性必须传，告知组件需要显示的是什么值

```html
<template>
  <view class="login">
    <w-select 
			style="margin-left: 20rpx;" 
      v-model='chooseValue' 
      defaultValue="所有审批人" 
      :list='list'
      valueName='content' 
			keyName="id"
      @change='change'
		>
    </w-select>
  </view>
</template>
<script>
  export default {
    data() {
      return {
        chooseValue: "",
        list: [{
          id: 1,
          content: '张三'
        }, {
          id: 2,
          content: '李四'
        }, {
          id: 3,
          content: '王五'
        }],
      };
    },
    methods: {
      change(e) {
        console.log('chooseValue', this.chooseValue)
      }
    },
  }
</script>
```