---
title: 记一次离奇的linux-ssh登录bug
author: X
date: 2024-09-12 17:16:10 +0800
categories:
  - debug
  - linux
tags:
  - linux
  - ssh
---
遇到了一个脑瘫错误，查了半天查到一样的问题

[sudo su command not working su: failed to execute root: No such file or directory](https://askubuntu.com/questions/1404304/sudo-su-command-not-working-su-failed-to-execute-root-no-such-file-or-director)

目前已根据文档中提到的方法解决，即修改`/etc/passwd`文件中的`root:x:0:0:root:/root:root`。当然，在我的问题里，这个错误行是`root:x:0:0:root:/root:myusername`

具体是什么原因引起的已经不可追溯了，推测与我想修改新用户的shell时执行的一些操作有关，例如`chsh`相关操作。

实际上这个问题并不是我在切换用户时发现的，而是连接ssh时突然连不上了，报错belike：

```
[16:40:45.445] Got some output, clearing connection timeout
[16:40:45.642] > root@xxxhost: Permission denied (publickey).
[16:40:45.663] > 过程试图写入的管道不存在。
```

还好此时我还有一个vscode窗口是连着这个服务器的root账号的，真是吓出一身冷汗，立刻开始搜索办法。结果当然是五花八门，笔者大量使用`sudoedit /etc/ssh/sshd_config`来修改ssh设定，依旧没有任何用处，期间还检查了`.ssh`下的公钥，也都是正确的。

所以说debug是非常看运气的，主要这个环节的报错是**Permission denied (publickey)**，可以说相当具有迷惑性了，想到切换用户也只是病急乱投医地碰运气，思路是回溯出错环节->之前设置新用户相关时，发现切换用户需要密码，因此重设了root密码->想着再切换一次用户（这个思路是多么离奇，正常来说是完全无用的行为）->发现切不回去了->发现事情真相……

是的，聪明的你已经发现了，最终错因与重设root密码这一操作完全没有关系，这就是debug的魅力，即毫无方法论，除非你有很强的知识储备。然而知识不就是在无数次没头脑的debug中学习的吗？

另，补充修改系统文件的命令：
```bash
sudo nano /etc/passwd
```
或：
```bash
sudoedit /etc/passwd
```

编辑完成后，`ctrl+X`保存退出。

有时修改前也要注意备份，养成好习惯：
```bash
sudo cp /etc/passwd /etc/passwd.bak
```