---
title: linux服务器离线安装anaconda
author: X
date: 2024-08-13 15:06:31 +0800
categories: [engineering, linux]
tags: [Linux,environment]
---

## 步骤1 下载anaconda.sh至本地

下载地址：[Index of / (anaconda.com)](https://repo.anaconda.com/archive/)
服务器版本查看：`uname -a`
下载相应版本的sh文件到本地

## 步骤2 上传sh文件至指定服务器

这个不多说了，xftp自己传一下

## 步骤3 静音安装

强调静音安装，是因为常规安装指定会需要不断按回车和输入yes认证，用我的办法可以规避这种麻烦。

```bash
mkdir -p ~/anaconda3
bash ~/yourpath/anaconda.sh -b -u -p ~/anaconda3
rm -rf ~/yourpath/anaconda.sh
```

注意这里bash指令结尾的`~/anaconda3`是安装路径，没写好的话会一大坨装错地方，linux没有撤回，很难受。
不过执行后控制台会打印perfix参数，这个对应的就是安装路径，快速检查一下对不对，如果错了直接ctrl+C停掉也来得及。
装完删除安装包，删不删见仁见智，不是必须的。
然后这时候应该还是调不出conda，初始化一下：

```bash
~/anaconda3/bin/conda init bash
~/anaconda3/bin/conda init zsh
```

控制台会提醒你重启会话，你可以重启也可以刷一下`.bashrc`：

```bash
source ~/.bashrc
```

这时候会发现已经在conda里了。


**随后就可以愉快的使用了**

参考文档：
一些操作借鉴的miniconda的官方文档：[Miniconda — Anaconda documentation](https://docs.anaconda.com/miniconda/)
