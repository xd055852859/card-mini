// pages/index/newCard.js
const app = getApp();
let utils = getApp().utils;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addCardDisable: true,
        newCard: {},
        customCard: {},
        userInfo: {},
        cardMsg: {
            "1": { name: "公司", value: "" },
            "2": { name: "职务", value: "" },
            "3": { name: "固话", value: "" },
            "4": { name: "地址", value: "" }
        },
        cardId: 0,
        visibleState: true,
        incumbentState: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.userInfo = wx.getStorageSync("myUserInfo");
        if (options.cardId) {
            this.data.cardId = options.cardId
        }
        if (this.data.cardId == 0) {
            //新建名片
            this.data.cardId = Math.max.apply(null, Object.keys(this.data.userInfo.cards)) + 1;
        } else {
            this.setData({
                cardId:this.data.cardId
            })
            if (this.data.userInfo.cards) {
                this.data.visibleState = this.data.userInfo.cards[this.data.cardId].defaultVisible;
                this.data.incumbentState = this.data.userInfo.cards[this.data.cardId].incumbent;
                for (let i in this.data.userInfo.cards[this.data.cardId].itemContent) {
                    if (parseInt(i) < 5) {
                        this.data.cardMsg[i] = this.data.userInfo.cards[this.data.cardId].itemContent[i];
                    } else if (parseInt(i) > 4 && parseInt(i) < 500) {
                        this.data.newCard[i] = this.data.userInfo.cards[this.data.cardId].itemContent[i];
                    } else {
                        this.data.customCard[i] = this.data.userInfo.cards[this.data.cardId].itemContent[i];
                        this.data.customCard[i].defaultVisible = this.data.userInfo.cards[this.data.cardId].itemContent[i].defaultVisible;
                    }
                }
            }
        }
        this.setData({
            cardMsg: this.data.cardMsg,
            useInfo: this.data.userInfo,
            newCard: this.data.newCard,
            customCard: this.data.customCard,
            visibleState:this.data.visibleState,
            incumbentState:this.data.incumbentState
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onShow: function () {
       
    },
    getName: function (e) {
        //获取对应数据
        switch (e.currentTarget.dataset.target) {
            case "new":
                if (parseInt(e.currentTarget.dataset.id) < 500) {
                    this.data.newCard[e.currentTarget.dataset.id] = { name: e.currentTarget.dataset.name, value: e.detail.value };
                } else {
                    this.data.customCard[e.currentTarget.dataset.id] = { name: e.currentTarget.dataset.name, value: e.detail.value, defaultVisible: true };
                }
                break;
            default:
                this.data.cardMsg[e.currentTarget.dataset.id] = { name: e.currentTarget.dataset.name, value: e.detail.value };
        }
        //用户名
        //1000之前
        //1000
    },
    addItem: function () {
        this.setData({
            addCardDisable: false,
        });
        wx.setStorageSync("newCard", this.data.newCard);
        wx.setStorageSync("customCard", this.data.customCard);
        wx.navigateTo({
            url: '/pages/index/newItem?itemType=1',
        })
    },
    //删除栏目
    delItem: function (e) {
        if (parseInt(e.currentTarget.dataset.id) < 500) {
            delete this.data.newCard[e.currentTarget.dataset.id]
        } else {
            delete this.data.customCard[e.currentTarget.dataset.id]
        }
        this.setData({
            newCard: this.data.newCard,
            customCard: this.data.customCard
        })
    },
    changeState: function (e) {
        if (e.currentTarget.dataset.target == "defaultVisible") {
            this.data.visibleState = e.detail.value
        } else {
            this.data.incumbentState = e.detail.value
        }
    },
    delCard:function(){
        var that = this;
        wx.showModal({
            title: '删除名片',
            confirmColor: "#5095FA",
            content: '确定要删除此名片吗',
            success: function(res) {
                if (res.confirm) {
                    utils.getAjaxToken('/card/org', {"itemTypeID": that.data.cardId }, function(res) {
                        wx.switchTab({
                            url: "/pages/index/index",
                        })
                    }, "DELETE")
                }
            }
        })
       
    },
    saveNewCard: function () {
        var that = this;
        var newcards ={}
        for (var i in this.data.newCard) {
            if (!this.data.newCard[i].value) {
                delete this.data.newCard[i]
            }
        }
        for (var j in this.data.customCard) {
            if (!this.data.customCard[j].value) {
                delete this.data.customCard[j]
            }
        }
        newcards[this.data.cardId] = Object.assign(this.data.cardMsg, this.data.newCard, this.data.customCard);
        var re = new RegExp(/^\s*$/);
        if (re.test(newcards[this.data.cardId]["1"].value)) {
            wx.showModal({ title: '信息提示', showCancel: false, confirmColor: "#5095FA", content: '公司不能为空' })
            return;
        }
        if (re.test(newcards[this.data.cardId]["2"].value)) {
            wx.showModal({ title: '信息提示', showCancel: false, confirmColor: "#5095FA", content: '职务不能为空' })
            return;
        }
        if (re.test(newcards[this.data.cardId]["3"].value)) {
            wx.showModal({ title: '信息提示', showCancel: false, confirmColor: "#5095FA", content: '固话不能为空' })
            return;
        }
        if (re.test(newcards[this.data.cardId]["4"].value)) {
            wx.showModal({ title: '信息提示', showCancel: false, confirmColor: "#5095FA", content: '地址不能为空' })
            return;
        }
        newcards.incumbent = this.data.incumbentState;
        newcards.defaultVisible= this.data.visibleState;
        //POST /card/orgInfo
        utils.getAjaxToken('/card/orgInfo', newcards, function (res) {
            wx.redirectTo({
                url: '/pages/index/cardInfo'
            })
        }, "POST")
    }
})