<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" class="my-nav-bar"
			:img-btn-src1="imgUrl+'/personal/ic_contract.png'" :img-btn-src2="imgUrl+'/personal/ic_arbitration.png'" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!-- #ifdef  H5-->
			<view class="bg-theme padding-tb-xl padding-lr-lg color-white flex justify-between"
				v-if="contractInfo.status === -1">
				已取消
			</view>
			<view class="bg-theme padding-tb-xl padding-lr-lg color-white flex justify-between" v-else>
				{{ contractInfo.statusDesc }}
				<view style="position: relative;">
					<view>...</view>
					<view v-if="isShowBox"
						class="bg-white radius-s position-absolute color-black text-lg text-center gray-border-1"
						style="width: 300rpx;right: 0;">
						<view class="padding-tb margin-lr gray-border-bottom"
							@click.stop="goToContractDetails(contractInfo.id)">合同</view>
						<view class="padding-tb margin-lr" @click.stop="goToApplyArbitration(contractInfo.id)">申请仲裁
						</view>
					</view>
				</view>
			</view>
			<!-- #endif -->

			<!--        外发活基本信息开始-->
			<view class="flex flex-direction padding bg-white">
				<view class="text-gray-4 text-df padding-bottom text-right">
					编号：{{ contractInfo.workInfoNo }}
				</view>
				<view class="padding-bottom-sm flex" style="min-height: 170rpx;">
					<view class="margin-top-ssm" style="min-width: 160rpx;">
						<image style="width:160rpx;height:160rpx;" class="radius-s" v-if="!contractInfo.releaseWorkResponse.img ||
                        contractInfo.releaseWorkResponse.img.length === 0" :src="releaseWorkBannerImg" />
						<image style="width:160rpx;height:160rpx" class="radius-s" v-else
							:src="contractInfo.releaseWorkResponse.img[0]" />
					</view>
					<view class="flex-grow margin-left-sm text-ssm">
						<view class="text-black margin-bottom-ssm text-normal text-bold" style="overflow: hidden;line-height: 1.5;min-height: 80rpx;display: -webkit-box;text-overflow: ellipsis;
							word-wrap: break-word;white-space: normal !important;-webkit-line-clamp: 2;-webkit-box-orient: vertical;">
							{{ contractInfo.releaseWorkResponse.title }}
						</view>
						<view class="text-ssm">
							<view class="flex justify-between">
								<view class="margin-bottom-ssm text-black">
									<text>单价：</text>
									<text class="margin-right-xs" v-if="!!contractInfo.releaseWorkResponse.unitPrice">
										{{ contractInfo.releaseWorkResponse.unitPrice | formatPrice }}元
									</text>
									<text class="margin-right-xs" v-else>待议</text>
								</view>
								<view class="margin-bottom-ssm text-black">
									<text>数量：</text>
									<text class="margin-right-xs" v-if="!!contractInfo.releaseWorkResponse.count">
										{{ contractInfo.releaseWorkResponse.count | formatQuantity }}{{ contractInfo.releaseWorkResponse.unit }}
									</text>
									<text class="margin-right-xs" v-else>待议</text>
								</view>
							</view>
							<view class="flex justify-between">
								<view class="margin-bottom-ssm text-black">
									<text>交期：</text>
									<text class="margin-right-xs">{{ contractInfo.deliveryTime | formatDate }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!--        外发活基本信息结束-->

			<!--        交易步骤-->
			<view class="margin-tb-sm">
				<view class="bg-white padding">
					<uni-steps :options="options" :userId="userData.id" direction="column" :active="0"></uni-steps>
				</view>
			</view>

			<view class="blank"></view>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white gray-border-top flex align-center"
			style="width:100%;position:fixed;left:0;bottom:0;z-index: 1;min-height:100rpx;">
			<view class="flex flex-grow align-center justify-between padding-left-sm  padding-lr-ssm">
				<view class="flex align-center justify-start" v-if="contractInfo.status === -1">
					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '010'"
						@click.stop="deleteTransaction(contractInfo.id)">删除
					</view>
					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '010'"
						@click.stop="goToContractDetails(contractInfo.id)">查看合同
					</view>
				</view>
				<view v-else-if="contractInfo.status === 5" class="flex align-center justify-start">
					<view class="button_other gray-border-1 text-black" @click.stop="checkDelayApply(contractInfo.id)">
						延期原因
					</view>
					<view class="button_other gray-border-1 text-black"
						@click.stop="goToContractDetails(contractInfo.id)">查看合同
					</view>
				</view>
				<view class="flex align-center justify-start" v-else>
					<view class="button_other gray-border-1 text-black"
						v-if="contractInfo.statusCode === '010' || contractInfo.statusCode === '100' || contractInfo.statusCode ==='101' || contractInfo.statusCode ==='001' || contractInfo.statusCode ==='110'
                              || contractInfo.statusCode ==='201' || contractInfo.statusCode ==='210' || contractInfo.statusCode ==='212'
                              || contractInfo.statusCode ==='301' || contractInfo.statusCode ==='321' || contractInfo.statusCode ==='401' || contractInfo.statusCode ==='411' "
						@click.stop="cancelTransaction(contractInfo.id,contractInfo.statusCode,'two','two','two')">
						取消
					</view>

					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '710'"
						@click.stop="operateCancelContractApply(contractInfo.id,0)">撤消取消
					</view>

					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '010'"
						@click.stop="goToContractDetails(contractInfo.id)">查看合同
					</view>

					<view class="button_other gray-border-1 text-black"
						v-if="(contractInfo.statusCode === '100' && type === '0') || (contractInfo.statusCode ==='110' && type==='0')"
						@click.stop="goToPaymentDeposit(contractInfo.id,contractInfo.firstPartDepositRequire,contractInfo.workInfoNo)">
						交保证金
					</view>

					<view class="button_other gray-border-1 text-black"
						v-if="(contractInfo.statusCode === '100' && type === '1') || (contractInfo.statusCode === '101' && type === '1')"
						@click.stop="goToPaymentDeposit(contractInfo.id,contractInfo.secondPartDepositRequire,contractInfo.workInfoNo)">
						交保证金
					</view>

					<view class="button_other gray-border-1 text-black"
						v-if="(contractInfo.statusCode === '101' && type === '0') || (contractInfo.statusCode === '110' && type === '1')"
						@click.stop="doPush(contractInfo.id,1)">催交保证金
					</view>

					<!--                        样品是否合格-->
					<view v-if="type === '0'" class="text-black">
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '221'"
							@click.stop="doPush(contractInfo.id,2)">催收样品
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '321'"
							@click.stop="doPush(contractInfo.id,3)">催收材料
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '212'"
							@click.stop="unqualified(contractInfo.id,false,0)">不合格
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '212'"
							@click.stop="unqualified(contractInfo.id,true,0)">合格
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '201'"
							@click.stop="deliverGoods(contractInfo.id,0)">样品发货
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '301'"
							@click.stop="deliverGoods(contractInfo.id,1)">材料发货
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '401'"
							@click.stop="acceptProduct(contractInfo.id)">确认验收
						</view>
						<view class="button_other gray-border-1"
							v-if="contractInfo.statusCode === '410' || contractInfo.statusCode === '411'"
							@click.stop="doPush(contractInfo.id,8)">催成品
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '412'"
							@click.stop="unqualified(contractInfo.id,false,1)">不合格
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '412'"
							@click.stop="unqualified(contractInfo.id,true,1)">合格
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '501'"
							@click.stop="openUploadPayVoucher(contractInfo.id,1)">支付凭证
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '510'"
							@click.stop="doPush(contractInfo.id,5)">催收款
						</view>
						<view class="button_other gray-border-1"
							v-if="contractInfo.statusCode === '600' || contractInfo.statusCode === '601'"
							@click.stop="goToEvaluate(contractInfo.id,contractInfo.firstPartUserId)">
							评价
						</view>
					</view>
					<view v-if="type === '1'" clas="text-black">
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '201'"
							@click.stop="doPush(contractInfo.id,7)">催发样品
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '210'"
							@click.stop="deliverGoods(contractInfo.id,0)">样品发货
						</view>

						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '221'"
							@click.stop="unqualified(contractInfo.id,false,0)">不合格
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '221'"
							@click.stop="unqualified(contractInfo.id,true,0)">合格
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '212'"
							@click.stop="doPush(contractInfo.id,2)">催收样品
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '301'"
							@click.stop="doPush(contractInfo.id,9)">催发材料
						</view>
						<!--                    <view class="button_other gray-border-1" v-if="contractInfo.statusCode === '321'" @click.stop="unqualified(contractInfo.id,false,2)">不合格</view>-->
						<!--                    <view class="button_other gray-border-1" v-if="contractInfo.statusCode === '321'" @click.stop="unqualified(contractInfo.id,true,2)">合格</view>-->
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '321'"
							@click.stop="confirmReceiveMaterial(contractInfo.id)">收到材料
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '401'"
							@click.stop="">催验收
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '410'"
							@click.stop="completedProduct(contractInfo.id)">成品完成
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '411'"
							@click.stop="deliverGoods(contractInfo.id,1)">成品发货
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '412'"
							@click.stop="doPush(contractInfo.id,4)">催收成品
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '501'"
							@click.stop="doPush(contractInfo.id,5)">催付款
						</view>
						<view class="button_other gray-border-1" v-if="contractInfo.statusCode === '510'"
							@click.stop="openUploadPayVoucher(contractInfo.id,2)">收款凭证
						</view>
						<view class="button_other gray-border-1"
							v-if="contractInfo.statusCode === '600' || contractInfo.statusCode === '610'"
							@click.stop="goToEvaluate(contractInfo.id,contractInfo.secondPartUserId)">
							评价
						</view>
					</view>


					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '410'"
						@click.stop="checkDelayApply(contractInfo.id,contractInfo.createTime,contractInfo.deliveryTime)">
						申请延期
					</view>
					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '701'"
						@click.stop="operateCancelContractApply(contractInfo.id,2)">不同意
					</view>
					<view class="button_other gray-border-1 text-black" v-if="contractInfo.statusCode === '701'"
						@click.stop="operateCancelContractApply(contractInfo.id,1)">同意
					</view>
				</view>

				<view class="flex flex-grow flex justify-end">
					<view class="button_other color-white theme-border"
						style="background: linear-gradient(to right, #ff6200, #fb5318);"
						@click="callPhone(type === '1'?contractInfo.firstPartUserMobile:contractInfo.secondPartUserMobile)">
						电话联系
					</view>
				</view>
			</view>
		</view>

		<jp-pwd ref="jpPwds" @completed="completed" @inputPwd="inputPwd" :money="pwd.money" :payType="pwd.payType"
			:keyType="pwd.keyType" @forget="forgetPass" :pawType="pwd.pawType" :tite="pwd.title"
			:contents="pwd.contents" :cancelType="pwd.cancelType" :keep="pwd.keep" :msg="pwd.msg" :places="pwd.places"
			contentsColor="#555" :keyImg="keyImg" :topImg="topImg" :isPwy="pwd.isPwy" titeColor="#fb5318"></jp-pwd>

		<passkeyborad :show="keyboardShow" :payType="payType" :money="payMoney" @password="password" :isIphoneX="false"
			@close="close"></passkeyborad>


		<!--       发货弹出框-->
		<uni-popup ref="popupGoods" type="center" :animation="true">
			<view class="bg-white radius-l padding text-df">
				<view class="text-normal text-theme text-center padding-bottom-sm">
					请填写物流信息
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<view class="flex-grow text-normal flex align-center justify-between" style="width: 100%;">
						<view class="flex-sub">物流公司：</view>
						<input v-model="carrier"
							class="flex-twice radius-s bg-gray-1 padding-ssm flex align-center justify-center" />
					</view>
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<view class="flex-grow text-normal flex align-center justify-between" style="width: 100%;">
						<view class="flex-sub">运单号：</view>
						<input v-model="waybill"
							class="flex-twice radius-s bg-gray-1 padding-ssm flex align-center justify-center" />
					</view>
				</view>
				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-normal padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupGoods.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-normal padding-lr padding-tb-sm radius text-center"
						@click.stop="submitGoods">确定</view>
				</view>
			</view>
		</uni-popup>

		<!--        不合格原因弹出框-->
		<uni-popup ref="popupUnqualified" type="center" :animation="true">
			<view class="bg-white radius-l padding text-df">
				<view class="text-normal text-theme text-center padding-bottom-sm">
					不合格原因
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<view class="flex-grow text-df flex align-center justify-start">
						<textarea placeholder="请输入不合格原因" maxlength="-1" v-model="unqualifiedReason" />
					</view>
				</view>

				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-normal padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupUnqualified.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-normal padding-lr padding-tb-sm radius text-center"
						@click.stop="confirmReceiveSimpleDemo">确定</view>
				</view>
			</view>
		</uni-popup>

		<!--        支付、收款凭证弹出框-->
		<uni-popup ref="popupVoucher" type="center" :animation="true">
			<view class="bg-white radius-l padding text-df">
				<view class="text-xl text-theme text-center padding-bottom-sm">
					{{ voucherTitle }}
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<upload-img-bar class="margin-top-sm" @changed="mediaChanged" :img-list="uploadImgList"
						:img-length-max="5" ref="uploadImgBar" />
				</view>

				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-normal padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupVoucher.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-normal padding-lr padding-tb-sm radius text-center"
						@click.stop="uploadPayVoucher">确认上传</view>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="reason" type="dialog">
			<uni-popup-dialog-text-area mode="input" title="小二提示" value="" placeholder="请输入不同意的理由"
				@confirm="disagreeReasonConfirmed"></uni-popup-dialog-text-area>
		</uni-popup>

	</view>

</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import passkeyborad from '@/components/yzc-paykeyboard/yzc-paykeyboard.vue';
	import jpPwd from '@/components/jp-pwd/jp-pwd.vue';
	import uniSteps from '../components/uni-steps.vue'
	import uniCollapse from '../components/uni-collapse.vue'
	import uniCollapseItem from '../components/uni-collapse-item.vue'
	import {
		calculateMath,
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		cancelContractApply,
		operateCancelContractApply,
		deleteContract,
		doUrgeAnything,
		deliverSample,
		deliverProduct,
		deliverMaterial,
		confirmSample,
		confirmGoods,
		uploadPayVoucher,
		acceptProduct,
		getContractRecord,
		payDeposit,
		confirmReceiveMaterial,
	} from "@/api/workinfo";
	import {
		getUserAccountInfoByUserId,
		verUserPassword
	} from '@/api/user'
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	import uniPopupDialogTextArea from "@/components/uni-popup/uni-popup-dialog-text-area";

	import {
		publicKey,
		imgUrl,active
	} from '@/utils/config';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "transactionDetails",
		components: {
			uniSteps,
			uniCollapse,
			uniCollapseItem,
			uniPopup,
			jpPwd,
			passkeyborad,
			uploadImgBar,
			uniPopupDialogTextArea,
			// #ifndef H5
			myNavBar
			// #endif
		},

		data() {
			return {
				token: null,
				userData: {},
				title: '',

				contractInfo: {
					id: null,
					status: null,
					releaseWorkResponse: {
						img: null,
					}
				},
				releaseWorkBannerImg: null,

				options: [],
				keyImg: '',
				topImg: '',
				pwd: {
					money: 100, //支付金额
					payType: 'two', //支付样式  one two
					keyType: 'one', //键盘样式  one two
					pawType: 'one', //输入框样式  one two
					title: '系统提示', //标题
					contents: '请输入支付密码，以确认是本人操作！', //提示
					cancelType: false, //是否输入完密码后消失
					keep: true, //点击遮挡是否关闭
					msg: '', // 密码错误提示语
					places: 6,
					isPwy: true
				},
				type: null, // //type=0 ---- 甲方，发活方；type=1 ---乙方，接活方
				statusCode: null,

				totalMoney: 0, //总保证金
				freezeMoney: 0, //被冻结的保证金
				payType: 5, //保证金
				keyboardShow: false,
				payPassword: null,
				payMoney: 0, //需要支付的保证金

				waybill: '', //运单号
				carrier: '',
				goodsType: null, //发货类型，0---样品，1---材料，
				unqualifiedReason: '', //不合格原因
				qualified: null,
				qualifiedType: null, //0---样品是否合格，1---成品是否合格
				voucherType: null, //凭证类型  1付款 2收款
				voucherTitle: '支付凭证',

				uploadImgList: [], //图片链接,

				isShowBox: false, //是否显示合同、申请仲裁框

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		filters: {
			formatDate(time) {
				return formatTime(new Date(time));
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

			this.contractInfo.id = parseInt(options.id);
			this.type = options.type; //0=表示发单方

			this.initData();
		},
		onShow() {
			//更多... 按钮 这里要做弹出式的，或者放到fab里面  todo
			//聊天和电话联系按钮，也要处理，放在这里不合适  todo

			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

			if (!this.token) {
				this.toLogin();
				return;
			}

			if (!!uni.getStorageSync("needRefresh")) {
				uni.removeStorageSync("needRefresh");
				this.initData();
			}
		},
		methods: {
			navAction(e) {
				if (e.action === 'back') {
					uni.navigateBack({
						delta: 1 // 返回的页面数
					});
				} else if (e.action === 'btn1') {
					this.goToContractDetails(this.contractInfo.id);
				} else if (e.action === 'btn2') {
					this.goToApplyArbitration(this.contractInfo.id);
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},

			initData() {
				//获取默认图片
				let defaultResource = uni.getStorageSync("defaultResource");
				this.releaseWorkBannerImg = defaultResource[0].resourceUrl[0];
				
				this.getContractRecord();
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
			//跳转到评论页面
			goToEvaluate(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: './evaluate?contractId=' + id + '&type=' + this.type
				})
			},
			//上传凭证
			uploadPayVoucher() {
				//图片校验
				if (this.uploadImgList.length === 0) {
					uni.showToast({
						icon: 'none',
						title: '至少上传一张凭证图片',
						duration: 3000
					})
					return
				}
				let paramsData = {
					contractId: this.contractInfo.id,
					voucherType: this.voucherType,
				}
				if (this.uploadImgList.length !== 0) {
					paramsData['voucherImg'] = JSON.stringify(this.uploadImgList);
				} else {
					paramsData['voucherImg'] = "[]";
				}

				let self = this;
				uploadPayVoucher(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "操作成功！",
							icon: "none",
							duration: 2000
						})
						setTimeout(() => {
							self.$refs.popupVoucher.close()
							self.getContractRecord()
						}, 2000)
					}
				});
			},
			//打开凭证上传
			openUploadPayVoucher(id, voucherType) {
				this.contractInfo.id = id
				this.voucherType = voucherType
				if (voucherType === 1) { //付款
					this.voucherTitle = '付款凭证'
				} else if (voucherType === 2) { //收款
					this.voucherTitle = '收款凭证'
				}
				this.$refs.popupVoucher.open()
			},
			//查看延期申请
			checkDelayApply(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '../../pagesOffer/contract/applyPostpone?contractId=' + id + '&type=' + this.type
				})
			},
			//完成成品
			completedProduct(id) {
				let self = this
				uni.showModal({
					title: "系统提示",
					content: '确认完成成品？',
					cancelText: '取消',
					confirmText: '确定完成',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							let paramsData = {
								contractId: id,
							}
							acceptProduct(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "操作成功！",
										icon: "none",
										duration: 2000
									})
									setTimeout(() => {
										self.getContractRecord()
									}, 2000);
								}
							});
						}
					}
				})
			},

			//打开不合格原因输入弹出框
			unqualified(id, qualified, qualifiedType) {
				this.contractInfo.id = id
				this.qualified = qualified
				this.qualifiedType = qualifiedType
				let contentModal = ''
				if (qualifiedType === 0) { //样品
					if (qualified) {
						contentModal = '是否确认样品合格？'
					} else {
						contentModal = '是否确认样品不合格？'
					}
				} else if (qualifiedType === 1) { //成品
					if (qualified) {
						contentModal = '是否确认成品合格？'
					} else {
						contentModal = '是否确认成品不合格？'
					}
				}

				let self = this
				uni.showModal({
					title: "系统提示",
					content: contentModal,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							if (!self.qualified) { //不合格
								self.$refs.popupUnqualified.open()
							} else { //合格
								self.confirmReceiveSimpleDemo()
							}
						}
					}
				})
			},
			//不合格/合格提交
			confirmReceiveSimpleDemo() {
				let paramsData = {
					contractId: this.contractInfo.id,
					qualified: this.qualified,
				}
				if (!this.qualified) {
					paramsData['reason'] = this.unqualifiedReason;
				}
				let self = this;
				if (this.qualifiedType === 0) { //样品是否合格
					confirmSample(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: "操作成功！",
								icon: "none",
								duration: 2000
							})
							setTimeout(() => {
								if (!self.qualified) {
									self.$refs.popupUnqualified.close()
								}
								self.getContractRecord()
							}, 2000);
						}
					});
				} else if (this.qualifiedType === 1) { //成品是否合格
					confirmGoods(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: "操作成功！",
								icon: "none",
								duration: 2000
							})
							setTimeout(() => {
								if (!self.qualified) {
									self.$refs.popupUnqualified.close()
								}
								self.getContractRecord()
							}, 2000);
						}
					});
				}
			},

			//发货
			submitGoods() {
				if (!this.carrier) {
					uni.showToast({
						title: '请输入物流公司',
						icon: "none",
						duration: 3000
					})
					return
				}
				if (!this.waybill) {
					uni.showToast({
						title: '请输入运单号',
						icon: "none",
						duration: 3000
					})
					return
				}

				let self = this;
				let paramsData = {
					contractId: this.contractInfo.id,
					waybillNo: this.waybill,
					expressName: this.carrier
				}
				if (this.goodsType === 0) {
					deliverSample(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '样品发货成功！',
								icon: "none",
								duration: 2000
							})
							setTimeout(() => {
								self.$refs.popupGoods.close();
								self.getContractRecord()
							}, 2000)
						}
					});
				} else if (this.goodsType === 1) {
					if (this.type === '0') {
						deliverMaterial(paramsData).then(res => {
							if (res.retCode === 0) {
								uni.showToast({
									title: '材料发货成功！',
									icon: "none",
									duration: 2000
								})
								setTimeout(() => {
									self.$refs.popupGoods.close();
									self.getContractRecord()
								}, 2000)
							}
						});
					} else if (this.type === '1') {
						deliverProduct(paramsData).then(res => {
							if (res.retCode === 0) {
								uni.showToast({
									title: '成品发货成功！',
									icon: "none",
									duration: 2000
								})
								setTimeout(() => {
									self.$refs.popupGoods.close();
									self.getContractRecord()
								}, 2000)
							}
						});
					}
				}
			},

			password(e) {
				this.payPassword = e
				if (this.payPassword) {
					this.submitPay()
				} else {
					uni.showToast({
						title: '请输入支付密码',
						icon: "none",
						duration: 1500
					})
				}
			},
			submitPay() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					contractId: this.contractInfo.id,
					amount: this.payMoney * 1000,
					deviceType: 2,
					password: jse.encrypt(this.payPassword)
				}
				let self = this;
				payDeposit(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "交保证金成功！",
							icon: "none",
							duration: 2000
						})
						setTimeout(() => {
							self.getContractRecord()
						}, 2000)
					}
				});
			},

			close() {
				this.keyboardShow = false
			},

			completed(e) {
				let reasonType = 1
				if (this.type === '1') {
					reasonType = 2
				} else if (this.type === '0') {
					reasonType = 1
				}
				let paramsData = {
					deviceType: 2,
					password: jse.encrypt(e),
				}
				let self = this;
				verUserPassword(paramsData).then(res => {
					if (res.retCode === 0) {
						if (this.statusCode === '010') {
							let paramsDataCancel = {
								contractId: self.contractInfo.id,
							}
							if (this.type === '1') {
								paramsDataCancel['responsibleUserUserType'] = 2
							} else if (this.type === '0') {
								paramsDataCancel['responsibleUserUserType'] = 1
							}

							cancelContractApply(paramsDataCancel).then(res0 => {
								if (res0.retCode === 0) {
									uni.showToast({
										title: '取消成功！',
										icon: "none",
										duration: 2000
									})
									self.$refs.jpPwds.backs()
									self.$refs.jpPwds.toCancel()
									setTimeout(() => {
										self.getContractRecord()
									}, 2000);
								}
							});
						} else if (self.statusCode === '001' || self.statusCode === '100' || self.statusCode ===
							'110' || self.statusCode === '101') { //取消交易，不需要赔偿
							uni.navigateTo({
								url: '/pagesOffer/contract/cancelReason?contractId=' + self.contractInfo
									.id + '&processType=deposit&reasonType=' + reasonType
							})
						} else if (self.statusCode === '201' || self.statusCode === '210' || self.statusCode ===
							'212' || self.statusCode === '221') { //取消交易，需要赔偿金
							uni.navigateTo({
								url: '/pagesOffer/contract/cancelReason?contractId=' + self.contractInfo
									.id + '&processType=sample&reasonType=' + reasonType + '&isShowMoney=1'
							})
						} else if (self.statusCode === '301' || self.statusCode === '321') { //取消交易，需要赔偿金
							uni.navigateTo({
								url: '/pagesOffer/contract/cancelReason?contractId=' + self.contractInfo
									.id + '&processType=metal&reasonType=' + reasonType + '&isShowMoney=1'
							})
						} else if (self.statusCode === '401' || self.statusCode === '411') { //取消交易，需要赔偿金
							uni.navigateTo({
								url: '/pagesOffer/contract/cancelReason?contractId=' + self.contractInfo
									.id + '&processType=product&reasonType=' + reasonType +
									'&isShowMoney=1'
							})
						}
						self.$refs.jpPwds.backs()
						self.$refs.jpPwds.toCancel()
					}
				});
			},
			inputPwd() {
				this.pwd.msg = ''
			},
			//删除交易
			deleteTransaction(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					contractId: id
				}
				let self = this
				uni.showModal({
					title: "系统提示",
					content: '是否确定删除这条合同信息？',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {

							deleteContract(paramsData).then(res => {
								if (res.retCode === 0) {
									self.getContractRecord();
								}
							});
						}
					}
				})
			},

			//取消交易
			cancelTransaction(id, statusCode, payType, keyType, pawType, img1, img2) {
				this.contractInfo.id = id
				this.statusCode = statusCode
				this.pwd.isPwy = true
				this.topImg = img1 || ''
				this.keyImg = img2 || ''
				// this.pwd.payType = payType
				this.pwd.keyType = keyType
				this.pwd.pawType = pawType
				this.pwd.places = 6
				this.$refs.jpPwds.toOpen()

			},
			disagreeReasonConfirmed(action, val) {
				let paramsData = {
					contractId: this.contractInfo.id,
					operateType: 2,
					refuseReason: val,
				}
				let self = this;
				operateCancelContractApply(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: '操作成功',
							duration: 2000
						})
						setTimeout(() => {
							action();
							self.getContractRecord();
						}, 2000)
					}
				});
			},
			//撤销取消
			operateCancelContractApply(id, operateType) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				if (operateType === 2) {
					this.contractInfo.id = id;
					this.$refs.reason.open();
					return;
				}

				let paramsData = {
					contractId: id,
					operateType: operateType
				}
				let self = this
				let modalContent = ''

				if (operateType === 0) {
					modalContent = '是否确认撤销取消交易？'
				} else {
					modalContent = '是否同意取消交易？'
				}
				uni.showModal({
					title: "系统提示",
					content: modalContent,
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							operateCancelContractApply(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										icon: 'none',
										title: '操作成功',
										duration: 2000
									})
									setTimeout(() => {
										self.getContractRecord();
									}, 2000)
								}
							});
						}
					}
				})
			},
			//样品发货
			deliverGoods(id, goodsType) {
				this.contractInfo.id = id
				this.goodsType = goodsType
				this.$refs.popupGoods.open()
			},
			//催缴、催收
			async doPush(contractId, urgeType) {
				let message = ''
				if (urgeType === 1) {
					message = '请确认是否催缴保证金？'
				} else if (urgeType === 2) {
					message = '请确认是否催收样品？'
				} else if (urgeType === 3) {
					message = '请确认是否催收材料？'
				} else if (urgeType === 4) {
					message = '请确认是否催收成品？'
				} else if (urgeType === 5) {
					message = '请确认是否催付款？'
				} else if (urgeType === 6) {
					message = '请确认是否催收款？'
				} else if (urgeType === 7) {
					message = '请确认是否催发样品？'
				} else if (urgeType === 8) {
					message = '请确认是否催发成品？'
				} else if (urgeType === 9) {
					message = '请确认是否催发材料？'
				}
				uni.showModal({
					title: "系统提示",
					content: message,
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							let paramsData = {
								contractId: contractId,
								urgeType: urgeType
							}
							doUrgeAnything(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										icon: 'none',
										title: '已成功提醒对方',
										duration: 2000
									})
								}
							});
						}
					}
				})
			},
			//跳转到交保证金页面
			goToPaymentDeposit(id, money, workInfoNo) {
				// #ifndef APP-PLUS
				this.loadUserData({
					id: id,
					money: money,
					workInfoNo: workInfoNo,
				});
				// #endif
				// #ifdef APP-PLUS
				uni.showModal({
					title: "系统提示",
					content: '请使用其他客户端充值',
					showCancel: false,
					confirmText: '我知道了',
					confirmColor: '#fb5318',
					success: function(res1) {}
				})
				// #endif
			},
			submitDeposit(param) {
				//如果保证金总额减去冻结的保证金大于应支付的保证金金额，则直接输入支付密码扣除
				if ((this.totalMoney - this.freezeMoney) > (param.money / 1000)) {
					this.contractInfo.id = param.id
					this.payMoney = (param.money / 1000)
					this.payPassword = ''
					this.keyboardShow = true
				} else { //小于则跳转到缴纳保证金页面
					uni.navigateTo({
						url: '../../pagesPersonal/pay/paymentDeposit?contractId=' + param.id
					})
				}
			},
			//获取用户个人信息
			loadUserData(param) {
				let self = this;
				getUserAccountInfoByUserId({
					userId: this.userData.id
				}).then(res => {
					if (res.retCode === 0) {
						self.totalMoney = res.data.deposit / 1000
						self.freezeMoney = res.data.depositFrozenCount / 1000

						self.submitDeposit(param);
					}
				});
			},

			//跳转到合同详情
			goToContractDetails(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: './contractDetails?id=' + id + '&type=' + this.type
				})
			},
			//打电话
			callPhone(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				}).catch(e=>{});
			},

			//确认收到材料
			confirmReceiveMaterial(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let self = this;
				uni.showModal({
					title: "系统提示",
					content: '是否确认已经收到材料？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							let paramsData = {
								contractId: id
							}
							confirmReceiveMaterial(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "操作成功！",
										icon: "none",
										duration: 2000
									})
									setTimeout(() => {
										self.getContractRecord()
									}, 2000)
								}
							});
						}
					}
				})
			},
			//确认验收成品
			acceptProduct(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let self = this
				uni.showModal({
					title: "系统提示",
					content: '是否确认验收成品？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: async function(res1) {
						if (res1.confirm) {
							let paramsData = {
								contractId: id
							}
							acceptProduct(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: "操作成功！",
										icon: "none",
										duration: 2000
									})
									setTimeout(() => {
										self.getContractRecord();
									}, 2000);
								}
							});
						}
					}
				})
			},

			goToApplyArbitration(id) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: './applyArbitration?id=' + id + '&type=' + this.type
				})
			},

			//获取交易详情
			getContractRecord() {
				let paramsData = {
					id: this.contractInfo.id
				}
				let self = this;
				console.log(2);
				getContractRecord(paramsData).then(res => {
					console.log(3);
					console.log(res);
					if (res.retCode === 0) {
						self.options = []

						let contract = res.data.contractInfo
						if (contract) {

							if (!!contract.sampleImg) {
								contract.sampleImg = JSON.parse(contract.sampleImg)
							} else {
								contract.sampleImg = [];
							}

							if (contract.statusDesc) {
								if (this.type === '0') {
									if (new RegExp('甲方').test(contract.statusDesc)) {
										contract.statusDesc = contract.statusDesc.replace('甲方', '我方')
									} else if (new RegExp('乙方').test(contract.statusDesc)) {
										contract.statusDesc = contract.statusDesc.replace('乙方', '对方')
									}
								} else if (this.type === '1') {
									if (new RegExp('甲方').test(contract.statusDesc)) {
										contract.statusDesc = contract.statusDesc.replace('甲方', '对方')
									} else if (new RegExp('乙方').test(contract.statusDesc)) {
										contract.statusDesc = contract.statusDesc.replace('乙方', '我方')
									}
								}
							}

							self.title = contract.statusDesc;

							// #ifdef H5 
							uni.setNavigationBarTitle({
								title: self.title,
							})
							// #endif

							let releaseWorkResponse = contract.releaseWorkResponse
							if (releaseWorkResponse) {
								if (!!releaseWorkResponse.img) {
									releaseWorkResponse.img = JSON.parse(releaseWorkResponse.img)
								} else {
									releaseWorkResponse.img = [];
								}
								if (!releaseWorkResponse.count) {
									releaseWorkResponse.count = 0;
								} else {
									releaseWorkResponse.count = Number(releaseWorkResponse.count);
								}
							}
						}
						let a = res.data.recordList
						let b = null
						let iconList = [{
								url: 'qianyue'
							},
							{
								url: 'fengxiankongzhi'
							},
							{
								url: 'dayang'
							},
							{
								url: 'shengchan'
							},
							{
								url: 'yanshou'
							},
							{
								url: 'jiesuan'
							},
							{
								url: 'fengxiankongzhi'
							},
							{
								url: 'pingjia'
							},
						]
						for (let i in a) {
							
							for (let j in a[i]) {
								b = a[i][j]
								if (b.length > 0) {
									for (let k = 0; k < b.length; k++) {
										if (b[k].createTime) {
											b[k].createTime = formatTime((b[k].createTime));
										}
										if (b[k].expressName) {
											b[k].recordDetail = b[k].recordDetail +
												" 【物流】:" + b[k].expressName +
												" 【单号】：" + b[k].waybillNo;
										}
									}
								}
								self.options = self.options.concat({
									title: j,
									desc: b,
									icon: self.imgUrl + '/transactionIcon/' + iconList[i]
										.url + '.png',
									iconGray: self.imgUrl + '/transactionIcon/' +
										iconList[i].url + '-gray.png',
									gray: b.length === 0,
									textColor: (b.length === 0) ? '#777777' : '#fb5318',
								});
							}
						}

						self.contractInfo = contract;
					}
				});
			},
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
			forgetPass() {
				uni.navigateTo({
					url: '../../pagesPersonal/pay/setPayPassword',
				})
			},
			otherFun(object) { //选择地址后的数据收集
				if (!!object) {
					console.log(object);
					this.getContractRecord();
				}
			},
		},
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;

		.transaction_steps_box {
			margin: 20rpx 0;

			.steps_box {
				background: #FFFFFF;
				padding: 30rpx 30rpx;
				box-shadow: 0 0 30rpx #e7e7e7;
			}
		}

	}

	.button_other {
		font-size: 28rpx;
		padding: 10rpx 24rpx;
		border-radius: 100rpx;
		display: flex;
		align-items: center;
		margin-right: 6rpx;
	}

	::v-deep .uni-collapse-item__title-box {
		padding-left: 0 !important;
	}

	.blank {
		height: 150rpx;
	}
</style>