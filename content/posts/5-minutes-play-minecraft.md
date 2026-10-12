---
title: 5分钟快速启动《Minecraft》
date: 2025-03-24
tags:
  - 成果
---
# 介绍
该文章介绍了Minecraft游玩需要的JAVA版本以及其他更多的相关配置规则。

# 正版

你当然离线版也能玩到游戏的所有内容，但是很多服务器要正版才能加入。国内访问MC官网他会告诉你去玩网易代理授权的免费版，而且国内官网你也买不了。所以推荐就是去微软商店登录你的微软帐号，**然后商店里搜索“Minecraft”购买**，基岩版和java版一起89元。然后正版登录的时候使用微软帐号即可。已经购买后，去MC官网登录帐号可以修改你的玩家ID和上传玩家皮肤。

# JAVA版本

最低Java版本要求
先贴一个来自Minecraft Wiki的Minecraft对Java的运行标准：（https://zh.minecraft.wiki/w/Java%E7%89%88）

从1.12（17w13a）开始，运行Minecraft的最低要求是Java 8。

从1.17（21w19a）开始，运行Minecraft的最低要求是Java 16。

从1.18（1.18-pre2）开始，运行Minecraft的最低要求是Java 17。

从1.20.5（24w14a）开始，运行Minecraft的最低要求是Java 21，且操作系统要求为64位。

> 作者：北葵Starry https://www.bilibili.com/read/cv35088159/ 出处：bilibili

## JAVA二进制选择

除了甲骨文，你有三种JAVA（openjdk）选择：  
adoptium - https://adoptium.net/zh-CN/  
bellsoft - https://bell-sw.com/  
Microsoft - https://www.microsoft.com/openjdk  

三种都可，但是在大陆网络，推荐选择Microsoft版本，这样就能享受到最快的下载体验，让你即使在酒店WIFI也能爽下java。

# 选择你的MC启动器（客户端）

- 国人比较熟知的启动器，如[HMCL](https://hmcl.huangyuhui.net/)，很优秀，开源，但是考虑到启动它你还需要有javafx，但是openjdk是不带这个的，然后HMCL就会开始在你电脑里拉屎以放下javafx。这边提供javafx的下载：https://gluonhq.com/products/javafx/ ，以及加载方式参考代码：https://github.com/Nelocompne/ahkproject/blob/master/without_javafx/without_javafx.ahk 。然后如果HMCL发现你运行mc版本用的java不对或者没有找到java，也会开始拉屎下载java。综合以上我不考虑HMCL。

- 其次就是[PCL2](https://ifdian.net/a/LTcat)，启动器本身终于摆脱了java，基于微软标准程序构建，但是不跨平台也不开源，以及多多少少也会拉屎，所以也不太推荐。

- [BAkaXL](https://www.bakaxl.com/)，颜值还行，基于微软.NET(dotnet)平台编写，（笔者吐槽：作者前一两年还打算也跨平台来着，还打算用Rust写，但是作者对跨平台框架实在不了解，甚至对Linux桌面环境这件事也完全不熟悉， ~~有点像高校老师教C语言给你用谭浩强的教材~~ ，甚至觉得“跨平台是项不太合理达成的任务”，可是要我说，当时有不少用.NET跨平台框架做的好例子比比皆是。）bakaxl一开始也开源的，后来作者放弃了，所以基于上述我也不太推荐。

- 我个人推荐[Prism Launcher](https://prismlauncher.org/)，国内基本上没什么人介绍过，不会java拉屎，QT框架编写，开源跨平台，唯一的问题默认不支持盗版账户（离线账户），你要添加离线账户得先添加正版账户 ~~（什么？）~~ ，不过也能解决：https://github.com/antunnitraj/Prism-Launcher-PolyMC-Offline-Bypass ，做法就是在Prism Launcher客户端目录下创建一个`accounts.json`文件，内容为：
```json
{"accounts": [{"entitlement": {"canPlayMinecraft": true,"ownsMinecraft": true},"type": "MSA"}],"formatVersion": 3}
```
这样就绕过了要先添加正版账户的步骤。不过该方法可能需要电脑安装Xbox应用（微软应用商店可下）才可实现。

- 还有个启动器： https://github.com/antunnitraj/OfflineMinecraftLauncher ，一种离线账户直接MC启动器，问题就是——完全的拉屎，从java到mc游戏资源直接拉屎到你电脑上， ~~纯粹的懒狗或者不是你自己的电脑可以这么干~~ 。

# 模组加载器，MOD资源，光源材质包选择。

材质包，模组加载器，mod下载，光源包，光影安装这几个东西就放到一起介绍。

如果是几年前，模组加载器你基本上就只能选择Forge，要光影你只能选择optifine（高清修复）。但是现在是2024年兄弟，你有大把选择：Fabric、Quilt、NeoForge，光影甚至不用选择那个不开源且老套的optifine，[mc百科](https://www.mcmod.cn)里搜“元素周期表”~~（大草）~~，“元素周期表”是代称，代指那些能代替高清修复的工作且开源的模组。以下有模组介绍。

## 光影方面

|     | Fabric       | NeoForge        | Forge       |     |     |     |     |     |
| --- | ------------ | --------------- | ----------- | --- | --- | --- | --- | --- |
| 前置  | Sodium       | Sodium          | Rubidium    |     |     |     |     |     |
|     |              | Rubidium        |             |     |     |     |     |     |
| 光影  | Iris Shaders | Iris Shaders    | Optifine    |     |     |     |     |     |
|     |              |                 | Oculus      |     |     |     |     |     |
| 优化  | Lithium      | Radium Reforged | Lithium     |     |     |     |     |     |
|     | Indium       |                 |             |     |     |     |     |     |
|     | Krypton      |                 |             |     |     |     |     |     |
|     | FerriteCore  | FerriteCore     | FerriteCore |     |     |     |     |     |
|     |              |                 |             |     |     |     |     |     |

根据不同版本自己选择组合。

## 光影包和材质包

国内MC-NEO光影站，全国首个全授权光影站： https://www.mcneo.cn/  
MGC中文图形站： https://minegraph.cn/

## 动态光源和矿物发光

默认大多数的光影包设置和优化都会开启动态光源，只不过矿物发光确实需要自己根据光影包进行设置，或者补丁 *Euphoria Patcher* 。

## 优化

这种有很多模组，比如优化FPS，现代优化 *ModernFix* ，还有超远视距 *Distant Horizons* 。

# 结束

这一套下来基本上就可以完成一套携带模组光影材质包的客户端了。值得注意的是，虽然国内有大量的懒人包、整合包，但是玩家必须要清楚一点，*MOJANG* 不允许别人将他们的游戏本体进行二次分发（包括魔改和破解的游戏客户端和服务端）。所以你哪怕清楚很多人都这样做，但请你知道这样是不对的。

# 移动端平台

你可能想要移动端平台的MC体验，在最近的更新中你可以体验来自 [PojavLauncher](https://github.com/PojavLauncherTeam/PojavLauncher) 的国产分支 [ZalithLauncher](https://github.com/ZalithLauncher/ZalithLauncher) 。这是给移动端的MC启动器，下载器，管理器。
