---
title: ssh-keygen自定义密钥名称
author: X
date: 2024-10-24 10:50:11 +0800
categories:
  - engineering
tags:
  - ssh
---
是的，使用 `ssh-keygen` 生成 SSH 密钥时，你可以自定义生成的私钥和公钥的名称。

### 自定义密钥名称的步骤

在运行 `ssh-keygen` 时，可以使用 `-f` 选项来指定密钥的文件名。

以下是一个示例命令：

```bash
ssh-keygen -t rsa -C "your_email@example.com" -f ~/.ssh/custom_key_name
```

### 解释命令参数：

- `-t rsa`：指定密钥类型为 RSA。
- `-C "your_email@example.com"`：添加备注或标签，通常使用你的邮箱，以便在密钥标识中清楚区分。
- `-f ~/.ssh/custom_key_name`：指定密钥文件的名称和路径。在这个例子中，将生成 `~/.ssh/custom_key_name`（私钥）和 `~/.ssh/custom_key_name.pub`（公钥）。

### 生成密钥之后的步骤

生成密钥后，你会在指定的位置找到生成的私钥和公钥文件。确保私钥文件的权限设置为只有用户可读（例如，使用 `chmod 600`）。

### 例子

以下是完整的示例流程：

```bash
ssh-keygen -t rsa -C "your_email@example.com" -f ~/.ssh/my_custom_key
```

然后，私钥文件为 `~/.ssh/my_custom_key`，公钥文件为 `~/.ssh/my_custom_key.pub`。

### 小结

通过使用 `-f` 选项，你可以自定义 SSH 密钥的名称。生成后，请妥善管理和保护你的私钥。如果有任何其他问题，请随时问我！