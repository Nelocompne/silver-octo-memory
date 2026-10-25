---
title: 通过批处理脚本设置IE可信任站点，兼容性视图
date: 2025-09-13
tags:
  - 技术
---

# 介绍

该文大多数内容主要为转载，文章结尾附带个人实战部分。

**说明**：经验部分为去年的这段时间实战出来的，现遇到同样的问题发现需要重新排查，故重新整理后发布到博客以作备份梳理。

<!-- more -->

# 【转载】
感谢用户 hoochanlon 贡献的大部分技术支持，以下两篇重要的组成帖子《批处理设置IE主页、可信任级别安全页选项、兼容视图、防Edge劫持》，《【batch&powershell】解决IE相关网站兼容及显示、点击按钮无响应等问题方案》


## 批处理设置IE主页、可信任级别安全页选项、兼容视图、防Edge劫持
文章来源： https://www.52pojie.cn/thread-1765347-1-1.html

### 序
由于企业的日常办公及业务需要，基本上是离不开IE的。这些企业内网系统、政府及银行网站都需要在IE里进行特别设置，才能保证正常稳定运行。在企业有众多各有所长的人，不懂电脑的也是相当多的；有时候在同一时间段会有多个同事找你处理问题，问题虽说简单，但操作繁琐，也很耽误自己的时间。做过桌面或网管的朋友，应该是有过这方面体会的。

解决途径有两个：一、将设置集成在封装系统镜像；二、写批处理脚本分发。

这个脚本花了我两天多的时间，主要是参考IE信任站点的“自定义级别”配置特别多，逐条查看巨耗时。大概有百来条策略配置是涉及内网环境办公业务的，比如：是否启用 MIME 探查（内网下载文档类型识别）、是否允许javascript脚本（涉及到打印）、是否允许重定向，等等。其实跟配置Linux云主机毛坯房的感受是一样的。

代码编写所用到的各类工具
- 注册表工具：https://registry-finder.com
- 搜索工具：https://www.voidtools.com/zh-cn/
- 小鱼儿win11 IE修复工具：https://www.yrxitong.com/h-nd-963.html
- 代码调试平台：PD虚拟机+Windows11镜像、WIN7

