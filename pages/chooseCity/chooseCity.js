let app = getApp()
let storage = require('../../utils/util.js')
Page({
  data: {
    showSearchButton: false,
    showCityAdcodeFirst: [],//城市code
    cityData: [],
    citySearchList: [],
    showSearchList: [],
    searchValue:'',
    cityHistoryList:[]
  },
  setCityHistory:function(data){
    if (storage.get_s('cityHistoryList')) {
      let list = storage.get_s('cityHistoryList');
      let some = list.some((item) => {
        return item.name === data.name
      });
      if (!some) {
        if (list.length >= 3) {
          list.splice(2, 1);
        }
        list.unshift(data)
      }
      storage.set('cityHistoryList', list)
    } else {
      storage.set('cityHistoryList', [data])
    }
  },
  backSetData:function(city,code){
    //到下单页
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    if (code !== prevPage.data.form._cityAdcode[1]){
      prevPage.setData({
        fromCity: true,
        form: storage.get_s('formInit')
      })
    }
    prevPage.setData({ 'form._cityAdcode': [city, code], loadAflcShipperPreferentialtDetailDto: true })
    wx.navigateBack({delta: 1})
  },
  backIndex: function(e){
    console.log(e.currentTarget.dataset.code)
    if(this.options.fromMap){//来自地图
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]
      prevPage.setData({ fromCity:true,adcode: e.currentTarget.dataset.code })
      wx.navigateBack({ delta: 1 })
    } else {
      this.setCityHistory({ name: this.data.showCityAdcodeFirst[0], code: e.currentTarget.dataset.code });
      this.backSetData(this.data.showCityAdcodeFirst[0], e.currentTarget.dataset.code)
    }
  },
  selectCity :function(e) {
    let adcode = e.currentTarget.dataset.item.code + ''
    if (this.options.fromMap) {//来自地图
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]
      prevPage.setData({ fromCity: true, adcode: adcode })
      wx.navigateBack({ delta: 1 })
    } else{
      this.setCityHistory({ name: e.currentTarget.dataset.item.name, code: adcode });
      this.backSetData(e.currentTarget.dataset.item.name, adcode)
    }

    // if (this.$route.query.formOrder !== undefined) {
    //   if (this.$localStorage.get_s('showCityAdcodeFirst')[1] !== item.code + '') {
    //     this.$localStorage.set_s('showCityAdcodeFirst', [item.name, item.code + '']);
    //     this.$localStorage.set_s('form', this.getForm());
    //     this.form = this.$localStorage.get_s('form');
    //     await this.getPriceByArea(item.code);
    //     this.back();
    //   }
    // } else if (this.$route.query.formChargeStandard !== undefined) {
    //   this.$router.replace({ name: 'ChargeStandard', query: { city: item.name, adcode: item.code } })
    // } else {
    //   this.setMapCode(item.code);
    //   this.back();
    // }
  },
  searchChange: function(e) {
    this.setData({ searchValue: e.detail.value})
    if (e.detail.value !== '') {
      let list = [];
      list = this.data.citySearchList.filter((item) => {
        return item.name.includes(e.detail.value)
      });
      this.setData({ showSearchList:list})
    } else {
      this.setData({ showSearchList: [] })
    }

  },
  clickCancle: function(){
    this.setData({ showSearchButton: false })
  },
  searchFocus: function() {
    this.setData({ showSearchButton: true })
  },
  onChange(event) {
    //console.log(event.detail, 'click right menu callback data')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let list = [];
    app.xhr('GET', `/aflc-common/aflcCommonAddressApi/cityList`, null, (res) => {
      try {
        if (res.data.status !== 200)
          return;
        res.data.data.forEach((item) => {
          item.pinyin = item.pinyin.toUpperCase();
        });
        res.data.data.forEach((item) => {
          list = list.concat(item.cities)
        });
        this.setData({ citySearchList: list, cityData: res.data.data})
        
      } catch (e) {
      }
    })
    if (storage.get_s('cityHistoryList')) {
      this.setData({ cityHistoryList: storage.get_s('cityHistoryList')})
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({ showCityAdcodeFirst: [storage.get_s('cityAdcodeFirst')[0], storage.get_s('cityAdcodeFirst')[1]]})
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