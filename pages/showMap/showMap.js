let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    fromCity:false, //选择城市页面后退后，刷新页面
    adcode:''
  },

  handleGetMessage: function (e) {
    console.log(e.detail.data)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    
    //到编辑地址页面
    if (prevPage.route === "pages/handleManage/handleManage") {
      prevPage.data.formRoute.addRoute.forEach((item, i) => {
        if (item.shipperSort === e.detail.data[0].obj.shipperSort) {
          let to = "formRoute.addRoute[" + i + "]";
          prevPage.setData({
            [to]: e.detail.data[0].obj
          })
        }
      })
      prevPage.openWindowFormMap(e.detail.data[0].obj.shipperSort)
    }

    //到下单页面
    if (prevPage.route === "pages/order/order"){
      prevPage.data.form.to.forEach((item, i) => {
        //插入地址，计算价格
        if (item.shipperSort === e.detail.data[0].obj.shipperSort) {
          let to = "form.to[" + i + "]";
          prevPage.setData({
            [to]: e.detail.data[0].obj
          })
        }
      })
      if (e.detail.data[0].belongCity) {
        prevPage.setData({ 'form.belongCity': e.detail.data[0].belongCity })
      }
      //刷新carList，计算价格
      if (e.detail.data[0].obj.shipperSort === 0 && e.detail.data[0].adcode[1] !== prevPage.data.form._cityAdcode[1]) {
        prevPage.setData({
          fromCity: true,
          'form._cityAdcode': e.detail.data[0].adcode
        })
      }
      prevPage.openWindowFormMap(e.detail.data[0].obj.shipperSort)
    }
  
  },
  onLoad: function (options) {
    let adcode = '', shipperNoUrl = '';
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 1]
    console.log(prevPage)
    if (options.shipperNo !== undefined){
      shipperNoUrl = `&shipperNo=${options.shipperNo}`
    }
    if(options.adcode){
      adcode = options.adcode
    }
    this.setData({
      url: `${app.h5Url}/wxShowMap?consignee=${options.consignee}&consigneeMobile=${options.consigneeMobile}&isSms=${options.isSms}&origin=${options.origin}&addressDetail=${options.addressDetail}&originCoordinate=${options.originCoordinate}&originName=${options.originName}&provinceCityArea=${options.provinceCityArea}&shipperSort=${options.shipperSort}&adcode=${adcode}${shipperNoUrl}`
    })
    console.log(this.data.url)
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
    if (this.data.fromCity === true){
      this.setData({ fromCity: false})
      //刷新页面,在选择城市返回后刷新
      let shipperNoUrl = '';
      if (this.options.shipperNo !== undefined) {
        shipperNoUrl = `&shipperNo=${this.options.shipperNo}`
      }
      wx.redirectTo({
        url: `/pages/showMap/showMap?consignee=${this.options.consignee}&consigneeMobile=${this.options.consigneeMobile}&isSms=${this.options.isSms}&origin=${this.options.origin}&addressDetail=${this.options.addressDetail}&originCoordinate=${this.options.originCoordinate}&originName=${this.options.originName}&provinceCityArea=${this.options.provinceCityArea}&shipperSort=${this.options.shipperSort}&adcode=${this.data.adcode}${shipperNoUrl}`
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