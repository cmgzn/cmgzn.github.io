---
title: linux安装全局可用的conda
author: X
date: 2024-09-13 14:12:06 +0800
categories:
  - engineering
  - environment
tags:
  - linux
---
# 参考链接
- [Linux为所有用户安装Miniconda](https://www.cnblogs.com/steinven/p/16190464.html "发布于 2022-04-25 15:35")
- [Linux创建用户并赋予Root权限](https://www.cnblogs.com/binyue/p/4702179.html "发布于 2014-10-12 15:38")

# 步骤

## 创建新用户并设置root权限
使用root账号创建新用户：
```bash
useradd newuser -m -g root -s /bin/bash
```
设置新用户密码：
```bash
passwd newuser
```
编辑sudoer文件：
```bash
nano /etc/sudoers
```

- 找到`root    ALL=(ALL:ALL) ALL`，在该行下添加`newuser    ALL=(ALL:ALL)NOPASSWD:ALL`
- `crtl+X`后`Y`后回车，保存退出

`su newuser`切换至新用户，可以执行一些sudo任务看看是否有了权限。

## 安装全局可用的conda

> 以下操作在新用户中实行

导航至`/opt`文件夹。或者`/usr`（该选项未经测试）
创建conda文件夹（以miniconda为例）：
```bash
sudo mkdir -p ./miniconda3
```
变更文件夹权限为所有人可读写
```bash
sudo chmod 777 miniconda3/
```
下载miniconda安装文件
```bash
 wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ./miniconda3/miniconda.sh
```
安装
```bash
bash ./miniconda3/miniconda.sh -b -u -p ./miniconda3
```
初始化
```bash
./miniconda3/bin/conda init bash
```
此时是在新用户中完成了初始化。如果其他用户想要使用，登录账号后导航到`/opt`文件夹执行同样的命令即可。

重新启动终端，你会发现已经进入了conda的base环境。