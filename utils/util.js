const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function get(key) {
  wx.getStorage({
    key: key,
    success: function (res) {
    },
    fail: function () { },
    complete: function () { }
  })

}

function get_s(key) {
  return wx.getStorageSync(key)
}

function set(key, data, cb) {
  wx.setStorage({
    key: key,
    data: data,
    success: function (res) {
      if (typeof (cb) == "function") {
        cb(res)
      }
    },
    fail: function () { },
    complete: function () { }
  })
}

function remove(key) {
  wx.removeStorage({
    key: key,
    success: function (res) { },
    fail: function () { },
    complete: function () { }
  })
}
module.exports = {
  formatTime: formatTime,
  get,
  get_s,
  set,
  remove
}
