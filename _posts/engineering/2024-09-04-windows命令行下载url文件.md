---
title: Windows命令行下载URL文件
author: X
date: 2024-09-04 13:42:04 +0800
categories: [engineering]
tags: [windows]
---

# 参考文档

最终使用的是这个方法：[windows系统自带cmd命令下载文件(类似linux的wget下载文件)](https://blog.csdn.net/u012910342/article/details/116278306)

一开始看的：[windows命令行远程下载文件的五种方法](https://www.cnblogs.com/cute-puli/p/14859208.html)

里面记录的方法，我用了方法一和方法二两种，用方法二的时候弄错了，没有写`-o`导致报错；写了还是报错，估计是权限问题，因为改到最终方法（powershell）就可以了。

# 脚本

最后为了方便使用，写了脚本。

```bash
chcp 65001
@echo off
setlocal enabledelayedexpansion

:: 获取脚本所在路径
set "scriptPath=%~dp0"

:: 提示用户输入URL
set /p "userUrl=请输入URL: "

:: 从URL中提取文件路径

for /f "tokens=1 delims=?" %%a in ("!userUrl!") do (
    set "filePath=%%a"
    set "repoPath=%%a"
)
for /f "tokens=3,* delims=/" %%a in ("%repoPath%") do (
    set "repoPath=%%b"
)

for %%i in ("%repoPath%") do set DIRECTORY=%%~dpi

for /f "tokens=6,* delims=/" %%a in ("%filePath%") do (
    set "filePath=%%b"
)

echo 文件路径：!DIRECTORY!
echo filepath: %filePath%

:: 生成保存的完整路径
set "savePath=!DIRECTORY!%filePath%"

:: 创建目录（如果不存在的话）
mkdir "!DIRECTORY!" >nul 2>&1

:: 使用certutil工具下载文件
powershell curl "%userUrl%" -o "%savePath%"

echo 文件已下载到: %savePath%
pause
```
脚本中，首先获取脚本所在路径，然后提示用户输入URL，并从URL中提取文件路径。接着，使用powershell的curl命令下载文件，并将下载的文件保存到指定的路径。最后，打印下载完成的信息，并暂停脚本。

一个比较重要的部分是`chcp 65001`，这条命令用于设置当前代码页为UTF-8编码，防止中文乱码。