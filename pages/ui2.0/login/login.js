let app = getApp()
var amapFile = require('../../../utils/amap-wx.js')
var myAmapFun = new amapFile.AMapWX({ key: 'cbb300a2c1e7820f0989eafee58db0ba' })
Page({
  data: {
    phone:'',
    phoneOk: false,
    code:'',
    time: null,
    timeName: '获取验证码',
    canSend: true,
    isOk:true,
    form:{},
    adcode:''
  },
  next() {
    if(this.data.phone === ''){
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!this.data.phoneOk){
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.code === ''){
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      })
      return
    }
 
    let data = {
      mobile: this.data.phone + '|aflc-2',
      code: this.data.code,
      grant_type: 'authorization_code',
      areaCode: this.data.adcode,
      registerOrigin: 'AF0030103'
    }
    if (this.data.isOk) {
      this.setData({ isOk:false})
      wx.showNavigationBarLoading()
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 3]
      app.xhrFormData('/api-uaa/mobile/token', data, (res => {
        if(res.data.access_token){
          app.storage.set('28kytoken', res.data.access_token);
          app.xhr('GET', '/aflc-common/common/aflcMemberCenter/v1/getShipperInfoByMobile', { mobile: this.data.phone, access_token: res.data.access_token}, (res1 => {
            if (res1.data.status === 200) {
              app.storage.set('userInfo', res1.data.data);
              if (app.storage.get_s('28kytoken') && app.storage.get_s('hasDownOrderAddr')) {
                let list = app.storage.get_s('hasDownOrderAddr');
                list.forEach((item) => {
                  if (item.shipperId === app.storage.get_s('userInfo').shipperId) {
                    prevPage.setData({ 'form.to': item.to, 'form.belongCity': item.belongCity})
                  }
                });
              }
              wx.navigateBack({ delta: 1 })
              wx.showToast({
                title: '登录成功！',
                icon: 'none',
                duration: 2000
              })
              wx.hideNavigationBarLoading()
            } else {
              wx.showToast({
                title: '服务器端返回数据错误，请确认是否已经注册为企业货主.',
                icon: 'none',
                duration: 2000
              })
              wx.hideNavigationBarLoading()
            }
            this.setData({ isOk: true })
          }))
        } else {
          this.setData({ isOk: true })
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }))

    }
    
  },
  timeGo(){
    let time = setInterval(() => {
      let timeName = this.data.timeName
      timeName = timeName - 1;
      this.setData({ timeName: timeName,canSend: false })
      app.storage.set('timeNameRegister', this.data.timeName);
      if (timeName <= 0) {
        this.setData({ timeName: '获取验证码', canSend: true})
        app.storage.remove('timeNameRegister');
        clearInterval(time)
      }
    }, 1000)

    this.setData({ time: time})

  },
  getCode(){
    if(this.data.phone === ''){
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!this.data.phoneOk){
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.canSend){
      this.setData({
        canSend: false
      })
      app.xhr('POST', `/aflc-common/aflcCommonSms/sendCodeSms/${this.data.phone}`, {}, (res => {
        if (res.data.status === 200) {
          this.setData({ timeName: 60 })
          app.storage.set('timeNameRegister', 60);
          this.timeGo();
        } else {
          wx.showToast({
            title: '错误：' + (res.data.text || res.data.errorInfo || res.data.data || JSON.stringify(res) || '服务器端返回数据错误.'),
            icon: 'none',
            duration: 2000
          })
          this.setData({ canSend: true })
        }
      }))
    }
  },
  setCode(e){
    this.setData({
      code: e.detail.value
    }) 
  },
  clearCode(){
    this.setData({
      code: ''
    })
  },
  clearPhone(){
    this.setData({
      phone: ''
    })
  },
  checkPhone(e){    
    this.setData({
      phone: e.detail.value,
      phoneOk: /^1[3-9]\d{9}$/.test(e.detail.value)
    })
  },
  toUserAgreement(){
    wx.navigateTo({
      url: '/pages/userAgreement/userAgreement'
    })
  },
  onLoad: function (options) {
    if (app.storage.get_s('timeNameRegister')) {
      this.setData({ timeName: app.storage.get_s('timeNameRegister'), canSend : false})
      this.timeGo();
    }
    myAmapFun.getRegeo({
      success: (data) => {
        let adcode = data[0].regeocodeData.addressComponent.adcode
        this.setData({adcode})
      },
      fail: (info) => {
        wx.showModal({
          title: "请允许授权获取地理位置",
          success: () => {
            wx.openSetting({
              complete(res) {
                console.log(res)
              }
            })
          }
        })
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