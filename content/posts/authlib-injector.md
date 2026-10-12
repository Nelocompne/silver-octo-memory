---
title: 《Minecraft》外置验证
date: 2025-06-14
tags:
  - 技术
---

# 介绍
MC正版登陆的时候，会验证微软账号，并且通过一个被 MOJANG 称之为 Yggdrasil 的验证服务器用来匹配正版玩家信息。

# 需求

## 正版皮肤
自己开过服务器的玩家会发现，如果你使用离线模式，也就是所谓盗版服，即使客户端使用正版登陆，在离线服里依然会没有皮肤。但是你去其他一些非正版公共服务器你可能能看到自己的皮肤，这是因为它们部署了外置 Yggdrasil 服务器。

## 正版验证服务器链接失败
如果服务端或者客户端遇到这个情况，就意味着正版玩家无法进入服务器，而自建服就是个好选择。

# 开始
我们的[@yushijinhun](https://github.com/yushijinhun)为社区实现了一个在客户端实现第三方外置验证服务的注入器[authlib-injector](https://github.com/yushijinhun/authlib-injector)。

这里分为两个部分：
- 一个是需要自搭建的第三方外置验证服务器，也就是Yggdrasil本体，这通常需要域名以及为了安全性需要的https，国内知名的公共服务器就是“LittleSkin皮肤站”。
- 第二是为游戏服务端，和客户端使用外置验证 _authlib-injector_ 。国内第三方MC启动器如HMCL基本上都已经内置了这个功能，玩家只需要考虑选择使用哪个外置验证服务器就行了。

## 搭建Yggdrasil服务器

两个选择：
- 皮肤站的社区开源版[Blessing Skin](https://github.com/bs-community/blessing-skin-server)
- Golang的轻量化实现，基本上满足所有功能[xmdhs/authlib-skin](https://github.com/xmdhs/authlib-skin) （私人小服务器个人推荐）

## 为服务器使用注入器

服务器下载jar文件： https://github.com/yushijinhun/authlib-injector/releases/

随后在服务器的启动指令中添加参数 `-javaagent:authlib-injector.jar=http(s)://domain(ip:port)/api/yggdrasil` 如：

```shell
java -javaagent:authlib-injector-1.2.5.jar=http://127.0.0.1:8080/api/yggdrasil -Xmx2G -jar fabric-server-launch.jar nogui
```

## 为客户端使用注入器

鉴于国内启动器都内置有就不用额外操作。对于像Prism Launcher这种上游明确表示不会支持authlib-injector的启动器，我们需要另辟蹊径。

如Prism Launcher支持在启动中添加包装器，使用[mmcai_rs](https://github.com/CatMe0w/mmcai_rs)。

# 注释

外置验证authlib-injector协议中支持为玩家优先匹配 _正版账号ID_ 的皮肤还是 _外置验证服务器_ 的皮肤。
