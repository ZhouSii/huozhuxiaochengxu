let app = getApp()
Page({
  data: {
    tabTypeId: 0,
    tabType: [{id: 0, name: "小货车"}, {id: 1, name: "发物流"}, {id: 2, name: " "}], // 大货车
    windowWidth: 0,
    windowHeight: 0,
    showLiftWindow: false,
    cityAdcode: [],
    xiaoHuocheDataIndexJs: {}
  },
  toWallet(){

  },
  toDriver(){
    if (app.storage.get_s('userInfo')) {
      wx.navigateTo({
        url: '/pages/ui2.0/myDrivers/myDrivers',
      })
    } else {
      wx.navigateTo({
        url: '/pages/ui2.0/login/login'
      })
    }
  },
  setFromCity(bool) {
    //调用子组件方法    
    this.selectComponent('#xiaoHuoCheOrder').setData({
      fromCity: bool
    })
  },
  setFaWuLiuFormData(obj, userCurrent){
    this.selectComponent('#faWuLiuOrderOrder').setData({
      ["faWuLiuForm.to[" + obj.shipperSort + "].consignee"]: obj.consignee,
      ["faWuLiuForm.to[" + obj.shipperSort + "].consigneeMobile"]: obj.consigneeMobile,
      ["faWuLiuForm.to[" + obj.shipperSort + "].addressDetail"]: obj.addressDetail,
      ["faWuLiuForm.to[" + obj.shipperSort + "].origin"]: obj.origin,
      ["faWuLiuForm.to[" + obj.shipperSort + "].originCoordinate"]: obj.originCoordinate,
      ["faWuLiuForm.to[" + obj.shipperSort + "].originName"]: obj.originName,
      ["faWuLiuForm.to[" + obj.shipperSort + "].provinceCityArea"]: obj.provinceCityArea,
      ["faWuLiuForm.to[" + obj.shipperSort + "].shipperSort"]: obj.shipperSort,
      ["faWuLiuForm.to[" + obj.shipperSort + "].province"]: obj.province,
      ["faWuLiuForm.to[" + obj.shipperSort + "].city"]: obj.city,
      ["faWuLiuForm.to[" + obj.shipperSort + "].area"]: obj.area,
      ["faWuLiuForm.to[" + obj.shipperSort + "].street"]: obj.street, // 街道
      ["faWuLiuForm.to[" + obj.shipperSort + "].streetCode"]: obj.streetCode, // 街道code
      ["faWuLiuForm.to[" + obj.shipperSort + "].cityCode"]: obj.cityCode, // 发物流的城市编码
      ["faWuLiuForm.to[" + obj.shipperSort + "].code"]: obj.code, //区code
      ["faWuLiuForm.to[" + obj.shipperSort + "].longitude"]: obj.longitude,
      ["faWuLiuForm.to[" + obj.shipperSort + "].latitude"]: obj.latitude,
      'faWuLiuForm.userCurrent': userCurrent
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
      // 写入form的数据到index.js,xiaoHuocheData给orderNext.js使用
      this.setData({
        xiaoHuocheDataIndexJs: this.selectComponent('#xiaoHuoCheOrder').data
      })
      // xiaoHuoCheOrder.js的_changeRun判断
      this.selectComponent('#xiaoHuoCheOrder').setData({
        _changeRun: true
      })
      wx.navigateTo({
        url: `/pages/ui2.0/orderNext/orderNext`,
        success: (res) => {
          // 整理form.to数据
          setTimeout(()=>{
            this.selectComponent('#xiaoHuoCheOrder').setData({
              'form.to':[this.selectComponent('#xiaoHuoCheOrder').data.form.to[0],{
                consignee: "",
                consigneeMobile: "",
                isSms: 0,
                origin: "",
                originCoordinate: "",
                originName: "",
                provinceCityArea: "",
                shipperSort: 1,
                addressDetail: ""
              }]
            })
          },500)
        }
      })
    }
  },
  changeSendType(e){
    this.setData({
      tabTypeId: e.target.dataset.id
    })
  },
  toOrderManage: function(){
    if (app.storage.get_s('userInfo')) {
      // wx.navigateTo({
      //   url: '/pages/orderManage/orderManage?from=order'
      // })
      wx.navigateTo({
        url: '/pages/ui2.0/orderManage/orderManage',
      })
    } else {
      wx.navigateTo({
        url: '/pages/ui2.0/login/login'
      })
    }
  },
  toMoreSet: function(){
    if (app.storage.get_s('userInfo')) {
      wx.navigateTo({
        url: '/pages/moreSet/moreSet',
        success: () => {}
      })
    } else {
      wx.navigateTo({
        url: '/pages/ui2.0/login/login'
      })
    }
  },
  getCityAdcode(e){
    //从子页面传入的_cityAdcode
    this.setData({
      cityAdcode: e.detail._cityAdcode
    })
  },
  toggleLeft() {
    this.setData({
      showLiftWindow: !this.data.showLiftWindow
    });
  },
  onLoad: function (options) {
    wx.getSystemInfo({
      success:(res) => {
        this.setData({ windowWidth: res.windowWidth, windowHeight: res.windowHeight})
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
    if (app.storage.get_s('userInfo')) {
      this.setData({ userInfo: app.storage.get_s('userInfo') })
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