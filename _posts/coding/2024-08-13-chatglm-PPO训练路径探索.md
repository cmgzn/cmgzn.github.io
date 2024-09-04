---
title: chatglm-PPO训练路径探索
author: X
date: 2024-08-13 09:06:31 +0800
categories: [coding, LLM]
tags: [ppo,模型训练]
---
# 背景

已有基于求解器的评测系统，等于在数学建模大模型这一品类下，不存在人类专家奖励分数难以获取的情况，可以直接获取标准化的评测分数。因此，初步调研认为，使用PPO无疑是方便且能够最大程度发挥数学建模大模型特色的。

# RLHF调研

## 参考资料

[ChatGPT 背后的“功臣”——RLHF 技术详解 (huggingface.co)](https://huggingface.co/blog/zh/rlhf)

步骤1：收集数据与有监督训练策略

从数据集中采样的prompt提问

数据标注者（人工）给出最合理的回答，组成问答机制对< Q , A > <Q,A><Q,A>

利用问答机制通过SFT有监督精调GPT3.5，得到策略policy

图片

步骤2：收集数据训练奖励模型

继续采样prompt，将prompt输入一个或多个 LLM 生成对比数据。他们产生了几对提示-答案< Q , A > <Q,A><Q,A>

人类标注者根据模型回答的质量，对回答的好坏进行排序（收集人类反馈）

得到排序的数据集后，训练奖励模型，奖励模型能够根据输入给出一个标量奖励值，代表人类对这些输出或行为的偏好
经过充分的训练，奖励模型可以在没有人为干预的情况下对智能体的输出或行为进行打分，以量化其符合人类偏好的程度

图片

图中的ELO是指建立其人类对于输出的相对排名

步骤3：结合奖励模型利用强化学习算法如PPO算法来优化策略

再次采样prompt，利用PPO模型（由前面第一步得到的策略初始化）产生结果得到< Q , A > <Q,A><Q,A>

将< Q , A > <Q,A><Q,A>输入奖励模型，产生打分（奖励）

利用奖励信号评估策略的输出，通过强化学习算法来优化策略（比如 PPO模型）

创建一个循环来优化微调策略：通过新采样的数据，在强化学习过程中，策略会生成新的输出或行为，并根据奖励模型的反馈进行迭代优化。这个过程会不断重复，直到模型的性能达到满意的水平

图片

**容易发现，对于当前任务，我们可以梳理出一个新的步骤，其重点在于把步骤2的奖励模型替换成现有的评测系统。**

**这显然是可以等价的，细节区别是，由于奖励模型的评分基于人类，因此直接打分会导致标准不统一，所以最终使用的分数实际上是不同LM的排名结果进行归一化。但这一点，基于图距离和求解器的建模评测系统不需要在乎，因为系统计算的分数本就是标准统一的（本就是归一化的）。**

*认为已经对大框架较为清晰，接下来就需要聚焦于步骤3，以此来看输入输出要求及精细的架构究竟如何。*

## 步骤三调研

前略

老弟我真服了，玩我是吧

```
File ~/.cache/huggingface/modules/transformers_modules/chatglm3-6b/modeling_chatglm.py:413, in SelfAttention.forward(self, hidden_states, attention_mask, rotary_pos_emb, kv_cache, use_cache)
    411 # adjust key and value for inference
    412 if kv_cache is not None:
--> 413     cache_k, cache_v = kv_cache
    414     key_layer = torch.cat((cache_k, key_layer), dim=0)
    415     value_layer = torch.cat((cache_v, value_layer), dim=0)

ValueError: too many values to unpack (expected 2)
```

屡次测试glm训练都报类似的错，左右调试（下了llama3和gpt2等各种模型）都能跑通，就glm不行，我说咋了呢，对齐都对到模型层级别了：

```python
model = AutoModel.from_pretrained(model_name)
model.lm_head = model.transformer.output_layer
del model.transformer.output_layer
model = AutoModelForCausalLMWithValueHead.from_pretrained(model)
```

*以上是glm没有lm_head层，本人精心排查后确定output_layer和lm_head同功能，因此进行了层名替换*

终于是把需要的加载上了，结果还是不行，

24.07.18 问题解决

一开始还以为是glm下错了（事实证明这种思路是错误的，但也算和真相沾边）
使用glm4做其他任务时仍旧有类似情况发生，因此怀疑是包冲突或glm本身的问题，果然：

[glm-4-9b-chat-1m加载推理汇报错 · Issue #263 · THUDM/GLM-4 · GitHub](https://github.com/THUDM/GLM-4/issues/263)
测验`pip install transformers==4.40`后，成功运行。
