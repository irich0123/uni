<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="发单交易" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme"></wuc-tab>

		<!--        信息列表开始-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">
			<!--列表开始-->
			<uni-list :border="false">
				<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false"
					@click.native="toItemDetail(item.id)">
					<view class="flex-grow">
						<work-transaction-list-cell :transaction="item">
							<view class="padding-top-sm margin-top-sm gray-border-top flex align-center justify-end">
								<view v-if="(item.status === -1) && (item.statusCode === '010')"
									class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
									@click.stop="deleteTransaction(item.id,index)">删除
								</view>
								<view
									class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
									v-else-if="item.status === 5" @click.stop="checkDelayApply(item.id)">延期原因
								</view>
								<view v-else class="flex align-center justify-end text-black">
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
										v-if="item.statusCode === '010' || item.statusCode === '100' || item.statusCode === '101' 
											|| item.statusCode === '001' || item.statusCode === '110'
                                                || item.statusCode === '201' || item.statusCode === '210' || item.statusCode === '212'
                                                || item.statusCode === '301' || item.statusCode === '321'
                                                || item.statusCode === '401' || item.statusCode === '411'"
										@click.stop="cancelTransaction(item.id,item.statusCode,'two','two','two')">
										取消
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '210' " @click.stop="doPush(item.id,7)">催发样品
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '710'"
										@click.stop="operateCancelContractApply(item.id,0)">撤销取消
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '010'" @click.stop="goToContractDetails(item.id)">查看合同
									</view>

									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '100' || item.statusCode === '110'"
										@click.stop="goToPaymentDeposit(item.id,item.firstPartDepositRequire,item.workInfoNo)">
										交保证金
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '101'" @click.stop="doPush(item.id,1)">催交保证金
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '201'" @click.stop="deliverGoods(item.id,0)">样品发货
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '301'" @click.stop="deliverGoods(item.id,1)">材料发货
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '221'" @click.stop="doPush(item.id,2)">催收样品
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '321'" @click.stop="doPush(item.id,3)">催收材料
									</view>

									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
										v-if="item.statusCode === '212'" @click.stop="unqualified(item.id,false,0)">不合格
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '212'" @click.stop="unqualified(item.id,true,0)">合格
									</view>

									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '401'" @click.stop="acceptProduct(item.id)">
										确认验收
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
										v-if="item.statusCode === '410'"
										@click.stop="checkDelayApply(item.id,item.createTime,item.deliveryTime)">
										申请延期
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '410' || item.statusCode === '411'"
										@click.stop="doPush(item.id,8)">催成品
									</view>
									<!--                                        <button size="mini" plain v-if="item.statusCode === '411'" @click.stop="doPush(item.id,8)">催寄成品</button>-->
									<!--                                        成品是否合格-->
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
										v-if="item.statusCode === '412'" @click.stop="unqualified(item.id,false,1)">不合格
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '412'" @click.stop="unqualified(item.id,true,1)">合格
									</view>

									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '501'" @click.stop="openUploadPayVoucher(item.id,1)">
										支付凭证
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '510'" @click.stop="doPush(item.id,5)">催收款
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '600' || item.statusCode === '601'"
										@click.stop="goToEvaluate(item.id,item.firstPartUserId)">评价
									</view>

									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-black text-sm"
										v-if="item.statusCode === '701'"
										@click.stop="operateCancelContractApply(item.id,2)">不同意
									</view>
									<view
										class="margin-left-ssm padding-lr padding-tb-ssm radius-xl gray-border-1 text-sm"
										v-if="item.statusCode === '701'"
										@click.stop="operateCancelContractApply(item.id,1)">同意
									</view>
								</view>
							</view>
						</work-transaction-list-cell>
					</view>
				</uni-list-item>
			</uni-list>

			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>

		<jp-pwd ref="jpPwds" @completed="completed" @inputPwd="inputPwd" :money="pwd.money" :payType="pwd.payType"
			:keyType="pwd.keyType" @forget="forgetPass" :pawType="pwd.pawType" :tite="pwd.title"
			:contents="pwd.contents" :cancelType="pwd.cancelType" :keep="pwd.keep" :msg="pwd.msg" :places="pwd.places"
			contentsColor="#555" :keyImg="keyImg" :topImg="topImg" :isPwy="pwd.isPwy" titeColor="#fb5318"></jp-pwd>

		<passkeyboard :show="keyboardShow" :payType="payType" :money="payMoney.toFixed(2)" @password="password"
			:isIphoneX="false" @close="close"></passkeyboard>


		<!--       发货弹出框-->
		<uni-popup ref="popupGoods" type="center" :animation="true">
			<view class="bg-white radius-l padding text-df">
				<view class="text-xl text-theme text-center padding-bottom-sm">
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
					<view class="flex-sub bg-white text-lg padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupGoods.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-lg padding-lr padding-tb-sm radius text-center"
						@click.stop="submitGoods">确定</view>
				</view>
			</view>
		</uni-popup>

		<!--        不合格原因弹出框-->
		<uni-popup ref="popupUnqualified" type="center" :animation="true">
			<view class="bg-white radius-l padding text-df">
				<view class="text-xl text-theme text-center padding-bottom-sm">
					不合格原因
				</view>
				<view
					class="padding radius-s gray-border-1 flex flex-direction align-center justify-start margin-tb-sm">
					<view class="flex-grow text-normal flex align-center justify-start">
						<textarea placeholder="请输入不合格原因" maxlength="-1" v-model="unqualifiedReason" />
					</view>
				</view>

				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-lg padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupUnqualified.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-lg padding-lr padding-tb-sm radius text-center"
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
					<upload-img-bar @changed="mediaChanged" class="margin-top-sm" :img-list="uploadImgList"
						:img-length-max="5" ref="uploadImgBar" />
				</view>

				<view class="flex align-center justify-between">
					<view class="flex-sub bg-white text-lg padding-lr padding-tb-sm radius text-center"
						@click.stop="$refs.popupVoucher.close()">取消</view>
					<view class="flex-sub color-white bg-theme text-lg padding-lr padding-tb-sm radius text-center"
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
	import jpPwd from '@/components/jp-pwd/jp-pwd.vue';
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTextArea from "@/components/uni-popup/uni-popup-dialog-text-area";
	import passkeyboard from '@/components/yzc-paykeyboard/yzc-paykeyboard.vue';
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import wucTab from "@/components/wuc-tab/wuc-tab";
	import {
		cancelContractApply,
		deleteContract,
		filterMyContract,
		operateCancelContractApply,
		doUrgeAnything,
		deliverSample,
		deliverMaterial,
		confirmSample,
		confirmGoods,
		uploadPayVoucher,
		acceptProduct,
		payDeposit,
	} from "@/api/workinfo";
	import {
		getUserAccountInfoByUserId,
		verUserPassword
	} from '@/api/user';
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	import WorkTransactionListCell from "../components/work-transaction-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	import {
		publicKey,active
	} from "@/utils/config";

	const jsEncrypt = require('@/utils/jsencrypt')
	let jse = new jsEncrypt.JSEncrypt();
	jse.setPublicKey(publicKey) //配置公钥

	export default {
		name: "transactionReleaseWork",
		components: {
			WorkTransactionListCell,
			jpPwd,
			passkeyboard,
			uniPopup,
			UniList,
			UniListItem,
			wucTab,
			uniPopupDialogTextArea,
			uploadImgBar,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				tabBars: [{
						name: '签约中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [0, 6],
						list: [],
					},
					{
						name: '进行中',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [1, 3, 4, 5],
						list: [],
					},
					{
						name: '已完成',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [-1, 2],
						list: [],
					}
				],
				tabIndex: 0,
				triggered: false,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				token: '',
				userData: {},

				payType: 5, //保证金

				id: null,
				waybill: '', //运单号
				carrier: '',
				goodsType: null, //发货类型，0---样品，1---材料，
				unqualifiedReason: '', //不合格原因
				qualified: null,
				qualifiedType: null, //0---样品是否合格，1---成品是否合格
				voucherType: null, //凭证类型  1付款 2收款
				voucherTitle: '支付凭证',

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

				keyboardShow: false,
				payPassword: null,
				payMoney: 0, //需要支付的保证金

				uploadImgList: [], //图片链接,

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
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop;
					//#endif
					// #ifdef H5
					this.contentTop = 0;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

			let o = options.o
			if (o === 'n') {
				this.tabIndex = 1
			} else {
				this.tabIndex = 0
			}
			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

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
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},

			initData() {
				this.loadData()
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
				uni.navigateTo({
					url: '/pagesOffer/contract/evaluate?contractId=' + id + '&type=0'
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
					contractId: this.id,
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
							self.tabBars[self.tabIndex].page = 1;
							self.loadData()
						}, 2000)
					}
				});
			},
			//打开凭证上传
			openUploadPayVoucher(id, voucherType) {
				this.id = id
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
				uni.navigateTo({
					url: '../../pagesOffer/contract/applyPostpone?contractId=' + id + '&type=0'
				})
			},
			//确认验收成品
			acceptProduct(id) {
				let self = this;
				uni.showModal({
					title: "系统提示",
					content: '是否确认验收成品？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
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
										self.tabBars[self.tabIndex].page = 1;
										self.loadData()
									}, 2000);
								}
							});
						}
					}
				})

			},
			//打开不合格原因输入弹出框
			unqualified(id, qualified, qualifiedType) {
				this.id = id
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
					success: function(res1) {
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
					contractId: this.id,
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
								self.tabBars[self.tabIndex].page = 1;
								self.loadData()
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
								self.tabBars[self.tabIndex].page = 1;
								self.loadData()
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
					contractId: this.id,
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
								self.tabBars[self.tabIndex].page = 1;
								self.loadData()
							}, 2000)
						}
					});
				} else if (this.goodsType === 1) {
					deliverMaterial(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '材料发货成功！',
								icon: "none",
								duration: 2000
							})
							setTimeout(() => {
								self.$refs.popupGoods.close();
								self.tabBars[self.tabIndex].page = 1;
								self.loadData()
							}, 2000)
						}
					});
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
				let paramsData = {
					contractId: this.id,
					amount: this.payMoney * 1000,
					deviceType: 2,
					password: jse.encrypt(this.payPassword),
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
							self.tabIndex[self.tabIndex].page = 1;
							self.loadData()
						}, 2000)
					}
				});
			},

			close() {
				this.keyboardShow = false
			},
			//取消时输入密码后
			completed(e) {
				let paramsData = {
					deviceType: 2,
					password: jse.encrypt(e),
				}
				let self = this;
				verUserPassword(paramsData).then(res => {
					if (res.retCode === 0) {
						if (this.statusCode === '010') {
							let params = {
								contractId: self.id,
								responsibleUserUserType: 1 //甲方
							}
							cancelContractApply(params).then(res0 => {
								if (res0.retCode === 0) {
									uni.showToast({
										title: '取消成功！',
										icon: "none",
										duration: 2000
									})
									self.$refs.jpPwds.backs()
									self.$refs.jpPwds.toCancel()
									setTimeout(() => {
										self.tabBars[self.tabIndex].page = 1;
										self.loadData()
									}, 2000);
								}
							});
						} else if (self.statusCode === '100' || self.statusCode === '110' || self.statusCode ===
							'101' || self.statusCode === '001') { //取消交易，不需要赔偿金
							uni.navigateTo({
								url: '../../pagesOffer/contract/cancelReason?contractId=' + self.id +
									'&processType=deposit&reasonType=1'
							})
						} else if (self.statusCode === '201' || self.statusCode === '210' || self.statusCode ===
							'212' || self.statusCode === '221') { //取消交易，需要赔偿金
							uni.navigateTo({
								url: '../../pagesOffer/contract/cancelReason?contractId=' + self.id +
									'&processType=sample&reasonType=1&isShowMoney=1'
							})
						} else if (self.statusCode === '301' || self.statusCode === '321') { //取消交易，需要赔偿金
							uni.navigateTo({
								url: '../../pagesOffer/contract/cancelReason?contractId=' + self.id +
									'&processType=metal&reasonType=1&isShowMoney=1'
							})
						} else if (self.statusCode === '401' || self.statusCode === '411') { //取消交易，需要赔偿金
							uni.navigateTo({
								url: '../../pagesOffer/contract/cancelReason?contractId=' + self.id +
									'&processType=product&reasonType=1&isShowMoney=1'
							})
						}
						self.$refs.jpPwds.backs();
						self.$refs.jpPwds.toCancel();
					}
				});
			},
			inputPwd() {
				this.pwd.msg = ''
			},
			//跳转到交易详情
			toItemDetail(id) {
				uni.navigateTo({
					url: '../../pagesOffer/contract/transactionDetails?id=' + id + '&type=0'
				})
			},
			//删除交易
			deleteTransaction(id, index) {
				let paramsData = {
					contractId: id
				}
				let self = this;
				uni.showModal({
					title: "系统提示",
					content: '是否确定删除这条交易信息？',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							deleteContract(paramsData).then(res => {
								if (res.retCode === 0) {
									self.tabBars[self.tabIndex].list.splice(index, 1);
								}
							});
						}
					}
				})
			},
			//取消交易
			cancelTransaction(id, statusCode, payType, keyType, pawType, img1, img2) {
				this.id = id
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
					contractId: this.id,
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
							action(); //关闭弹窗
							self.tabBars[self.tabIndex].page = 1;
							self.loadData()
						}, 2000)
					}
				});
			},
			//撤销取消
			operateCancelContractApply(id, operateType) {
				if (operateType === 2) {
					this.id = id;
					this.$refs.reason.open();
					return;
				}

				let paramsData = {
					contractId: id,
					operateType: operateType
				}
				let self = this
				let modalContent = '';

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
					success: function(res1) {
						if (res1.confirm) {
							operateCancelContractApply(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										icon: 'none',
										title: '操作成功',
										duration: 2000
									})
									setTimeout(() => {
										self.tabBars[self.tabIndex].page = 1;
										self.loadData()
									}, 2000)
								}
							});
						}
					}
				})
			},
			//样品发货
			deliverGoods(id, goodsType) {
				this.id = id
				this.goodsType = goodsType
				this.$refs.popupGoods.open()
			},
			//催缴、催收
			doPush(contractId, urgeType) {
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
				} else if (urgeType === 8) { //催生产成品
					message = '请确认是否催发成品？'
				} else if (urgeType === 9) {
					message = '请确认是否催发材料？'
				}
				let self = this
				uni.showModal({
					title: "系统提示",
					content: message,
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
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
			goToPaymentDeposit(id, firstPartDepositRequire, workInfoNo) {
				this.loadUserData({
					id: id,
					firstPartDepositRequire: firstPartDepositRequire,
					workInfoNo: workInfoNo,
				});
			},
			submitDeposit(param) {
				//如果保证金总额减去冻结的保证金大于应支付的保证金金额，则直接输入支付密码扣除
				if ((this.totalMoney - this.freezeMoney) > (param.firstPartDepositRequire / 1000)) {
					this.id = param.id
					this.payMoney = (param.firstPartDepositRequire / 1000)
					this.payPassword = ''
					this.keyboardShow = true
				} else { //小于则跳转到缴纳保证金页面
					console.log("跳转缴纳")
					uni.navigateTo({
						url: '../pay/paymentDeposit?contractId=' + param.id
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
			//查看合同详情
			goToContractDetails(id) {
				//type=0 ---- 甲方，发活方；type=1 ---乙方，接活方
				uni.navigateTo({
					url: '../../pagesOffer/contract/contractDetails?id=' + id + '&type=0'
				})
			},
			//打电话
			callPhone(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				}).catch(e => {});
			},
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.loadData();
					}, 300);
				}
			},
			//获取我的交易
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let paramsData = {
					firstPartUserId: this.userData.id,
					statusList: this.tabBars[this.tabIndex].statusList,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size
				}

				let self = this;
				filterMyContract(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}

						res.data.list.forEach(item => {
							if (new RegExp('甲方').test(item.statusDesc)) {
								item.statusDesc = item.statusDesc.replace('甲方', '我方')
							} else if (new RegExp('乙方').test(item.statusDesc)) {
								item.statusDesc = item.statusDesc.replace('乙方', '对方')
							}

							if (item.releaseWorkResponse.img) {
								item.releaseWorkResponse.img = JSON.parse(item.releaseWorkResponse.img);
							} else {
								item.releaseWorkResponse.img = [];
							}

							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.tabBars[this.tabIndex].page = 1;
				this.tabBars[this.tabIndex].list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
			forgetPass() {
				uni.navigateTo({
					url: '../pay/setPayPassword',
				})
			},
			otherFun(object) { //选择地址后的数据收集
				if (!!object) {
					console.log(object);
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/tabBar.css";
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}

	::v-deep .uni-popup__wrapper-box {
		width: 90%;
	}
</style>