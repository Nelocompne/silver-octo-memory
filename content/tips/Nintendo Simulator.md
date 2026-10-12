---
title: 任天堂NS模拟器
date: 2024-10-02
tags:
  - seed
---
# 介绍
早在今年3月20日的时候传出yuzu遭到任天堂关停，与10月1日后ryujinx也遭到关停。

与我而言项目源码可以备份，预编译可以保存，我更关心的是这些模拟器依然需要固件和密钥才能玩到那些新的游戏。我一般直接谷歌搜*"prod keys download"*来获取这些。

yuzu在后面通过源码的分支叫suyu，他们的团队当然也关注ryujinx，所以他们也备份了源码，地址贴在文章末尾。

## 软件截图

我记得ryujinx在1.1.11xx到1.1.12xx版本之间UI上做出了一些改变，但总体使用方式没有变化很多。

## 使用说明
ryujinx自带*portable mode*用来把数据存储到指定目录里。使用方式基本上就是在ryujinx运行目录里创建一个叫*portable*的文件夹就可以了，或者运行的时候`ryujinx.exe -r portable`（我没这样试过）

# 地址
| 官网      | Description |
| ----------- | ----------- |
| https://archive.org/details/ryujinx-1.1.1403 | 源码最终版本V1.1.1403  |
| https://archive.org/details/ryujinx-final  | 预编译最终版本V1.1.1401 |
| https://git.suyu.dev/suyu/suyu | suyu   |
