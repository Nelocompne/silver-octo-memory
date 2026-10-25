---
title: Git快速配置
date: 2024-06-14
tags:
  - seed
---
## 配置Git

https://aka.ms/vscode-setup-git -->>
   https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup

```shell
$ git config --global user.name "John Doe" # Your Identity
$ git config --global user.email johndoe@example.com

$ git config user.name #Checking Your Settings
John Doe
```

## git depth 1

克隆代码仓库深度 depth 为 1，即最近一次的提交版本。后续的 git pull 也将维持只获取最近的版本。用来避免因仓库历史记录过大而占用大量存储空间。

```bash
git clone --depth 1 $<git.url>
```

