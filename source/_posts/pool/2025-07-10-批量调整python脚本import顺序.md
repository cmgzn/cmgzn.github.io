---
title: 批量调整python脚本import顺序
author: X
date: 2025-07-10 17:29:59 +0800
categories:
  - coding
tags:
---
```python
import subprocess

import sys

import re

  
  

def get_staged_py_files():

    """获取暂存区已修改的 .py 文件名列表"""

    res = subprocess.run(

        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"], capture_output=True, text=True

    )

    return [f for f in res.stdout.strip().split("\n") if f.endswith(".py")]

  
  

def process_file(path):

    with open(path, encoding="utf-8") as f:

        lines = f.readlines()

  

    # 记录所有import的行索引

    import_last_idx = -1

    logger_idx = -1

    import_pattern = re.compile(r"^(import |from )")

    logger_pattern = re.compile(r"^\s*logger\s*=\s*logging\.getLogger\(\s*__name__\s*\)")

  

    for idx, line in enumerate(lines):

        if logger_pattern.match(line):

            logger_idx = idx

        if import_pattern.match(line):

            import_last_idx = idx

  

    if logger_idx == -1:

        return

  

    while True:

        if lines[import_last_idx + 1].strip():

            import_last_idx += 1

        else:

            break

  

    # 移动

    logger_line = lines.pop(logger_idx)

    # insert 之后，如果logger原位置在最后一个import前，那么import_last_idx需要 --

    if logger_idx < import_last_idx:

        import_last_idx -= 1

    lines.insert(import_last_idx + 1, logger_line)

  

    # 写回

    with open(path, "w", encoding="utf-8") as f:

        f.writelines(lines)

    print(f"Moved logger in {path}")

  
  

def main():

    files = get_staged_py_files()

    for f in files:

        process_file(f)

  
  

if __name__ == "__main__":

    main()
```