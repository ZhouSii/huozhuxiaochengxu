let app = getApp()
var amapFile = require('../../utils/amap-wx.js')
var myAmapFun = new amapFile.AMapWX({ key: 'cbb300a2c1e7820f0989eafee58db0ba' });
let animation = wx.createAnimation({
  duration: 250,
  timingFunction: 'ease-in-out',
})
Page({
  data: {
    scrollTop: 0, //中间滚动位置
    scrollLeft: 0, // 顶部车型滚动
    cityNameWidth: 0,//顶部市名宽度
    fromCity: false,//用于刷新carList，获取元素宽度
    loadAflcShipperPreferentialtDetailDto: true,//检查是否读取优惠金
    canGoToOrderNext: true,
    animationData: {},
    windowWidth: 0,
    windowHeight: 0,
    showLiftWindow: false,
    showWindow: false, //地址详情弹窗
    i: 0, //地址详情索引
    checkedSms: undefined,//地址详情sms
    showSms: true,
    userInfo:null,

    carList: [], //车辆列表
    form: { //主页表单
      belongCity: '', //发货地 订单所属区域(定位的城市id)
      code: [], //城市code
      time: '', //选择的时间
      _cityAdcode: [],//城市code
      carType: '', //滑块ID
      carTypeItemLeft: 0, //滑块开始位置
      carTypeItemWidth: 0, //滑块宽度
      initialIndex: 0, //车型图片位置

      serviceCode: '', //额外服务要使用

      couponId: "", //优惠券id
      preferentialAmountId: "", //优惠金id

      priceId: '', //定价id
      priceType: '', //定价类型 1标准定价 2区域定价
      specCode: '', //车辆规格Code

      to: [{
          consignee: "", //收货人姓名
          consigneeMobile: "", //收货人电话
          isSms: 0, //是否短信通知(1为是，0为否)
          origin: "", //地点名称详细地址
          addressDetail:'', //地址详情 门牌
          originCoordinate: "", //地点坐标(格式22.5253951835,114.0988813763纬度经度)
          originName: "", //地点名称
          provinceCityArea: "", //省市区（格式:广东省,广州市,天河区）
          shipperSort: 0 //线路排序号
        },
        {
          consignee: "",
          consigneeMobile: "",
          isSms: 0,
          origin: "",
          addressDetail: '',
          originCoordinate: "",
          originName: "",
          provinceCityArea: "",
          shipperSort: 1
        }
      ],
      mathPriceList: {
        distance: 0, //预估里程
        price: 0, //起步价
        kmPrice: 0, //起步公里
        carTypeName: '', //车型
        outDistance: 0, //超出公里
        outstripPrice: 0, //超出公里价钱
        reward: 0, //在线交易优惠金
        orderDiscountAmount: 0, //优惠卷
        _totalAmount: 0, //预估总价
        totalAmount: 0, //总价格(起步价+超里程费) 未减优惠
        couponIdList: [], //优惠券对应选择的车型
        moreAddrPrice: 0, //多地址价格
        moreAddr: 0 // 多地址个数
      },
    },
    multiArray: [[], [], []],
    multiIndex: [0, 0, 0],
    haveHour:[], //余下的小时
    haveMin:[], //余下的分钟
    cityCoordinate:[], //当前城市坐标

// 发物流
    tabTypeId:1,
    tabType: [{ id: 0, name: "小货车" }, { id: 1, name: "发物流" }], // , {id: 2, name: "大货车"}
    faWuLiuForm: {},
    showAddressWindow: false,
    showBottomWindow: false,
    addr: {},
    faWuLiuForm: {
      to: [{
        consignee: "",//收货人姓名
        consigneeMobile: "",//收货人电话
        isSms: 0,//是否短信通知(1为是，0为否)
        origin: "",//地点名称详细地址
        originCoordinate: "",//地点坐标(格式22.5253951835,114.0988813763纬度经度)
        originName: "",//地点名称
        provinceCityArea: "",//省市区（格式:广东省,广州市,天河区）
        shipperSort: 0,//线路排序号
        province: '',
        city: '',
        area: '',
        street: '', // 街道
        streetCode: '', // 街道code
        cityCode: '', // 发物流的城市编码
        code: '', //区code
        longitude: '',
        latitude: ''
      },
      {
        consignee: "",
        consigneeMobile: "",
        isSms: 0,
        origin: "",
        originCoordinate: "",
        originName: "",
        provinceCityArea: "",
        shipperSort: 1,
        province: '',
        city: '',
        area: '',
        street: '',
        streetCode: '',
        cityCode: '',
        code: '', //区code
        longitude: '',
        latitude: ''
      }
      ],
      agencyInfo: {}, // 区代信息
      calculateList: [], // 发物流区代计算价格
      estimatePrice: 0, // 预估
      reductionPrice: 0, // 减免
      number: '',
      weight: '',
      volume: '',
      goodsCode: '',
      goodsName: '',
      userCurrent: {
        userCurrentAddress: '', // 用户当前地址(长地址)
        userCurrentAddressName: '', // 用户当前地址名称(短地址)
        userCurrentAreaCode: '', // 用户当前区域代码值
        userCurrentLatitude: '', // 用户当前纬度
        userCurrentLongitude: '', // 用户当前经度
      }
    }
  },
  toFaWuLiuNext: function() {

  },
  bindblurNumber: function(e) {

  },
  bindinputNumber: function(e) {
console.log(e)
  },
  showBottomWindowHandle: function() {
    this.setData({
      showBottomWindow: !this.data.showBottomWindow
    })
  },
  changeSendType: function (e) {
    this.setData({ tabTypeId: e.currentTarget.dataset.id})
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
    let addressDetail = "form.to[" + this.data.i + "].addressDetail";
    let consignee = "form.to[" + this.data.i + "].consignee";
    let consigneeMobile = "form.to[" + this.data.i + "].consigneeMobile";
    let checkSms = "form.to[" + this.data.i + "].isSms";

    this.setData({ [addressDetail]: e.detail.value.checkAddressNo, [consignee]: e.detail.value.checkConsignee, [consigneeMobile]: e.detail.value.checkConsigneeMobile, [checkSms]: this.data.checkedSms, showWindow:false })
  },
  smsHandle: function(e) {
    if (this.data.checkedSms === 0){
      this.setData({ checkedSms: 1 })
    } else {
      this.setData({ checkedSms: 0 })
    }
  },
  openWindow: function(e) {
    let i = e.currentTarget.dataset.i;
    let list = this.data.form.to
    if (list[i].originCoordinate !== ''){
      this.setData({ showWindow: true, i, checkedSms: list[i].isSms})
    }
  },
  openWindowFormMap: function (i) {
    let list = this.data.form.to
    if (list[i].originCoordinate !== '') {
      this.setData({ showWindow: true, i, checkedSms: list[i].isSms })
    }
  },
  closeWindow: function() {
    this.setData({ showWindow: false})
  },
  test: function(){
    console.log(this.data)
  },
  toOrderManage: function(){
    if (app.storage.get_s('userInfo')) {
      wx.navigateTo({
        url: '/pages/orderManage/orderManage?from=order'
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  toMoreSet:  function(){
    if (app.storage.get_s('userInfo')) {
      wx.navigateTo({
        url: '/pages/moreSet/moreSet',
        success: () => {}
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  toShowMap: function(e){
    let item = e.currentTarget.dataset.item, originCoordinate;
    if (item.originCoordinate === ''){
      //userLocation高德地图定位
      originCoordinate = this.data.cityCoordinate
    } else{
      originCoordinate = item.originCoordinate.split(',').reverse().join(',')
    }
    wx.navigateTo({
      url: `/pages/showMap/showMap?consignee=${item.consignee}&consigneeMobile=${item.consigneeMobile}&isSms=${item.isSms}&origin=${item.origin}&addressDetail=${item.addressDetail}&originCoordinate=${originCoordinate}&originName=${item.originName}&provinceCityArea=${item.provinceCityArea}&shipperSort=${item.shipperSort}`
    })
  },
  toFareEstimate: function(){
    let originCoordinateList = []
    this.data.form.to.forEach((item)=>{
      originCoordinateList.push({ originCoordinate: item.originCoordinate})
    })
    let mathPriceList = JSON.stringify(this.data.form.mathPriceList)
    let to = JSON.stringify(originCoordinateList)
    if (this.data.form.mathPriceList._totalAmount !== 0) {
      wx.navigateTo({
        url: `/pages/fareEstimate/fareEstimate?mathPriceList=${mathPriceList}&to=${to}`,
      })
    }
  },
  toPreferential: function(){
    if (app.storage.get_s('userInfo')) {
      if (this.data.form.mathPriceList._totalAmount !== 0) {
        wx.navigateTo({
          url: `/pages/preferential/preferential`,
        })
      } else {
        wx.showToast({
          title: '需要收发货地址',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.navigateTo({
        url: `/pages/login/login`,
      })
    }

  },
  toRouteManage: function(){
    if (app.storage.get_s('userInfo')) {
      wx.navigateTo({
        url: `/pages/routeManage/routeManage`,
      })
    } else {
      wx.navigateTo({
        url: `/pages/login/login`,
      })
    }
  },
  toUseCarNow: function(){
    if (app.storage.get_s('userInfo')) {
      let some = this.data.form.to.some((item) => {
        return item.originCoordinate === ''
      });
      if (!some) {
        if (this.data.form.mathPriceList._totalAmount !== 0 && this.data.canGoToOrderNext) {
          this.setData({'form.time':''})
          wx.navigateTo({ url: '/pages/orderNext/orderNext' })
        } else {
          //
        }
      } else {
        wx.showToast({
          title: '请填写完整地址',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  updateAddressList: function(e){
    let i = e.currentTarget.dataset.i;
    let length = this.data.form.to.length;
    let list = this.data.form.to
    if (i === 1) {
      if (length >= 10) {
        wx.showToast({
          title: '最多只能添加十条目的地',
          icon: 'none',
          duration: 2000
        })
        return
      }
      list.push({
        consignee: "",
        consigneeMobile: "",
        isSms: 0,
        origin: "",
        addressDetail: '',
        originCoordinate: "",
        originName: "",
        provinceCityArea: "",
        shipperSort: length
      })
    } else if (i > 1) {
      list.splice(i, 1);
      list.forEach((item, i) => {
        item.shipperSort = i
      });
      this.mathPrice()
    }
    this.setData({ 'form.to': list })

    let query = wx.createSelectorQuery();
    query.select('#scroll').boundingClientRect();
    query.exec(ele => {
      this.setData({ scrollTop: ele[0].bottom})
    })
  },
  specClick: function(e){
    let item = e.currentTarget.dataset.item;
    let item1 = e.currentTarget.dataset.item1;
    let i = e.currentTarget.dataset.i;
    let up = "carList[" + i + "].specNameSelected";
    if (item.specNameSelected !== item1) {
      this.setData({ 'form.specCode': item1,[up]:item1})
    } else {
      this.setData({ 'form.specCode': '', [up]: '' })
    }
  },
  changeCarTypePicHandler: function(e) {
    let i = e.detail.current

    this.setData({
      'form.initialIndex': i,
      'form.carType': this.data.carList[i].carType,
      'form.carTypeItemLeft': this.data.carList[i].left,
      'form.carTypeItemWidth': this.data.carList[i].width,
      'form.priceId': this.data.carList[i].list[0].id,
      'form.priceType': this.data.carList[i].list[0].priceType,
      'form.specCode': this.data.carList[i].specNameSelected
    })
    this.tabAnimation();
    this.carTypeScroll();
    this.mathPrice();
  },
  carTypeScroll: function(){
    let query = wx.createSelectorQuery();
    query.select('#carTypeItem').boundingClientRect();
    query.exec(ele => {
      let carTypeWidth = ele[0].width
      let center = this.data.form.carTypeItemLeft - (carTypeWidth / 2) + (this.data.form.carTypeItemWidth / 2)
      this.setData({ scrollLeft: center })
    })
  },
  changeCarTypePicHandler2: function(e){
    let dir = e.currentTarget.dataset.dir;
    let initialIndex = this.data.form.initialIndex
    if (dir === 'left' && this.data.form.initialIndex > 0){
      --initialIndex
      this.setData({ 'form.initialIndex': initialIndex })
    }else if (dir === 'right' && this.data.form.initialIndex < (this.data.carList.length - 1)){
      ++initialIndex
      this.setData({ 'form.initialIndex': initialIndex })
    }
  },
  selectCarType: function(e) {
    let i = e.currentTarget.dataset.i;
    let item = e.currentTarget.dataset.item;

    this.setData({
      'form.initialIndex': i,
      'form.carType': item.carType,
      'form.carTypeItemLeft': item.left,
      'form.carTypeItemWidth': item.width
    })
    this.tabAnimation()
  },
  getPriceList: function(code) {
    app.xhr('GET', `/aflc-sm/aflcPriceApi/getPriceByArea/${code}`, null, (res) => {
      if (res.data.status === 200) {
        let list = []
        res.data.data[0].list.forEach((item) => {
          item.list[0].show = false;
          item.specNameSelected = '';
          item.list[0].specName = item.list[0].specName.split(',')
          list.push({
            couponId: '',
            orderDiscountAmount: 0,
            isUse: '',
            carType: item.carType,
            carTypeName: item.carTypeName
          })
          //生成couponIdList
          this.setData({'form.mathPriceList.couponIdList': list})
        });
        this.setData({ 
          carList: res.data.data[0].list, 
          'form.serviceCode': res.data.data[0].serviceCode, 
          'form.carType': res.data.data[0].list[0].carType,
          'form.priceId': res.data.data[0].list[0].list[0].id,
          'form.priceType': res.data.data[0].list[0].list[0].priceType,
          'form.specCode': '',
          'form.initialIndex': 0
          })
        const query = wx.createSelectorQuery()
        query.selectAll('.carType-item').boundingClientRect()
        query.exec((res1)=> {
          let list = res.data.data[0].list
          let l = 0;
          res1[0].forEach((item, i) => {
            list[i].width = item.width;
            l = l + item.width;
            list[i].left = l - item.width
          });
          this.setData({
            carList: list,
            'form.carTypeItemLeft': list[0].left,
            'form.carTypeItemWidth': list[0].width
          })
          this.tabAnimation()
            // console.log(this.data)
        })
        this.mathPrice();
      }
      let query = wx.createSelectorQuery();
      query.select('#cityName').boundingClientRect();
      query.exec(ele => {
        this.setData({ cityNameWidth: ele[0].width })
      })
      this.carTypeScroll();
    })
  },
  toggleLeft() {
    this.setData({
      showLiftWindow: !this.data.showLiftWindow
    });
  },

  tabAnimation: function(){
    animation.left(this.data.form.carTypeItemLeft).step()
    animation.width(this.data.form.carTypeItemWidth).step()
    this.setData({ animationData: animation.export() })
  },
  mathPrice: function(){
    let start = '', end = '', waypoints = '', path = [];
    let some = this.data.form.to.some((item) => {
      return item.originCoordinate === ''
    });
    if (some) {
      return
    }
    wx.showNavigationBarLoading()
    this.setData({ canGoToOrderNext: false })
    let coordinate = this.data.form.to;
    coordinate.forEach((item, i) => {
      path.push(item.originCoordinate.split(',').reverse())
    });
    start = `${path[0][0]}, ${path[0][1]}`;
    end = `${path[path.length - 1][0]}, ${path[path.length - 1][1]}`;
    if (path.length > 2) {
      path.shift();
      path.pop();
      let list = [];
      path.forEach((item) => {
        list.push(`${item[0]}, ${item[1]}`)
      });
      waypoints = list.join(';')
    }
    console.log(waypoints)
    myAmapFun.getDrivingRoute({
      origin: start,
      destination: end,
      strategy: 2,//距离最短
      waypoints: waypoints,
      success:  (result) => {
        this.setData({ 'form.mathPriceList.distance': Math.ceil(result.paths[0].distance / 1000)})
        let outstripPrice;// 超里程价格
        this.data.carList.forEach((item) => {
          if (item.carType === this.data.form.carType) {
            outstripPrice = item.list[0].outstripPrice;
            this.setData({
              'form.mathPriceList.price': item.list[0].price,
              'form.mathPriceList.kmPrice': item.list[0].kmPrice,
              'form.mathPriceList.carTypeName': item.list[0].carTypeName,
            })

          }
        });
        let outDistance = this.data.form.mathPriceList.distance - this.data.form.mathPriceList.kmPrice
        if (outDistance > 0) {
          this.setData({
            'form.mathPriceList.outDistance': outDistance,
            'form.mathPriceList.outstripPrice': Math.ceil(outDistance * outstripPrice),
          })

        } else {
          this.setData({
            'form.mathPriceList.outDistance': 0,
            'form.mathPriceList.outstripPrice': 0,
          })
        }
        if (this.data.form.to.length > 2) {
          this.data.form.mathPriceList.moreAddr = this.data.form.to.length - 2
          this.setData({ 'form.mathPriceList.moreAddr': this.data.form.to.length - 2})
        } else {
          this.setData({ 'form.mathPriceList.moreAddr': 0 })
        }
        let totalAmount = this.data.form.mathPriceList.price + this.data.form.mathPriceList.outstripPrice + this.data.form.mathPriceList.moreAddr * this.data.form.mathPriceList.moreAddrPrice;//总价格(起步价+超里程费) 未减优惠
        this.setData({'form.mathPriceList.totalAmount': totalAmount})

        if (app.storage.get_s("userInfo")) {
          let parm = {
            areaCode: this.data.form.belongCity,//发货地id
            carType: this.data.form.carType,
            discountLevel: app.storage.get_s("userInfo").discountLevel,
            ifPreferential: 1, //是否使用优惠金
            serivceCode: this.data.form.serviceCode,
            totalAmount: this.data.form.mathPriceList.price + this.data.form.mathPriceList.outstripPrice,//起步价+超里程费
            userId: app.storage.get_s("userInfo").shipperId
          };
            app.xhr('POST', `/aflc-order/aflcOrderApi/getPreferential?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, parm, (res) => {
              if (res.data.status === 200) {
                app.storage.set('preferentialList', res.data.data);
                //获取优惠金
                if (res.data.data.aflcShipperPreferentialtDetailDto !== null) {
                  if (this.data.form.belongCity === res.data.data.aflcShipperPreferentialtDetailDto.areaCode) {
                    if (this.data.loadAflcShipperPreferentialtDetailDto){
                      this.setData({
                        'form.mathPriceList.reward': res.data.data.aflcShipperPreferentialtDetailDto.reward,
                        'form.preferentialAmountId': res.data.data.aflcShipperPreferentialtDetailDto.id
                      })
                    }
                  }
                } else {
                  this.setData({ 'form.mathPriceList.reward': 0 })
                }
                this.data.form.mathPriceList.couponIdList.forEach((item) => {
                  if (item.carType === this.data.form.carType) {
                    if (item.isUse === false) {
                      this.setData({
                        'form.mathPriceList.orderDiscountAmount': 0,
                        'form.couponId': ''
                      })
                    } else {
                      if (item.couponId === '') {
                        if (res.data.data.aflcCouponUseDtos.length > 0) {
                          let one = res.data.data.aflcCouponUseDtos[0];
                          if (one.isCanUse && (one.ifvouchersuperposition === '1' || (one.ifvouchersuperposition === '0' && res.data.data.aflcShipperPreferentialtDetailDto === null))) {
                            this.setData({
                              'form.mathPriceList.orderDiscountAmount': one.orderDiscountAmount,
                              'form.couponId': one.id
                            })
                          } else {
                            this.setData({
                              'form.mathPriceList.orderDiscountAmount': 0,
                              'form.couponId': ''
                            })
                          }
                        }
                      } else {
                        res.data.data.aflcCouponUseDtos.forEach((item1)=>{
                          if (item1.id === item.couponId) {
                            //cannotUseCause不能用的原因
                            if (item1.cannotUseCause) {
                              this.setData({
                                'form.mathPriceList.orderDiscountAmount': 0,
                                'form.couponId': ''
                              })
                            } else {
                              this.setData({
                                'form.mathPriceList.orderDiscountAmount': item.orderDiscountAmount,
                                'form.couponId': item.couponId
                              })
                            }
                          }
                        })
                      }
                    }
                  }
                });
              }
              this.setData({
                'form.mathPriceList._totalAmount': totalAmount - this.data.form.mathPriceList.orderDiscountAmount - this.data.form.mathPriceList.reward //总价格(起步价+超里程费) 减优惠
              })
              wx.hideNavigationBarLoading()
              this.setData({ canGoToOrderNext: true })
            })

        } else {
          wx.hideNavigationBarLoading()
          this.setData({ 'form.mathPriceList._totalAmount': totalAmount, canGoToOrderNext: true})
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  getCity: function(){
    myAmapFun.getRegeo({
      success: (data) => {
        console.log(data)
        //初始化城市code,传送到城市选择页面的定们城市
      let adcode =  data[0].regeocodeData.addressComponent.adcode.substr(0, 4) + '00'
        app.storage.set('cityAdcodeFirst', [data[0].regeocodeData.addressComponent.city, adcode])
        this.setData({ 
          'form._cityAdcode': [data[0].regeocodeData.addressComponent.city, adcode],
          cityCoordinate: [data[0].longitude, data[0].latitude]
          })
        this.getPriceList(adcode)
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
  bindMultiPickerChange: function (e) {
    if (app.storage.get_s('userInfo')) {
      let some = this.data.form.to.some((item) => {
        return item.originCoordinate === ''
      });
      if (!some) {
        if (this.data.form.mathPriceList._totalAmount !== 0 && this.data.canGoToOrderNext) {
          this.setData({ 'form.time': `${new Date(this.data.multiArray[0][e.detail.value[0]].id).format("yyyy-MM-dd")} ${this.data.multiArray[1][e.detail.value[1]].id}:${this.data.multiArray[2][e.detail.value[2]].id}:00` })
          wx.navigateTo({ url: '/pages/orderNext/orderNext' })
        } else {
          //
        }
      } else {
        wx.showToast({
          title: '请填写完整地址',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
    this.setData({
      multiArray: [[], [], []], multiIndex: [0, 0, 0]
    })
  },
  bindMultiPickerColumnChange: function (e) {
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        if (data.multiIndex[0] === 0){
          data.multiArray[1] = this.data.haveHour;
          data.multiArray[2] = this.data.haveMin;
        } else {
          let list = [],b;
          for(let i=0;i<24;i++){
            i < 10 ? b = `0${i}` : b = i
            list.push({ id: b+'', name: b+'点' })
          }
          data.multiArray[1] = list;
          data.multiArray[2] = [{ id: "00", name: '00分' }, { id: "15", name: '15分' },{ id: "30", name: '30分' },{ id: "45", name: '45分' }];
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      case 1:
        if (data.multiIndex[0] === 0){
          // console.log('今天第一列')
          if (data.multiIndex[1] === 0) {
            // console.log('今天第二列')
            data.multiArray[2] = this.data.haveMin;
          } else {
            // console.log('非今天第二列')
            data.multiArray[2] = [{ id: "00", name: '00分' }, { id: "15", name: '15分' }, { id: "30", name: '30分' }, { id: "45", name: '45分' }];
          }
        }else{
          // console.log('非今天第一列')
          data.multiArray[2] = [{ id: "00", name: '00分' }, { id: "15", name: '15分' }, { id: "30", name: '30分' }, { id: "45", name: '45分' }];
        }
        data.multiIndex[2] = 0;
        break;
    }
    this.setData(data);
  },
  getTime: function(){
    //第一列
    let timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) * 1;
    let multiArray = this.data.multiArray
    multiArray[0].unshift({ id: timeStamp, name: '今天' });
    for (let i = 1; i < 7; i++) {
      let monthAdd = timeStamp + 86400000 * i
      multiArray[0].push({ id: monthAdd, name: new Date(monthAdd).format("MM月dd号") })
    }

    //今天余下多少小时 列 
    let now = new Date() * 1;
    let EndTime = timeStamp + 86400000;
    let haveTime = EndTime - now;
    let t1 = 60 * 1000 * 15;
    let timeList = [], hourList = [];
    let ii = Math.ceil(haveTime / t1) - 3;
    for (let i = ii; i >= 0; i--) {
      timeList.push([new Date(EndTime - t1 * i).format("hh"), new Date(EndTime - t1 * i).format("mm")])
    }
    timeList.forEach((item)=>{
      hourList.push(item[0])
    })
    hourList.pop()
    let newArrHour = Array.from(new Set(hourList))
    newArrHour.forEach((item)=>{
      multiArray[1].push({id:item, name:item+ '点'})
    })

    //今天余下多少分 列 
    timeList.forEach((item)=>{
      if (item[0] === newArrHour[0]) {
        multiArray[2].push({ id:item[1], name:item[1]+'分'})
      }
    })
    this.setData({ multiArray, haveHour: multiArray[1], haveMin: multiArray[2]})
  },
  timeCancel: function(){
    this.setData({ multiArray: [[], [], []], multiIndex: [0, 0, 0] })
  },
  onLoad: function(options) {
    wx.getSystemInfo({
      success:(res) => {
        this.setData({ windowWidth: res.windowWidth, windowHeight: res.windowHeight})
      }
    })
    this.getCity()
    app.xhr('GET', '/aflc-common/aflcCommonSysDistApi/findAflcCommonSysDictByCodes/AF0043101%2CAF004310101', null, (res) => {
      if (res.data.status === 200) {
        if (res.data.data.AF0043101.value * 1 === 1) {
          this.setData({ 'form.mathPriceList.moreAddrPrice': res.data.data.AF004310101.value * 1})
        }
      }
      //保存form空数据
      app.storage.set('formInit', this.data.form)
    })

    wx.login({
      success: res => {
        console.log(res.code)
      }
    })
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
    if (app.storage.get_s('userInfo')) {
      this.setData({ userInfo: app.storage.get_s('userInfo') })
    }
    //来自路线页,来自城市页调用getPriceList重新计算
    if (this.data.fromCity){
      this.getPriceList(this.data.form._cityAdcode[1])
      this.setData({ fromCity:false })
    } else {
      //返回页面时调用mathPrice方法
      this.mathPrice();
    }
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