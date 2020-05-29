let app = getApp()
let animation = wx.createAnimation({
  duration: 250,
  timingFunction: 'ease-in-out',
})
let animationPay = wx.createAnimation({
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
    animationDataPay: {},
    animationDataBottomPay: {},
    zh: '',
    sh: '',
    carList:[],
    selected4: 'wx',//支付选择
    payShowList: [{ show: true }, { show: false }, { show: false }],
    showAddress: true,
    showBottomWindow: false,
    showPayWindow: false,
    showMask: false,//蒙板2
    requestNameListShow:'', //额外服务字符串
    tipWindow: false,
    tipList: [],//小费列表
    tipForm: { inputId: '', inputTip: '' }, //手动输入小费

    goodsWindow: false,
    goodsList: [],//货物列表
    inputGoods: '',

    weightWindow: false,
    weightList: [],//重量列表
    inputWeight: '',
    volumeWindow: false,
    volumeList: [],//体积列表
    inputVolume: '',
    canClick: true,
    form: {},
    formNext:{
      tipId: '', //小费id
      tipName: '', //小费名
      goodsName: '', //货物名称
      weightName: '', //重量
      volumeName: '', //体积
      isFirst: 0,
      extraServiceDtoList: [],//额外服务
      requestNameList: [],//额外服务名称
      remark: '' //给司机捎句话
    },
    parm: {},
    orderId: '',
    timer: null,
    balance: 0
  },
  next: function(){
    console.log(this.data.orderId)
    // app.xhr('POST', `/aflc-pay/pay/shipper/common/v1/jsApiUnifiedOrder/${this.data.orderId}?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, null, (res) => {
    //   if (res.data.status === 200) {

    //   }
    // })

  },
  showpayShowList: function(){
    let up = "payShowList[" + 0 + "].show";
    this.setData({ [up]: !this.data.payShowList[0].show})
  },
  showBottomWindow: function(){
    this.setData({showBottomWindow: true})
    animation.opacity(1).step()
    animationBottom.bottom(0).step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
  },
  closeBottomWindow: function () {
    animation.opacity(0).step()
    animationBottom.bottom('-68%').step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
    setTimeout(() => {
      this.setData({
        showBottomWindow: false
      })
    }, 250)
  },
  pay: function(){
    wx.showNavigationBarLoading()

    this.data.form.to.forEach((item) => {
      //地址加门牌
      item.origin = `${item.origin} ${item.addressDetail}` 
      if (item.consigneeMobile === '') {
        item.consigneeMobile = app.storage.get_s('userInfo').mobile
      }
    });//为空时加上默认号码
    let parm = {
      aflcPriceDto: {
        priceId: this.data.form.priceId,//定价id
        priceType: this.data.form.priceType,//定价类型 1标准定价 2区域定价
        spec: this.data.form.specCode//车辆规格
      },
      belongCity: this.data.form.belongCity,//发货地 订单所属区域(定位的城市id)
      couponId: this.data.form.couponId,//优惠券id
      distance: this.data.form.mathPriceList.distance,//实际总距离(地图计算)
      extraPrice: this.data.formNext.tipName,//附加小费
      extraPriceCode: this.data.formNext.tipId,//附加小费编码
      extraServiceDtoList: this.data.formNext.extraServiceDtoList,//额外服务
      goodsName: this.data.formNext.goodsName,//货物名称
      goodsVolume: this.data.formNext.volumeName,//货物体积（方）
      goodsWeight: this.data.formNext.weightName,//货物重量（吨）
      ip: "",//客户端ip地址(app端不用传)
      isFirst: this.data.formNext.isFirst,//我的司机优先接单(1为true，0为false)
      orderFrom: 'AF0040004',//订单来源(ios,android)
      orderPrice: this.data.form.mathPriceList.totalAmount + this.data.formNext.tipName * 1,//订单原价格(未减优惠券，优惠金的金额)
      preferentialAmountId: this.data.form.preferentialAmountId,//优惠金id
      ifPreferential: this.data.form.preferentialAmountId ? 1 : 0,
      remark: this.data.formNext.remark,//给司机捎句话
      serviceCode: this.data.form.serviceCode,//服务分类（同城，省际,零担）
      shipperId: app.storage.get_s("userInfo").shipperId,//货主id(app端不用传)
      shipperLineDtoList: this.data.form.to,//路线列表
      totalAmount: this.data.form.mathPriceList._totalAmount + this.data.formNext.tipName * 1,//总价格
      useCarTime: this.data.form.time === '' ? '' : this.data.form.time,//用车时间(yyyy-MM-dd HH:mm:ss)
      usedCarType: this.data.form.carType,//用车类型（车辆类型）
    }
    clearTimeout(this.data.timer);
    this.setData({ timer: null})
    if (this.data.canClick === true) {
      this.setData({ canClick: false })
      this.createOrder(parm);
    }
  },
  createOrder: function (parm) {
    console.log(parm)
    app.xhr('POST', `/aflc-order/aflcOrderApi/createOrder?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res) => {
      console.log(res)
      this.setData({ showPayWindow: true })
      animationPay.opacity(1).step()
      animationBottom.bottom(0).step()
      this.setData({ animationDataPay: animationPay.export(), animationDataBottomPay: animationBottom.export() })
      wx:wx.hideNavigationBarLoading()
      if (res.data.status === 200){
        this.setData({ orderId: res.data.data })
      } else if (res.data.status === 10042) {
        wx.showToast({
          title: '您扫的接单码的司机不存在，请重新扫码发货或使用App发货。',
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.status === 10043) {
        // this.$createDialog({
        //   type: 'confirm',
        //   icon: '',
        //   title: '',
        //   content: '当前司机已下班，系统不能推送订单给他，是否继续发货，让其他司机接单？',
        //   confirmBtn: {
        //     text: '继续发货',
        //     active: true,
        //     disabled: false,
        //     href: 'javascript:;'
        //   },
        //   cancelBtn: {
        //     text: '不发货了',
        //     active: false,
        //     disabled: false,
        //     href: 'javascript:;'
        //   },
        //   onConfirm: () => {
        //     this.pay(false)
        //   },
        //   onCancel: () => { }
        // }).show()

      } else if (res.data.status === 10033 || res.data.status === 10030) {
        this.setData({ orderId: '' })
        wx.showToast({
          title: res.data.errorInfo || res.data.text,
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/orderManage/orderManage`
          })
        }, 2000);
      } else {
        this.setData({ orderId: '' })
        wx.showToast({
          title: res.data.errorInfo || res.data.text,
          icon: 'none',
          duration: 2000
        })
      }

      setTimeout(() => {
        this.setData({ canClick: true })
      }, 1000)
    })
  },
  closePayWindow:function() {
    animationPay.opacity(0).step()
    animationBottom.bottom('-75%').step()
    this.setData({ animationDataPay: animationPay.export(), animationDataBottomPay: animationBottom.export() })
    setTimeout(() => {
      this.setData({
        showPayWindow: false
      })
    }, 250)
  },
  switch1Change(e) {
    if (e.detail.value){
      this.setData({ 'formNext.isFirst': 1 })
    } else{
      this.setData({ 'formNext.isFirst': 0 })
    }
  },
  volume: function(){
    this.setData({ showMask: true, volumeWindow: !this.data.volumeWindow, inputVolume: '' })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  selectedVolume: function(e){
    let item = e.currentTarget.dataset.item, name
    if (item.name === '不填') {
      name = ''
    } else {
      name = item.name
    }
    this.setData({ 'formNext.volumeName': name, showMask: false, volumeWindow: false })
  },
  volumeSubmit: function(){
    let re = /^0{1}([.]([1-9][0-9]*)|[.][0-9]*[1-9]+[0-9]*)$|^[1-9]\d*([.]{1}[0-9]+)?$/;
    if (this.data.inputVolume !== '') {
      if (re.test(this.data.inputVolume)) {
        this.setData({ showMask: false, volumeWindow: !this.data.volumeWindow, 'formNext.volumeName': this.data.inputVolume })
      } else {
        wx.showToast({
          title: '输入的格式不正确',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.showToast({
        title: '输入的格式不正确',
        icon: 'none',
        duration: 2000
      })
    }
  },
  checkVolume: function(e){
    this.setData({ inputVolume: e.detail.value })
  },
  weight: function(){
    this.setData({ showMask: true, weightWindow: !this.data.weightWindow, inputWeight: '' })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  selectedWeight: function(e) {
    let item = e.currentTarget.dataset.item, name
    if (item.name === '不填') {
      name = ''
    } else {
      name = item.name
    }
    this.setData({ 'formNext.weightName': name, showMask: false, weightWindow: false })
  },
  weightSubmit: function() {
    let re = /^0{1}([.]([1-9][0-9]*)|[.][0-9]*[1-9]+[0-9]*)$|^[1-9]\d*([.]{1}[0-9]+)?$/;
    if (this.data.inputWeight !== '') {
      if (re.test(this.data.inputWeight)) {
        this.setData({ showMask: false, weightWindow: !this.data.weightWindow, 'formNext.weightName': this.data.inputWeight })
      } else {
        wx.showToast({
          title: '输入的格式不正确',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.showToast({
        title: '输入的格式不正确',
        icon: 'none',
        duration: 2000
      })
    }
  },
  checkWeight: function(e){
    this.setData({ inputWeight: e.detail.value })
  },
  goods: function(){
    this.setData({ showMask: true, goodsWindow: !this.data.goodsWindow, inputGoods:''})
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  selectedGoods: function(e) {
    let item = e.currentTarget.dataset.item,name
    if (item.name === '不填') {
      name = ''
    } else {
      name = item.name
    }
    this.setData({ 'formNext.goodsName': name, showMask: false, goodsWindow:false})
  },
  goodsSubmit: function() {
    let reg = /^[0-9a-zA-Z\u4e00-\u9fa5 ]{1,10}$/;
    if (reg.test(this.data.inputGoods)) {
      this.setData({ showMask: false, goodsWindow: !this.data.goodsWindow, 'formNext.goodsName': this.data.inputGoods })
    } else {
      wx.showToast({
        title: '只能输入汉字、英文、数字',
        icon: 'none',
        duration: 2000
      })
    }
  },
  checkGoods: function(e) {
    this.setData({ inputGoods: e.detail.value})
  },
  submitTip: function(){
    animation.opacity(0).step()
    this.setData({ animationData: animation.export() })
    if (this.data.tipForm.inputTip === '') {
      setTimeout(()=>{
        this.setData({
          'formNext.tipName': '',
          'formNext.tipId': '',
          showMask: !this.data.showMask,
          tipWindow: !this.data.tipWindow
        })
      },250)

    } else {
      let re = /^[1-9][0-9]*$/g;
      if (re.test(this.data.tipForm.inputTip * 1)) {
        setTimeout(() => {
          this.setData({
            showMask: !this.data.showMask,
            tipWindow: !this.data.tipWindow
          })
        },250)
        if ((this.data.tipForm.inputTip * 1) > 200) {
          this.setData({'tipForm.inputTip': 200})
        }
        this.setData({
          'formNext.tipName': this.data.tipForm.inputTip,
          'formNext.tipId': this.data.tipForm.inputId === '' ? '' : this.data.tipForm.inputId,
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
  checkTip: function(e){
    if (e.detail.value * 1 > 200) {
      this.setData({'tipForm.inputTip': 200})
    } else{
      this.setData({ 'tipForm.inputTip': e.detail.value })
    }
  },
  selectedTip: function(e){
    let item = e.target.dataset.item
    this.setData({
      'tipForm.inputId':item.id,
      'tipForm.inputTip': item.name,
    })
  },
  tip: function(){
    this.setData({
      showMask: true,
      tipWindow: !this.data.tipWindow
    })
    animation.opacity(1).step()
    this.setData({ animationData: animation.export() })
  },
  closeMask2: function(){
    animation.opacity(0).step()
    this.setData({ animationData: animation.export() })
    setTimeout(()=>{
      this.setData({
        showMask: false, tipWindow: false, goodsWindow: false, showPayWindow: false, volumeWindow: false, weightWindow: false,
      })
    },250)
  },
  showAddressOn: function(){
    this.setData({
      showAddress: true
    })
  },
  showAddressOff: function () {
    this.setData({
      showAddress: false
    })
  },
  toPreferential: function () {
    wx.navigateTo({url: `/pages/preferential/preferential`,})
  },
  onLoad: function (options) {
    animation.opacity(0).step()
    animationPay.opacity(0).step()
    this.setData({ animationData: animation.export(), animationDataPay: animationPay.export() })
    //小费
    app.xhr('GET', '/aflc-common/sysDict/getSysDictByCodeGet/AF00405', null, (res) => {
      if (res.data.status === 200) {
        this.setData({tipList: res.data.data})
      }
    })
    //货物名称
    app.xhr('GET', '/aflc-common/sysDict/getSysDictByCodeGet/AF00402', null, (res) => {
      if (res.data.status === 200) {
        this.setData({goodsList: res.data.data})
      }
    })
    //重量
    app.xhr('GET', '/aflc-common/sysDict/getSysDictByCodeGet/AF00403', null, (res) => {
      if (res.data.status === 200) {
        this.setData({ weightList: res.data.data })
      }
    })
    //体积
    app.xhr('GET', '/aflc-common/sysDict/getSysDictByCodeGet/AF00404', null, (res) => {
      if (res.data.status === 200) {
        this.setData({ volumeList: res.data.data })
      }
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
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    this.setData({ form: prevPage.data.form, carList: prevPage.data.carList })
    if (this.data.formNext.requestNameList.length !== 0) {
      this.setData({ requestNameListShow: this.data.formNext.requestNameList.join(',') })
    }
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