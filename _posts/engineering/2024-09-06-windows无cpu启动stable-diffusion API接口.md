---
title: windows无cpu启动stable-diffusion-webui
author: X
date: 2024-09-06 10:27:50 +0800
categories:
  - engineering
  - win
tags:
  - SD
  - 模型部署
---
# 参考文档
[【奶奶看了也不会】AI绘画 Mac安装stable-diffusion-webui绘制AI妹子保姆级教程](https://zhuanlan.zhihu.com/p/609620596)
[新手向，Stable Diffusion API 接口，在本地调用](https://blog.csdn.net/qq_36645932/article/details/130183786)

# 写在前面
本文关于sd-webui的cpu部署部分，是基于参考文档的windows版修正，前半部分操作一致，但由于咱们算是开发人员，因此过于小白的步骤在此一带而过了，原文写得已经很详细。

# CPU部署

## 准备工作

- Python3.10.6版本（已安装其他版本也不要紧，X使用的就是3.11）
- stable-diffusion-webui代码下载，下载地址：[https://github.com/AUTOMATIC1111/stable-diffusion-webui](https://link.zhihu.com/?target=https%3A//github.com/AUTOMATIC1111/stable-diffusion-webui)

## 安装

### 依赖安装

1. conda环境创建，此处不赘述
2. 启动环境，从github上把stable-diffusion-webui的[源代码](https://zhida.zhihu.com/search?q=%E6%BA%90%E4%BB%A3%E7%A0%81&zhida_source=entity&is_preview=1)下载下来，进入到stable-diffusion-webui目录下，执行↓
```bash
 pip install -r requirements_versions.txt
```

### 模型安装（下载）

所谓模型安装其实就是下载到指定文件夹。

**官方模型下载（checkpoint模型）**

下载地址：[https://huggingface.co/CompVis/stable-diffusion-v-1-4-original](https://link.zhihu.com/?target=https%3A//huggingface.co/CompVis/stable-diffusion-v-1-4-original)

下载 `sd-v1-4.ckpt` 或者 `[sd-v1-4-full-ema.ckpt](https://zhida.zhihu.com/search?q=sd-v1-4-full-ema.ckpt&zhida_source=entity&is_preview=1)`。

**LoRA模型**

下载地址：[https://civitai.com/models/6424](https://link.zhihu.com/?target=https%3A//civitai.com/models/6424/chilloutmix)

- 对于**checkpoint模型**，请移动到`stable-diffusion-webui/models/Stable-diffusion`⽬录下
- 对于**LoRA模型**，请移动到`stable-diffusion-webui/models/Lora`目录下（没有就自己新建一个）
- 其他模型按对应的类型移到对应的目录下

## 运行项目（与原文有所不同）

### **修改lanuch.py文件**

在原文件开头添加：
```python
import os
os.environ["no_proxy"] = "localhost,127.0.0.1,::1"
```

这个是在本身使用代理服务的基础上修改代理设置，否则会报错：
```bash
ValueError: When localhost is not accessible, a shareable link must be created. Please set share=True or check your proxy settings to allow access to localhost.
```

如果没挂代理，忽略这个设置也没问题。

>参考文档：[ ValueError: When localhost is not accessible, a shareable link must be created. Please set share=True.](https://github.com/chenfei-wu/TaskMatrix/issues/250)

### **运行项目**

stable diffusion在windows部署（CPU版）
```bash
python launch.py --skip-torch-cuda-test --no-half --api
```

这里面前两个启动参数，都测试过了，没有就会报错启动不了。最后一个`--api`，不确定如果没有的话会不会影响api调用，估计会吧！

# API接口

与参考文档基本一致，区别是，使用代理的情况下，同样需要添加`no_proxy`环境变量，最终的调用demo如下：

```python
import os
import io
import base64
from PIL import Image

os.environ["no_proxy"] = "localhost,127.0.0.1,::1"
  
import requests
  
url = "http://127.0.0.1:7860"
  
payload = {"prompt": "puppy dog", "steps": 5}
  
response = requests.post(url=f"{url}/sdapi/v1/txt2img", json=payload)
  
if response.status_code == 200:
    r = response.json()

    for i in r["images"]:
        image = Image.open(io.BytesIO(base64.b64decode(i.split(",", 1)[0])))
        image.save("output.png")
else:
    print(response.status_code, response.reason)
    print("response.text:", response.text)
```

跑了一下，效果还是蛮可以的，半分钟一张图。