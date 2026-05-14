---
title: 不太安全但管用的docker非root用户权限问题
author: X
date: 2024-10-18 15:21:13 +0800
categories:
  - debug
tags:
  - environment
  - docker
---
```
sudo chmod 666 /var/run/docker.sock
```

比较粗暴但是省时间。

我个人认为调整docker组也可以，而且更可控。但~whatever，简单就可以

[参考链接](https://www.digitalocean.com/community/questions/how-to-fix-docker-got-permission-denied-while-trying-to-connect-to-the-docker-daemon-socket)

[官网解决方案](https://docs.docker.com/engine/install/linux-postinstall/)