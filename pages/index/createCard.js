// pages/card/createCard.js
let utils = getApp().utils;
const app = getApp();
const qiniuUploader = require("../../utils/qiniuUploader");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        codeState: 0, //验证码样式状态
        codeViewState: false, //验证码输入框样式
        num: 60, //倒计时
        fav: [
            // { "id": 0, "name": "勤奋", "new": false },
            // { "id": 1, "name": "热情", "new": false },
            // { "id": 2, "name": "幽默", "new": false },
            // { "id": 3, "name": "责任心", "new": false }
        ], //标签数组
        favState: 1, //标签初始状态
        favDisable: true,
        addItemDisable: true,
        newItem: {},
        customItem: {},
        imageArray: [],
        userInfo: {},
        personMsg: {
            "1": {
                name: "mobile",
                value: ""
            },
            "2": {
                name: "email",
                value: ""
            },
            "3": {
                name: "telephone",
                value: ""
            },
            "4": {
                name: "address",
                value: ""
            }
        },
        mainCardMsg: {
            "1000": {
                orgName: "",
                post: ""
            }
        },
        user: {},
        verCode: 0,
        type: 0,
        verState: false,
        verSubmitState: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function(options) {
        wx.setStorageSync("fav", this.data.fav);
        this.setData({
            favDisable: true,
            addItemDisable: true
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onLoad: function(options) {
        var that = this;
        if (options.type) {
            this.data.type = options.type;
        }
        utils.getAjaxToken('/user/allInfo', {
            type: 1
        }, function(res) {
            that.data.userInfo = res;
            // this.data.userInfo = wx.getStorageSync("myUserInfo");
            if (that.data.userInfo.cards) {
                for (let i in that.data.userInfo.cards) {
                    if (parseInt(i) < 5) {
                        if (that.data.userInfo.cards[i]) {
                            that.data.personMsg[i] = that.data.userInfo.cards[i].itemContent;
                        }
                    } else if (parseInt(i) > 4 && parseInt(i) < 500) {
                        if (that.data.userInfo.cards[i]) {
                            that.data.newItem[i] = that.data.userInfo.cards[i].itemContent;
                        }
                    } else if (parseInt(i) > 499 && parseInt(i) < 1000) {
                        if (that.data.userInfo.cards[i]) {
                            that.data.customItem[i] = that.data.userInfo.cards[i].itemContent;
                            that.data.customItem[i].defaultVisible = that.data.userInfo.cards[i].defaultVisible;
                        }
                    } else {
                        if (that.data.userInfo.cards["1000"]) {
                            that.data.mainCardMsg["1000"] = that.data.userInfo.cards["1000"].itemContent;
                        }
                    }
                }
            }
            //如果有兴趣标签有数据
            if (that.data.userInfo.user.favs) {
                that.data.fav = that.data.userInfo.user.favs;
                that.data.favState = 1
            }
            if (that.data.userInfo.user.verified && that.data.userInfo.cards["1"]) {
                that.data.verState = that.data.userInfo.user.verified;
            }
            if (that.data.userInfo.user.picture && that.data.userInfo.user.picture.length > 0) {
                that.data.imageArray = that.data.userInfo.user.picture;
            }

            wx.setStorageSync("fav", that.data.fav);
            that.setData({
                personMsg: that.data.personMsg,
                mainCardMsg: that.data.mainCardMsg,
                userInfo: that.data.userInfo,
                newItem: that.data.newItem,
                customItem: that.data.customItem,
                imageArray: that.data.imageArray,
                fav: that.data.fav,
                verState: that.data.verState
            })
        });
    },
    //更改头像
    // 初始化七牛相关参数
    initQiniu: function(callback) {
        var usertoken = wx.getStorageSync("token");
        if (usertoken != "") {
            utils.getAjaxToken("/thirdService/getQiNiuUpTokenSmallProgram", {
                token: usertoken
            }, function(data) {
                var options = {
                    region: 'ECN',
                    // uptokenURL: util.picURL +"?token ="+ usertoken,
                    uptoken: data,
                    domain: 'http://cdn-icare.qingtime.cn/',
                    shouldUseQiniuFileName: false
                };
                qiniuUploader.init(options);
                callback();

            });
        }
    },
    chooseAvatar: function() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sourceType: [
                'album', 'camera'
            ],
            success: function(res) {
                wx.uploadFile({
                    url: 'http://127.0.0.1:8086/upload/picture', // 仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'file',
                    // formData: {
                    //     user: 'test'
                    // },
                    success(res) {
                        const data = res.data
                        // do something
                    }
                })
            }
        })
    },
    choosePicture: function() {
        var that = this;
        wx.chooseImage({
            sizeType: "compressed",
            sourceType: [
                'album', 'camera'
            ],
            success: function(res) {
                for (var i = 0; i < res.tempFilePaths.length; i++) {
                    wx.getImageInfo({
                        src: res.tempFilePaths[i],
                        success: function(res) {
                            //添加回调
                            that.initQiniu(function() {
                                qiniuUploader.upload(res.path, (res) => {
                                    that.data.imageArray.push(res.imageURL);
                                    that.setData({
                                        imageArray: that.data.imageArray
                                    })
                                }, (error) => {
                                    console.error('error: ' + error);
                                });
                            });

                        }
                    });
                }
            }
        })
    },
    delPicture: function(e) {
        this.data.imageArray.splice(e.currentTarget.dataset.id, 1);
        this.setData({
            imageArray: this.data.imageArray
        })
    },
    //获取输入框的内容
    getName: function(e) {
        //获取对应数据
        switch (e.currentTarget.dataset.target) {
            case "nickName":
                this.data.userInfo.user.nickName = e.detail.value;
                break;
            case "declaration":
                this.data.userInfo.user.declaration = e.detail.value;
                break;
            case "orgName":
                this.data.mainCardMsg["1000"].orgName = e.detail.value;
                break;
            case "post":
                this.data.mainCardMsg["1000"].post = e.detail.value;
                break;
            case "verCode":
                if (e.detail.value) {
                    this.setData({
                        verSubmitState: true
                    })
                } else {
                    this.setData({
                        verSubmitState: false
                    })
                }
                this.data.verCode = e.detail.value;
                break;
            case "new":
                if (parseInt(e.currentTarget.dataset.id) < 500) {
                    this.data.newItem[e.currentTarget.dataset.id] = {
                        name: e.currentTarget.dataset.name,
                        value: e.detail.value
                    };
                } else {
                    this.data.customItem[e.currentTarget.dataset.id] = {
                        name: e.currentTarget.dataset.name,
                        value: e.detail.value,
                        defaultVisible: true
                    };
                }
                break;
            default:
                this.data.personMsg[e.currentTarget.dataset.id] = {
                    name: e.currentTarget.dataset.name,
                    value: e.detail.value
                };
        }
        //用户名
        //1000之前
        //1000
    },
    //添加项目
    addItem: function() {
        this.setData({
            addItemDisable: false,
        });
        wx.setStorageSync("newItem", this.data.newItem);
        wx.setStorageSync("customItem", this.data.customItem);
        wx.navigateTo({
            url: '/pages/index/newItem'
        })
    },
    //删除栏目
    delItem: function(e) {
        if (parseInt(e.currentTarget.dataset.id) < 500) {
            delete this.data.newItem[e.currentTarget.dataset.id]
        } else {
            delete this.data.customItem[e.currentTarget.dataset.id]
        }
        this.setData({
            newItem: this.data.newItem,
            customItem: this.data.customItem
        })
    },
    getphonenumber: function(e) {
        var that = this;
        if (e.detail.errMsg == "getPhoneNumber:ok") {
            wx.request({
                url: app.globalData.location + '/thirdService/decryptData', //仅为示例，并非真实的接口地址
                data: {
                    "encryptedData": e.detail.encryptedData,
                    "iv": e.detail.iv,
                    "sessionKey": wx.getStorageSync("session_key")
                },
                method: "GET",
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    that.data.personMsg["1"].value = res.data.result.phoneNumber;
                    utils.getAjaxToken('/user/updateProperty', {
                        "verified": true
                    }, function(res) {
                        //POST /card/baseInfo
                        that.setData({
                            personMsg: that.data.personMsg,
                            verState: true
                        })
                    }, "POST")
                }
            })
        } else {
            this.setData({
                personMsg: that.data.personMsg,
                codeState: 1
            })
        }
    },
    sendVercode: function() {
        var that = this;
        var re = new RegExp(/^\s*$/);
        var re1 = new RegExp(/(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/);
        if (!re1.test(this.data.personMsg["1"].value) && !re.test(this.data.personMsg["1"].value)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '请输入正确的手机号码'
            })
            return;
        } else if (re.test(this.data.personMsg["1"].value)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '手机号码不能为空'
            })
            return;
        }
        this.setData({
            codeState: 2,
            codeViewState: true
        })
        if (this.data.personMsg["1"].value) {
            //发送验证码
            wx.request({
                url: 'https://namecard.qingtime.cn/sendVerifyCodeNameCard',
                method: 'POST',
                data: {
                    "mobileArea": "+86",
                    "mobile": this.data.personMsg["1"].value,
                    "type": 1
                },

                //参数为键值对字符串
                header: {
                    //设置参数内容类型为x-www-form-urlencoded
                    'content-type': 'application/x-www-form-urlencoded',
                    //'Accept': 'application/json'
                },
                success: function(res) {
                    var timer = setInterval(function() {
                        if (that.data.num < 2) {
                            that.data.num = 60;
                            that.setData({
                                codeState: 1,
                                num: that.data.num
                            })
                            clearInterval(timer);
                        } else {
                            that.data.num--;
                            that.setData({
                                num: that.data.num,
                            })
                        }
                    }, 1000)
                }
            })
        }
    },
    submitCode: function() {
        var that = this;
        utils.getAjaxToken('/user/verifyUserMobileCode', {
            "mobileArea": "+86",
            "mobile": this.data.personMsg["1"].value + "",
            "code": this.data.verCode + ""
        }, function(res) {
            if (res == "success") {
                that.setData({
                    codeViewState: false,
                    verState: true
                })
            }
        }, "POST")
    },
    toInterest: function() {
        //说明要刷新favState
        this.setData({
            favDisable: false,
        });
        wx.navigateTo({
            url: '/pages/index/insterest'
        })
    },
    saveCard: function() {
        //POST /user/updateProperty
        let that = this;
        var re = new RegExp(/^\s*$/);
        var re1 = new RegExp(/(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/);
        var re2 = new RegExp(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/);
        for (var i in this.data.newItem) {
            if (!this.data.newItem[i].value) {
                delete this.data.newItem[i]
            }
        }
        for (var j in this.data.customItem) {
            if (!this.data.customItem[j].value) {
                delete this.data.customItem[j]
            }
        }
        var cards = Object.assign(this.data.personMsg, this.data.mainCardMsg, this.data.customItem, this.data.newItem);
        //验证
        if (!re1.test(cards["1"].value) && !re.test(cards["1"].value)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '请输入正确的手机号码'
            })
            return;
        } else if (re.test(cards["1"].value)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '手机号码不能为空'
            })
            return;
        }
        if (!re2.test(cards["2"].value) && !re.test(cards["2"].value)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '请输入正确的邮箱地址'
            })
            return;
        }
        if (re.test(cards["1000"].orgName)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '公司不能为空'
            })
            return;
        }
        if (re.test(cards["1000"].post)) {
            wx.showModal({
                title: '信息提示',
                showCancel: false,
                confirmColor: "#5095FA",
                content: '职务不能为空'
            })
            return;
        }
        /*if (this.data.verState) {
            delete cards["1"];
        }*/
        let cardsToken = Object.assign({
            "token": wx.getStorageSync("token")
        }, cards);
        utils.getAjaxToken('/user/updateProperty', {
            "nickName": this.data.userInfo.user.nickName,
            "avatar": this.data.userInfo.user.avatar,
            "favs": this.data.fav,
            "picture": this.data.imageArray,
            "declaration": this.data.userInfo.user.declaration
        }, function(res) {
            //POST /card/baseInfo
            wx.request({
                url: app.globalData.location + '/card/baseInfo', //仅为示例，并非真实的接口地址
                data: cardsToken,
                method: "POST",
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    wx.setStorageSync("myUserInfo", that.data.userInfo);
                    if (that.data.type == 0) {
                        wx.switchTab({
                            url: '/pages/index/index'
                        })
                    } else if (that.data.type == 1) {
                        wx.redirectTo({
                            url: '/pages/index/cardInfo'
                        })
                    }

                }
            })
        }, "POST")
    }
})