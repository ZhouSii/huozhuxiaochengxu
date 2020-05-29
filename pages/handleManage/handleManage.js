let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showWindow: false,
    visible: false,
    actions: [{
      name: '确定'
    }],
    showWindow:false,
    i:0,
    checkedSms: undefined,
    showSms: false,
    formRoute: {
      lineName: '', //路线名称
      addRoute: [{
          consigneeMobile: '',
          consignee: '',
          addressDetail: '',
          cityCode: "", //城市编码（格式440100）
          origin: "", //详细地址
          originCoordinate: "", //地点坐标(小的在前)
          originName: "", //地点名称
          provinceCityArea: "", //省市区（格式:广东省广州市天河区）
          shipperSort: 0,
          isSms: 0
        },
        {
          consigneeMobile: '',
          consignee: '',
          addressDetail: '',
          cityCode: "",
          origin: "",
          originCoordinate: "",
          originName: "",
          provinceCityArea: "",
          shipperSort: 1,
          isSms: 0
        }
      ],
    },
  },
  smsHandle: function (e) {
    if (this.data.checkedSms === 0) {
      this.setData({ checkedSms: 1 })
    } else {
      this.setData({ checkedSms: 0 })
    }
  },
  toShowMap: function(e) {
    let item = e.currentTarget.dataset.item, originCoordinate;
    console.log(item)
    if (item.originCoordinate === '') {
      //userLocation高德地图定位
      originCoordinate = app.storage.get_s('userLocation')
    } else {
      originCoordinate = item.originCoordinate.split(',').reverse().join(',')
    }
    wx.navigateTo({
      url: `/pages/showMap/showMap?consignee=${item.consignee ? item.consignee : ''}&consigneeMobile=${item.consigneeMobile ? item.consigneeMobile : ''}&isSms=${item.isSms ? item.isSms : 0}&origin=${item.origin}&addressDetail=${item.addressDetail ? item.addressDetail : ''}&originCoordinate=${originCoordinate}&originName=${item.originName}&provinceCityArea=${item.provinceCityArea}&shipperSort=${item.shipperSort}&shipperNo=${item.shipperNo}`
    })
  },
  formSubmit: function (e) {
    let re = /^1[3-9]\d{9}$/;
    if (this.data.checkedSms) {
      if (e.detail.value.checkConsigneeMobile !== '') {
        if (!re.test(e.detail.value.checkConsigneeMobile)) {
          wx.showToast({
            title: '手机号码不正确',
            icon: 'none',
            duration: 2000
          })
          return
        }
      } else {
        wx.showToast({
          title: '手机号码必须填写',
          icon: 'none',
          duration: 2000
        })
        return
      }
    } else {
      if (e.detail.value.checkConsigneeMobile !== '') {
        if (!re.test(e.detail.value.checkConsigneeMobile)) {
          wx.showToast({
            title: '手机号码不正确',
            icon: 'none',
            duration: 2000
          })
          return
        }
      }
    }
    let addressDetail = "formRoute.addRoute[" + this.data.i + "].addressDetail";
    let consignee = "formRoute.addRoute[" + this.data.i + "].consignee";
    let consigneeMobile = "formRoute.addRoute[" + this.data.i + "].consigneeMobile";
    let checkSms = "formRoute.addRoute[" + this.data.i + "].isSms";
    console.log(e.detail.value)
    this.setData({ [addressDetail]: e.detail.value.checkAddressNo, [consignee]: e.detail.value.checkConsignee, [consigneeMobile]: e.detail.value.checkConsigneeMobile, [checkSms]: this.data.checkedSms, showWindow: false })
    console.log(this.data.formRoute)
  },
  successSubmit: function() {
    console.log(this.data.formRoute);
    let validate = /^[0-9a-zA-Z\u4e00-\u9fa5 ]{1,30}$/;
    if (this.data.formRoute.lineName === '') {
      wx.showToast({
        title: '路线名称不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!validate.test(this.data.formRoute.lineName)) {
      wx.showToast({
        title: '只能输入汉字、英文、数字',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let some = this.data.formRoute.addRoute.some((item) => {
      return item.originCoordinate === ''
    });

    if (some) {
      wx.showToast({
        title: '路线不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    // 路线接口与下单接口 字段名不一样，需要转换
    this.data.formRoute.addRoute.forEach((item)=>{
      item.contactsPhone = item.consigneeMobile
      item.contacts = item.consignee
      item.address = item.addressDetail
    })
    let parm = {
      "aflcShipperLineDtos": this.data.formRoute.addRoute,
      "shipperLineName": this.data.formRoute.lineName
    };
    if (app.storage.get_s('routeLineDetail')) {
      app.xhr('POST', `/aflc-uc/aflcShipperLineApi/updateAflcShipperLine/${this.data.formRoute.addRoute[0].shipperNo}?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res) => {
        if (res.data.status === 200) {
          wx.showToast({
            title: '修改成功',
            icon: 'none',
            duration: 2000
          })
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.showToast({
            title: res.data.errorInfo,
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else {
      app.xhr('POST', `/aflc-uc/aflcShipperLineApi/addAflcShipperLine?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res) => {
        if (res.data.status === 200) {
          wx.showToast({
            title: '新增成功',
            icon: 'none',
            duration: 2000
          })
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.showToast({
            title: res.data.errorInfo,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  openWindow: function(e) {
    let i = e.currentTarget.dataset.i;
    let list = this.data.formRoute.addRoute
    if (list[i].originCoordinate !== '') {
      this.setData({
        showWindow: true,
        i,
        checkedSms: list[i].isSms ? list[i].isSms: 0
      })
    }
  },
  openWindowFormMap: function (i) {
    let list = this.data.formRoute.addRoute
    if (list[i].originCoordinate !== '') {
      this.setData({ showWindow: true, i, checkedSms: list[i].isSms })
    }
  },
  updateAddressList: function(e) {
    let i = e.currentTarget.dataset.i;
    let list = this.data.formRoute.addRoute
    if (i === 1) {
      if (list.length >= 10) {
        wx.showToast({
          title: '最多只能添加十条目的地',
          icon: 'none',
          duration: 2000
        })
        return
      }
      list.push({
        consigneeMobile: '',
        consignee: '',
        addressDetail: '',
        cityCode: "",
        origin: "",
        originCoordinate: "",
        originName: "",
        provinceCityArea: "",
        shipperSort: list.length,
        isSms: 0
      })
    } else if (i > 1) {
      list.splice(i, 1);
      list.forEach((item, i) => {
        item.shipperSort = i
      });
    }
    this.setData({
      'formRoute.addRoute': list
    })
  },
  reset: function() {
    this.setData({
      visible: true
    });
  },
  handleCancel: function() {
    this.setData({
      visible: false
    });
  },
  handleClickItem: function(e) {
    let obj = {
      lineName: '', //路线名称
      addRoute: [{
          consigneeMobile: '',
          consignee: '',
          addressDetail: '',
          cityCode: "", //城市编码（格式440100）
          origin: "", //详细地址
          originCoordinate: "", //地点坐标(小的在前)
          originName: "", //地点名称
          provinceCityArea: "", //省市区（格式:广东省广州市天河区）
          shipperSort: 0,
          isSms: 0
        },
        {
          consigneeMobile: '',
          consignee: '',
          addressDetail: '',
          cityCode: "",
          origin: "",
          originCoordinate: "",
          originName: "",
          provinceCityArea: "",
          shipperSort: 1,
          isSms: 0
        }
      ],
    }
    this.setData({
      formRoute: obj,
      visible: false
    })
  },
  checkInput: function(e) {
    this.setData({
      'formRoute.lineName': e.detail.value
    })
  },
  closeWindow: function () {
    this.setData({ showWindow: false })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.storage.get_s('routeLineDetail')) {
      let routeLineDetail = app.storage.get_s('routeLineDetail')
      // 路线接口与下单接口 字段名不一样，需要转换
      routeLineDetail.addRoute.forEach((item)=>{
        item.consigneeMobile = item.contactsPhone
        item.consignee = item.contacts
      })

      this.setData({
        formRoute: routeLineDetail
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})