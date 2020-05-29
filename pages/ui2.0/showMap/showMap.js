let app = getApp()
Page({
  data: {
    url:'',
    adcode:'',
    addrObj: {},
    from:'' //检查来自那个下单页面
  },

  handleGetMessage: function(e) {
    // console.log(e.detail.data)
    let obj = e.detail.data[0].obj
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2] // index.js 数据
    if (e.detail.data[0].from === 'faWuLiu'){
      let userCurrent = e.detail.data[0].userCurrent
      prevPage.setFaWuLiuFormData(obj, userCurrent)
    } else {
      let belongCity = e.detail.data[0].belongCity
      let adcode = e.detail.data[0].adcode
      if (adcode && adcode.length > 0) {
        prevPage.setData({
          cityAdcode: adcode,
        })
      }
      prevPage.setFormData(obj, belongCity)
    }
  },
  onLoad: function (options) {
    let obj = JSON.parse(options.item)
    let adcode = '';
    if(options.adcode){
      adcode = options.adcode
    }
    if (options.from){
      this.setData({
        from: options.from
      })
    }
    this.setData({
      addrObj: obj,
      url: `${app.h5Url}/wxShowMap2?shipperSort=${obj.shipperSort}&originCoordinate=${options.originCoordinate}&item=${encodeURIComponent(options.item)}&adcode=${adcode}&from=${this.data.from}`
    })
    console.log(this.data.url)
  },
  onShow: function () {
    if(this.data.adcode){
      const strObj = JSON.stringify(this.data.addrObj)
      wx.redirectTo({
        url: `/pages/ui2.0/showMap/showMap?item=${strObj}&originCoordinate=${this.options.originCoordinate}&adcode=${this.data.adcode}&from=${this.data.from}`
      })
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