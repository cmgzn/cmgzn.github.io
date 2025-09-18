---
title: Elasticsearch远程docker部署
author: X
date: 2024-10-15 14:27:40 +0800
categories:
  - engineering
  - 数据库
tags:
  - Elasticsearch
  - docker
  - linux
---
# 从Docker安装Elasticsearch

[官方教程](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)

按步骤走就可以。需要注意，创建容器时需要调整一下自己需要的设置，示例提供的设置需要https验证，以及开启了试用，只想用基础版的可以取消。最后多方调试，苯人用的设置如下：

```bash
sudo docker run -p 9200:9200 -p 9300:9300 -d --name es01 --network elastic \
  -e ELASTIC_PASSWORD=$ELASTIC_PASSWORD \
  -e "discovery.type=single-node" \
  -e "xpack.security.http.ssl.enabled=false" \
  -e "xpack.license.self_generated.type=basic" \
  docker.elastic.co/elasticsearch/elasticsearch:8.15.2
```

这种方法下密码可以通过环境变量自己指定，并且关掉了https验证以及试用版。REST API测试：

```bash
curl -u elastic:$ELASTIC_PASSWORD http://localhost:9200
```

利用vscode转发端口到本地，本地也可以顺畅联通。

表面看起来很简单，实际为了找到合适的设置，笔者遭老罪了^v^...