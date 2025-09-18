---
title: 免费且私密的联网搜索组件duckduckgo
author: X
date: 2024-09-05 15:51:05 +0800
categories:
  - engineering
  - pool
tags:
  - 黑科技
---
# 背景
玩agentscope（开源）的react_agent，试用其service板块的toolkit功能，在其中add一个联网搜索的插件，但其提供的联网插件都需要api-key，就想着用一个免费的。我记得是有一些，但忘了叫什么，一番搜索后最后引入了这个（不是我一开始记忆里的某个s开头的免费api），这准确来说是一个逆向封装后的包（信源：[用duckduckgo的搜索API免费给大模型接入联网功能，让普通模型也能实现类似new bing的效果](https://linux.do/t/topic/122537)），确实比较方便好用，看论坛说对网络有要求（可能是不能没有梯子，这方面没有测试），但个人使用感受是非常舒服快捷的。

# 使用方法
pypi包：
[duckduckgo-search](https://pypi.org/project/duckduckgo-search/#2-text---text-search-by-duckduckgocom)

github库：
[duckduckgo_search](https://github.com/deedy5/duckduckgo_search)

目前用的就是`DDGS().text('test', max_results=1)`，返回的格式是：

```
[{'title': 'Stardew Valley 中文维基', 'href': 'https://zh.stardewvalleywiki.com/Stardew_Valley_Wiki', 'body': '星露谷物语是一个牧场类的rpg游戏。你继承了爷爷在星露谷的农场，但是你手头上只有最基础的农具和少许的金钱
，你得靠此开始你的新生活。你能把这片杂草丛生的田地变成一个繁荣的家园吗？这很不容易，自从joja公司来到了小镇
，以前的生活都变了。'}]
```