核心参考站点
- [admx.help-Microsoft.Policies.InternetExplorer](https://admx.help/?Category=InternetExplorer&Policy=Microsoft.Policies.InternetExplorer::IZ_PolicyNotificationBarActiveXURLaction_9&Language=zh-cn)
- https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-gppref/c05dc3bf-dcfc-4f46-8be2-8a78e46875a7
脚本涉及到IE是三大板块，“兼容性视图设置”、“主页设置与防edge劫持”、“IE受信任的站点设置”。“提升特权与关闭UAC”是后面查资料加的，因为很多人包括我自己，用右键运行往往会有些别扭...双击再重复确认，对于我来说挺麻烦的。

### 编码调试过程中遇到的主要问题

双环境IE11测试
1. IE逐条添加IP可信任站点没问题，但无法删除（注册表可）；字母域名站点则一切正常。
2. 将IE配置策略应用到所有用户，在win11的IE上出现不能加入可信任站点的bug
3. IE被edge多次劫持；死锁主页更改，在win11的IE已经不合时宜了。

问题处理办法：
- 问题1；由于是企业内网环境，删不掉IP站点，影响不大。
- 问题2；注释了设置SECURITY_HKLM_ONLY键值的代码。
- 问题3；注释死锁主页代码；修改IEtoEdge项键值与IE第三方扩展项键值。

win7的IE11与win11 IE11的区别仅在于主页修改有GUI，其他各项基本上是一致的。


关于小鱼儿win11 IE修复工具，网上好评不错。请求管理员权限什么中规中矩，没有植入主页其他的注入信息。大家也可以用IDA、RH这类反编译工具来折腾折腾，也可以做后续深入研究。

### 附源码说明
代码特别长，是因为我看完了[admx.help -【安全页 受信任的站点区域】](https://admx.help/?Category=InternetExplorer&Policy=Microsoft.Policies.InternetExplorer::IZ_PolicyNotificationBarActiveXURLaction_5&Language=zh-cn)的所有项，根据我自己的内网环境做的考量设置，这也就是耗时两天多的原因。简单的话，可以只保留以下区域安全级别的设置，并关闭注释。

```bat
@rem 0 本地计算机区域；1 Intranet 内部网； 2 受信任的站点区域；3 Internet 外网域；4 受限制的站点区域

@REM 直接将可信任战点的安全级别调至最低
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "CurrentLevel" /t REG_DWORD /d 0x10000 /f 

@REM 直接将Intranet 内部网的安全级别调至最低
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1" /v "CurrentLevel" /t REG_DWORD /d 0x10000 /f 
```

注意要点：
- 使用git仓里的代码，记得转成GB2312格式。
- 使用时注意仔细看我对代码的注释说明。
- 脚本面向受众：网管、桌面、装机工程师等特殊人群使用，不适合普通大众用户使用。

https://github.com/hoochanlon/ihs-simple/blob/main/d-bat/saigonoie.bat

```bat
@REM ------------- 特权升级与关闭UAC---------------------------

@REM [csdn-让bat批处理以管理员权限运行的实现方法](https://blog.csdn.net/NeiHan2020/article/details/124982175)
@REM 让bat启动时，首先调用vbs脚本，通过vbs脚本，以管理员身份调用该bat的 runas 部分，最后顺便定位脚本当前执行环境（目录）

@ECHO off
%1 C:\Windows\SysWOW64\mshta.exe vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit
cd /d "%~dp0"

@REM 关闭UAC，重启生效
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v "EnableLUA" /t REG_DWORD /d 0 /f

@REM ----------- 兼容性视图 ----------------------------

@REM 将所有网站都加入兼容性视图。
@REM [cnblogs-注册表法修改IE8安全级别的方法](https://www.cnblogs.com/freeton/p/3675018.html)
@REM 在国内的环境，要求使用IE浏览器，索性全都统一设置成兼容视图吧
reg add "HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\BrowserEmulation" /v "AllSitesCompatibilityMode" /t REG_DWORD /d 1 /f

@REM -------- 主页设置与防劫持 --------------------------
@REM  最新的win11系统已经把IE的主页设置GUI移除了。

@REM 设置主页
reg add "HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\Main" /v "Start Page" /t REG_SZ /d www.baidu.com /f

@REM 防止主页不被恶意修改，原理：外来程序没有这么高的权限修改这一项。
@REM reg add "HKCU\Software\Policies\Microsoft\Internet Explorer\Control Panel" /v HomePage /d 1 /f >nul
@REM 该指令用于解除死锁！ >nul 不输入任何信息。
@REM reg delete "HKCU\Software\Policies\Microsoft\Internet Explorer\Control Panel" /v HomePage /f >nul

@REM 防止 edge 劫持 IE ，即IE默认启用第三方扩展。
@REM [[REG]「サード パーティ製のブラウザー拡張を許可する」をレジストリで設定する方法【IE11編】](https://automationlabo.com/wat/?p=4213)
reg add "HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\Main" /v "Enable Browser Extensions" /t REG_SZ /d "NO" /f

@REM 注册表修改，但不关闭IE默认启用第三方扩展。(最新版的win10/11系统还是得关掉IE默认启用的第三方扩展...双管齐下)
@REM https://techcommunity.microsoft.com/t5/enterprise/ie-to-edge-87-redirection-issues/m-p/1941961
reg add "HKCU\Software\Microsoft\Edge\IEToEdge" /v "UpsellDisabled" /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Edge\IEToEdge" /v "RedirectionMode" /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Edge\IEToEdge" /v "QuietExpirationTime" /t REG_QWORD /d 0 /f

@REM ------------- 加入可信任站点 -----------------

@REM /v参数后面是“http”，这意味着它将创建或修改名为“http”的键值对；/t 指定type /d  指定设置或修改的注册表项的值； /f 强制
@REM 由于 Ranges\Range100 都是数字，还要配置两次冗长的键值注册，个人感觉不如 ZoneMap\Domains 好管理。
@REM 添加网址并指定为可信任战点。0x00000002为2的十六进制。

@REM 这里会存在信任站点GUI界面删除不了IP站点的bug，即使用示例中的另一方法也是如此，所以最好设置为与IE浏览器相关的业务
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\192.168.0.1" /v http /t REG_DWORD /d 0x00000002 /f
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\192.168.0.2" /v http /t REG_DWORD /d 0x00000002 /f
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\192.168.0.3" /v https /t REG_DWORD /d 0x00000002 /f

@REM 有域名的网站倒是可以正常删除，IP的就只能用注册表删除了。
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\baidu.com\www" /v http /t REG_DWORD /d 0x00000002 /f
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\bing.com\www" /v https /t REG_DWORD /d 0x00000002 /f

@REM ----------------- IE受信任的站点设置，逐条解读---------------------------

@REM 直接将可信任战点的安全级别调至最低
@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "CurrentLevel" /t REG_DWORD /d 0x10000 /f 

@REM 直接将Intranet 内部网的安全级别调至最低
@REM 0 本地计算机区域；1 Intranet 内部网； 2 受信任的站点区域；3 Internet 外网域；4 受限制的站点区域。
@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1" /v "CurrentLevel" /t REG_DWORD /d 0x10000 /f 

@REM [51cto-使用域组策略设置IE受信任站点](https://blog.51cto.com/guozhengyuan/1393631)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "Flags" /t REG_DWORD /d 0x00047 /f

@REM 将IE配置策略应用到所有用户。 在win11的IE上出现不能加入可信任站点的bug
@REM https://www.itprotoday.com/compute-engines/jsi-tip-5130-how-can-i-manage-internet-explorer-security-zones-registry
@REM reg add "HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows\CurrentVersion\Internet Settings" /v SECURITY_HKLM_ONLY /t REG_DWORD /d 1 /f

@REM 各项配置及模版查阅：
:: https://admx.help/?Category=InternetExplorer&Policy=Microsoft.Policies.InternetExplorer::IZ_Policy_TurnOnProtectedMode_9&Language=zh-cn
:: https://admx.help/?Category=InternetExplorer&Policy=Microsoft.Policies.InternetExplorer::IZ_PolicyTrustedSitesZoneTemplate&Language=zh-cn

@REM 启用ActiveX 控件自动提示，0，启用；3，禁用。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2201" /t REG_DWORD /d 0 /f

@REM 0，启用；1，禁用；2，提示。启用 Java 小程序脚本 
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1402" /t REG_DWORD /d 0 /f

@REM 0，启用; 启用下载已签名的 ActiveX 控件 
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1001" /t REG_DWORD /d 0 /f

@REM 3，禁用；禁用下载未签名的 ActiveX 控件
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1004" /t REG_DWORD /d 1 /f

@REM 选项只能跟着文档走，可能是工程量太大了，所有数字选项不统一，比较凌乱。
@REM 继续.....

@REM 禁用仅允许经过批准的域在未经提示的情况下使用 ActiveX 控件
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "120B" /t REG_DWORD /d 0 /f

@REM 禁用使用弹出窗口阻止程序
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1809" /t REG_DWORD /d 3 /f

@REM 启用允许 Internet Explorer WebBrowser 控件的脚本
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1206" /t REG_DWORD /d 0 /f

@REM 启用允许 META REFRESH，允许重定向
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1608" /t REG_DWORD /d 0 /f

@REM 启用允许 Scriptlet，网页验证码用得着
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1209" /t REG_DWORD /d 0 /f

@REM 启用允许二进制文件和脚本行为
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2000" /t REG_DWORD /d 0 /f

@REM 允许加载 XAML 文件，提供了对动画和3D众多方面的支持。
:: [百度百科-XAML](https://baike.baidu.com/item/XAML/6123952?fr=aladdin)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2402" /t REG_DWORD /d 0 /f

@REM 启用允许加载 XAML 浏览器应用程序
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2400" /t REG_DWORD /d 0 /f

@REM 启用允许加载 XPS 文件
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2401" /t REG_DWORD /d 0 /f

@REM 启用允许在一个窗口中拖动不同域中的内容，**禁用**
@REM 防止员工，乱拖动导致错点选项。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2708" /t REG_DWORD /d 3 /f

@REM 启用允许在多个窗口之间拖动不同域中的内容，**禁用**
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2709" /t REG_DWORD /d 3 /f

@REM 允许在网页上使用旧媒体播放机播放视频和动画，**禁用**
@REM 防止员工看视频，摸鱼
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "120A" /t REG_DWORD /d 3 /f

@REM 允许字体下载
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1604" /t REG_DWORD /d 0 /f

@REM 允许安装桌面项目，它可以让用户将 Web 内容作为桌面背景 **提示** 。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1800" /t REG_DWORD /d 1 /f

@REM 允许拖放文件或复制/粘贴文件
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1802" /t REG_DWORD /d 0 /f

@REM 允许文件下载
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1803" /t REG_DWORD /d 0 /f

@REM 允许活动脚本；禁用则会阻止运行该区域中页面上的脚本代码。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1400" /t REG_DWORD /d 0 /f

@REM 允许由脚本启动的窗口，不受大小或位置限制 
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2102" /t REG_DWORD /d 0 /f

@REM 允许网站使用脚本窗口提示获得信息
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2105" /t REG_DWORD /d 0 /f

@REM 允许网站打开没有状态栏或地址栏的窗口
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2104" /t REG_DWORD /d 0 /f

@REM 允许通过受限制的协议的活动内容访问我的电脑，**提示** 
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2300" /t REG_DWORD /d 1 /f

@REM 允许通过脚本从剪贴板进行剪切、复制或粘贴操作
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1407" /t REG_DWORD /d 0 /f

@REM 允许通过脚本更新状态栏
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2103" /t REG_DWORD /d 0 /f

@REM 关闭 .NET Framework 安装程序， **禁用**
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2600" /t REG_DWORD /d 0 /f

@REM 关闭首次运行控件提示
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1208" /t REG_DWORD /d 0 /f

@REM 启用 MIME 探查，主要用来确认文件类型。
:: [Java获取文件的Mime类型的几种方式总结](https://backend.devrank.cn/traffic-information/7082116610194065421)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2100" /t REG_DWORD /d 0 /f

@REM 启用 SmartScreen 筛选器扫描，**禁用**
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2301" /t REG_DWORD /d 3 /f

@REM 禁用保护模式
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2500" /t REG_DWORD /d 3 /f

@REM 启用跨站点脚本筛选，**禁用**
@REM 允许跨站点脚本注入。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1409" /t REG_DWORD /d 3 /f

@REM 启用Internet Explorer 呈现旧版筛选器。做兼容的
:: https://learn.microsoft.com/en-us/archive/blogs/ie_cn/ie10-release-preview-dx
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "270B" /t REG_DWORD /d 0 /f

@REM 启用在IFRAME中启动应用程序和文件
@REM FRAME是HTML标签，作用是文档中的文档，或者浮动的框架(FRAME)。iframe元素会创建包含另外一个文档的内联框架（即行内框架）。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1804" /t REG_DWORD /d 0 /f

@REM 在不太严格的 Web 内容域中的网站可以导航到此区域，**提示**
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2101" /t REG_DWORD /d 1 /f

@REM 启用对可能不安全的文件显示安全警告
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1806" /t REG_DWORD /d 0 /f

@REM 启用对标记为可安全执行脚本的 ActiveX 控件执行脚本，无须用户干预即可自动进行脚本交互。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1405" /t REG_DWORD /d 0 /f

@REM 对没有标记为安全的 ActiveX 控件进行初始化和脚本运行，**提示**
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1201" /t REG_DWORD /d 1 /f

@REM 用户数据持久化
@REM 用户可以在浏览器历史记录、收藏夹、XML 存储或直接在保存到磁盘的网页中保存信息。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1606" /t REG_DWORD /d 0 /f

@REM 允许提交非加密表单数据
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1601" /t REG_DWORD /d 0 /f

@REM 启用文件下载的自动提示
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2200" /t REG_DWORD /d 0 /f

:: 显示混合内容，**提示** 安全(https://)和不安全内容(http://)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1609" /t REG_DWORD /d 1 /f

@REM 启用“没有证书或只有一个证书时不提示进行客户端证书选择”
@REM 对可信任站点，自动证书确认
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1A04" /t REG_DWORD /d 0 /f

@REM 用户通过 HTML 表单上载文件时发送路径信息。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "160A" /t REG_DWORD /d 0 /f

@REM 自动使用当前用户名和密码自动登录
@REM 网络上的smb文件共享
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1A00" /t REG_DWORD /d 0 /f

@REM 启用此策略设置，则 Internet Explorer 不会检查反恶意程序，以查看是否可安全创建 ActiveX 控件实例。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "270C" /t REG_DWORD /d 0 /f

@REM 用户可以跨域打开窗口和框架，并可以跨域访问应用程序。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1607" /t REG_DWORD /d 0 /f

@REM REG_DWORD 的默认进制是十六进制，它的数值可以用十进制、二进制方式来表示。
@REM 196608 十进制，软件频道权限，安全级 - 低 
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1E05" /t REG_DWORD /d 0x030000 /f

@REM 启用运行 ActiveX 控件和插件
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1200" /t REG_DWORD /d 0 /f

@REM 启用执行未签名的托管组件。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2004" /t REG_DWORD /d 0 /f
@REM 启用执行签名的托管组件。
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2001" /t REG_DWORD /d 0 /f

@REM 用户可以在区域中加载使用 MSXML 或 ADO 访问区域中其他站点数据的页面
@REM 内部数据库访问
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1406" /t REG_DWORD /d 0 /f

@REM Java 权限，安全级 - 低；196608 十进制
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1C00" /t REG_DWORD /d 0x030000 /f

@REM 保留字部分，如： Default1408Local、Default140ATrusted、Default1605Internet、Default2302Restricted

:: 起先查阅的资料:[csdn-修改注册表来修改IE的设置资料汇总](https://blog.csdn.net/wangqiulin123456/article/details/17068649)
:: 微软官方已将旧版的IE文档资料删除了，不过还是找到了蛛丝马迹。对比如下两个文档，可以发现其端倪。
:: 估摸着微软当时是想做些什么设置，然后在"受信任的站点区域模板"板块，对这些保留项做了别有意味的定义
:: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-gppref/c05dc3bf-dcfc-4f46-8be2-8a78e46875a7

@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "140A" /t REG_DWORD /d 0 /f
@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1605" /t REG_DWORD /d 0 /f
@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "1408" /t REG_DWORD /d 0 /f
@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" /v "2302" /t REG_DWORD /d 0 /f

@REM ------------ 兼容性视图示例。----------------
@REM %Temp% 是一个变量目录，双击winRAR的运行文件常保存在这
@REM  [新浪爱问知识达人-attrib -s -r -h是什么意思？](https://iask.sina.com.cn/b/3124185.html)
@REM  attrib更改单个文件或目录的属性，R只读属性 -R清除只读属性；H设置隐藏属性；S设置系统属性。
@REM  del /f：强制删除只读文件。/s：删除所有子目录中的指定的文件。/q：安静模式

@REM If exist "%Temp%\~import.reg" (
@REM  Attrib -R -S -H "%Temp%\~import.reg"
@REM  del /F /Q "%Temp%\~import.reg"
@REM If exist "%Temp%\~import.reg" (
@REM  Echo Could not delete file "%Temp%\~import.reg"
@REM  Pause
@REM )

@REM 从 Internet Explorer\BrowserEmulation\ClearableListData\UserFilter 导入注册表的用法。
@REM [IE浏览器兼容性视图设置数据解析](https://blog.csdn.net/thb_cn/article/details/125124565)
@REM 该文章虽说描述细致，但二进制、十六进制并不适合大多数人，故PASS
@REM 而且这样的做法，易导致IE 兼容性视图设置无法添加网站，提示“你输入了一个无效域”的错误
:: [cnblogs-IE 11兼容性视图设置无法添加网站，提示“你输入了一个无效域”](https://www.cnblogs.com/xiykj/p/13603024.html)

@REM > "%Temp%\~import.reg" ECHO Windows Registry Editor Version 5.00
@REM >> "%Temp%\~import.reg" ECHO.
@REM >> "%Temp%\~import.reg" ECHO [HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData]
@REM >> "%Temp%\~import.reg" ECHO "UserFilter"=hex:41,1f,00,00,53,08,ad,ba,01,00,00,00,36,00,00,00,01,00,00,00,\
@REM >> "%Temp%\~import.reg" ECHO   01,00,00,00,0c,00,00,00,d9,1c,6d,08,94,d9,d6,01,01,00,00,00,0c,00,31,00,39,\
@REM >> "%Temp%\~import.reg" ECHO   00,32,00,2e,00,31,00,36,00,38,00,2e,00,30,00,2e,00,33,00,33,00

@REM START /WAIT REGEDIT /S "%Temp%\~import.reg"
@REM DEL "%Temp%\~import.reg"

@REM ------- 加入可信任站点示例 ------------------------

@REM 可信任站点设置，改写成你自己需要设置的网址及地址 Range是分支范围的意思，每添加一个域名，Range1...2...3等等
@REM “:Range”是这个特定范围的名称。请注意，名称前面的冒号是必需的，虽然是字符串键值，但以示区分同名关系。
@REM REG_SZ 字符串类型；REG_DWORD 数值类型；将该项分支指定到受信任领域
@REM 0 本地计算机区域；1 Intranet 内部网； 2 受信任的站点区域；3 Internet 外网域；4 受限制的站点区域。

@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range100" /v ":Range" /t REG_SZ /d 192.168.0.11 /f 
@REM reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range100" /v "http" /t REG_DWORD /d 2 /f

@REM -----------写代码涉及到的工具---------------------

@REM 写好的批处理可以用 Bat To Exe Converter打包成exe文件
@REM Windows设置重要的参考网站：https://admx.help
@REM 注册表工具：https://registry-finder.com
@REM 搜索工具：https://www.voidtools.com/zh-cn/
@REM 小鱼儿win11 IE修复工具：https://www.yrxitong.com/h-nd-963.html

ECHO "已关闭UAC，重启电脑将生效。"
pause
```

### 参考资料
特权提升：[csdn-让bat批处理以管理员权限运行的实现方法](https://blog.csdn.net/NeiHan2020/article/details/124982175)

注册表导入写法考量：[zhangshilong.cn-电脑时间服务器怎么设置,系统时间未与ntp服务器同步](https://www.zhangshilong.cn/work/124450.html)

核心参考站点
- [admx.help-Microsoft.Policies.InternetExplorer](https://admx.help/?Category=InternetExplorer&Policy=Microsoft.Policies.InternetExplorer::IZ_PolicyNotificationBarActiveXURLaction_9&Language=zh-cn)
- https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-gppref/c05dc3bf-dcfc-4f46-8be2-8a78e46875a7

IE修改安全级别
- [itprotoday-jsi tip 5130 how can i manage internet explorer security zones registry（2002）](https://www.itprotoday.com/compute-engines/jsi-tip-5130-how-can-i-manage-internet-explorer-security-zones-registry)
- [修改注册表来修改IE的设置---资料汇总（2013）](https://blog.csdn.net/wangqiulin123456/article/details/17068649)
- [cnblogs-注册表法修改IE8安全级别的方法（2014）](https://www.cnblogs.com/freeton/p/3675018.html)
- [51cto-使用域组策略设置IE受信任站点（2014）](https://blog.51cto.com/guozhengyuan/1393631)

IE重定向问题
- [techcommunity.microsoft.com-IE to Edge 87+ redirection issues](https://techcommunity.microsoft.com/t5/enterprise/ie-to-edge-87-redirection-issues/m-p/1941961)
- [Windows 自動化技術大全-【REG】「サード パーティ製のブラウザー拡張を許可する」をレジストリで設定する方法【IE11編】](https://automationlabo.com/wat/?p=4213)

IE兼容性视图
- [csdn-IE浏览器兼容性视图设置数据解析](https://blog.csdn.net/thb_cn/article/details/125124565)
- [cnblogs-IE 11兼容性视图设置无法添加网站，提示“你输入了一个无效域”](https://www.cnblogs.com/xiykj/p/13603024.html)

编码中途的学习了解过程
- [新浪爱问知识达人-attrib -s -r -h是什么意思？](https://iask.sina.com.cn/b/3124185.html)
- https://learn.microsoft.com/en-us/archive/blogs/ie_cn/ie10-release-preview-dx （兼容旧版IE）
- [Java获取文件的Mime类型的几种方式总结](https://backend.devrank.cn/traffic-information/7082116610194065421)（确认网载文件类型）
- [百度百科-XAML](https://baike.baidu.com/item/XAML/6123952?fr=aladdin) （支持动画等特效用的）

## 【batch&powershell】解决IE相关网站兼容及显示、点击按钮无响应等问题方案

### 前言

- 起因：财务无法点击登录进入保险网站做业务。
- 解决办法：运行保险网站提供的脚本。
- 产生的想法：
1. 利用保险网站提供的现成脚本，改写成适合公司内部自己用的IE站点设置脚本
2. 由此，必须根据网站地址，推测出兼容视图的hex。

这样的话，自己就能用现成脚本，结合相关的配置兼容视图站点代码，轻松应付很多IE站点出现的异常问题了。

### IE兼容性视图hex值测试

通过[chaoyuew - Windows Powershell进阶(43) 注册表操作之IE兼容性视图](https://chaoyuew.gitee.io/WPS-43-Advanced-Modifying-IE-Compatibility-View-Settings-with-Powershell.html)提供的源码，计算出网址的hex，通过如下指令植入注册表，添加兼容性视图站点是成立的。

```bat
reg add "HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData" /v "UserFilter" /t REG_BINARY /d 
```

![](https://cdn.jsdelivr.net/gh/hoochanlon/scripts/AQUICK/catch2023-08-04%2020.29.31.png)

加入多个站点测试

![](https://cdn.jsdelivr.net/gh/hoochanlon/scripts/AQUICK/catch2023-08-04%2020.48.25.png)

### hex值需求分析
随时备着一份代码太麻烦了，要是能在线输入网址，并返回相应的hex结果就不错。或者

`irm https://ghproxy.com/https://raw.githubusercontent.com/hoochanlon/scripts/main/d-pwsh/clac_ie_clearablelistdata_hex.ps1|iex`

![](https://cdn.jsdelivr.net/gh/hoochanlon/scripts/AQUICK/catch2023-08-04%2021.50.10.png)

### 附源码
**生成兼容视图代码+hex值配套**
对[chaoyuew - Windows Powershell进阶(43) 注册表操作之IE兼容性视图](https://chaoyuew.gitee.io/WPS-43-Advanced-Modifying-IE-Compatibility-View-Settings-with-Powershell.html)进行适应性改写，效果如上图。

代码地址：https://github.com/hoochanlon/scripts/blob/main/d-pwsh/clac_ie_clearablelistdata_hex.ps1

```bat
# 使用说明
# 下载到本地使用，需转成 GB2312 编码，否则中文乱码
Function Get-WebsiteHex(){
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$True)]
        [string]$website
    )

    # 去除网址中的 https:// 和 http:// 前缀
    $website = $website -replace "https?://", ""

    # 去除斜杠后的所有内容
    $website = $website -replace "/.*"

    # 计算网站名称的十六进制长度
    $hex_length = [BitConverter]::ToString([BitConverter]::GetBytes([int16]$website.length)).replace('-','')
    # 将网站名称转换为十六进制数据
    $hex_data = ([System.Text.Encoding]::Unicode.GetBytes($website) | ForEach-Object { "{0:X2}" -f $_ }) -join ""
    return "0C000000000000000000000101000000$hex_length$hex_data"
}

Function Get-IECompatibilityViewHexHeader(){
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$True)]
        [string[]]$websites
    )

    # 构建 IE 兼容性视图的头部
    return ("411F00005308ADBA{0}FFFFFFFF01000000{0}" -f ([BitConverter]::ToString([BitConverter]::GetBytes([int32]$websites.count)).replace('-','')))
}

Function Get-IECVHex(){
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$True)]
        [string]$websites,
        [switch]$ReturnBytes
    )

    # 获取每个网站的十六进制表示，并将它们连接起来
    $siteArray = $websites -split "[, ]" | Where-Object { $_.Trim() -ne '' }
    $hex_website = $siteArray | ForEach-Object { Get-WebsiteHex $_ }
    $hex_result = ("411F00005308ADBA{0}FFFFFFFF01000000{0}$hex_website" -f [BitConverter]::ToString([BitConverter]::GetBytes([int32]$siteArray.count)).replace('-','')) -replace " "

    if( $ReturnBytes ){
        # 如果传入了 "-ReturnBytes" 开关，则返回字节数组
        [byte[]]$bytes = @()
        for( $n=0; $n -lt $hex_result.length; $n += 2 ){
            $bytes += ([Convert]::ToInt64($hex_result.substring($n,2),16))
        }
        return $bytes
    }else{
        # 否则，返回十六进制字符串
        return $hex_result
    }
}

Write-Host ""
$websites = Read-Host "请输入想要IE兼容视图的网址"
# 从用户输入中获取网址并调用 Get-IECVHex 函数
Write-Host "`n 所有相关网址的hex值已生成，复制如下指令即可： `n"
Write-Host 'reg add "HKCU\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData" /v "UserFilter" /t REG_BINARY /d ' -NoNewline
Get-IECVHex -websites $websites

# 参考链接：
# * [Windows Powershell进阶(43) 注册表操作之IE兼容性视图](https://chaoyuew.gitee.io/WPS-43-Advanced-Modifying-IE-Compatibility-View-Settings-with-Powershell.html)
# * [Jeff's Blog - MODIFYING IE COMPATIBILITY VIEW SETTINGS WITH POWERSHELL](http://jeffgraves.me/2014/02/19/modifying-ie-compatibility-view-settings-with-powershell/)
# * [csdn - IE浏览器兼容性视图设置数据解析](https://blog.csdn.net/thb_cn/article/details/125124565)
```

**IE兼容及显示、点击按钮无响应等问题处理**
代码已去掉对保险官网的信任站点、兼容视图设置，方便自定义。

代码地址：https://github.com/hoochanlon/scripts/blob/main/d-bat/ie_web_setting_demo.bat

```bat
@SETLOCAL ENABLEDELAYEDEXPANSION

@ECHO OFF

@CLS

@ECHO ON

@ECHO 开始进行IE浏览器运行环境设置.......

@ECHO.&&ECHO.

@echo 设置IE8版本以上兼容性视图中显示所有网站

@rem 关于网站对应的hex值，情配合 clac_ie_clearablelistdata_hex.ps1 使用，这个例子是B站的hex值。
@reg add "HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData" /v UserFilter /t REG_BINARY /f /d 411F00005308ADBA01000000FFFFFFFF01000000010000000C00000000000000000000010100000010007700770077002E00620069006C006900620069006C0069002E0063006F006D00

@ECHO 正在添加受信任列表......（）

@reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\baidu.com\www" /v http /t REG_DWORD /d 0x00000002 /f
@reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\10.10.10.1" /v http /t REG_DWORD /d 0x00000002 /f
@reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\192.168.1.1" /v http /t REG_DWORD /d 0x00000002 /f
@reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\192.168.1.2" /v http /t REG_DWORD /d 0x00000002 /f

@ECHO.&&ECHO 正在进行受信站点ActiveX权限设置......

@set RegPath=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1
@SET RegPath1=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2
@SET RegPath2=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3

@REG ADD "%RegPath%" /V DisplayName /T REG_SZ /D "本地 Intranet" /F

@REG ADD "%RegPath%" /V Description /T REG_SZ /D "该区域中包含您公司 Intranet 上的所有网站。" /F

@echo 本地 Intranet区域设置

@REG ADD "%RegPath%" /V CurrentLevel /T REG_DWORD /D 0X0 /F

@REG add "%regpath%" /v "1001" /t reg_dword /d 0x00000001 /f
@REG add "%regpath%" /v "1004" /t reg_dword /d 0x00000001 /f
@reg add "%regpath%" /v "1200" /d "0" /t REG_DWORD /f
@REG add "%regpath%" /v "120B" /t reg_dword /d 0x00000003 /f
@REG add "%regpath%" /v "1201" /t reg_dword /d 0x00000001 /f
@reg add "%regpath%" /v "1208" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /v "1209" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /v "1400" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /v "1402" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /v "1407" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /v "1405" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /v "1609" /d "0" /t REG_DWORD /f
@REG add "%regpath%" /v "1804" /t reg_dword /d 0x00000001 /f
@REG add "%regpath%" /v "1809" /t reg_dword /d 0x00000000 /f
@reg add "%regpath%" /v "2300" /d "0" /t REG_DWORD /f
@reg add "%regpath%" /V "2201" /d "0" /t REG_DWORD /f

@echo 受信任的站点区域

@REG ADD "%RegPath1%" /V CurrentLevel /T REG_DWORD /D 0X0 /F
@REG add "%regpath1%" /v "1001" /t reg_dword /d 0x00000001 /f
@REG add "%regpath1%" /v "1004" /t reg_dword /d 0x00000001 /f
@reg add "%regpath1%" /v "1200" /d "0" /t REG_DWORD /f
@REG add "%regpath1%" /v "120B" /t reg_dword /d 0x00000003 /f
@REG add "%regpath1%" /v "1201" /t reg_dword /d 0x00000001 /f
@reg add "%regpath1%" /v "1208" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /v "1209" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /v "1400" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /v "1402" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /v "1405" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /v "1407" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /v "1609" /d "0" /t REG_DWORD /f
@REG add "%regpath1%" /v "1804" /t reg_dword /d 0x00000001 /f
@REG add "%regpath1%" /v "1809" /t reg_dword /d 0x00000000 /f
@reg add "%regpath1%" /v "2300" /d "0" /t REG_DWORD /f
@reg add "%regpath1%" /V "2201" /d "0" /t REG_DWORD /f

@echo Internet 区域设置
@REG ADD "%RegPath2%" /V CurrentLevel /T REG_DWORD /D 0X0 /F
@REG add "%regpath2%" /v "1001" /t reg_dword /d 0x00000001 /f
@REG add "%regpath2%" /v "1004" /t reg_dword /d 0x00000001 /f
@reg add "%regpath2%" /v "1200" /d "0" /t REG_DWORD /f
@REG add "%regpath2%" /v "1201" /t reg_dword /d 0x00000001 /f
@reg add "%regpath2%" /v "1208" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /v "1209" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /v "1400" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /v "1402" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /v "1405" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /v "1407" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /v "1609" /d "0" /t REG_DWORD /f
@REG add "%regpath2%" /v "1804" /t reg_dword /d 0x00000001 /f
@REG add "%regpath2%" /v "1809" /t reg_dword /d 0x00000000 /f
@reg add "%regpath2%" /v "2300" /d "0" /t REG_DWORD /f
@reg add "%regpath2%" /V "2201" /d "0" /t REG_DWORD /f

@REG ADD "%RegPath%" /V Description /T REG_SZ /D "该区域中包含所有未放在其他区域中的网站" /F

@REG ADD "%RegPath%4" /V DisplayName /T REG_SZ /D "受限站点" /F

@REG ADD "%RegPath%4" /V Description /T REG_SZ /D "该区域中包含可能会损坏您的计算机或数据的网站。"" /F

@ECHO ActiveX权限设置完成

@echo. && @echo 去掉IE弹窗提醒...
@reg add "HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\New Windows" /v "PopupMgr" /d "0" /t REG_DWORD /f

@ECHO.&&ECHO 正在重启IE浏览器，请稍等......

::TASKKILL /IM iexplore.exe /T /F

@TASKKILL /IM iexplore.exe /F

@PING 127.0.0.1 -4 -n 5 >nul

@ECHO.&&ECHO.&&@ECHO IE使用环境配置完成。

@PING 127.0.0.1 -4 -n 5 >nul

EXIT
```

### 参考资料
- [Windows Powershell进阶(43) 注册表操作之IE兼容性视图](https://chaoyuew.gitee.io/WPS-43-Advanced-Modifying-IE-Compatibility-View-Settings-with-Powershell.html)
- [Jeff's Blog - MODIFYING IE COMPATIBILITY VIEW SETTINGS WITH POWERSHELL](http://jeffgraves.me/2014/02/19/modifying-ie-compatibility-view-settings-with-powershell/)
- [csdn - IE浏览器兼容性视图设置数据解析](https://blog.csdn.net/thb_cn/article/details/125124565)

# 个人实战总结

## 核心的两个问题

个人在维护的客户主要为内网系统，故上文中的部分联网脚本不在实战的范围内，所以问题主要为两点：
- IE兼容性视图
- IE可信站点

由于大部分的业务系统均为IE设计，且设计老旧，很多系统设计停留在ie9甚至更老的版本中，故新windows系统中带的标准ie某些老函数已经无法使用，个人测试发现win10LTSC企业版的ie11（或win10专业版启动企业模式的ie11）兼容性视图下表现最佳。

IE的可信站点其实并不需要过多设置，因为IE浏览器“受信任的站点”自定义级别中“重置自定义设置”自带“中（默认值）”“中低”“低”这三个预设，我们只需要重置到“低”即可。

## 源码脚本

通过上两篇文章以及核心的两个问题，提炼出关键的批处理脚本就两部分：

- 第一是上文中提到的IE兼容性视图生成脚本： clac_ie_clearablelistdata_hex.ps1
- 第二即可信站点添加


源码解析：（注意，以下源码中涉及的地址均为示例，使用中请替换成实际地址）

```bat
:: 在IE11可信站点的存储地址用数组表示，统一存放在`HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap` 中

:: 用 `Ranges\RangeXXX`存储的为纯IP网址，其中XXX为用户可自定义的任意数组号码，每项数组不可重复即可。
:: 加入http的值将访问地址确认为非https进行访问（部分业务系统无https）

:: 示例：
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range101" /v http /t REG_DWORD /d 2 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range101" /v :Range /t REG_SZ /d 100.*.*.* /f

REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range10" /v http /t REG_DWORD /d 2 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range10" /v :Range /t REG_SZ /d 100.64.0.2 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range11" /v http /t REG_DWORD /d 2 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range11" /v :Range /t REG_SZ /d 100.64.0.3 /f

:: 用 `Domains\xxxxx` 存储的为域名地址
:: 注册表组名即为域名地址，并加入http和https的值用于接受可信范围。

:: 示例：
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\baidu.com\www" /v http /t REG_DWORD /d 0x00000002 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\10.10.10.*" /v http /t REG_DWORD /d 0x00000002 /f

REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\xxxxx.xx.xa" /v http /t REG_DWORD /d 0x00000002 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\xxxxx.xx.xa\*" /v http /t REG_DWORD /d 0x00000002 /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\xxxxx.xx.xa\*" /v https /t REG_DWORD /d 0x00000002 /f
```

ie11对可信站点的注册表存储地址和老版本IE是不同的，故如果你是从老IE版本升级过来的，部分配置内容在迁移的过程中会产生错误或冲突，所以使用自动配置脚本之前请先清除之前的配置内容，这边也提供相应的脚本：

```bat
::IE兼容性视图配置清空（IE8以上）
reg delete "HKCU\Software\Microsoft\Internet Explorer\BrowserEmulation\ClearableListData" /v "UserFilter" /f

::IE可信站点地址清空（IE8以上）
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges" /f
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains" /f
```
