---
title: Windows-7-update
date: 2024-05-29
tags:
  - seed
---
# 介绍
Windows7目前微软已经停止了有关它的一切更新，接下来会介绍一些相关的细节。
## SP1
如果你的win7没有获得SP1，除了安装带SP1版的win7系统，你还可以通过更新包来升级你的win7系统： 转到 Microsoft 网站上的 [Windows 7 Service Pack 1 下载页面](https://www.catalog.update.microsoft.com/Search.aspx?q=KB976932) 。[来源](https://support.microsoft.com/zh-cn/windows/%E5%AE%89%E8%A3%85-windows-7-service-pack-1-sp1-b3da2c0f-cdb6-0572-8596-bab972897f61)。
注意：里面包含x32位和x64位。升级包的大小为：32位	541.9 MB，64位	912.4 MB。

## SHA-2代码签名补丁
即使你已经是通过SP1版win7官方镜像安装的，你会遇到“SHA-2代码签名”补丁缺失导致的如“火绒”不能安装。
如果要打上该补丁，你可以选择两种方案：
1. 火绒官方的 “火绒安全-SHA-2代码签名补丁修复工具”，[下载](https://down5.huorong.cn/tools/sha256_fix.exe)。
2. 微软官网下载补丁： [KB4474419](https://www.catalog.update.microsoft.com/Search.aspx?q=KB4474419)、
[KB4490628](https://www.catalog.update.microsoft.com/Search.aspx?q=KB4490628)

火绒备注： [1](https://huorong.cn/service/support/fqa/personal-edition-faq/installation-and-uninstallation-problems/file), [2](https://huorong.cn/service/support/fqa/common-problem-1/rests/special-problem)

## UpdatePack7R2

作者： https://blog.simplix.info/updatepack7r2/

### 使用方法

在命令行运行时跟随命令参数：
- 键 /Reboot 用于在需要时自动重启。
- 键 /S 用于完全静默安装，无窗口和消息。大小写敏感。
- 键 /Silent 用于被动安装——可见进度，但安装完全自动。
- 键 /Temp= 允许设置临时工作目录。它不必为空，但必须存在。
- 键 /NoSpace 允许跳过检查系统分区的可用空间，不建议使用。
- 键 /FixOn 开启 Meltdown 和 Spectre 的保护，而 /FixOff 则关闭它。没有键的情况下，Win7 的保护是关闭的，Win2008R2 的保护是开启的。

### 附加功能

- 如果系统尚未安装 SP1，可以自动安装。为此，需要将 Windows6.1-KB976932-X86.exe 和 Windows6.1-KB976932-X64.exe 文件与更新包放在同一目录下。
- 如果更新包附近有 UpdatePack7R2Start.cmd，它将在安装更新之前执行；UpdatePack7R2Finish.cmd 将在安装之后执行；UpdatePack7R2Wim.cmd 将在集成更新之后执行。默认情况下将显示控制台窗口。若要隐藏它们，cmd 文件的第一行应以“:hide”（不带引号）开头。更新包会跟踪 cmd 文件的退出代码，以备需要重启的情况。该代码为 3010（exit 3010 命令）。
- 支持安装和集成插件：[SmartFix](https://smartfix.pro/)、[DirectX](https://www.wincert.net/forum/index.php?/topic/12622-microsoft-directx-end-user-runtimes-june-2010)、[.NET Framework](https://github.com/abbodi1406/dotNetFx4xW7A/releases)、[Visual C++](https://gitlab.com/stdout12/adns/-/releases)。插件文件应放置在与 UpdatePack7R2 相同的文件夹中。
