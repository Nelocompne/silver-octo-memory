---
title: 虚拟PDF打印机clawPDF实践
date: 2024-03-07
tags:
  - trade
---

## 准备

- [clawsoftware/clawPDF: Open Source Virtual (Network) Printer for Windows that allows you to create PDFs, OCR text, and print images, with advanced features usually available only in enterprise solutions. (github.com)](https://github.com/clawsoftware/clawPDF)
## 安装

1. 安装clawPDF
2. clawPDF虚拟打印机配置设置
	1. 打开“clawPDF”虚拟打印机选项设置，“高级”，“文档选项”-“PostScript选项”-“镜像输出：是”。
3. clawPDF配置及打印
	1. 始菜单找到“clawPDF”，“文件参数设置”：
	2. 保存：转换后使用标准查看器打开，关闭，在批处理任务下避免重复打开。
	3. 自动保存：启用自动保存，开启，在批处理任务下避免手动保存。
	4. 动作：打印文件，开启，将输出的处理自动跳转到打印流程。

打印时，选择“clawPDF”虚拟打印机进行打印，之后再从打印机选项中选择实际打印机打印。

- 优点：Windows多版本集成，开源，集成GhostScript。
- 缺点：打印处理本质为将输出的PDF文件进行打印，如文档内容复杂度高，面对性能较慢的机器需要花费更多时间。

## 常见问题

如遇到无法安装clawPDF，请安装微软vc++运行库后重试。
