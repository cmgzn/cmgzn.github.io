---
title: Fatescript | 当我谈RAG时我谈些什么
source: https://fatescript.github.io/blog/2024/LLM-RAG/
author: []
published: 
created: 2024-11-26
description: 搜索(R)是如果增强生成(AG)的
tags:
  - clippings
---
#### TL; DR

- 大模型同时拥有多种完全矛盾的知识，也有自己本身的prior。
- 关键token的采样结果非常影响模型的生成效果。
- 除去直接提供答案，搜索本身是通过帮助模型”回想场景”或引导模型的prior来增强生成效果。
- 分享一下自己写的token level[可视化工具](https://github.com/FateScript/token_visualizer)<sup>[1]</sup>，希望这个工具能够有所帮助。

#### Intro

前一段时间在做一些RAG（retrieval augmented generation）相关的事情，如果你不了解RAG的流程，那么可以理解为：每一个query会经过意图模型判断“是否要进行搜索”，“搜索词是什么”等，经过搜索引擎检索文档提供材料后，辅助模型进行回答（本质上是一种比较灵活的知识注入）。具体的流程图示可以参考下图：

![](https://fatescript.github.io/assets/blog/rag_pipeline.png)

RAG pipeline<sup>[2]</sup>

​

RAG领域当然也有一些paper，但是总体上来看，普遍是建立在workflow上的改进，比如材料排序和过滤的技巧、根据模型置信度采取不同的prompt模板<sup><a href="https://arxiv.org/pdf/2401.15884.pdf" rel="external nofollow noopener" target="_blank">[3]</a></sup>（提高反事实能力）、每一轮结束后引入反思机制提高解决多跳问题<sup><a href="https://arxiv.org/pdf/2310.11511.pdf" rel="external nofollow noopener" target="_blank">[4]</a></sup>（本质上是一个agent）…这些文章更偏向tricks，虽然仍然有可以学习的insight，但这些文章没有解决我一直好奇的一个问题：**本质上，搜索材料是如何帮助模型完成回答的**？

#### RAG的两种场景

这个问题肯定要分成两个场景去看：首先，考虑模型本身就没有的知识，联网搜索只是单纯地提供材料，材料说啥就是啥，材料有错那模型回答同样有错，这点是毋庸置疑的，因为知识是存粹注入的。这个场景的一些典型的例子： “周杰伦为啥在卖煎饼？”、“电影《周处除三害》讲了什么故事”。模型在没有这部分知识的情况下，不可能回答正确，此时的RAG = 搜索引擎提供参考 + 模型有啥说啥。

不过，很多时候我们的疑问在于第二种场景，也是这篇博客要讨论的内容：**大模型本身已经学习了某些知识，但是因为数据本身的长尾性，学习的效果并不好**。

一个典型的例子就是reverse curse（模型知道A是B，但是并不知道B是A）<sup><a href="https://arxiv.org/pdf/2309.12288.pdf" rel="external nofollow noopener" target="_blank">[5]</a></sup>。我之前写过一个[blog](https://fatescript.github.io/blog/2023/LLM-markov-chain/)介绍过markov chain视角下的LLM，沿着那个视角去进一步思考reverse curse：基于next-token prediction的做法，训练预料“A是B”能够帮助建模 A -> B的状态转移，但是无法建模 B -> A的状态转移概率。所以后续看到的一些文章都是通过类似permute<sup><a href="https://arxiv.org/pdf/2403.00758.pdf" rel="external nofollow noopener" target="_blank">[6]</a></sup>/reverse<sup><a href="https://arxiv.org/pdf/2403.13799.pdf" rel="external nofollow noopener" target="_blank">[7]</a></sup>的数据增强形式来帮助模型进行建模。但这两个做法还是停留在在“头疼医头，脚疼医脚”的范畴内，没有从根本上解决本质问题：在 P函数表示等价的语意时，建模 不等价 。甚至 P函数表示等价语意也并不本质，举个例子，当A, B具有夫妻关系， 定义为X是Y的子女的概率时，模型建模 也不等价于建模 。

回到场景本身，RAG本身是比较容易解决大部分长尾知识的，虽然这个能力来自于搜索引擎的帮助，但是我们的问题看起来更清楚了一些：**长尾知识是模型在预训练阶段见过的了，那么搜索材料是如何帮助模型正确回答问题的呢**？

#### 蝴蝶效应之采样偏差

模型的生成过程是概率的采样过程，不论模型的回答是正确还是错误，都有可能是采样偏差导致的问题。所以为了确定token level的概率，我写了一个token level的[visualizer](https://github.com/FateScript/token_visualizer)，方便查看到底哪些token出现了偏差，偏差的概率又是多少。为了方便理解采样偏差，下面给了一个例子：

原始的prompt是”背诵《赤壁赋》”，下面是截取的一部分可视化的结果（越红色部分表示token概率越低，越绿表明表明token概率越高）：

![](https://fatescript.github.io/assets/blog/rag_sample.jpeg)

生成结果可视化

​

从回答内容来说，“月明星稀，乌鹊南飞”后面的回答是错误的，应该是“此非曹孟德之诗乎”，变成了“绕树三匝，何枝可依？”。但是如果看“绕”这个位置的token对应的概率，可以看到“此”的概率是88.8%，“绕”的概率只有9.3%，虽然模型此处的回答是错误的，但只能说是“运气不佳”采样到了错误的token，如果采样到了正确的token，模型其实是可以回答正确的。

既然讲到了采样概率，我在这里也稍稍提出来一个猜想，稍稍地抛砖引玉一下，欢迎更有insight的人证明/证伪：**RLHF阶段会使得一部分token（比如格式相关的token）的概率分布变得更sharp来达到与人类align的目的，本质上是一种对于模型的hotfix**。之所以会有这种猜测是之前可视化过一些做了RLHF的模型，直观感受就是概率分布通常比较sharp。不过沿着这个想法继续下去，即使模型和人类align之后，其实本质上仍然保留着原始能力，只是看起来某些“危险发言”因为采样概率降低而看起来“不见”了。之前有个[blog](https://www.lesswrong.com/posts/qmQFHCgCyEEjuy5a7/lora-fine-tuning-efficiently-undoes-safety-training-from)介绍了通过LoRA回撤alignment的效果，从这个角度来思考，完全是合理的。

#### RAG的三轮测试

重新回到之前的问题上，搜索（或者任何形式的知识注入）到底是如何增强模型进行回答的呢？

为了回答这个问题，我们首先需要设计一些case来进行检验，众所周知，因为GPT本身会更新训练语料，所以新的版本通常会比旧版本更新一些信息。而我们的case最好应当在更新信息时间范围之内，通过[官方文档](https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo)来看，最好控制在Sep 2021到Apr 2023之间。除此之外，这个信息应该尽量广为人知一些，类似太阳系从九大行星更新到八大行星这种信息。

第一个映入脑海的就是周杰伦有了三胎的消息，在google上搜索了一下，这个时间是在2022年5月。考虑到reverse curse，选择了“昆凌的孩子是谁（`Who are Hannah Quinlivan's children?`）”这个问题。

注意，后文的几轮测试只是为了帮助建立直觉和认知，并非严格论证，仅仅是“管中窥豹”。

UPDATE：在准备发布这个blog的前几天，我在arxiv翻到了一篇[文章](https://arxiv.org/pdf/2404.10198.pdf)<sup>[11]</sup>对本文的一部分观点做了定量分析，感兴趣的也可以去读一下。

##### 第一轮：基础测试

本章节中后续的测试会给出使用的pormpt和对应的可视化结果，所有的结果是在temperature设置成0.3的基础上得出。

针对Prompt：

> Answer the following question: Who are Hannah Quinlivan’s children?

下面是gpt-4（知识更新到2021年9月）的回答可视化：

![](https://fatescript.github.io/assets/blog/rag_expr_1_1.png)

GPT-4回答

​

可以看到GPT认为昆凌有两个孩子，并且这件事情的概率几乎为100%，这个知识和当时的现实是高度匹配的。

接着去问gpt-4-1106-preview同样的问题，这个模型的知识已经更新到2023年4月份了，按说回答应该有很大概率认为是有三个孩子，然而可视化的结果是下面这样：

![](https://fatescript.github.io/assets/blog/rag_expr_1_2.png)

GPT-4-1106-preview回答

​

从回答来看，模型仍然认为昆凌有两个孩子，但是`three`的概率也有29% ，也就是在孩子的数量这件事情上，模型的知识只被修正了一部分。

如果直接问周杰伦的孩子是谁呢？(后续问题都是使用gpt-4-1106-preview的结果)

> Answer the following question: Who are Jay Chou’s children?

![](https://fatescript.github.io/assets/blog/rag_expr_1_3.png)

​

可以看到有两个孩子的概率直接到了接近100%，通过第二个和第三个回答的对比来看，gpt-4-1106-preview更容易认为周杰伦有2个孩子，结合reverse curse的paper里面表达的内容，不难看出来：**模型的建模是非对称的**。通过对概率的可视化，现在你应该对这种非对称性有了更深的认识了。

根据前面两个不同的模型的回答，我们基本上能得到下面的结论：

- **模型本身同时拥有多种完全矛盾的知识**。在这个例子里面就是昆凌有两个/三个孩子，很多时候回答的正确与错误仅仅是取决于采样本身，采样到了`three`还是`two`就足以决定最终回答的正确与否。在关键token上，就是“一招不慎，满盘皆输”。
- 矛盾的知识应该来自于训练数据的矛盾，极大概率是预训练数据里面同时存在“两个孩子”和“三个孩子”的数据。这种**因为新数据出现导致旧数据失效的问题大概率没有被考虑到**，OpenAI对于数据管理也没有做的那么面面俱到。

##### 第二轮：给点hint

前一个小节中我们主要考虑依靠模型本身的能力进行回答的场景，这一个小节我们主要考虑给定一些信息对于原始问题的影响。

考虑到OpenAI大概率会使用维基百科的数据做预训练，于是我对应找到了周杰伦的[维基百科](https://en.wikipedia.org/wiki/Jay_Chou)，回滚到了更新周杰伦有三个孩子的历史版本，找到了附近的一句话：`In November 2014, Chou confirmed his relationship with model Hannah Quinlivan.` 对于回答“Who are Hannah Quinlivan’s children”这个问题来说，这句话除了提供了周杰伦是昆凌老公以及结婚时间之外，并没有额外的信息量，而我们上一轮的测试中，即使直接问”Who are Jay Chou’s children“这个问题，模型也并不能回答正确。所以可以确认这句话基本没有提供格外的信息。

此时prompt变成：

> Here is some text from wiki:  
> \`\`\`  
> In November 2014, Chou confirmed his relationship with model Hannah Quinlivan.  
> \`\`\`  
> Answer the following question: Who are Hannah Quinlivan’s children?

但是模型的回答出乎我的预料：模型认为有3个孩子，概率也提升到97%：

![](https://fatescript.github.io/assets/blog/rag_expr_2_1.png)

​

为了排除本身话术（也就是“Here is some text from wiki”）的影响，又加入了一个完全无用的信息进行测试：

> Here is some text from wiki:  
> \`\`\`  
> 1 + 1 = 2  
> \`\`\`  
> Answer the following question: Who are Hannah Quinlivan’s children?

![](https://fatescript.github.io/assets/blog/rag_expr_2_2.png)

​

此时模型完全不能回答正确，且回答有两个孩子的概率反倒是提高到了98%，这说明提供有一定相关性的准确信息对于回答是有帮助的，而无关的信息可能有害的。

为了和上一轮中“Who are Jay Chou’s children?”的问题做对照，这一轮也把问题中的昆凌换成周杰伦，同时提供完全相同的材料：

> Here is some text from wiki:  
> \`\`\`  
> In November 2014, Chou confirmed his relationship with model Hannah Quinlivan.  
> \`\`\`  
> Answer the following question: Who are Jay Chou’s children?

![](https://fatescript.github.io/assets/blog/rag_expr_2_3.png)

​

有趣的是，尽管是同样提供了没有什么信息量的数据，模型回答错误的概率（也就是认为是两个孩子的概率）已经从非常置信（第一轮接近100%的概率）变成没那么置信（本轮的69.5%）了，这也就表明，从维基百科精心选取的这段看似没有太多信息量的内容，确实能够让模型回答变得更加正确。

对于模型来说，在不提供提供正确答案，只有context的情况下，也能正确回答问题（类似markov视角下的CoT）。在这种场景里来看，搜索返回的材料更像是帮助模型”回想”正确答案。这就像是玩“听前奏猜歌名”的游戏，告诉你“你在电影里听到过”也能很大程度上提升回答准确率一样。

##### 第三轮：直接提供正确/错误答案

前两轮中，一轮是考察baseline，一轮是考察没有问题答案的hint类型，这一轮中，我们就考察直接提供答案的场景。毕竟大部分情况下的RAG都是伴随着问题的答案的。

首先来看直接提供正确答案的case：

> Here is some text from wiki:  
> \`\`\`  
> Hannah Quinlivan has three children.  
> \`\`\`  
> Answer the following question: Who are Jay Chou’s children?

![](https://fatescript.github.io/assets/blog/rag_expr_3_1.png)

​

不难看出来，在给出来正确答案的情况下，模型几乎百分百可以确认有三个孩子。同时，因为没有直接提供三个孩子的名字，根据模型回答来看模型本身是拥有这部分知识的。

接着我们来看提供错误回答的case：直接在材料中说有五个孩子。

> Here is some text from wiki:  
> \`\`\`  
> Hannah Quinlivan has five children.  
> \`\`\`  
> Answer the following question: Who are Jay Chou’s children?

![](https://fatescript.github.io/assets/blog/rag_expr_3_2.png)

​

这个回答是最有趣的一个，模型认识到这个材料是反事实的，并且根据自己现有的知识直接回答有两个孩子。而且看起来模型除了`two` 这个token之外，`three` 的概率排在第二位。虽然概率不足1%，但是此处没有`four`和`five`的token，也可以表明模型并没有建模错误的知识，这也是反事实能力的来源。

在反事实的样例中也可以看到，模型在默认状态下也仍然认为周杰伦只有两个孩子，这也强化了我们在第一轮的认知：虽然模型的训练语料已经更新到2023年，但是**反映到模型来说，它还是更能接受周杰伦只有两个孩子的事实，这就是模型的prior**。训练语料肯定也对prior产生了影响：`three`这个token仍有一定的概率出现，但是并不高。

如果你做过sft/alignment的话，你也许会有类似的发现：**预训练模型本身是有自己的知识的，有时候它会拒绝SFT阶段提供的知识**。举个例子：如果pre-train模型认为周杰伦就是只有两个孩子，那你在SFT阶段即使添加了少量周杰伦有三个孩子的数据，在1个epoch的训练之后，任何类似的变体问题，**甚至是原始的SFT数据直接作为输入去测试，模型并不能展现“看一遍就会”的超强拟合能力**，而会在”二”和“三”的选择处出现分歧，通常符合原始知识的token “二”概率会更高一些。当然，如果你多训练一两个epoch，你会发现模型接受了这个知识，不过在变体问题上仍然表现不佳。

##### 总结认知

- 对于模型没有的知识，搜索返回的信息起到提供可能答案的作用。从这个角度来说，**长窗口技术杀不死RAG，但是长窗口是对RAG中使用的trick（比如前文提到的chunk、filter、rerank）的一种降维打击。**RAG本身立足于新的知识、隐私等考虑，这点上与长窗口的场景没有重合，但长窗口本身会使得RAG的pipeline越来越简单。
- 对于模型已有的知识，RAG技术本不应该使用，因为一个理想中的“好”模型应该能够在见到知识（即使是长尾知识）后拥有很好的学习效果。但是，就如我们前面的case中指出的，现阶段比较靠谱的模型，即使强如GPT-4，仍然会存在知识冲突的问题（因为新知识对应的语料相比原始知识对应的语料，占比会更少）。在这种场景下，**RAG本身起到的作用除了众所周知的提供答案、降低幻觉之外，更多的是帮助模型”回想起”正确的回答(修正prior)，或者是引导模型从多个冲突的知识中选择某一个知识回答**。

#### 沧海遗珠

- token visualizer其实最早是为了分析推理过程中的幻觉而开发出来的一个工具，而幻觉本质上是高概率的错误token。很多bad case，关键的token采样正确了后面的回答就会自动修正了，所以每次面临badcase，我常常会有一种“明明我只要保持其它一切不变，只去修正某个token的概率就好了，但却不知如何去做”的无力感。
- 作为一个偏好高密度信息的人，我对于大模型的期待在于：**模型能够生成搜索引擎知识之外的内容**，不然上限不会超越搜索引擎。目前的RAG或者说大模型的死穴之一就是：**无法产生搜索引擎中存在，但无法检索到的深度知识。**举一个最简单的例子：我试过问大模型“深度学习中，算子级别的数值稳定trick有哪些，列出具体的算子和对应的trick”或者类似意思的问题，没有任何一个模型能够回答出softmax、log-sum-exp这些内容，多数都在范范地谈论调整学习率、梯度裁剪和初始化相关的内容。但如果你直接问softmax的数值稳定技巧，所有的大模型都知道为防止overflow使用的减去最大值的trick。所以，能看出来：**模型本身拥有每个单点知识，但是因为这些单点知识在网络上并没有人整合过，模型没有见过，搜索也搜索不到，所以很难生成出来**。当大模型可以生成这种信息的时候，就可以说完全超越了搜索引擎。每个人就可以探索自己“不知道自己不知道”的领域了。

#### Connect the dots

关于RAG的内容在这个小节之前已经讨论完了，接下来我想分享的是在写visualizer时候的一些新的感悟，只对技术感兴趣的同学可以跳过这一小节。

之前有一段时间在地铁上很无聊，加上计划开始写blog，所以“不务正业”去看了一些CSS和前端相关的内容。当时看起来这件事情与深度学习毫不相干，虽然学到了新的知识，但除了知识之外则是“毫无收益”：不会带来任何薪资上的涨幅，也很难和搞算法的同事聊这些东西，我一个CSS苦手也很难在未来某天靠这三脚猫的功夫谋一个饭碗。

但是，当我在twitter上看到可视化ppl的[post](https://twitter.com/thesephist/status/1617747154231259137)<sup>[12]</sup>的时候，我很自然就想到了类似的方法也可以用来可视化推理过程，在搜索了gradio的文档之后，结合之前掌握到的一点粗浅的前端知识，我认识到了写一个类似的简单demo是完全可行的。如果没有那段“不务正业”的时光的话，或许我就会错过这个有趣的事情了。站在现在来看，好像所有之前的时刻都是为了这个时刻做准备，但是在学那些知识的时候，我并没有意识到这一点，也一定不会想到这一点。那一刻，我唯一能做的，只有做好手头的事情。

突然地，我想起了乔布斯的那段著名的演讲，虽然很多人更喜欢最后的“Stay Hungry. Stay Foolish.”，但我想起的却是前面的一段：**You can’t connect the dots looking forward, you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future**. You have to trust in something - your gut, destiny, life, karma, whatever.

![](https://fatescript.github.io/assets/blog/knowledge_experience.png)

​

**相信那条线。**

#### Reference

**\[1\]** [Token visualizer - github](https://github.com/FateScript/token_visualizer)  
**\[2\]** [Retrieval-Augmented Generation for Large Language Models: A Survey](https://arxiv.org/pdf/2312.10997.pdf)  
**\[3\]** [Corrective Retrieval Augmented Generation](https://arxiv.org/pdf/2401.15884.pdf)  
**\[4\]** [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/pdf/2310.11511.pdf)  
**\[5\]** [The Reversal Curse: LLMs trained on “A is B” fail to learn “B is A”](https://arxiv.org/pdf/2309.12288.pdf)  
**\[6\]** [Mitigating Reversal Curse in Large Language Models via Semantic-aware Permutation Training](https://arxiv.org/pdf/2403.00758.pdf)  
**\[7\]** [Reverse Training to Nurse the Reversal Curse](https://arxiv.org/pdf/2403.13799.pdf)  
**\[8\]** [LoRA undoes safety training - LessWrong](https://www.lesswrong.com/posts/qmQFHCgCyEEjuy5a7/lora-fine-tuning-efficiently-undoes-safety-training-from)  
**\[9\]** [OpenAI models 信息 - 官方文档](https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo)  
**\[10\]** [周杰伦的维基百科](https://en.wikipedia.org/wiki/Jay_Chou)  
**\[11\]** [How faithful are RAG models? Quantifying the tug-of-war between RAG and LLMs’ internal prior](https://arxiv.org/pdf/2404.10198.pdf)  
**\[12\]** [twitter上@thesephist的可视化工具](https://twitter.com/thesephist/status/1617747154231259137)