---
id: the-hustle-for-cash
title: 搞钱折腾记
summary: 
date: 2026-08-11
tags:
  - NewAPI
  - 词元
  - 人工智能
readTime: 10 分钟
---

## 后背

> 这两天心血来潮，想着怎么搞钱，正好也毕业了，有足够的时间折腾。于是就在 Telegram 上和 KD 讨论了一下该卖些什么。

---

## 一、讨论去卖梯子

一开始想着去 [Kitty](https://kitty.fo) 买一个订阅，然后通过 [SubBoost](https://github.com/SubBoost/subboost) 中转分发订阅，并且去除上游订阅中的广告，加入自己的广告信息。

**遇到的问题：**  
SubBoost 做不到流量配额、最大连接数、过期时间以及分发用户系统，所以中转下来不好分发，也不方便管理和维护。

**Kitty 订阅价格：**  
价格确实便宜，有 5TB 月流量和 10TB 月流量版本，不限制连接设备，网速快、地区多，非常适合中转。
然后自己用的话也比较推荐，可以看看这个价格：  
![Kitty价格](https://cloudflarecnimg.scdn.io/i/6a7aaba55c43d_1786424229.webp)

> 邀请链接：[点击打开](https://kitty.fo/register?invite=2ATYY6QL)

---

## 二、转向卖 Token（AI 接口中转）

觉得卖梯子不赚钱且麻烦，就打算卖 token，去中转别人的接口。  
找同学 cky 要了 84 块钱，在小兔互联买了一台活动机子，配置如下：

![服务器配置](https://cloudflarecnimg.scdn.io/i/6a7aacb5c9d07_1786424501.webp)

- 购买时长：180 天  
- 续费价格：336 元/年付  
- 目前使用人少，性能过剩  
  ![状态截图](https://cloudflarecnimg.scdn.io/i/6a7aae7b6c4f3_1786424955.webp)

这一家的活动蛮多的，如果想买可以这里注册[点击打开](https://moebun.com/aff/QUPXEVNU)

---

## 三、搭建 NewAPI

花了一个晚上配置好 NewAPI。**槽点一下：** 很多地方不能批量操作，比如价格不能批量设置，我从英伟达搞了一堆免费模型，想全部设为 0，只能手动一个一个改；还有那个兑换码，前面忘记调汇率了，然后兑换码需要全部删除，就必须一个一个删除，我点了好久。

**上游设置：**  
一共弄了 5 个上游：

- 1 个官方（主要靠人多缓存命中率高来压价赚毛利）
- 其他 4 个来自其他中转站汇集

![渠道截图](https://cloudflarecnimg.scdn.io/i/6a7aadb6a2cb2_1786424758.webp)  
不难看出官方的响应速度就是快。

> 如果你想试试，可以通过我的邀请注册：[点击注册](https://ai.mrcwoods.com/sign-up?aff=keS3)  
> 注册送 0.5 元额度，供检测模型使用。

---

## 四、模型列表

里面大多数是免费的端侧模型，高级模型比较少，因为找不到便宜的上游。
可以看下高级模型的定价：

![模型截图1](https://cloudflarecnimg.scdn.io/i/6a7aaeca31efb_1786425034.webp)  
![模型截图2](https://cloudflarecnimg.scdn.io/i/6a7aaee6ad256_1786425062.webp)

具体有哪些模型、价格如何，可以自己上去看看：[点击打开定价页面](https://ai.mrcwoods.com/pricing)

---

## 五、盈利方式

目前投入成本感觉很难回本。  
收费渠道放在闲鱼，通过自动发货发对应额度的兑换码，让用户自己兑换。

**托管经历：**

- 先在 [zhinianboke](https://xy.zhinianboke.com/) 托管，发现商品卖掉不能自动补上架
- 自己没有鱼小铺，就找 KD 帮忙托管，支付系统就这样草草搭建好了

> 总之，都是草台班子，走一步看一步吧。

---

*以上内容为个人折腾记录，仅供参考，不构成任何投资或购买建议。*