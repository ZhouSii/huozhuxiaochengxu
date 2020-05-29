let app = getApp()
var amapFile = require('../../../utils/amap-wx.js')
var myAmapFun = new amapFile.AMapWX({ key: 'cbb300a2c1e7820f0989eafee58db0ba' });
let animation = wx.createAnimation({
  duration: 250,
  timingFunction: 'ease-in-out',
})
let animationBottom = wx.createAnimation({
  duration: 200,
  timingFunction: 'ease-in-out',
})
Page({
  data: {
    animationData: {},
    animationDataBottom: {},
    showMask: false,
    showCarTypeWindow: false, //车型要求
    showRequestListWindow: false,// 额外服务
    showMaskMoney: false, //蒙板回款
    dialogFormVisible: false, // 回款弹窗
    tipWindow: false,
    goodsWindow: false,
    weightWindow: false,
    volumeWindow: false,
    protectionWindow: false,
    mathStatusWindow: false, //预估弹窗
    selectedProtectionTemp:{
      insuranceFeeCode: '',
      insurancePlanCode: '',
      insuranceMoney: 0
    },
    showPayWindow: false,
    mathStatus: true,
    tipList: [],
    xhcGoodsList: [],
    inputGoods: '', // 货物名称input
    weightList: [],
    inputWeight: '',
    volumeList: [],
    inputVolume: '',
    protectionList: [], // 理赔列表
    tipForm:{inputId:'',inputTip:''}, //手动输入小费
    extraService: { money: "" },
    cityAdcode: [],
    form:{},
    xiaoHuocheDataOrderNext: {},
    carList: [], // 车辆规格列表
    selectedCarTypeTemp: '', // 选择的车辆规格
    showSpec: '',
    requestList: [], // 额外服务列表
    orderNextform:{
      specCode:'', //车辆规格
      extraServiceDtoList: [],//额外服务
      requestNameList: '',//额外服务名称
      tipId:'',//小费id
      tipName:'',//小费名
      isFirst: 0, //我的司机优先接单
      goodsName:'',//货物名称
      weightName:'',//重量
      volumeName:'',//体积
      remark:'',//给司机捎句话
      _protection: false, // 货物保障
      insuranceFeeCode: '', // 需要支付保费
      insurancePlanCode:'', // 免赔
      insuranceMoney: 0, // 保险价钱
      preferentialList: [], //优惠券数据
      couponId: "",//优惠券id
      preferentialAmountId: "",//优惠金id
      mathPriceList:{
        distance:0,//预估里程
        price:0,//起步价
        kmPrice:0,//起步公里
        carTypeName:'',//车型
        outDistance:0,//超出公里
        outstripPrice:0,//超出公里价钱
        reward:0,//在线交易优惠金
        orderDiscountAmount:0,//优惠券
        _totalAmount:0,//预估总价 需要减优惠
        totalAmount:0,//总价格(起步价+超里程费+多地址+（小费 在orderNext）) 未减优惠
        couponIdList:[],//优惠券对应选择的车型
        moreAddrPrice:0, //写在localStorage
        moreAddr:0 // 多地址个数
      }
    },
    canClick:true,
    timer: null
  },
  pay(e){
    let bool = e.currentTarget.dataset.bool
    let form = this.selectComponent('#xiaoHuoCheOrder').data.form

    let preferentialAmountId,ifPreferential,couponId;
    preferentialAmountId = this.data.orderNextform.preferentialAmountId;
    preferentialAmountId ? ifPreferential = 1 : ifPreferential = 0;
    couponId = this.data.orderNextform.couponId

    let parm = {
      aflcPriceDto: {
        priceId: form.priceId,//定价id
        priceType: form.priceType,//定价类型 1标准定价 2区域定价
        spec: this.data.orderNextform.specCode//车辆规格
      },
      belongCity: form.belongCity,//发货地 订单所属区域(定位的城市id)
      couponId: couponId,//优惠券id
      distance: this.data.orderNextform.mathPriceList.distance,//实际总距离(地图计算)
      extraPrice: this.data.orderNextform.tipName,//附加小费
      extraPriceCode: this.data.orderNextform.tipId,//附加小费编码
      extraServiceDtoList: this.data.orderNextform.extraServiceDtoList,//额外服务
      goodsName: this.data.orderNextform.goodsName,//货物名称
      goodsVolume: this.data.orderNextform.volumeName,//货物体积（方）
      goodsWeight: this.data.orderNextform.weightName,//货物重量（吨）
      ip: app.IP ? app.IP : '',//客户端ip地址(app端不用传)
      isFirst: this.data.orderNextform.isFirst,//我的司机优先接单
      orderFrom: '',//订单来源(ios,android)
      orderPrice: this.data.orderNextform.mathPriceList.totalAmount + this.data.orderNextform.tipName * 1 + this.data.orderNextform.insuranceMoney * 1,//订单原价格(未减优惠券，优惠金的金额)
      preferentialAmountId: preferentialAmountId,//优惠金id
      ifPreferential: ifPreferential,
      remark: this.data.orderNextform.remark,//给司机捎句话
      serviceCode:  form.serviceCode,//服务分类（同城，省际,零担）
      shipperId:  app.storage.get_s("userInfo").shipperId,//货主id(app端不用传)
      shipperLineDtoList: form.to,//路线列表
      totalAmount:  this.data.orderNextform.mathPriceList._totalAmount + this.data.orderNextform.tipName * 1 + this.data.orderNextform.insuranceMoney * 1,//总价格
      useCarTime: form.time === '' ? '' : form.time,//用车时间(yyyy-MM-dd HH:mm:ss)
      usedCarType: form.carType,//用车类型（车辆类型）
      // salesmanPhone: this.$localStorage.get_s("salesmanPhone"),//渠道
      // belongSalesman: this.$localStorage.get_s("belongSalesman"),
      // belongSalesmanName: this.$localStorage.get_s("belongSalesmanName"),
      // belongSalesmanMobile: this.$localStorage.get_s("belongSalesmanMobile"),
      insuranceFeeCode: this.data.orderNextform.insuranceFeeCode,
      insurancePlanCode: this.data.orderNextform.insurancePlanCode
      // recommenderUserTypeCode:this.$localStorage.get_s("recommenderUserTypeCode"),
    };

    clearTimeout(this.data.timer);
    this.setData({
      timer: null
    })
    if(this.data.canClick === true) {
      this.setData({
        canClick: false
      })
      this.createOrder(parm);
    }
  },
  createOrder(parm){
    this.setData({
      showPayWindow: true
    })
    this.showBottomWindow()
    console.log(parm)
    // app.xhr('POST', `/aflc-order/aflcOrderApi/createOrder`, parm, (res => {
    //   if(res.data.status === 200){

    //   } else if(res.data.status === 10042) {

    //   }else if(res.data.status === 10043){

    //   }
    // }))

    setTimeout(()=>{
      this.setData({
        canClick: true
      })
    },1000)
  },
  next(){

  },
  mathPrice(xiaoHuoCheOrderForm){
    let start = '', end = '', waypoints = '', path = []
    let some = xiaoHuoCheOrderForm.to.some((item) => {
      return item.originCoordinate === ''
    });
    if (some) {
      return
    }
    wx.showNavigationBarLoading()
    this.setData({
      mathStatus: false
    })
    xiaoHuoCheOrderForm.to.forEach((item, i) => {
      path.push(item.originCoordinate.split(',').reverse())
    });
    start = `${path[0][0]}, ${path[0][1]}`;
    end = `${path[path.length - 1][0]}, ${path[path.length - 1][1]}`;
    if (path.length > 2) {
      path.shift();
      path.pop();
      let list = [];
      path.forEach((item) => {
        list.push(`${item[0]}, ${item[1]}`)
      });
      waypoints = list.join(';')
    }
    console.log(waypoints)
    myAmapFun.getDrivingRoute({
      origin: start,
      destination: end,
      strategy: 2,//距离最短
      waypoints: waypoints,
      success: (result) => {
        this.setData({ 'orderNextform.mathPriceList.distance': Math.ceil(result.paths[0].distance / 1000)})
        let outstripPrice;// 超里程价格
        xiaoHuoCheOrderForm.carList.forEach((item) => {
          if (item.carType === xiaoHuoCheOrderForm.carType) {
            outstripPrice = item.list[0].outstripPrice;
            this.setData({
              'orderNextform.mathPriceList.price': item.list[0].price,
              'orderNextform.mathPriceList.kmPrice': item.list[0].kmPrice,
              'orderNextform.mathPriceList.carTypeName': item.list[0].carTypeName,
            })
          }
        });
        let outDistance = this.data.orderNextform.mathPriceList.distance - this.data.orderNextform.mathPriceList.kmPrice
        if (outDistance > 0) {
          this.setData({
            'orderNextform.mathPriceList.outDistance': outDistance,
            'orderNextform.mathPriceList.outstripPrice': Math.ceil(outDistance * outstripPrice),
          })
        } else {
          this.setData({
            'orderNextform.mathPriceList.outDistance': 0,
            'orderNextform.mathPriceList.outstripPrice': 0,
          })
        }
        if (xiaoHuoCheOrderForm.to.length > 2) {
          this.setData({ 'orderNextform.mathPriceList.moreAddr': xiaoHuoCheOrderForm.to.length - 2})
        } else {
          this.setData({ 'orderNextform.mathPriceList.moreAddr': 0 })
        }
        let mathTotalAmount = this.data.orderNextform.mathPriceList.price + this.data.orderNextform.mathPriceList.outstripPrice + (xiaoHuoCheOrderForm.to.length - 2) * this.data.orderNextform.mathPriceList.moreAddrPrice;//总价格(起步价+超里程费) 未减优惠
        this.setData({'orderNextform.mathPriceList.totalAmount': mathTotalAmount})
        if (app.storage.get_s("userInfo")) {
          let parm = {
            areaCode: xiaoHuoCheOrderForm.belongCity,//发货地id
            carType: xiaoHuoCheOrderForm.carType,
            discountLevel: app.storage.get_s("userInfo").discountLevel,
            ifPreferential: 1, //是否使用优惠金
            serivceCode: xiaoHuoCheOrderForm.serviceCode,
            totalAmount: this.data.orderNextform.mathPriceList.price + this.data.orderNextform.mathPriceList.outstripPrice,//起步价+超里程费
            userId: app.storage.get_s("userInfo").shipperId
          };
            app.xhr('POST', `/aflc-order/aflcOrderApi/getPreferential?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res) => {
              if (res.data.status === 200) {
                //可选择不限制【AF046801】,仅限APP【AF046802】,仅限H5【AF046803】,仅限小程序【AF046804】
                //  下单立减（AF046901）
                //  余额付立减（AF046902）
                //  微信、支付宝付立减（AF046903）
                res.data.data.aflcCouponUseDtos.forEach(item => {
                  if(item.paymentMethod !== 'AF046902' && (item.useTogetherRoad === 'AF046801' || item.useTogetherRoad === 'AF046803') &&
                    item.isCanUse
                  ) {
                    item._canUse = true
                  } else {
                    item._canUse = false
                  }
                })
                this.setData({
                  preferentialList: res.data.data
                })
                //获取优惠金
                if (res.data.data.aflcShipperPreferentialtDetailDto !== null) {
                  if (xiaoHuoCheOrderForm.belongCity === res.data.data.aflcShipperPreferentialtDetailDto.areaCode) {
                    if (this.data.loadAflcShipperPreferentialtDetailDto){
                      this.setData({
                        'orderNextform.mathPriceList.reward': res.data.data.aflcShipperPreferentialtDetailDto.reward,
                        'orderNextform.preferentialAmountId': res.data.data.aflcShipperPreferentialtDetailDto.id
                      })
                    }
                  }
                } else {
                  this.setData({ 'orderNextform.mathPriceList.reward': 0,'orderNextform.preferentialAmountId': 0 })
                }
                let aflcCouponUseDtos = this.data.preferentialList.aflcCouponUseDtos
                this.data.orderNextform.mathPriceList.couponIdList.forEach((item) => {
                  if (item.carType === xiaoHuoCheOrderForm.carType) {
                    if (item.isUse === false) {
                      this.setData({
                        'orderNextform.mathPriceList.orderDiscountAmount': 0,
                        'orderNextform.couponId': ''
                      })
                    } else {
                      //自动选择优惠券
                      if (item.couponId === '') {
                        if (aflcCouponUseDtos.length > 0) {
                          let findOne = aflcCouponUseDtos.find(item => {
                            return item._canUse === true
                          })
                          //ifvouchersuperposition 能否与大户券叠加
                          if (findOne) {
                            if(findOne.ifvouchersuperposition === '0'){
                              this.setData({
                                'orderNextform.preferentialAmountId': '',
                                 'orderNextform.mathPriceList.reward': 0
                                })
                            }
                            this.setData({
                              'orderNextform.mathPriceList.orderDiscountAmount': findOne.orderDiscountAmount,
                              'orderNextform.couponId': findOne.id
                            })
                          } else {
                            this.setData({
                              'orderNextform.mathPriceList.orderDiscountAmount': 0,
                              'orderNextform.couponId': ''
                            })
                          }
                        } else {
                          this.setData({
                            'orderNextform.mathPriceList.orderDiscountAmount': 0,
                            'orderNextform.couponId': ''
                          })
                        }
                      } else {
                         //手动选择优惠券
                         let hasItem = aflcCouponUseDtos.find((item1) => {
                          return item1.id === item.couponId
                        })
                        if(hasItem) {
                          if(hasItem.ifvouchersuperposition === '0'){
                            this.setData({
                              'orderNextform.preferentialAmountId': '',
                              'orderNextform.mathPriceList.reward': 0
                            })
                          }
                          if(hasItem._canUse){
                            this.setData({
                              'orderNextform.mathPriceList.orderDiscountAmount': hasItem.orderDiscountAmount,
                              'orderNextform.couponId': hasItem.couponId
                            })
                          } else {
                            this.setData({
                              'orderNextform.mathPriceList.orderDiscountAmount': 0,
                              'orderNextform.couponId': ''
                            })
                          }
                        } else {
                          this.setData({
                            'orderNextform.mathPriceList.orderDiscountAmount': 0,
                            'orderNextform.couponId': ''
                          })
                        }
                      }
                    }
                  }
                });
              } else {
                wx.showToast({
                  title: res.data.text || res.data.errorInfo,
                  icon: 'none',
                  duration: 2000
                })
              }
              this.setData({
                'orderNextform.mathPriceList._totalAmount': mathTotalAmount - this.data.orderNextform.mathPriceList.orderDiscountAmount - this.data.orderNextform.mathPriceList.reward, //总价格(起步价+超里程费) 减优惠
                mathStatus: true
              })
              wx.hideNavigationBarLoading()
            })
        } else {
          wx.hideNavigationBarLoading()
          this.setData({ 
            'orderNextform.mathPriceList.orderDiscountAmount': 0,
            'orderNextform.couponId': '',
            'orderNextform.preferentialAmountId': '',
            'orderNextform.mathPriceList.reward': 0,
            'orderNextform.mathPriceList._totalAmount': mathTotalAmount,
             mathStatus: true
            })
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  showBottomWindow(){
    this.setData({
      showMask: !this.data.showMask,
    })
    animation.opacity(1).step()
    animationBottom.bottom(0).step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
  },
  closeMask2(){
    this.closeBottomWindow()
  },
  closeBottomWindow: function () {
    animation.opacity(0).step()
    animationBottom.bottom('-68%').step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
    setTimeout(() => {
      this.setData({
        showCarTypeWindow: false,
        showRequestListWindow: false,
        tipWindow: false,
        goodsWindow: false,
        weightWindow: false,
        volumeWindow: false,
        protectionWindow: false,
        mathStatusWindow: false,
        showPayWindow: false,
        showMask: false
      })
      if(!this.data.orderNextform._protection || !this.data.orderNextform.insuranceFeeCode){
        this.closeProtection()
      }
    }, 250)
  },
  showPreferential(){

  },
  showMathStatus(){
    this.setData({
      mathStatusWindow: true
    })
    this.showBottomWindow()
  },
  protectionClick(){
    this.setData({
      'orderNextform.insuranceFeeCode': this.data.selectedProtectionTemp.insuranceFeeCode,
      'orderNextform.insurancePlanCode': this.data.selectedProtectionTemp.insurancePlanCode,
      'orderNextform.insuranceMoney': this.data.selectedProtectionTemp.insuranceMoney
    })
    this.closeMask2()
  },
  selectedProtectionType(e){
    let item = e.currentTarget.dataset.item
    if(this.data.selectedProtectionTemp.insuranceFeeCode === item.insuranceFeeCode && this.data.selectedProtectionTemp.insurancePlanCode === item.insurancePlanCode) {
      this.setData({
        'selectedProtectionTemp.insuranceFeeCode': '',
        'selectedProtectionTemp.insurancePlanCode': '',
        'selectedProtectionTemp.insuranceMoney': ''
      })
    } else {
      this.setData({
        'selectedProtectionTemp.insuranceFeeCode': item.insuranceFeeCode,
        'selectedProtectionTemp.insurancePlanCode': item.insurancePlanCode,
        'selectedProtectionTemp.insuranceMoney': item.money
      })
    }
  },
  closeProtection(){
    this.setData({
      'orderNextform._protection': false,
      'selectedProtectionTemp.insuranceFeeCode': '',
      'selectedProtectionTemp.insurancePlanCode': '',
      'selectedProtectionTemp.insuranceMoney': '',
      'orderNextform.insuranceFeeCode': '',
      'orderNextform.insurancePlanCode': '',
      'orderNextform.insuranceMoney': ''
    })
  },
  protectionSwitch(e){
    if (e.detail.value){
      this.setData({
        'orderNextform._protection': true,
        protectionWindow: true
      })
      this.showBottomWindow()
    } else{
      this.closeProtection()
    }
  },
  checkInputVolume(e){
    this.setData({
      inputVolume: e.detail.value
    })
  },
  volume(){
    this.setData({
      volumeWindow: true,
      showMask: !this.data.showMask,
    })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  volumeSubmit(){
    if(this.data.inputVolume === ''){
      this.setData({
        'orderNextform.volumeName': ''
      })
      this.closeMask2()
    } else {
        this.closeMask2()
        this.setData({
          'orderNextform.volumeName': this.data.inputVolume
        })
    }
  },
  selectedVolume(e){
    let item = e.currentTarget.dataset.item
    if(item.name === '不填'){
      this.setData({
        inputVolume: ''
      })
    }else{
      if(item.name !== this.data.inputVolume){
        this.setData({
          inputVolume: item.name
        })
      } else{
        this.setData({
          inputVolume: ''
        })
      }
    }
  },
  weight(){
    this.setData({
      weightWindow: true,
      showMask: !this.data.showMask,
    })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  checkInputWeight(e){
    this.setData({
      inputWeight: e.detail.value
    })
  },
  weightSubmit(){
    if(this.data.inputWeight === ''){
      this.setData({
        'orderNextform.weightName': ''
      })
      this.closeMask2()
    } else {
        this.closeMask2()
        this.setData({
          'orderNextform.weightName': this.data.inputWeight
        })
    }
  },
  selectedWeight(e){
    let item = e.currentTarget.dataset.item
    if(item.name === '不填'){
      this.setData({
        inputWeight: ''
      })
    }else{
      if(item.name !== this.data.inputWeight){
        this.setData({
          inputWeight: item.name
        })
      } else{
        this.setData({
          inputWeight: ''
        })
      }
    }
  },
  goods(){
    this.setData({
      goodsWindow: true,
      showMask: !this.data.showMask,
    })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  checkGoods(e){
    this.setData({
      inputGoods: e.detail.value
    })
  },
  goodsSubmit(){
    if(this.data.inputGoods === ''){
      this.setData({
        'orderNextform.goodsName': ''
      })
      this.closeMask2()
    } else {
      let reg = /^[0-9a-zA-Z\u4e00-\u9fa5 ]{1,10}$/;
      if(reg.test(this.data.inputGoods)){
        this.closeMask2()
        this.setData({
          'orderNextform.goodsName': this.data.inputGoods
        })
      }else {
        wx.showToast({
          title: '只能输入汉字、英文、数字',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  selectedGoods(e){
    let item = e.currentTarget.dataset.item
    if(item.name === '不填'){
      this.setData({
        inputGoods: ''
      })
    }else{
      if(item.name !== this.data.inputGoods){
        this.setData({
          inputGoods: item.name
        })
      } else{
        this.setData({
          inputGoods: ''
        })
      }
    }
  },
  checkTip(e){
    this.setData({
      'tipForm.inputId': ''
    })
    if(e.detail.value * 1 > 200){
      this.setData({
        'tipForm.inputTip': 200
      })
    }else{
      this.setData({
        'tipForm.inputTip': e.detail.value
      })
    }
  },
  tip(){
    this.setData({
      tipWindow: true,
      showMask: !this.data.showMask,
    })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  submitTip(){
    if(this.data.tipForm.inputTip === ''){
      this.setData({
        'orderNextform.tipName':'',
        'orderNextform.tipId':''
      })
      this.closeMask2()
    }else {
      let re = /^[1-9][0-9]*$/g;
      if(re.test(this.data.tipForm.inputTip * 1)){
        this.closeMask2()
        if((this.data.tipForm.inputTip * 1) > 200){
          this.setData({
            'tipForm.inputTip': 200
          })
        }
        this.setData({
          'orderNextform.tipName': this.data.tipForm.inputTip,
          'orderNextform.tipId': this.data.tipForm.inputId === ''?'':this.data.tipForm.inputId
        })
      }else {
        wx.showToast({
          title: '金额格式错误,必须是整数',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  selectedTip(e){
    let item = e.currentTarget.dataset.item
    if(item.id !== this.data.tipForm.inputId){
      this.setData({
        'tipForm.inputId': item.id,
        'tipForm.inputTip': item.name
      })
    } else {
      this.setData({
        'tipForm.inputId': '',
        'tipForm.inputTip': ''
      })
    }

  },
  switch1Change(e) {
    if (e.detail.value){
      this.setData({ 'orderNextform.isFirst': 1 })
    } else{
      this.setData({ 'orderNextform.isFirst': 0 })
    }
  },
  closeMoney(){
    this.setData({
      dialogFormVisible: false,
      showMaskMoney: false
    })
  },
  submitMoney(){
    if (this.data.extraService.money === "") {
      this.setData({
        dialogFormVisible: false,
        showMaskMoney: false
      })
    } else {
      if (/^[1-9][0-9]*$/g.test(this.data.extraService.money)) {
        let requestList = this.data.requestList
        if (this.data.extraService.money * 1 > 20000) {
          this.setData({
            'extraService.money': 20000
          })
        }
        requestList.forEach(item => {
          if (item.extraId === "ee9b54d836a74924b43824b62c79c734") {
            item.selected = true;
            item.remark = this.data.extraService.money;
          }
        });
        this.setData({
          requestList,
          dialogFormVisible: false,
          showMaskMoney: false
        })
      } else {
        wx.showToast({
          title: '金额格式错误,必须是整数',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  changeMoney(e){
    let money = e.detail.value * 1
    if (money > 20000) {
      this.setData({
        'extraService.money': 20000
      })
    } else {
      this.setData({
        'extraService.money':money
      })
    }
  },
  requestOkClick(){
    this.addExtraServiceDtoList()
    this.closeMask2()
  },
  requestClick(e){
    let item = e.currentTarget.dataset.item
    let i = e.currentTarget.dataset.index
    let up = "requestList[" + i + "]";
    let requestList = this.data.requestList
    if (item.extraId === "1b51fb332dac42da9f19092d275caf29") {
      item.selected = !item.selected;
      requestList.forEach(item => {
        if (item.extraId === "2b988d6a75314914ae5fdf724e10b1c9") {
          item.selected = false;
        }
      })
      this.setData({
        requestList
      })
    } else if (item.extraId === "2b988d6a75314914ae5fdf724e10b1c9") {
      item.selected = !item.selected;
      requestList.forEach(item => {
        if (item.extraId === "1b51fb332dac42da9f19092d275caf29") {
          item.selected = false;
        }
      })
      this.setData({
        requestList
      })
    } else if (item.extraId === "ee9b54d836a74924b43824b62c79c734") {
      item.selected = false;
      item.remark = "";
      this.setData({
        'extraService.money': '',
        showMaskMoney: true,
        dialogFormVisible: true
      })
    } else {
      item.selected = !item.selected;
    }
    this.setData({
      [up]: item
    })
  },
  addExtraServiceDtoList(){
    let extraServiceDtoList = [], requestNameList = [];
    let list = this.data.requestList.filter(item => {
      return item.selected === true;
    });
    list.forEach(item => {
      extraServiceDtoList.push({
        extraId: item.extraId,
        remark: item.remark
      });
      if (item.extraId === "ee9b54d836a74924b43824b62c79c734") {
        requestNameList.push(`${item.extraName}￥（${item.remark}）`);
      } else {
        requestNameList.push(item.extraName);
      }
    });
    this.setData({
      'orderNextform.requestNameList': requestNameList.join(','),
      'orderNextform.extraServiceDtoList': extraServiceDtoList
    })
  },
  showRequest(){
    let requestList = this.data.requestList
    requestList.forEach(item => {
      item.selected = false;
      item.remark = "";
    });
    if (this.data.orderNextform.extraServiceDtoList.length !== 0) {
      requestList.forEach(item => {
        this.data.orderNextform.extraServiceDtoList.forEach(item1 => {
          if (item.extraId === item1.extraId) {
            item.selected = true;
            item.remark = item1.remark;
          }
        });
        if (!item.selected) {
          item.selected = false;
          item.remark = "";
        }
      });
    }
    this.setData({
      showRequestListWindow: true,
      requestList
    })
    this.showBottomWindow()
  },
  toClaims(){
    wx.navigateTo({
      url: '/pages/ui2.0/claims/claims',
    })
  },
  setFormData(obj, belongCity){
    if(belongCity){
      this.selectComponent('#xiaoHuoCheOrder').setData({
        'form.belongCity': belongCity
      })
    }
    this.selectComponent('#xiaoHuoCheOrder').setData({
      ["form.to[" + obj.shipperSort + "].consignee"]: obj.consignee,
      ["form.to[" + obj.shipperSort + "].consigneeMobile"]: obj.consigneeMobile,
      ["form.to[" + obj.shipperSort + "].addressDetail"]: obj.addressDetail,
      ["form.to[" + obj.shipperSort + "].origin"]: obj.origin,
      ["form.to[" + obj.shipperSort + "].originCoordinate"]: obj.originCoordinate,
      ["form.to[" + obj.shipperSort + "].originName"]: obj.originName,
      ["form.to[" + obj.shipperSort + "].provinceCityArea"]: obj.provinceCityArea,
      ["form.to[" + obj.shipperSort + "].shipperSort"]: obj.shipperSort,
    })
    let some = this.selectComponent('#xiaoHuoCheOrder').data.form.to.some((item) => {
      return item.originCoordinate === ''
    })
    if(!some) {
   
    }
  },
  specClick(){
    this.selectComponent('#xiaoHuoCheOrder').data.form.carList.forEach((item,i) => {
      if(item.carType === this.selectComponent('#xiaoHuoCheOrder').data.form.carType){
        console.log(item)
        this.selectComponent('#xiaoHuoCheOrder').setData({
          ["form.carList[" + i + "].specNameSelected"]: this.data.selectedCarTypeTemp
        })
      }
    })
    this.setData({
      'orderNextform.specCode': this.data.selectedCarTypeTemp
    })
    this.closeMask2()
  },
  showCarType(){
    let obj = this.selectComponent('#xiaoHuoCheOrder').data.form.carList.find((item) => {
      return item.carType === this.selectComponent('#xiaoHuoCheOrder').data.form.carType
    })
    this.setData({
      showCarTypeWindow: true,
      selectedCarTypeTemp: obj.specNameSelected
    })
    this.showBottomWindow()
  },
  getCarChange(e){
    console.log(e.detail.form)
    let list = e.detail.form.carList.filter((item) => {
      return item.carType === e.detail.form.carType
    })
    this.setData({
      carList: list[0].list[0].specName,
      'orderNextform.specCode': list[0].specNameSelected
    })
    this.setShowSpec(list)
    this.mathPrice(e.detail.form)
  },
  setShowSpec(list){
    let str, specNameList = list[0].list[0].specName
    if(list[0]){
      if(specNameList.length > 2){
        str = `${specNameList[0]},${specNameList[1]}等`
      } else if(specNameList.length > 1){
        str = `${specNameList[0]},${specNameList[1]}`
      } else {
        str = list[0].list[0].specName
      }
    }
    this.setData({
      showSpec: str
    })
  },

  selectedCarType(e){
    let itemName = e.currentTarget.dataset.item
    if(this.data.selectedCarTypeTemp !== itemName){
      this.setData({
        selectedCarTypeTemp: itemName
      })
    } else {
      this.setData({
        selectedCarTypeTemp: ''
      })
    }

  },
  test(){
    console.log(this.data)
  },
  onLoad: function (options) {
    animation.opacity(0).step()
    animationBottom.bottom('-68%').step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export()})
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2] //index.js数据
    this.setData({
      cityAdcode: prevPage.data.cityAdcode,
      xiaoHuocheDataOrderNext: prevPage.data.xiaoHuocheDataIndexJs
    })
 
    // this.setData({
    //   cityAdcode:  ["佛山市", "440600"],
    //   xiaoHuocheDataOrderNext: {form:{"belongCity":"440604","carList":[{"carType":"AF01801","carTypeName":"小面包","list":[{"id":"1125297514034200576","serivceCode":"AF01701","carTypeCode":"AF01801","price":35,"kmPrice":7,"outstripPrice":3,"carLength":1.7,"carWidth":1.1,"carHeight":1,"capacityTon":0.6,"capacitySquare":2.6,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com//tms/20181229/5wmEXhs2PZAEZNyZEXHcKhQMP8JASr62.png","specName":["拆座"],"priceType":2,"areaName":"佛山市","carTypeName":"小面包","show":false}],"specNameSelected":"","width":68,"left":0},{"carType":"AF01802","carTypeName":"金杯车","list":[{"id":"1126298089592946688","serivceCode":"AF01701","carTypeCode":"AF01802","price":57,"kmPrice":7,"outstripPrice":4,"carLength":2.7,"carWidth":1.4,"carHeight":1.2,"capacityTon":1,"capacitySquare":4.5,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com//tms/20181229/JXikJJB6kPfj5fjKzWd2C7HtNPMMcxGj.png","specName":["加长,拆座"],"priceType":2,"areaName":"佛山市","carTypeName":"金杯车","show":false}],"specNameSelected":"","width":68,"left":68},{"carType":"AF01803","carTypeName":"小型货车","list":[{"id":"1126298162407755776","serivceCode":"AF01701","carTypeCode":"AF01803","price":67,"kmPrice":7,"outstripPrice":4,"carLength":2.7,"carWidth":1.5,"carHeight":1.7,"capacityTon":1.25,"capacitySquare":6.9,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com//tms/20181229/fDPTZPFsSbHYDc2SfkmsthWzQmQjraGR.png","specName":["厢车,高栏,依维柯"],"priceType":2,"areaName":"佛山市","carTypeName":"小型货车","show":false}],"specNameSelected":"","width":84,"left":136},{"carType":"AF01804","carTypeName":"中型货车","list":[{"id":"1126298273028329472","serivceCode":"AF01701","carTypeCode":"AF01804","price":109,"kmPrice":7,"outstripPrice":5,"carLength":4.2,"carWidth":1.8,"carHeight":1.8,"capacityTon":1.8,"capacitySquare":13.6,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com//tms/20181229/r7GcQ2TTWHYh26ekM5MGz6jM6rS5TYDM.png","specName":["厢车,高栏,尾板"],"priceType":2,"areaName":"佛山市","carTypeName":"中型货车","show":false}],"specNameSelected":"","width":84,"left":220},{"carType":"AF01806","carTypeName":"6.8米","list":[{"id":"1142005149723377664","serivceCode":"AF01701","carTypeCode":"AF01806","price":280,"kmPrice":15,"outstripPrice":6,"carLength":6.8,"carWidth":2.4,"carHeight":2.4,"capacityTon":5,"capacitySquare":39.1,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com/tms/20190327/IMG_WEB_2019_3_27_162133_38794.png","specName":["厢车,高栏,平板,尾板"],"priceType":2,"areaName":"佛山市","carTypeName":"6.8米","show":false}],"specNameSelected":"","width":59,"left":304},{"carType":"AF01807","carTypeName":"7.6米","list":[{"id":"1142005188061138944","serivceCode":"AF01701","carTypeCode":"AF01807","price":330,"kmPrice":15,"outstripPrice":6,"carLength":7.6,"carWidth":2.4,"carHeight":2.5,"capacityTon":8,"capacitySquare":45.6,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com/tms/20190327/IMG_WEB_2019_3_27_162312_85663.png","specName":["厢车,尾板"],"priceType":2,"areaName":"佛山市","carTypeName":"7.6米","show":false}],"specNameSelected":"","width":59,"left":363},{"carType":"AF01808","carTypeName":"9.6米","list":[{"id":"1142005222261493760","serivceCode":"AF01701","carTypeCode":"AF01808","price":380,"kmPrice":15,"outstripPrice":8,"carLength":9.6,"carWidth":2.4,"carHeight":2.6,"capacityTon":15,"capacitySquare":59.9,"servicePic":"http://aflc.oss-cn-shenzhen.aliyuncs.com/tms/20190327/IMG_WEB_2019_3_27_162324_56455.png","specName":["厢车,高栏,平板,尾板"],"priceType":2,"areaName":"佛山市","carTypeName":"9.6米","show":false}],"specNameSelected":"","width":59,"left":422}],"code":[],"date":"2020-02-10T01:01:02.423Z","timeList":[],"time":"","_cityAdcode":["佛山市","440600"],"carType":"AF01802","carTypeItemLeft":68,"carTypeItemWidth":68,"initialIndex":1,"serviceCode":"AF01701","showSpecWindow":false,"couponId":"","preferentialAmountId":"","priceId":"1126298089592946688","priceType":2,"specCode":"加长","extraServiceDtoList":[],"requestNameList":[],"goodsName":"","weightName":"","volumeName":"","tipId":"","tipName":"","isFirst":0,"to":[{"consignee":"","consigneeMobile":"","isSms":0,"origin":"禅城区","originCoordinate":"23.028762,113.122717","originName":"佛山市","provinceCityArea":"广东省,佛山市,禅城区","shipperSort":0,"addressDetail":""},{"consignee":"","consigneeMobile":"","isSms":0,"origin":"禅城区","originCoordinate":"23.028762,113.122717","originName":"佛山市","provinceCityArea":"广东省,佛山市,禅城区","shipperSort":1,"addressDetail":""}],"remark":"","mathPriceList":{},"_protection":false,"insuranceFeeCode":"","insurancePlanCode":"","insuranceMoney":"","_timeId":0,"_time":""}}
    // })

    let list = this.data.xiaoHuocheDataOrderNext.form.carList.filter((item) => {
      return item.carType === this.data.xiaoHuocheDataOrderNext.form.carType
    })
    this.setData({
      carList: list[0].list[0].specName
    })
    this.setShowSpec(list)
    this.mathPrice(this.data.xiaoHuocheDataOrderNext.form)
     // 额外服务列表
    app.xhr('GET', `/aflc-sm/aflcExtraPriceApi/findExtraPrice/AF01701`, null, (res1) => {
      if (res1.data.status === 200) {
        if (this.data.orderNextform.extraServiceDtoList.length === 0) {
          res1.data.data.forEach(item => {
            item.selected = false;
            item.remark = "";
          });
        } else {
          res1.data.data.forEach(item => {
            this.data.orderNextform.extraServiceDtoList.forEach(item1 => {
              if (item.extraId === item1.extraId) {
                item.selected = true;
                item.remark = item1.remark;
              }
            });
            if (!item.selected) {
              item.selected = false;
              item.remark = "";
            }
          });
        }

        this.setData({
          requestList: res1.data.data
        })
      }
    })
    
    //小费
    app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF00405`, null, (res1) => {
      this.setData({
        tipList: res1.data.data
      })
    })

    //货物名称
    app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF00402`, null, (res1) => {
      this.setData({
        xhcGoodsList: res1.data.data
      })
    })
    
    //重量
    app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF00403`, null, (res1) => {
      this.setData({
        weightList: res1.data.data
      })
    })
    
     //体积
     app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF00404`, null, (res1) => {
      this.setData({
        volumeList: res1.data.data
      })
    })

    // 多途径地服务费
    app.xhr('GET', `/aflc-common/aflcCommonSysDistApi/findAflcCommonSysDictByCodes/AF0043101%2CAF004310101`, null, (res) => {
      if(res.data.status === 200){
        if(res.data.data.AF0043101.value * 1 === 1){
          this.setData({
            'orderNextform.mathPriceList.moreAddrPrice': res.data.data.AF004310101.value * 1
          })
        }
      }
    })
    
    //理赔
    app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF0042601`, null, (res1) => {
      app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF0042602`, null, (res2) => {
        let obj1 = {},obj2 = {}
        res1.data.data.forEach((item) => {
          if(item.name === '保价'){
            obj1.value = `${item.value}${item.remark}`
          }
          if(item.name === '免赔金额'){
            obj1.noValue = `${item.value}${item.remark}`
            obj1.insurancePlanCode = item.code
          }
          if(item.name === '需要支付保费'){
            obj1.require = `${item.value}${item.remark}`
            obj1.money = item.value
            obj1.insuranceFeeCode = item.code
          }
        })
        res2.data.data.forEach((item) => {
          if(item.name === '保价'){
            obj2.value = `${item.value}${item.remark}`
          }
          if(item.name === '免赔金额'){
            obj2.noValue = `${item.value}${item.remark}`
            obj2.insurancePlanCode = item.code
          }
          if(item.name === '需要支付保费'){
            obj2.require = `${item.value}${item.remark}`
            obj2.money = item.value
            obj2.insuranceFeeCode = item.code
          }
        })
        obj1.name1 = `${obj1.value}货物保障`
        obj1.name2 = `${obj1.require}货物保障费`
        obj1.name3 = `货物损坏、丢失最高赔付${obj1.value}`
        obj2.name1 = `${obj2.value}货物保障`
        obj2.name2 = `${obj2.require}货物保障费`
        obj2.name3 = `货物损坏、丢失最高赔付${obj2.value}，其中免赔金额为${obj2.noValue}`
        this.setData({
          protectionList: [obj1,obj2]
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(this.data.timer);
    this.setData({
      timer: null
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})