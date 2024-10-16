---
title: Elasticsearch之一百种你不得不记的RESTful api
author: X
date: 2024-10-16 14:41:44 +0800
categories:
  - engineering
  - 数据库
tags:
  - Elasticsearch
  - curl
---
1. 删除索引`curl -XDELETE "http://localhost:9200/your_index_name?pretty"
2. 查看索引列表`curl -X GET "http://localhost:9200/_cat/indices?v"
`
`