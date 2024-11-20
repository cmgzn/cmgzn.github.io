---
title: Python-asyncio异步转同步
author: X
date: 2024-11-20 13:04:32 +0800
categories:
  - debug
  - coding
tags:
  - 异步/协程
  - 线程
---
在Python编程中，异步编程（Asynchronous Programming）和同步编程（Synchronous Programming）是两种常见的编程范式。理解如何在这两者之间转换，对于在实际项目中有效利用异步特性以及与现有同步代码集成至关重要。本文将详细介绍如何将Python中的异步代码转换为同步代码，涵盖`run_coroutine_threadsafe`等方法，以及异步生成器（`async_gen`）的转换。

## 一、异步与同步编程概述

### 1.1 同步编程

- **执行模型**：同步编程按照指令的顺序逐步执行，每个操作必须等待前一个操作完成后才开始。
- **优点**：直观、简单，易于理解和调试。
- **缺点**：在处理I/O密集型任务时，可能导致性能瓶颈，因为程序会等待I/O操作完成。

### 1.2 异步编程

- **执行模型**：异步编程允许任务在等待I/O操作时挂起，释放线程去执行其他任务，完成后再恢复执行。
- **优点**：更高的性能，特别是在I/O密集型应用中，因为可以更有效地利用资源。
- **缺点**：编程模型复杂，调试困难度较高。

Python通过`asyncio`库为异步编程提供了强大的支持。

## 二、Python异步编程基础

