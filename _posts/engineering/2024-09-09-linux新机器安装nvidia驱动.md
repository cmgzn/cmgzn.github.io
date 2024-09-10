---
title: linux新机器安装nvidia驱动
author: X
date: 2024-09-09 09:45:21 +0800
categories:
  - engineering
  - linux
tags:
  - linux
  - environment
---
昨天搞的，有点记不清具体细节了。
首先查看显卡型号：
```shell
lspci | grep -i nvidia
```

在以下网页找到对应的显卡
https://www.nvidia.com/en-us/drivers/
> 加载可能很慢，稍等一会儿会出现选项

我是T4，找到的最新驱动来自这里：
https://www.nvidia.cn/drivers/details/231206/

右键复制下载链接后，wget下载即可。
下载后发现是`.deb`文件，这个有点和我事先看好的教程不太一样，教程里写的是`.run`文件的安装。所以这里费了点功夫，最后参考的是天翼云的教程：
https://www.ctyun.cn/document/10027724/10256137

很管用，很详细，点赞。

略微不同之处是，我没有执行apt-key那一条语句，是直接执行了dpkg后，跳出了提示，让我用cp语句完成类似操作。这两者应该是等价的。但建议使用我的方式，因为天翼云提供的apt-key中使用的路径是适配天翼云的，而你自己dpkg后得到的提示是基于你自己的机子，那个路径才是正确的。