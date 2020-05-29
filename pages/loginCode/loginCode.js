let app = getApp()
var amapFile = require('../../utils/amap-wx.js')
var myAmapFun = new amapFile.AMapWX({ key: 'cbb300a2c1e7820f0989eafee58db0ba' })
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    code: '',
    time: null,
    timeName: '重新获取',
    canClick: false,
    isOk: true,
    adcode: '',
    form:{}
  },
  next: function(){
    if (this.data.code !== '') {
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
              wx.navigateBack({ delta: 2 })
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
              this.setData({ isOk: true })
              wx.hideNavigationBarLoading()
            }
          }))
     
        }))

      }
    }

  },
  checkCode: function(e){
    this.setData({ code: e.detail.value })
  },
  clearCode: function(){
    this.setData({code:''})
  },
  timeGo: function(){
    let time = setInterval(() => {
      let timeName = this.data.timeName
      timeName = timeName - 1;
      this.setData({ timeName: timeName })
      app.storage.set('timeNameRegister', this.data.timeName);
      if (timeName <= 0) {
        this.setData({ timeName: '重新获取', canClick:false})
        app.storage.remove('timeNameRegister');
        clearInterval(time)
      }
    }, 1000)

    this.setData({ time: time})
  },
  getCode: function(){
    if (this.data.canClick === false) {
      this.sendCodeSms()
    }
  },
  sendCodeSms: function(){
    app.xhr('POST', `/aflc-common/aflcCommonSms/sendCodeSms/${this.options.phone}`, {}, (res => {
      if (res.data.status === 200) {
        this.setData({ timeName: 60, canClick: true })
        app.storage.set('timeNameRegister', 60);
        this.timeGo();
      } else {
        wx.showToast({
          title: '错误：' + (res.data.text || res.data.errorInfo || res.data.data || JSON.stringify(res) || '服务器端返回数据错误.'),
          icon: 'none',
          duration: 2000
        })
      }
    }))
  },
  onLoad: function (options) {
    this.setData({ phone: this.options.phone})
    if (app.storage.get_s('timeNameRegister')) {
      this.setData({ timeName: app.storage.get_s('timeNameRegister'), canClick : true})
      this.timeGo();
    } else {
      this.sendCodeSms()
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
    clearInterval(this.data.time);
    this.setData({time:null})
    app.storage.remove('timeNameRegister');
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