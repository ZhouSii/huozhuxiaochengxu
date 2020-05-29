Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};
const baseUrl = 'http://192.168.1.78:7010';//开发环境
// const baseUrl = 'https://biz.28kuaiyun.com/test';//测试环境
// const baseUrl = 'https://biz.28kuaiyun.com/api';//生产环境

const urlLocal = 'http://192.168.1.181:8081';//开发环境
// const urlLocal = 'https://biz.28kuaiyun.com/mobile';//生产环境
App({
  storage: require('./utils/util.js'),
  h5Url: urlLocal,
  IP:'',
  xhr: function (method, url, obj = null, cb) {
    let header = {'Accept': 'application/json'}
    // if (wx.getStorageSync('28kytoken')){
    //   header.access_token = wx.getStorageSync('28kytoken')
    // }
    // if (wx.getStorageSync('userInfo')) {
    //   header.user_token = wx.getStorageSync('userInfo').userToken
    // }
    wx.request({
      url: baseUrl + url,
      data: obj,
      method,
      header: header,
      success: function (res) {
        if (res.statusCode === 401) {
          wx.showToast({
            title: '尚未登录或者登录信息已失效，请重新登录.',
            icon: 'none',
            duration: 2000
          })
          setTimeout(()=>{
            wx.navigateTo({ url: '/pages/ui2.0/login/login' })
          },2000)
        }
          if (typeof (cb) === "function"){
            cb(res)
          }
      },
      fail: function (error) {
        console.log(error)
        wx.showToast({
          title: '加载失败，请检查您的网络是否连接正常！',
          icon: 'none',
          duration: 2000
        })
        // wx.reLaunch({url: '/pages/ui2.0/login/login'})
      }
    })
  },
  xhrFormData: function (url, obj = null, cb) {
    wx.request({
      url: baseUrl + url,
      data: obj,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': 'Basic d2ViQXBwOndlYkFwcA=='
      },
      success: function (res) {
        if (typeof (cb) === "function") {
          cb(res)
        }
      },
      fail: function (error) {
        console.log(error)
        wx.showToast({
          title: '加载失败，请检查您的网络是否连接正常！',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onLaunch: function () {
    wx.request({
      url: 'https://pv.sohu.com/cityjson?ie=utf-8',
      success:  (e) => {
        let aaa = e.data.split(' ')
        let bbb = aaa[4]
        let ccc = bbb.replace('"','')
        let ddd = ccc.replace('"', '')
        let eee = ddd.replace(',', '')
        this.IP = eee
      },
      fail:function(){
        console.log("失败了");
      }
    })
    // 获取手机系统信息
    wx.getSystemInfo({
      success: res => {
        //导航高度
        this.globalData.navHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    })

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },
  globalData: {
    userInfo: null,
    navHeight: 0 // 自定义导航栏高度
  }
})