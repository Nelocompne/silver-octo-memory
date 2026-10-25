---
title: 扫描仪TWAIN协议
date: 2024-06-01
tags:
  - seed
---
# 介绍
TWAIN 是一种应用于扫描仪数码图像采集相关的通信协议。
## TWACKER
TWAIN track工具，可用于测试图像扫描设备驱动功能。
https://github.com/twain/twain-toolkit
💾[twacker 2.5.0 安装包](https://github.com/twain/twain-toolkit/releases/download/v2.5.0/twacker_020500.zip)

![TWACKER1.jpg](https://s2.loli.net/2024/06/01/W6NHeQa4vPcT3IL.jpg)
![TWACKER2.jpg](https://s2.loli.net/2024/06/01/U63yLYhobr4DgRE.jpg)

## TWAIN Samples
官方库TWAIN的WINDOWS程序示例。包含两个部分：twainapp设备控制软件，twainds TWAIN扫描虚拟驱动。
https://github.com/twain/twain-samples
💾[应用安装包](https://github.com/twain/twain-samples/releases/download/v2.5.0/Twain_sample01_02050000.zip)

![twainapp.jpg](https://s2.loli.net/2024/06/01/fTaLj9ErIpq5gA1.jpg)

## TWAIN CS
一个C#写的TWAIN设备控制样例程序。里面包含`twaincscert` `twaincsscan` `twaincstst`三个部分，其中`scan`为扫描仪测试程序。
https://github.com/twain/twain-cs
💾[TWAIN CS 预编译二进制程序](https://github.com/twain/twain-cs/files/7496959/twain-cs_02050000.zip)

![TWAINCS.jpg](https://s2.loli.net/2024/06/01/KYoabnpqNx91cmt.jpg)

## windows-virtual-scanner
TWAIN虚拟扫描仪分支，可以将twainds TWAIN扫描虚拟驱动注入可以通过自定义图像进行扫描的分支程序。
https://github.com/yushulx/windows-virtual-scanner


# 地址
| 官网      | https://twain.org/ |
| ----------- | ----------- |
| GITHUB      | https://github.com/twain |
