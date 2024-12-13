---
title: "使用line_profiler对python代码性能进行评估优化 - DECHIN - 博客园"
source: "https://www.cnblogs.com/dechinphy/p/line-profiler.html"
author:
published:
created: 2024-12-04
description: "介绍python的逐行性能分析工具line_profiler的安装与使用，对给定的两个案例用line_profiler进行分析并给出性能分析的结论，其中通过正弦函数的不同实现方式的性能排名也给了大家一些库的使用的启发。"
tags:
  - "clippings"
---
介绍python的逐行性能分析工具line\_profiler的安装与使用，对给定的两个案例用line\_profiler进行分析并给出性能分析的结论，其中通过正弦函数的不同实现方式的性能排名也给了大家一些库的使用的启发。

## 性能测试的意义

在做完一个python项目之后，我们经常要考虑对软件的性能进行优化。那么我们需要一个软件优化的思路，首先我们需要明确软件本身代码以及函数的瓶颈，最理想的情况就是有这样一个工具，能够将一个目标函数的代码每一行的性能都评估出来，这样我们可以针对所有代码中性能最差的那一部分，来进行针对性的优化。开源库`line_profiler`就做了一个这样的工作，开源地址：[github.com/rkern/line\_profiler](https://www.cnblogs.com/dechinphy/p/github.com/rkern/line_profiler)。下面让我们一起看下该工具的安装和使用详情。

## line\_profiler的安装

`line_profiler`的安装支持源码安装和pip的安装，这里我们仅介绍pip形式的安装，也比较容易，源码安装方式请参考官方开源地址。

```bash
[dechin@dechin-manjaro line_profiler]$ python3 -m pip install line_profiler
Collecting line_profiler
  Downloading line_profiler-3.1.0-cp38-cp38-manylinux2010_x86_64.whl (65 kB)
     |████████████████████████████████| 65 kB 221 kB/s 
Requirement already satisfied: IPython in /home/dechin/anaconda3/lib/python3.8/site-packages (from line_profiler) (7.19.0)
Requirement already satisfied: prompt-toolkit!=3.0.0,!=3.0.1,<3.1.0,>=2.0.0 in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (3.0.8)
Requirement already satisfied: backcall in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (0.2.0)
Requirement already satisfied: pexpect>4.3; sys_platform != "win32" in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (4.8.0)
Requirement already satisfied: setuptools>=18.5 in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (50.3.1.post20201107)
Requirement already satisfied: jedi>=0.10 in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (0.17.1)
Requirement already satisfied: decorator in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (4.4.2)
Requirement already satisfied: traitlets>=4.2 in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (5.0.5)
Requirement already satisfied: pygments in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (2.7.2)
Requirement already satisfied: pickleshare in /home/dechin/anaconda3/lib/python3.8/site-packages (from IPython->line_profiler) (0.7.5)
Requirement already satisfied: wcwidth in /home/dechin/anaconda3/lib/python3.8/site-packages (from prompt-toolkit!=3.0.0,!=3.0.1,<3.1.0,>=2.0.0->IPython->line_profiler) (0.2.5)
Requirement already satisfied: ptyprocess>=0.5 in /home/dechin/anaconda3/lib/python3.8/site-packages (from pexpect>4.3; sys_platform != "win32"->IPython->line_profiler) (0.6.0)
Requirement already satisfied: parso<0.8.0,>=0.7.0 in /home/dechin/anaconda3/lib/python3.8/site-packages (from jedi>=0.10->IPython->line_profiler) (0.7.0)
Requirement already satisfied: ipython-genutils in /home/dechin/anaconda3/lib/python3.8/site-packages (from traitlets>=4.2->IPython->line_profiler) (0.2.0)
Installing collected packages: line-profiler
Successfully installed line-profiler-3.1.0
```

这里额外介绍一种临时使用pip的源进行安装的方案，这里用到的是腾讯所提供的pypi源：

```bash
python3 -m pip install -i https://mirrors.cloud.tencent.com/pypi/simple line_profiler
```

如果需要永久保存源可以修改`~/.pip/pip.conf`文件，一个参考示例如下（采用华为云的镜像源）：

```bash
[global]
index-url = https://mirrors.huaweicloud.com/repository/pypi/simple
trusted-host = mirrors.huaweicloud.com
timeout = 120
```

## 在需要调试优化的代码中引用line\_profiler

让我们直接来看一个案例：

```python
# line_profiler_test.py
from line_profiler import LineProfiler
import numpy as np

@profile
def test_profiler():
    for i in range(100):
        a = np.random.randn(100)
        b = np.random.randn(1000)
        c = np.random.randn(10000)
    return None

if __name__ == '__main__':
    test_profiler()
```

在这个案例中，我们定义了一个需要测试的函数`test_profiler`，在这个函数中有几行待分析性能的模块`numpy.random.randn`。使用的方式就是先import进来`LineProfiler`函数，然后在需要逐行进行性能分析的函数上方引用名为`profile`的装饰器，就完成了line\_profiler性能分析的配置。关于python装饰器的使用和原理，可以参考这篇[博客](https://www.cnblogs.com/dechinphy/p/decoretor.html)的内容介绍。还有一点需要注意的是，line\_profiler所能够分析的范围仅限于加了装饰器的函数内容，如果函数内有其他的调用之类的，不会再进入其他的函数进行分析，除了内嵌的嵌套函数。

## 使用line\_profiler进行简单性能分析

line\_profiler的使用方法也较为简单，主要就是两步：先用`kernprof`解析，再采用python执行得到分析结果。

1. 在定义好需要分析的函数模块之后，用`kernprof`解析成二进制`lprof`文件：

```bash
[dechin-manjaro line_profiler]# kernprof -l line_profiler_test.py 
Wrote profile results to line_profiler_test.py.lprof
```

该命令执行结束后，会在当前目录下产生一个`lprof`文件：

```bash
[dechin-manjaro line_profiler]# ll
总用量 8
-rw-r--r-- 1 dechin dechin 304  1月 20 16:00 line_profiler_test.py
-rw-r--r-- 1 root   root   185  1月 20 16:00 line_profiler_test.py.lprof
```

2. 使用`python3`运行`lprof`二进制文件：

```bash
[dechin-manjaro line_profiler]# python3 -m line_profiler line_profiler_test.py.lprof 
Timer unit: 1e-06 s

Total time: 0.022633 s
File: line_profiler_test.py
Function: test_profiler at line 5

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
     5                                           @profile
     6                                           def test_profiler():
     7       101         40.0      0.4      0.2      for i in range(100):
     8       100        332.0      3.3      1.5          a = np.random.randn(100)
     9       100       2092.0     20.9      9.2          b = np.random.randn(1000)
    10       100      20169.0    201.7     89.1          c = np.random.randn(10000)
    11         1          0.0      0.0      0.0      return None
```

这里我们就直接得到了逐行的性能分析结论。简单介绍一下每一列的含义：代码在代码文件中对应的行号、被调用的次数、该行的总共执行时间、单次执行所消耗的时间、执行时间在该函数下的占比，最后一列是具体的代码内容。其实，关于`line_profiler`的使用介绍到这里就可以结束了，但是我们希望通过另外一个实际案例来分析line\_profiler的功能，感兴趣的读者可以继续往下阅读。

## 使用line\_profiler分析不同函数库计算正弦函数sin的效率

我们这里需要测试多个库中所实现的`正弦函数`，其中包含我们自己使用的fortran内置的`SIN`函数。

在演示line\_profiler的性能测试之前，让我们先看看如何将一个fortran的`f90`文件转换成python可调用的动态链接库文件。

1. 首先在Manjaro Linux平台上安装gfotran

```bash
[dechin-manjaro line_profiler]# pacman -S gcc-fortran
正在解析依赖关系...
正在查找软件包冲突...

软件包 (1) gcc-fortran-10.2.0-4

下载大小：   9.44 MiB
全部安装大小：  31.01 MiB

:: 进行安装吗？ [Y/n] Y
:: 正在获取软件包......
 gcc-fortran-10.2.0-4-x86_64                                                                                        9.4 MiB  6.70 MiB/s 00:01 [#######################################################################################] 100%
(1/1) 正在检查密钥环里的密钥                                                                                                                  [#######################################################################################] 100%
(1/1) 正在检查软件包完整性                                                                                                                    [#######################################################################################] 100%
(1/1) 正在加载软件包文件                                                                                                                      [#######################################################################################] 100%
(1/1) 正在检查文件冲突                                                                                                                        [#######################################################################################] 100%
(1/1) 正在检查可用存储空间                                                                                                                    [#######################################################################################] 100%
:: 正在处理软件包的变化...
(1/1) 正在安装 gcc-fortran                                                                                                                    [#######################################################################################] 100%
:: 正在运行事务后钩子函数...
(1/2) Arming ConditionNeedsUpdate...
(2/2) Updating the info directory file...
```

2. 创建一个简单的fortran文件`fmath.f90`，功能为返回正弦函数的值：

```fortran
subroutine fsin(theta,result)
        implicit none
        real*8::theta
        real*8,intent(out)::result
        result=SIN(theta)
end subroutine
```

3. 用f2py将该fortran文件编译成名为`fmath`的动态链接库：

```bash
[dechin-manjaro line_profiler]# f2py -c -m fmath fmath.f90 
running build
running config_cc
unifing config_cc, config, build_clib, build_ext, build commands --compiler options
running config_fc
unifing config_fc, config, build_clib, build_ext, build commands --fcompiler options
running build_src
build_src
building extension "fmath" sources
f2py options: []
f2py:> /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fmathmodule.c
creating /tmp/tmpup5ia9lf/src.linux-x86_64-3.8
Reading fortran codes...
        Reading file 'fmath.f90' (format:free)
Post-processing...
        Block: fmath
                        Block: fsin
Post-processing (stage 2)...
Building modules...
        Building module "fmath"...
                Constructing wrapper function "fsin"...
                  result = fsin(theta)
        Wrote C/API module "fmath" to file "/tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fmathmodule.c"
  adding '/tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fortranobject.c' to sources.
  adding '/tmp/tmpup5ia9lf/src.linux-x86_64-3.8' to include_dirs.
copying /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/f2py/src/fortranobject.c -> /tmp/tmpup5ia9lf/src.linux-x86_64-3.8
copying /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/f2py/src/fortranobject.h -> /tmp/tmpup5ia9lf/src.linux-x86_64-3.8
build_src: building npy-pkg config files
running build_ext
customize UnixCCompiler
customize UnixCCompiler using build_ext
get_default_fcompiler: matching types: '['gnu95', 'intel', 'lahey', 'pg', 'absoft', 'nag', 'vast', 'compaq', 'intele', 'intelem', 'gnu', 'g95', 'pathf95', 'nagfor']'
customize Gnu95FCompiler
Found executable /usr/bin/gfortran
customize Gnu95FCompiler
customize Gnu95FCompiler using build_ext
building 'fmath' extension
compiling C sources
C compiler: gcc -pthread -B /home/dechin/anaconda3/compiler_compat -Wl,--sysroot=/ -Wsign-compare -DNDEBUG -g -fwrapv -O3 -Wall -Wstrict-prototypes -fPIC

creating /tmp/tmpup5ia9lf/tmp
creating /tmp/tmpup5ia9lf/tmp/tmpup5ia9lf
creating /tmp/tmpup5ia9lf/tmp/tmpup5ia9lf/src.linux-x86_64-3.8
compile options: '-I/tmp/tmpup5ia9lf/src.linux-x86_64-3.8 -I/home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include -I/home/dechin/anaconda3/include/python3.8 -c'
gcc: /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fmathmodule.c
gcc: /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fortranobject.c
In file included from /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/ndarraytypes.h:1822,
                 from /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/ndarrayobject.h:12,
                 from /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/arrayobject.h:4,
                 from /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fortranobject.h:13,
                 from /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fmathmodule.c:15:
/home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/npy_1_7_deprecated_api.h:17:2: 警告：#warning "Using deprecated NumPy API, disable it with " "#define NPY_NO_DEPRECATED_API NPY_1_7_API_VERSION" [-Wcpp]
   17 | #warning "Using deprecated NumPy API, disable it with " \
      |  ^~~~~~~
In file included from /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/ndarraytypes.h:1822,
                 from /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/ndarrayobject.h:12,
                 from /home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/arrayobject.h:4,
                 from /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fortranobject.h:13,
                 from /tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fortranobject.c:2:
/home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include/numpy/npy_1_7_deprecated_api.h:17:2: 警告：#warning "Using deprecated NumPy API, disable it with " "#define NPY_NO_DEPRECATED_API NPY_1_7_API_VERSION" [-Wcpp]
   17 | #warning "Using deprecated NumPy API, disable it with " \
      |  ^~~~~~~
compiling Fortran sources
Fortran f77 compiler: /usr/bin/gfortran -Wall -g -ffixed-form -fno-second-underscore -fPIC -O3 -funroll-loops
Fortran f90 compiler: /usr/bin/gfortran -Wall -g -fno-second-underscore -fPIC -O3 -funroll-loops
Fortran fix compiler: /usr/bin/gfortran -Wall -g -ffixed-form -fno-second-underscore -Wall -g -fno-second-underscore -fPIC -O3 -funroll-loops
compile options: '-I/tmp/tmpup5ia9lf/src.linux-x86_64-3.8 -I/home/dechin/anaconda3/lib/python3.8/site-packages/numpy/core/include -I/home/dechin/anaconda3/include/python3.8 -c'
gfortran:f90: fmath.f90
/usr/bin/gfortran -Wall -g -Wall -g -shared /tmp/tmpup5ia9lf/tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fmathmodule.o /tmp/tmpup5ia9lf/tmp/tmpup5ia9lf/src.linux-x86_64-3.8/fortranobject.o /tmp/tmpup5ia9lf/fmath.o -L/usr/lib/gcc/x86_64-pc-linux-gnu/10.2.0/../../../../lib -L/usr/lib/gcc/x86_64-pc-linux-gnu/10.2.0/../../../../lib -lgfortran -o ./fmath.cpython-38-x86_64-linux-gnu.so
Removing build directory /tmp/tmpup5ia9lf
```

这中间会有一些告警，但是并不影响我们的正常使用，编译好之后，可以在当前目录下看到一个so文件（如果是windows平台可能是其他类型的动态链接库文件）：

```bash
[dechin-manjaro line_profiler]# ll
总用量 120
-rwxr-xr-x 1 root   root   107256  1月 20 16:40 fmath.cpython-38-x86_64-linux-gnu.so
-rw-r--r-- 1 root   root      150  1月 20 16:40 fmath.f90
-rw-r--r-- 1 dechin dechin    304  1月 20 16:00 line_profiler_test.py
-rw-r--r-- 1 root   root      185  1月 20 16:00 line_profiler_test.py.lprof
```

3. 用ipython测试该动态链接库的功能是否正常：

```bash
[dechin-manjaro line_profiler]# ipython
Python 3.8.5 (default, Sep  4 2020, 07:30:14) 
Type 'copyright', 'credits' or 'license' for more information
IPython 7.19.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: from fmath import fsin

In [2]: print (fsin(3.14))
0.0015926529164868282

In [3]: print (fsin(3.1415926))
5.3589793170057245e-08
```

这里我们可以看到基于fortran的正弦函数的功能已经完成实现了，接下来让我们正式对比几种正弦函数实现的性能（底层的实现有可能重复，这里作为黑盒来进行性能测试）。

首先，我们还是需要创建好待测试的python文件`sin_profiler_test.py`：

```python
# sin_profiler_test.py
from line_profiler import LineProfiler
import random
from numpy import sin as numpy_sin
from math import sin as math_sin
# from cupy import sin as cupy_sin
from cmath import sin as cmath_sin
from fmath import fsin as fortran_sin

@profile
def test_profiler():
    for i in range(100000):
        r = random.random()
        a = numpy_sin(r)
        b = math_sin(r)
        # c = cupy_sin(r)
        d = cmath_sin(r)
        e = fortran_sin(r)
    return None

if __name__ == '__main__':
    test_profiler()
```

这里`line_profiler`的定义跟前面定义的例子一致，我们主要测试的对象为`numpy,math,cmath`四个开源库的正弦函数实现以及自己实现的一个fortran的正弦函数，通过上面介绍的`f2py`构造的动态链接库跟python实现无缝对接。由于这里的`cupy`库没有安装成功，所以这里暂时没办法测试而注释掉了。接下来还是一样的，通过`kernprof`进行编译构建：

```bash
[dechin-manjaro line_profiler]# kernprof -l sin_profiler_test.py 
Wrote profile results to sin_profiler_test.py.lprof
```

最后通过`python3`来执行：

```bash
[dechin-manjaro line_profiler]# python3 -m line_profiler sin_profiler_test.py.lprof 
Timer unit: 1e-06 s

Total time: 0.261304 s
File: sin_profiler_test.py
Function: test_profiler at line 10

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    10                                           @profile
    11                                           def test_profiler():
    12    100001      28032.0      0.3     10.7      for i in range(100000):
    13    100000      33995.0      0.3     13.0          r = random.random()
    14    100000      86870.0      0.9     33.2          a = numpy_sin(r)
    15    100000      33374.0      0.3     12.8          b = math_sin(r)
    16                                                   # c = cupy_sin(r)
    17    100000      40179.0      0.4     15.4          d = cmath_sin(r)
    18    100000      38854.0      0.4     14.9          e = fortran_sin(r)
    19         1          0.0      0.0      0.0      return None
```

从这个结果上我们可以看出，在这测试的四个库中，`math`的计算效率是最高的，`numpy`的计算效率是最低的，而我们自己编写的`fortran接口函数`甚至都比`numpy`的实现快了一倍，仅次于`math`的实现。其实，这里值涉及到了单个函数的性能测试，我们还可以通过`ipython`中自带的`timeit`来进行测试：

```bash
[dechin-manjaro line_profiler]# ipython
Python 3.8.5 (default, Sep  4 2020, 07:30:14) 
Type 'copyright', 'credits' or 'license' for more information
IPython 7.19.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: from fmath import fsin

In [2]: import random

In [3]: %timeit fsin(random.random())
145 ns ± 2.38 ns per loop (mean ± std. dev. of 7 runs, 10000000 loops each)

In [4]: from math import sin as math_sin

In [5]: %timeit math_sin(random.random())
107 ns ± 0.116 ns per loop (mean ± std. dev. of 7 runs, 10000000 loops each)

In [6]: from numpy import sin as numpy_sin

In [7]: %timeit numpy_sin(random.random())
611 ns ± 4.28 ns per loop (mean ± std. dev. of 7 runs, 1000000 loops each)

In [8]: from cmath import sin as cmath_sin

In [9]: %timeit cmath_sin(random.random())
151 ns ± 1.01 ns per loop (mean ± std. dev. of 7 runs, 10000000 loops each)
```

在这个结果中我们看到排名的趋势依然跟之前的保持一致，但是由于将`random`模块和计算模块放在一起，在给出的时间数值上有些差异。

## 总结概要

本文重点介绍了python的一款逐行性能分析的工具`line_profiler`，通过简单的装饰器的调用就可以分析出程序的性能瓶颈，从而进行针对性的优化。另外，在测试的过程中我们还可以发现，不同形式的正弦三角函数实现，性能是存在差异的，只是在日常使用频率较低的情况下是不感知的。需要了解的是，即使是正弦函数也有很多不同的实现方案，比如各种级数展开，而目前最流行、性能最高的计算方式，其实还是通过查表法。因此，不同的算法实现、不同的语言实现，都会导致完全不一样的结果。就测试情况而言，已知的性能排名为：`math`<`fortran`<`cmath`<`numpy`从左到右运行时长逐步增加。

## 版权声明

本文首发链接为：[https://www.cnblogs.com/dechinphy/p/line-profiler.html](https://www.cnblogs.com/dechinphy/p/line-profiler.html)  
作者ID：DechinPhy  
更多原著文章请参考：[https://www.cnblogs.com/dechinphy/](https://www.cnblogs.com/dechinphy/)