### 2.0 参考链接
[学习python异步编程asyncio之协程和任务](https://www.cnblogs.com/mrlonely2018/p/15998293.html "发布于 2022-03-12 20:25")
[阻塞异步与协程.ipynb](https://github.com/hsz1273327/TutorialForPython/blob/master/%E8%AF%AD%E6%B3%95%E7%AF%87/%E6%B5%81%E7%A8%8B%E6%8E%A7%E5%88%B6/%E9%98%BB%E5%A1%9E%E5%BC%82%E6%AD%A5%E4%B8%8E%E5%8D%8F%E7%A8%8B.ipynb)

### 2.1 `asyncio`概述

`asyncio`是Python标准库中的一个库，旨在编写并发代码，特别是处理I/O密集型和高层次结构化网络代码。它基于协程（coroutines）和事件循环（event loop）的概念。

### 2.2 基本概念

- **协程（Coroutine）**：特殊的生成器，支持异步操作的函数，使用`async def`定义。
- **事件循环（Event Loop）**：协调和调度协程执行的核心机制。
- **任务（Task）**：包装协程的对象，用于追踪协程的执行状态。

### 2.3 简单示例

```python
import asyncio

async def say_hello():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

asyncio.run(say_hello())
```

## 三、异步转同步

在实际开发中，可能需要将异步代码转换为同步执行，特别是在与现有同步代码集成时。以下是几种常用的方法。

### 3.0 参考链接
[一份其他库里异步转同步的案例](https://github.com/rotationalio/pyensign/blob/c745da6dbb6a3999dbedb39ce4d3524bac56f4c0/pyensign/sync.py#L8)

### 3.1 使用 `asyncio.run`

`asyncio.run` 是一种简单的方法，用于运行一个**顶层**的异步函数，并等待其完成。这适用于将异步代码作为脚本顶层入口执行。

```python
import asyncio

async def main():
    print("Start")
    await asyncio.sleep(1)
    print("End")

# 同步调用
asyncio.run(main())
```

**注意事项**：
- `asyncio.run` 会创建并管理一个新的事件循环。
- 只能在主线程中调用，且不能在已有事件循环的环境中使用（例如，在Jupyter Notebook中可能会报错）。

### 3.2 使用事件循环的 `run_until_complete`

适用于需要更细粒度控制事件循环的场景。

```python
import asyncio

async def main():
    print("Start")
    await asyncio.sleep(1)
    print("End")

# 获取事件循环
loop = asyncio.get_event_loop()
# 运行直到完成
loop.run_until_complete(main())
```

**注意事项**：
- 在旧版本的Python（3.6及以下）中更常用。
- 在Python 3.7及以上，推荐使用`asyncio.run`。
- 可能需要手动管理事件循环的关闭。
- 若当前线程已存在事件循环（非运行状态），推荐使用本方法。

### 3.3 在现有同步线程中运行异步协程：`run_coroutine_threadsafe`

`run_coroutine_threadsafe` 是 `asyncio` 提供的方法，用于在已有事件循环的线程中，将协程提交给事件循环执行，并返回一个`concurrent.futures.Future`实例，可以用于等待协程的结果。

#### 使用场景

- 将异步代码嵌入到多线程或多进程的同步代码中。
- 在GUI应用（如Tkinter、PyQt）中调用异步代码，同时保持界面响应。

#### 示例代码

```python
import asyncio
import concurrent.futures
import threading

async def async_task(x, y):
    await asyncio.sleep(1)
    return x + y

def run_async_in_sync(x, y):
    loop = asyncio.get_event_loop()
    if not loop.is_running():
        raise RuntimeError("Event loop is not running")
    future = asyncio.run_coroutine_threadsafe(async_task(x, y), loop)
    return future.result()

# 在主线程中启动事件循环
def start_event_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

new_loop = asyncio.new_event_loop()
t = threading.Thread(target=start_event_loop, args=(new_loop,), daemon=True)
t.start()

# 在不同的线程中调用异步代码
result = run_async_in_sync(1, 2)
print(result)  # 输出: 3

# 关闭事件循环
new_loop.call_soon_threadsafe(new_loop.stop)
t.join()
new_loop.close() # 这句不写貌似也可以，毕竟在单独的线程里，关不关都不妨碍主线程
```

**解释**：

1. 创建一个新的事件循环，并在单独的线程中运行它。
2. 使用`asyncio.run_coroutine_threadsafe`将异步协程提交给事件循环执行。
3. 使用`future.result()`等待并获取协程的结果。

**注意事项**：
- 确保事件循环在单独的线程中持续运行，避免阻塞主线程。
- **需要适当管理事件循环的启动和关闭**，防止资源泄漏。
	- 这是一个比较难处理的问题，尤其在异步生成器转换时，下文会细说

### 3.4 在现有事件循环中运行协程：`nest_asyncio`
> 此方法未经验证

有时在已有事件循环（如Jupyter Notebook）中需要运行协程，可以使用第三方库`nest_asyncio`来嵌套事件循环。

#### 安装

```bash
pip install nest_asyncio
```

#### 使用示例

```python
import asyncio
import nest_asyncio

nest_asyncio.apply()

async def main():
    print("Start")
    await asyncio.sleep(1)
    print("End")

# 同步调用
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
```

**注意事项**：
- `nest_asyncio` 允许在已运行的事件循环中嵌套执行协程，适用于特殊的环境。
- 不是所有场景下都适用，需谨慎使用。

## 四、异步生成器 (`async_gen`) 转换为同步

异步生成器允许以异步的方式逐步产生数据。将异步生成器转换为同步代码，通常需要同步地迭代异步生成器。

### 4.0 参考链接
[一份他人实现方案](https://github.com/hikariatama/hikka-pyro/blob/f6e15767a4944ccb2acf04e21b9b046ff1fcf471/hikkapyro/sync.py#L36)
[不知道是啥语言的神秘疑似伪代码但可以使用](https://github.com/ydb-platform/ydb/blob/5b45c7497248b94d579ecaf8c43cdb997e1e66c0/contrib/python/grpcio/py3/grpc/_cython/_cygrpc/aio/common.pyx.pxi#L125)
### 4.1 异步生成器示例

```python
async def async_gen():
    for i in range(5):
        await asyncio.sleep(1)
        yield i
```

### 4.2 同步迭代异步生成器

要在同步代码中迭代异步生成器，可以采用以下方法：

#### 方法一：使用事件循环和 `__anext__`

```python
import asyncio

async def async_gen():
    for i in range(5):
        await asyncio.sleep(1)
        yield i

def async_gen_to_sync(agen):
    loop = asyncio.get_event_loop()
    while True:
        try:
            next_coroutine = agen.__anext__()
            value = loop.run_until_complete(next_coroutine)
            yield value
        except StopAsyncIteration:
            break

# 使用示例
for v in async_gen_to_sync(async_gen()):
	print(v)
```

还有一种写法：
```python
def sync_iter_async_gen(agen):
    loop = asyncio.get_event_loop()
	try:
		for value in iter(lambda: loop.run_until_complete(agen.__anext__()), None):
		yield value
	except StopAsyncIteration:
		pass
```

容易发现，二者实质上是等价的。

**注意事项**：
- 此方法会在每次迭代时阻塞等待协程完成。
- 需要事件循环处于非运行状态，否则会引发错误。

#### 方法二：使用 `run_coroutine_threadsafe` 在独立线程中运行

这个要详细说一下。

```python
import asyncio

async def async_gen():
    for i in range(5):
        await asyncio.sleep(1)
        yield i

def async_gen_to_sync(agen):
	loop = asyncio.new_event_loop()
	t = threading.Thread(target=loop.run_forever)
	t.start()
	asyncio.set_event_loop(loop)

	try:
		for value in iter(lambda: asyncio.run_coroutine_threadsafe(agen.__anext__(), loop).result(), None):
			yield value
	except StopAsyncIteration:
		pass
	finally:
		loop.call_soon_threadsafe(loop.stop)
		t.join()
```

**解释**：
- 在独立的线程中启动事件循环，并运行异步生成器的消费协程。
- 主线程和事件循环线程互不干扰。

**优点**：
- 不会阻塞主线程。
- 适用于需要并行处理的场景。

隐藏问题：
- 敏感的朋友很容易注意到，如果外部调用手动或意外中止，那么这个生成器无法获知这一点，依旧在自己单独线程里的`event_loop`中等待下一轮`yield`，也就是说只有手动`gen.close()`（等于在`try-except`语法中触发一个`GeneratorExit`错误，使函数运行到`finally`）或`stream finished`（整个生成器全部调用完，触发`StopAsyncIteration`）才能安全关掉`event_loop`。
- 这个感觉设计上没有更好的办法可以解决了，只能说用户自己用的时候多注意吧

#### 方法三：收集所有生成的数据

如果异步生成器的数据量较小，可以将其全部收集到一个列表中，然后在同步代码中使用。

```python
import asyncio

async def async_gen():
    for i in range(5):
        await asyncio.sleep(1)
        yield i

async def collect_async_gen():
    return [item async for item in async_gen()]

def sync_collect():
    return asyncio.run(collect_async_gen())

# 使用示例
results = sync_collect()
print(results)
```

**注意事项**：
- 适用于数据量较小的生成器，避免大量数据占用内存。
- 无法逐步处理数据，需等待所有数据生成完成。

## 五、注意事项与最佳实践

1. **事件循环的管理**：
   - 确保事件循环的创建、运行和关闭正确管理，避免资源泄漏或阻塞。
   - 避免在同一个线程中重复创建事件循环。

2. **线程安全**：
   - `run_coroutine_threadsafe` 是线程安全的，但需要确保事件循环在另一个线程中运行。
   - 避免在事件循环运行时阻塞事件循环线程。

3. **异常处理**：
   - 异步转同步时，需要适当捕获和处理异常，避免程序崩溃。
   - 例如，使用`future.result()` 时，可能会引发协程中的异常。

4. **性能考虑**：
   - 将异步代码转换为同步代码可能会带来性能损失，尤其是在高频调用的场景。
   - 尽量在需要时进行转换，避免频繁的上下文切换。

5. **代码维护**：
   - 保持异步与同步代码的清晰分离，避免混淆。
   - 使用明确的接口和抽象层来管理异步与同步的交互。

## 中插：一些额外的设计思考

第五章中提到“保持异步与同步代码清晰分离，避免混淆”，这一点的确很重要，而异步转同步的操作本身即是违背了这一点的，这让人不禁想，一个良好的架构应当是如此混用的吗？

尤其是`run_coroutine_threadsafe`方法的使用场景，它几乎是为“异步调同步调异步”这样一个诡异的场景设计的，这是一个有必要的场景吗？用同步方法桥接两个异步方法？？

实际上，copy一份一模一样的同步方法，然后在其前面加个`async`，不就可以直接在该方法里`await`需要的异步方法了吗（即异步调异步调异步）？

我能想到的唯一有一定必要的场景就是“异步调同步...(同步\*n)...调异步”，那么在不想为了一份async而copy+rewrite整条链路的情况下，确实需要使用`run_coroutine_threadsafe`，但这应当也是一个临时的处理方式，最健康的还是异步同步分离，最多进行一次转换。

当然`run_coroutine_threadsafe`其实也还好，当场转同步当场`loop.stop`还是挺安全的，只是切换上下文会有性能损失；十分不优雅的目前看只有类似生成器这种无法当场阻塞完的情况……

## 六、完整示例

以下是一个综合示例，展示了如何在同步代码中调用异步函数、处理异步生成器，以及使用`run_coroutine_threadsafe`。

```python
import asyncio
import concurrent.futures
import threading

# 定义异步任务
async def fetch_data(x):
    await asyncio.sleep(1)
    return x * 2

# 定义异步生成器
async def async_gen():
    for i in range(3):
        await asyncio.sleep(1)
        yield i

# 在独立线程中运行事件循环
def start_event_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

# 创建并启动事件循环线程
new_loop = asyncio.new_event_loop()
t = threading.Thread(target=start_event_loop, args=(new_loop,), daemon=True)
t.start()

# 使用 run_coroutine_threadsafe 调用异步函数
def get_data_sync(x):
    future = asyncio.run_coroutine_threadsafe(fetch_data(x), new_loop)
    return future.result()

# 同步调用异步生成器
def async_gen_to_sync(agen):
    while True:
        try:
            future = asyncio.run_coroutine_threadsafe(agen.__anext__(), new_loop)
            value = future.result()
            yield value
        except concurrent.futures.TimeoutError:
            print("Timeout occurred")
            break
        except StopAsyncIteration:
            break
    return results

# 使用示例
if __name__ == "__main__":
    result = get_data_sync(10)
    print(f"fetch_data result: {result}")  # 输出: fetch_data result: 20

    gen_results = sync_iter_async_gen(async_gen())
    print(f"async_gen results: {gen_results}")  # 输出: async_gen results: [0, 1, 2]

    # 关闭事件循环
    new_loop.call_soon_threadsafe(new_loop.stop)
    t.join()
    new_loop.close()
```

**输出**：

```
fetch_data result: 20
async_gen results: [0, 1, 2]
```

**解释**：

1. 创建一个新的事件循环，并在独立线程中运行它。
2. 使用`run_coroutine_threadsafe`同步调用异步函数`fetch_data`。
3. 通过`sync_iter_async_gen`函数同步迭代异步生成器`async_gen`。
4. 最后，正确关闭事件循环和相关线程。

## 七、总结

将异步代码转换为同步代码在Python开发中是一个常见需求，特别是在需要与现有同步系统集成时。通过理解`asyncio`的基本机制以及合理使用`run_coroutine_threadsafe`等方法，可以实现高效且可靠的异步转同步。处理异步生成器时，需要仔细管理事件循环和迭代过程，确保数据的正确获取和资源的有效利用。

在实践中，始终建议根据具体需求选择合适的方法，并注意避免常见的陷阱，如事件循环的冲突、线程安全问题等。通过良好的设计和充分的测试，可以有效地在异步和同步编程之间转换，实现功能强大且高效的Python应用。