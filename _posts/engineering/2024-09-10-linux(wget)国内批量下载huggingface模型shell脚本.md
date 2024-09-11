---
title: linux(wget)国内批量下载huggingface模型shell脚本
author: X
date: 2024-09-10 14:16:41 +0800
categories:
  - engineering
  - linux
tags:
  - shell脚本
  - 黑科技
---
# 更新

发现有别人写好的更好用的脚本，功能完善，支持多种下载方式，且多线程。
[CLI-Tool for download Huggingface models an](https://gist.github.com/padeoe/697678ab8e528b85a2a7bddafea1fa4f "CLI-Tool for download Huggingface models and datasets with aria2/wget+git")
国内支持：将脚本44行的`HF_ENDPOINT=${HF_ENDPOINT:-"https://huggingface.co"}`变更为`HF_ENDPOINT=${HF_ENDPOINT:-"https://hf-mirror.com"}`即可。

其余使用方法详见教程。

# 原笔记
今天这个笔记是绝对的常用，因为是shell脚本，理论上不是huggingface的下载链接也可以用，可以说相当实用了（笔者在不同的公司写了三次这个脚本，要是早点写笔记就不用这样了，冷抖泪）

实现批量下载+自动重命名文件，不需要自己一个一个对着链接重命名啦，比市面上的都快捷。原理很简单，是自动提取url最后一个"/"后的字段，然后根据`?`拆成两部分，只取第一部分，这样就把原链接中的查询字段等多余字段去除，提取正确的文件名。

使用方式：
1. 创建一个txt文档，将你需要下载的文件url一行一个粘贴进去
2. 把这个脚本拖到下载目标文件夹下
3. 目标文件夹下执行`bash yourscriptname.sh`
4. 命令行填入之前创建的txt文件名
5. 回车执行即可，日志会记录在`download_log.txt`，如果命令行没有输出就去日志里看一下

```shell
#!/bin/bash
# 请确保该脚本有执行权限，可以通过chmod +x scriptname.sh赋予
echo "请输入urltxt路径:"
read filepath

# 指定日志文件
log_file="download_log.txt"

# 清空或创建日志文件
> "$log_file"

while read -r url; do
    # 提取URL中最后一个'/'之后的内容，再按'?'分割取第一部分作为文件名
    filename=$(echo "${url##*/}" | cut -d '?' -f 1)
    # 检查文件是否已存在
    if [ -e "$filename" ]; then
        echo "文件'$filename'已存在，跳过下载。" >> "$log_file"
        continue
    fi
    # 使用wget下载资源并重命名，同时记录日志
    wget --tries=3 --timeout=30 --no-clobber -nv -O "$filename" "$url" 2>> "$log_file"
    if [ $? -eq 0 ]; then
        echo "下载完成并已重命名为: $filename" >> "$log_file"
    else
        echo "下载'$url'失败，请检查URL是否正确或网络连接是否正常。" >> "$log_file"
    fi
done < "$filepath"

echo "下载任务已完成，详细情况请查看$log_file"
```

hf国内镜像站：https://hf-mirror.com/

本脚本下一轮迭代计划：
实现解析hf-url自动创建文件夹，例如https://hf-mirror.com/Qwen/Qwen2-VL-7B-Instruct/resolve/main/README.md?download=true，实现自动创建`Qwen2-VL-7B-Instruct/resolve/main/`文件夹并下载至该路径。