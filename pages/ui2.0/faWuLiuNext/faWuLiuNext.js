let app = getApp()
let animation = wx.createAnimation({
  duration: 250,
  timingFunction: 'ease-in-out',
})
let animationBottom = wx.createAnimation({
  duration: 200,
  timingFunction: 'ease-in-out',
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    animationData: {},
    animationDataBottom: {},
    showMask: false,
    showMask1: false,
    servicesWindow: false,
    timeWindow: false,
    showAgencyInfoWindow: false,
    showDetailWindow: false,
    showPayWindow: false,
    showValueWindow: false,
    faWuLiuForm: {},
    signList: [],
    remarkList: [],
    payList: [
      {name:'现付',sub:'物流公司揽货并确认运费后，支付运费',type:1},
      {name:'到付',sub:'收货人收到货时，支付运费',type:0}
      ],
    windowForm: {
      extraCodeTemp: '',
      signNameTemp: '',
      receivedAmountTemp: '',
      remarkTemp: ''
    },
    weekList:[],
    timeList:[],
    multiIndex: [0, 0],
    partPrice: {},
    tranAgingDay: '',
    estimatePrice: 0, // 预估
    calculateList: [],
    faWuLiuNextForm: {
      pick: false, // 上门接货
      pickTime: [], // 接货时间
      showTime: '', // 显示接货时间
      delivery: false, // 送货（不含上楼）
      payType: 1, // 付款方式
      price: '', // 货物价格
      extraCode: '', // 签收单code
      signName: '', // 签收单
      receivedAmount: null, // 代收货款
      remark: '' // 发货备注
    },
    fullStar: [false,false,false,false,false],
    maxValue: 0,

  },
  pay(){

  },
  getAgency(key,e = {},is = false){

  },
  showDetailWindow(){
    if(this.data.showDetailWindow === false){
      this.setData({
        showDetailWindow: true
      })
      this.showBottomWindow1()
    } else {
      this.closeBottomWindow1()
    }

  },
  changeSwitch1(e){

  },
  openTimeWindow(){
    this.setWeekList()
    this.setData({
      timeWindow: true
    })
    this.showBottomWindow()
  },
  timeOk(){
    this.setData({
      'faWuLiuNextForm.showTime': `${this.data.weekList[this.data.multiIndex[0]].name} ${this.data.timeList[this.data.multiIndex[1]].name}`,
      'faWuLiuNextForm.pickTime': [this.data.weekList[this.data.multiIndex[0]].value, this.data.timeList[this.data.multiIndex[1]].value]
    })
    this.closeBottomWindow()
  },
  bindChange(e){
    this.setData({
      multiIndex: e.detail.value
    })
  },
  setWeekList(){
    let dayList = []
        for(let i = 0; i < 7; i++) {
          if(i === 0){
            dayList.push({
              text: '今天',
              name: new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("MM月dd日"),
              value: new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("yyyy-MM-dd hh:mm:ss")
            })
          } else if(i === 1) {
            dayList.push({
              text: '明天',
              name: new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("MM月dd日"),
              value: new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("yyyy-MM-dd hh:mm:ss")
            })
          } else {
            let index = new Date(new Date() * 1 + 1000 * 3600 * 24 * i).getDay(),week
            switch (index) {
              case 0:
                week = '星期日'
                break;
              case 1:
                week = '星期一'
                break;
              case 2:
                week = '星期二'
                break;
              case 3:
                week = '星期三'
                break;
              case 4:
                week = '星期四'
                break;
              case 5:
                week = '星期五'
                break;
              case 6:
                week = '星期六'
                break;
            }
            dayList.push({
              text: `${new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("MM月dd日")} ${week}`,
              name: new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("MM月dd日"),
              value: new Date(new Date() * 1 + 1000 * 3600 * 24 * i).format("yyyy-MM-dd hh:mm:ss")
            })
          }
        }
        this.setData({
          weekList: dayList
        })
  },
  changeSwitch(e) {
    let bool = e.detail.value
    if(bool){
      this.setWeekList()
      this.setData({
        timeWindow: true,
        'faWuLiuNextForm.pick': 1
      })
      this.showBottomWindow()
    } else {
      this.setData({
        'faWuLiuNextForm.showTime': '',
        'faWuLiuNextForm.pickTime': [],
        'faWuLiuNextForm.pick': 0
      })
    }
  },
  selectedSign(e){
    let item = e.currentTarget.dataset.item
    this.setData({
      'windowForm.extraCodeTemp': item.code,
      'windowForm.signNameTemp': item.name
    })
  },
  getByteLen(val) {
    let len = 0;
    for (let i = 0; i < val.length; i++) {
      let length = val.charCodeAt(i);
      if (length >= 0 && length <= 128) {
        len += 1;
      } else {
        len += 1;
      }
    }
    return len;
  },
  checkInput(e){
    let v = e.detail.value
    if (this.getByteLen(v) > 60) {
      this.setData({
        'windowForm.remarkTemp':v.substr(0,60)
      })
    } else {
      this.setData({
        'windowForm.remarkTemp':v
      })
    }
  },
  selectedRemark(e){
    let item = e.currentTarget.dataset.item
    if (item.name.length + this.data.windowForm.remarkTemp.length < 60) {
      this.setData({
        'windowForm.remarkTemp': this.data.windowForm.remarkTemp.length === 0 ? item.name : `${this.data.windowForm.remarkTemp},${item.name}`
      })
    }
  },
  clickSuccess(){
    this.setData({
      'faWuLiuNextForm.extraCode': this.data.windowForm.extraCodeTemp,
      'faWuLiuNextForm.signName': this.data.windowForm.signNameTemp,
      'faWuLiuNextForm.receivedAmount': this.data.windowForm.receivedAmountTemp,
      'faWuLiuNextForm.remark': this.data.windowForm.remarkTemp
    })
    this.closeBottomWindow()
    if (this.data.faWuLiuNextForm.extraCode) {
      this.getAgency(this.data.faWuLiuNextForm.extraCode)
    }
  },
  openBottomWindow(){
    this.setData({
      'windowForm.extraCodeTemp': this.data.faWuLiuNextForm.extraCode,
      'windowForm.signNameTemp': this.data.faWuLiuNextForm.signName,
      'windowForm.receivedAmountTemp': this.data.faWuLiuNextForm.receivedAmount,
      'windowForm.remarkTemp': this.data.faWuLiuNextForm.remark,
      servicesWindow: true
    })
    this.showBottomWindow()
  },
  showPayWindow(){
    this.setData({
      showPayWindow: true
    })
    this.showBottomWindow()
  },
  selectedPay(e){
    this.setData({
      'faWuLiuNextForm.payType': e.currentTarget.dataset.item.type
    })
    this.closeBottomWindow()
    let p = 0
    if (this.data.faWuLiuNextForm.payType === 0) {
      this.data.calculateList.forEach((item) => {
        if (item.priceKey === 'AF0711902' || item.priceKey === 'AF0711901') {
          item.show = false
        }
        if (item.show) {
          p += item.priceValue
        }
      })
      this.setData({
        estimatePrice: p
      })
    } else {
      this.data.calculateList.forEach((item) => {
        if (item.priceKey === 'AF0711902' || item.priceKey === 'AF0711901') {
          item.show = true
        }
        if (item.show) {
          p += item.priceValue
        }
      })
      this.setData({
        estimatePrice: p
      })
    }
  },
  showValueWindow(){
    this.setData({
      showValueWindow: true
    })
    this.showBottomWindow()
  },
  selectedAgency(e){
    let item = e.currentTarget.dataset.item
    this.setData({
      'faWuLiuForm.agencyInfo': item
    })
    this.closeBottomWindow()
  },
  phone(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.item.agencyMobile
    })
  },
  showAgencyInfoWindow(){
    this.setData({
      showAgencyInfoWindow: true
    })
    this.showBottomWindow()
  },
  showBottomWindow(){
    this.setData({
      showMask: !this.data.showMask,
    })
    animation.opacity(1).step()
    animationBottom.bottom(0).step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
  },
  showBottomWindow1(){
    this.setData({
      showMask1: !this.data.showMask1,
    })
    animation.opacity(1).step()
    animationBottom.bottom(0).step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
  },
  closeBottomWindow: function () {
    animation.opacity(0).step()
    animationBottom.bottom('-72%').step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
    //检查上门接货有没有赋过值
    if(this.data.timeWindow === true && this.data.faWuLiuNextForm.showTime === ''){
      this.setData({
        'faWuLiuNextForm.showTime': `${this.data.weekList[0].name} ${this.data.timeList[0].name}`,
        'faWuLiuNextForm.pickTime': [this.data.weekList[0].value, this.data.timeList[0].value]
      })
    }
    setTimeout(() => {
      this.setData({
        multiIndex: [0, 0],
        showMask: false,
        showPayWindow: false,
        servicesWindow: false,
        showValueWindow: false,
        timeWindow: false,
        showAgencyInfoWindow: false,
      })
    }, 250)
  },
  closeBottomWindow1: function () {
    animation.opacity(0).step()
    animationBottom.bottom('-72%').step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
    setTimeout(() => {
      this.setData({
        showMask1: false,
        showDetailWindow: false,
      })
    }, 250)
  },
  onLoad: function (options) {
    animation.opacity(0).step()
    animationBottom.bottom('-72%').step()
    this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })

      // 回单
      app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF07102`, null, (res1) => {
        this.setData({
          signList: res1.data.data
        })
      })
      // 备注
      app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF07103`, null, (res1) => {
        this.setData({
          remarkList: res1.data.data
        })
      })
      // 时间
      app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF04917`, null, (res1) => {
        let timeListTemp = []
        res1.data.data.forEach((item) => {
          timeListTemp.push({text: `${item.name}${item.value}`, name: item.value, value: item.code})
        })
        this.setData({
          timeList: timeListTemp
        })
      })
      // 货物价值
      app.xhr('GET', `/aflc-common/aflcCommonSysDistApi/findAflcCommonSysDictBycode/AF07104`, null, (res1) => {
        this.setData({
          maxValue: res1.data.data
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