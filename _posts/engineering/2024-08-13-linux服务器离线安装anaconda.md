---
title: linux服务器离线安装anaconda
author: X
date: 2024-08-13 15:06:31 +0800
categories: [engineering]
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

## 步骤4 配置内网源

如果没有.condarc文件，需要先使用下面命令生成默认配置文件

```
source ~/.bashrc
conda config --set show_channel_urls yes
```

*亲测，可以不这样写，直接`vim ./.condarc`然后把下面的内容粘进去也是完全可以的哈~*

将.condarc中内容修改为

##### 黄区

```
# channels:
#   - defaults
channel_priority: strict
show_channel_urls: true
channel_alias: http://10.244.173.8:8088/repository/conda-proxy
default_channels:
  - main
```

也可以试试下面这个

```
channel_alias: http://10.155.196.240:8088/repository/conda-proxy
default_channels:
  - main
  - r
```

##### 绿区

```
# channels:
#   - defaults
channel_priority: strict
show_channel_urls: true
channel_alias: http://10.155.97.225:8088/repository/conda-proxy
default_channels:
  - main
```

一些小技巧是可以先ping一下，比如`ping 10.155.97.225`，如果能通，那一般这个配置就是好用的。ping都ping不通的话，建议在w3找找有没有其他ip。

**随后就可以愉快的使用了**

参考文档：
[linux conda安装、配置源 - 潘志的博客 (huawei.com)](https://3ms.huawei.com/km/blogs/details/13349249)
[新Linux机器食用方法\_pip与conda配置\_pycharm远程连接配置\_yum配置\_gcc安装与升级 - AI特性与推理服务部 - 3MS知识管理社区 (huawei.com)](https://3ms.huawei.com/km/groups/3773717/blogs/details/15307199)
一些操作借鉴的miniconda的官方文档：[Miniconda — Anaconda documentation](https://docs.anaconda.com/miniconda/)
