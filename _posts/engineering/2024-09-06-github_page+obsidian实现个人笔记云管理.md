---
title: github_page+obsidian实现个人笔记云管理
author: X
date: 2024-09-06 09:30:30 +0800
categories:
  - engineering
  - pool
tags:
  - 笔记管理
---
# 背景
如题所示。

我的个人主页Use the [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) theme for [Jekyll](https://jekyllrb.com/)，这套github page的部署方式有个问题，是写的文档必须以`YYYY-MM-DD-title`的格式命名，具体是`Jekyll`的限制还是`Chirpy`的限制我也不清楚。

此外，文档开头也需要一组"---"包围的文档属性说明，形式如下：

![文档属性说明](assets/img/Dingtalk_20240906094335.jpg)

这显然很麻烦，很快想到了用脚本或模板形式来快速创建符合格式的md文档。不想自己从头造轮子，马上想到的是利用vscode的活动模板，跟着下面这个教程做的：

[vscode中设置markdown的活动模板](https://blog.csdn.net/qq_45522541/article/details/114033756)

结合LLM，成功搞出了快速模板：

```json
{

    // Place your snippets for markdown here. Each snippet is defined under a snippet name and has a prefix, body and

    // description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:

    // $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the

    // same ids are connected.

    // Example:

    // "Print to console": {

    //  "prefix": "log",

    //  "body": [

    //      "console.log('$1');",

    //      "$2"

    //  ],

    //  "description": "Log output to console"

    // }

    "Insert Current Date": {

        "prefix": "title",

        "body": [

            "---",

            "title:",

            "author: X",

            "date: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE} ${CURRENT_HOUR}:${CURRENT_MINUTE}:${CURRENT_SECOND} +0800",

            "categories: []",

            "tags: []",

            "---"

        ],

        "description": "Insert current date in Markdown format"

    }  

}
```

上面的大段注释是原本就带的，很有参考价值（指提供给LLM后，LLM能够写出符合格式的内容），这里的`prefix`字段实际上是触发活动模板的，类似你打下`main`后会触发`if __name__ == '__main__'`的模板。经过以上设置后，在markdown打下`title`，就会触发`body`中默认的内容，一行一行显示。

聪明的你发现了，这样只解决了文档属性的问题，标题呢？难道真的要写脚本来处理？

那么就到了今天的主题：obsidian + github_page

# 使用方式

利用obsidian的日记模板：

1. 使用obsidian打开你的github_page文件夹
2. 设置->核心插件->日记->日期格式，这实际上是每次新建日记时的默认文件名，这里文件名就是YYYY-MM-DD，所以不用调了
3. 与上一步同页，把新建日记存放位置改到`_post`里。我目前使用的方案是在`_post`下新建一个文件夹专门用来存放“日记”（其实是新笔记），写完笔记后把笔记转移到相应的其他文件夹下。obsidian新建日记的机制是，如果你在日记路径下已经有了一个名为当天日期的md文档，那点击日记只会跳转到该文档；如果你改了名字（例如在原标题上添加了实际笔记标题，如2024-09-06-今日笔记），那点击日记就会再新建一个日记（新的笔记模板），可以说非常方便了。
4. 新建一个模板文档，date栏填写`{{date}} {{time:HH:mm:ss}} +0800`，这是符合obsidian格式的写法。这个模板路径显然是填到上一步同页的“日记模板位置”里。

有些需要注意的点是，在obsidian中，文件属性不是以前文所看到的形式显示的，而是：

![](assets/img/Dingtalk_20240906103403.jpg)

在你填写完categories和tags之后呢，实际也并不是原先手写时的`[tag1, tag2]`形式，而是：

![](assets/img/Dingtalk_20240906103705.jpg)
但并不影响部署发布，`Jekyll`还是可以完美识别的。

自此，你可以在obsidian中丝滑创作笔记，推送库可以利用第三方插件`Git`，实现笔记全流程都在同一平台管理。你也可以继续使用obsidian的内部链接功能，只不过发布后不再是链接，只会保留标题名称。