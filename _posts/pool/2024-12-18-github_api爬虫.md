---
title: 2024-12-18-github_api爬虫
author: X
date: 2024-12-18 14:08:29 +0800
categories: 
tags:
---
# 背景
需要爬github repo中的一些特定内容，利用了github提供的api。搞了整整两天才搞出来稍微优化的版本，主要因为github_api有**速率限制**，所以需要准备好token断连后换token续传、并发等处理。

# 参考文档
[关于速率限制的官方最佳实践](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28)
有关各种请求的endpoints链接可以在文档首页下拉找到。
[首页](https://docs.github.com/en/rest?apiVersion=2022-11-28)
[pr's endpoints](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28)

# 代码设计

## 嵌套文件夹完整下载
涉及并发，是笔者做得比较用心的一部分：
```python
async def download_file(file_url, file_path, session, semaphore, token, logger):
    retries = 0
    while retries < 50:
        async with semaphore:
            headers = {"Authorization": f"token {token}"}

            async with session.get(file_url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    file_content = base64.b64decode(data["content"])
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    with open(file_path, "wb") as f:
                        f.write(file_content)
                    break
                else:
                    retries += 1
                    if retries % 6 == 0:
                        await asyncio.sleep(60 * 15)
                    else:
                        token = random.choice(token_list)
    if retries >= 50:
        logger.error(f"{file_path}下载失败，{file_url}")
    return True


async def async_download_dir(
    directory_url, directory, session, semaphore, token,
):
    headers = {"Authorization": f"token {token}"} if token else {}
    async with session.get(directory_url, headers=headers) as response:
        response.raise_for_status()
        data = await response.json()
        tree = data["tree"]

        if len(tree) > 2000:
            return False

        tasks = []
        for file in tree:
            file_path = os.path.join(directory, file["path"])
            file_url = file["url"]
            if file["type"] == "tree":
                tasks.append(
                    async_download_dir(
                        file_url, file_path, session, semaphore, token
                    )
                )
            else:
                if not os.path.exists(file_path):
                    tasks.append(
                        download_file(
                            file_url, file_path, session, semaphore, token
                        )
                    )

        await asyncio.gather(*tasks)
    return True


def download_dir(directory_url, directory, token=None):
    async def run():
        async with aiohttp.ClientSession() as session:
            semaphore = asyncio.Semaphore(10)
            result = await async_download_dir(
                directory_url, directory, session, semaphore, token
            )
            return result

    return asyncio.run(run())
```

有并发，有异常处理，有细粒度的token轮换来保证断点续传，而且是有backoff的重试策略，我觉得还是很不错滴。

# 后台运行

1. **启动**

	```bash
	nohup python your_script.py > nohup.out
	```
	默认日志就在`nohup.out`，`>`是可以指定到其他文件中
1. **打印日志**

```bash
	tail -f nohup.out
```

4. **查找进程 ID (PID) 根据脚本名：**

   使用 `pgrep` 命令直接根据脚本名查找进程 ID。

   ```bash
   pgrep -f your_script.py
   ```

   `-f` 参数表示搜索全命令行，而不仅仅是进程名称，这样可以确保找到指定脚本的进程。

4. **停止进程：**

   使用 `pkill` 命令根据脚本名来停止进程：

   ```bash
   pkill -f your_script.py
   ```

   同样地，`-f` 参数表示搜索全命令行。

