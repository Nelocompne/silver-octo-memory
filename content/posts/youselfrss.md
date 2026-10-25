---
title: 属于自己的“RSS生态”
date: 2024-02-17
---

在这里我不会教你怎么用RSS开始你的第一次阅读，因为网上有太多这样的教程供你学习。

我也更偏向你要自己学会使用它，因为这样才知道你是否真的需要RSS？而不是浪费过多的时间？

但我也会在这里分享一些RSS的小技巧，欢迎大家参与交流。

## 聚合

RSS最大的特点是聚合，你不再需要在各种内容平台之间奔波就可以获得有用的信息。但是媒体平台并不会乐意你这么做，假如你去看RSS了，它们的广告和营销该如何第一时间推送到你面前？

这就是为什么即使一些媒体平台就算不提供RSS服务，也会千方百计阻止你通过自己的方式从它们手上获得RSS。

## 获取更新

比起应用软件自带的更新程序，很多开源软件或者独立游戏并不自带这种功能。如果软件作者发布在Github，那将非常简单，Github非常乐于提供RSS，直接使用即可。

游戏及其他类型作品呢？这会有点复杂，不少作者会选择发布在Patreon，Fantia，Fanbox甚至论坛上，你当然大可注册帐号直接订阅他们，但假如你关注的范围多来起来，你将非常需要RSS的信息聚合功能。部分博客系统或论坛都会有隐藏的RSS服务，需要你自己去发现它们。

通常这些内容平台没有广告，就算有广告，带来的收益也不会给你关注的作者，所以 RSSHub 通过自己的方法，从这些没有RSS的平台关注自己支持的作者。（我甚至通过 RSSHub 订阅《AliceInCradle》的B站动态。）

## RSSHub Radar

新版本的RSSHub Radar增加了一个“预览”功能，它能实时将rss那让人眼花的格式解析成人类可读的预览。这样，就可以在你订阅之前就能很快知道这是否是你需要的内容。

## Miniflux

得益于我们亲爱的DIYgod，从他那里我得知了一个开源好用的RSS客户端，相较于已经臃肿的Tiny Tiny RSS或各种付费的RSS订阅平台，Miniflux拥有最轻量化的RSS体验，部署后通过web前端访问，也能通过第三方客户端接入API体验，但对我来说web端已经非常优雅了，不管是手机还是电脑还是任何设备，只要有浏览器就可以访问，很多时候我们并不需要太多的APP。

## 一台VPS和域名

虽然这两者不是必须的，你当然可以通过本地的NAS或是家用网络主机部署和代替。

但是考虑到RSS源来自互联网各个地方，只要你有个网络线路不错的服务器就可以帮助你快速从RSS源获取内容。假如你有个自己的域名，把前面提到的Miniflux（甚至RSSHub）部署在VPS上，可以让你在任何地方通过自己的域名轻松阅读RSS。

## 用docker部署它

比起太多的服务依赖，我们直接通过docker脚手架一次性部署这些属于自己的服务。参考：

Miniflux： [v2/contrib/docker-compose/basic.yml at main · miniflux/v2 (github.com)](https://github.com/miniflux/v2/blob/main/contrib/docker-compose/basic.yml)

RSSHub： [RSSHub/docker-compose.yml at master · DIYgod/RSSHub (github.com)](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)

Docker的一个小技巧是，如果你并不想在其他地方使用RSSHub的服务，Docker构建的内部网络可以很轻松的让Miniflux和RSSHub结合起来。

![](/assets/blog/rss1.png)