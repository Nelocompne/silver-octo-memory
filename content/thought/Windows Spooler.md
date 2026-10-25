---
title: Windows Spooler
date: 2024-11-05
tags:
  - seed
---
# 介绍

有时候在系统打印机管理下会发现无法彻底删除打印机，删除刷新后又出现了。可以尝试重启`Spooler`服务并清理缓存。
# 操作

- 命令操作关闭服务，或手动在任务管理器中关闭服务。 `net stop spooler`
- 进入该目录 `C:\Windows\System32\spool\PRINTERS` 删除里面的所有文件。
- 启动Spooler服务，恢复打印机服务。 `net start spooler`
