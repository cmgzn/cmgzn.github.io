---
title: transformers.Trainer中wandb的关闭
author: X
date: 2024-08-13 09:06:31 +0800
categories:
  - engineering
  - LLM
tags:
  - 黑科技
  - 模型训练
  - transformers
---

# wandb关闭

## 背景

```
[INFO|integration_utils.py:750] 2024-07-08 16:22:45,186 >> Automatic Weights & Biases logging enabled, to disable set os.environ["WANDB_DISABLED"] = "true"
wandb: WARNING The `run_name` is currently set to the same value as `TrainingArguments.output_dir`. If this was not intended, please specify a different run name by setting the `TrainingArguments.run_name` parameter.
wandb: Network error (SSLError), entering retry loop.
wandb: W&B API key is configured. Use `wandb login --relogin` to force relogin
wandb: Network error (SSLError), entering retry loop.
wandb: ERROR Run initialization has timed out after 90.0 sec.
wandb: ERROR Please refer to the documentation for additional information: https://docs.wandb.ai/guides/track/tracking-faq#initstarterror-error-communicating-with-wandb-process-
```

使用transformers.Trainer过程中，wandb连不上，想着直接关了算了。

## 1. 在Python代码中设置路径

在代码最前面写：

```python
import os
os.environ["WANDB_DISABLED"]="true"
```

这样做的缺点是会报警告信息：

```
Using the `WANDB_DISABLED` environment variable is deprecated and will be removed in v5. Use the --report_to flag to control the integrations used for logging results (for instance --report_to none).
```

另外，使用模型训练pipeline时，一般也不会想要进到已成型的脚本里再做改动，这种思路总感觉怪怪的，缺乏可拓展性和稳定性。

## 2. 在TrainingArguments中设置入参

在TrainingArguments的入参中设置`report_to="none"`（事实上这也是第一种方法警告信息中推荐的方案）。

```
report_to: none
```

实践中往往在yaml文件中找到train参数的位置，贴上去即可。
此处还尝试过改成`report_to: tensorboard`，结果tensorboard也没打开：

```
File "/home/ma-user/anaconda3/envs/chatglm/lib/python3.10/site-packages/transformers/trainer_callback.py", line 421, in add_callback
    cb = callback() if isinstance(callback, type) else callback
  File "/home/ma-user/anaconda3/envs/chatglm/lib/python3.10/site-packages/transformers/integrations/integration_utils.py", line 603, in __init__
    raise RuntimeError(
RuntimeError: TensorBoardCallback requires tensorboard to be installed. Either update your PyTorch version or install tensorboardX.
```

直接`none`解千愁得了。

## 参考资料

- [How to turn WanDB off in trainer? - #9 by mspinaci - Beginners - Hugging Face Forums](https://discuss.huggingface.co/t/how-to-turn-wandb-off-in-trainer/6237/9)
