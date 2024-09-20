---
title: obsidian ios多平台同步超完美方案
author: X
date: 2024-09-20 15:37:38 +0800
categories:
  - 磨刀
  - obsidian
tags:
  - 笔记管理
---
最近高强度使用obsidian，有时候一些备忘的check box也想在obsidian写，于是就捣鼓着想把仓库同步到移动端（ios）。

看了很多云盘备份方案，其实都没有github丝滑，最重要的是免费+通用，若无必要，勿增实体，一个新事物的引入，与原有事物的耦合性不佳，它几乎只能解决当前问题的话，那笔者是不会优先考虑TA的！所以github就是最佳方案！

另一方面，根据笔者的知识储备，觉得移动端使用git命令不应该很困难！果然就找到了，这个博主写的非常好，完美解决问题。

[obsidian git ios 多平台同步](https://cason.work/2023/04/20/obsidian-git-ios-%E5%A4%9A%E5%B9%B3%E5%8F%B0%E5%90%8C%E6%AD%A5/)

省流版：
1. 下一个`iSH Shell`（免费且界面蛮舒服的）
2. 打开ISH执行以下命令
    
    1. 安装git
	```bash
	apk add git
	```
    2. 用于在当前用户的主目录下创建一个名为 “obsidian” 的新文件夹
	```bash
	cd ~ && mkdir obsidian
	```
    3. 执行以下命令会打开手机文件管理器，之后需要选中本地的obsidian文件夹，点击完成。这样就让obsidian软件中的math文件夹，装载到ish上的obsidian文件夹内 ，之后对于obsidian软件内math文件的修改，iSH上也同步修改
	```bash
	mount -t ios . obsidian
	```

关键操作其实就是第三步这句，有效联通了本地文件夹和ish文件夹。明白这一点，之后利用github做其他软件的多端同步也不是问题。

当时打开ish我还在想怎么找本地路径，原来是直接挂载上去，方便~太方便了~

关于linux的mount指令，可以看这个大佬的，写得很详细：

[Linux mount命令详解](https://zh-liang-cn.github.io/2014/05/23/linux-mount-command/)
