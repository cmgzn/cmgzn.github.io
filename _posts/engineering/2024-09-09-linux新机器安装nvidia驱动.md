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
[Ubuntu操作系统安装Nvidia GPU驱动](https://www.ctyun.cn/document/10027724/10256137)

很管用，很详细，点赞。

句句解释：


在 Ubuntu 20.04 系统上安装 NVIDIA 显卡驱动程序和 CUDA 驱动程序的命令。
1. `dpkg -i /root/nvidia-driver-local-repo-ubuntu2004-470.129.06_1.0-1_amd64.deb`
   - 这行命令使用 `dpkg` 工具安装了一个名为 `nvidia-driver-local-repo-ubuntu2004-470.129.06_1.0-1_amd64.deb` 的 Debian 软件包。这个软件包是 NVIDIA 官方提供的本地存储库,用于安装 NVIDIA 显卡驱动程序。

2. `apt-key --keyring /usr/share/keyrings/nvidia-driver-local-D9CB5EF8-keyring.gpg add /var/nvidia-driver-local-repo-ubuntu2004-470.129.06/D9CB5EF8.pub`
   - 这行命令将 NVIDIA 本地存储库的 GPG 密钥添加到 Ubuntu 系统的受信任密钥列表中,以确保从该存储库安装的软件包能够被正确验证。

3. `apt-get update`
   - 这行命令更新 Ubuntu 系统的软件包索引,以获取最新的软件包信息。

4. `apt-get install -y cuda-drivers`
   - 这行命令从 NVIDIA 本地存储库安装 CUDA 驱动程序。`-y` 参数表示自动回答 "Yes" 以确认安装。

5. `apt-get purge -y nvidia-driver-local-repo-ubuntu2004-470.129.06`
   - 这行命令删除之前安装的 NVIDIA 本地存储库软件包。`purge` 参数表示不仅删除软件包本身,还删除所有相关的配置文件。

6. `apt-key --keyring /usr/share/keyrings/nvidia-driver-local-D9CB5EF8-keyring.gpg del D9CB5EF8`
   - 这行命令从 Ubuntu 系统的受信任密钥列表中删除之前添加的 NVIDIA 本地存储库的 GPG 密钥。

7. `rm -vf /etc/apt/preferences.d/nvidia`
   - 这行命令删除一个可能存在的名为 `nvidia` 的文件,该文件可能会影响 NVIDIA 软件包的安装优先级。`-v` 参数表示显示详细的输出信息,`-f` 参数表示强制删除,即使该文件不存在也不会报错。

总的来说,这段代码的目的是在 Ubuntu 20.04 系统上安装 NVIDIA 显卡驱动程序和 CUDA 驱动程序,并在安装完成后清理相关的临时文件和密钥。这些步骤通常是在配置 NVIDIA GPU 加速环境时需要执行的操作。

略微不同之处是，我没有执行apt-key那一条语句，是直接执行了dpkg后，跳出了提示，让我用cp语句完成类似操作。这两者应该是等价的。但建议使用我的方式，因为天翼云提供的apt-key中使用的路径是适配天翼云的，而你自己dpkg后得到的提示是基于你自己的机子，那个路径才是正确的。