---
title: docker-ubuntu安装教程
author: X
date: 2024-10-15 14:27:40 +0800
categories:
  - engineering
tags:
  - docker
  - linux
---
# 安装docker
没什么好说的，国内参考这个：

[如何在 Ubuntu 22.04 LTS 中安装 Docker 和 Docker Compose](https://www.cnblogs.com/carmi/p/17939025)

中间因为试了其他方法，出了一些冲突，去`etc/apt`下面挨个翻一遍，把docker相关全删了，重新跑一下。

省流：

## 1. 更新ubuntu
```bash
sudo apt update
sudo apt upgrade
sudo apt full-upgrade
```

这里因为之前装nvidia驱动时乱搞，多装了一个版本，所以也出错了，照例循着报错去`etc/apt`把不对的依赖删了就行了。删之前检查一下确定是不用的驱动版本。

## 2. 添加Docker库

首先，安装必要的证书并允许 apt 包管理器使用以下命令通过 HTTPS 使用存储库：

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
```

然后，运行下列命令添加 Docker 的官方 GPG 密钥：

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

添加 Docker 官方库：

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

使用命令更新 Ubuntu 源列表：

```bash
sudo apt update
```

## 3. 安装 Docker

这里只摘取安装最新版本的方法：

运行下列命令在 Ubuntu 22.04 LTS 服务器中安装最新 Docker CE：

```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

手动选择版本的方法看原文。

安装完成后，运行如下命令验证 Docker 服务是否在运行：

```bash
sudo systemctl status docker
```

如果没有运行，运行以下命令运行 Docker 服务：

```bash
sudo systemctl start docker
```

使 Docker 服务在每次重启时自动启动：

```bash
sudo systemctl enable docker
```

可以使用以下命令查看已安装的 Docker 版本：

```bash
sudo docker version
```

## 4. 测试docker

原文有点小错误，实际是运行：

```bash
sudo docker run hello-world
```

上述命令会下载一个 Docker 测试镜像，并在容器内执行一个 “hello_world” 样例程序。

这里不出意外会有网络问题，参考[docker国内镜像源配置及走代理设置](https://blog.csdn.net/Lichen0196/article/details/137355517)设置一下：

`/etc/docker/daemon.json`处，没有的话自行创建。

```bash
sudo vim  /etc/docker/daemon.json
```

填写：
```json
{
    "registry-mirrors": [
        "https://registry.docker-cn.com",
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com",
        "https://ccr.ccs.tencentyun.com"
    ]
}
```

重启docker，注意由于走的是守护程序daemon，所以daemon进程也需要重启。

```bash
sudo systemctl daemon-reload		#重启daemon进程
sudo systemctl restart docker		#重启docker
```

最后验证：
```bash
docker info
```

检查info里面是否包含：
```plain
 Registry Mirrors:
  https://docker.mirrors.ustc.edu.cn/
  http://hub-mirror.c.163.com/
  https://mirror.ccs.tencentyun.com/
  https://registry.docker-cn.com/
```