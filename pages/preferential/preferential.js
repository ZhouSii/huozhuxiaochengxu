let app = getApp()
Page({
  data: {
    backgroundImg: '',
    inputData: '',
    couponList: [],
    form: {},
    aflcShipperPreferentialtDetailDto: null,
    _reward: 0,//优惠金价格初始值
    _preferentialAmountId: ''//优惠金ID初始值
  },
  switch1Change(e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    if (e.detail.value) {
      this.setData({ 'form.mathPriceList.reward': this.data._reward, 'form.preferentialAmountId': this.data._preferentialAmountId })
      prevPage.setData({ 'form.mathPriceList.reward': this.data._reward, 'form.preferentialAmountId': this.data._preferentialAmountId, loadAflcShipperPreferentialtDetailDto: true })
    } else {
      this.setData({ 'form.mathPriceList.reward': 0, 'form.preferentialAmountId': ''})
      prevPage.setData({ 'form.mathPriceList.reward': 0, 'form.preferentialAmountId': '', loadAflcShipperPreferentialtDetailDto: false })
    }
  },
  volumeSubmit: function(){
    let parm = {
      aflcCoupon: {},
      couponNum: this.data.inputData,
    };
    app.xhr('POST', `/aflc-sm/aflcCouponExchangeApi/exchange?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res) => {
      if (res.data.status === 200) {
        wx.showToast({
          title: res.data.data,
          icon: 'none',
          duration: 2000
        })
        let parm = {
          areaCode: this.data.form.belongCity,//发货地id
          carType: this.data.form.carType,
          discountLevel: app.storage.get_s("userInfo").discountLevel,
          ifPreferential: 1, //是否使用优惠金
          serivceCode: this.data.form.serviceCode,
          totalAmount: this.data.form.mathPriceList.price + this.data.form.mathPriceList.outstripPrice,//(起步价+超里程费)
          userId: app.storage.get_s("userInfo").shipperId
        };
        app.xhr('POST', `/aflc-order/aflcOrderApi/getPreferential?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res1) => {
          if (res1.data.status === 200) {
            app.storage.set('preferentialList', res1.data.data);
            this.getPreferential(res1.data.data)
          }
        })
      } else {
        wx.showToast({
          title: res.data.errorInfo,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  setInputData: function(e){
    this.setData({ inputData: e.detail.value})
  },
  successSubmit: function () {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    prevPage.setData({
      'form.couponId': 0,
      'form.mathPriceList.orderDiscountAmount': 0,
      'form.mathPriceList._totalAmount': prevPage.data.form.mathPriceList.price + prevPage.data.form.mathPriceList.outstripPrice - prevPage.data.form.mathPriceList.reward
    })

    let couponIdList = prevPage.data.form.mathPriceList.couponIdList
    couponIdList.forEach((item1) => {
      if (item1.carType === prevPage.data.form.carType) {
        item1.isUse = false;
        item1.couponId = '';
        item1.orderDiscountAmount = 0;
      }
    });
    prevPage.setData({ 'form.mathPriceList.couponIdList': couponIdList})
    wx.navigateBack({ delta: 1 })
  },
  selectExchange: function(e) {
    let item = e.currentTarget.dataset.item;
    if (item.isCanUse && (item.ifvouchersuperposition === '1' || (item.ifvouchersuperposition === '0' && this.data.aflcShipperPreferentialtDetailDto === null))) {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]
      prevPage.setData({
         'form.couponId': item.id,
          'form.mathPriceList.orderDiscountAmount': item.orderDiscountAmount,
        'form.mathPriceList._totalAmount': prevPage.data.form.mathPriceList.price + prevPage.data.form.mathPriceList.outstripPrice - prevPage.data.form.mathPriceList.reward - item.orderDiscountAmount
         })

      let couponIdList = prevPage.data.form.mathPriceList.couponIdList
      couponIdList.forEach((item1) => {
        if (item1.carType === prevPage.data.form.carType) {
          item1.isUse = true;
          item1.couponId = item.id;
          item1.orderDiscountAmount = item.orderDiscountAmount;
        }
      });
      prevPage.setData({ 'form.mathPriceList.couponIdList': couponIdList })
      wx.navigateBack({ delta: 1 })
    }

  },
  showItem: function(e){
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    let up = "couponList[" + index + "].show";
    this.setData({ [up]: !this.data.couponList[index].show})
  },
  getPreferential: function (preferentialList){
    this.setData({ aflcShipperPreferentialtDetailDto: preferentialList.aflcShipperPreferentialtDetailDto})
    if (preferentialList.aflcCouponUseDtos.length > 0) {
      preferentialList.aflcCouponUseDtos.forEach((item) => {
        item.grantTime = item.grantTime.split(' ')[0].replace(/-/g, ".");
        item.endTime = item.endTime.split(' ')[0].replace(/-/g, ".");
        item.show = false
      });
      this.setData({ couponList: preferentialList.aflcCouponUseDtos})
    } else {
      this.setData({ couponList: "暂时没有优惠券" })
    }
  },
  toRewardInfo: function () {
    wx.navigateTo({
      url: '/pages/rewardInfo/rewardInfo',
    })
  },
  onLoad: function (options) {
    let preferentialList = app.storage.get_s('preferentialList');
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    this.setData({ form: prevPage.data.form, _reward: preferentialList.aflcShipperPreferentialtDetailDto ? preferentialList.aflcShipperPreferentialtDetailDto.reward : 0, _preferentialAmountId: preferentialList.aflcShipperPreferentialtDetailDto?preferentialList.aflcShipperPreferentialtDetailDto.id : '' })
    this.getPreferential(preferentialList)
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