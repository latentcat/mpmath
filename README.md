# mpMath — 微信公众号公式编辑插件
想要在微信公众号的编辑器里输入公式吗？来试试我们的 Chrome 插件吧～

相信不少人有在微信公众号上输入数学公式的需求，而微信至今没有推出官方的公式编辑器。有人被迫去选择一些新的工作流程，比如我在文章《[一道从初中做到大学的数学题](https://mp.weixin.qq.com/s/uCdL9gJUbIs0X5WCXiskgA)》中采用了 $\TeX \rightarrow$ PDF $\rightarrow$ SVG 的制作流程，这对普通用户来说都有一定的门槛。有人妥协，选择用截图来插入公式，或是干脆用文字字符来拼凑公式，而等等这些都有一定的问题。在这样的情况下，我们选择自己写一个插件来满足公众号输入公式的需求。

完全开源。  
能力有限，许多问题尚未解决，许多功能尚未实现。如果大家能提供帮助的话，我们将感激不尽！

> 如果你不太熟悉 $\LaTeX$ 语法，可以参考语雀的[数学公式举例](https://www.yuque.com/yuque/help/brzicb)、Apple 的[示例方程](https://support.apple.com/zh-cn/HT202501#sample)，或是这一份 [MathJax 基本教程和快速参考](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)。
>
> 如果你正在寻找基于 $\TeX$ 编写的数学题，推荐一个网站：[橘子数学](https://www.mathcrowd.cn/)。
>
> 如果你偏好非所见即所得的写作方式，试试这个：[Markdown Nice](https://mdnice.com)，同样对数学公式有着很好的支持。

### 特性

- 使用 MathJax 渲染 SVG 格式的 $\LaTeX$ 公式
- 嵌入微信公众号原生编辑器
- 公式显示清晰、可调字号、支持字体颜色改变、支持 Dark Mode
- 完整的快捷键支持

### 下载与安装

#### Chrome 应用商店下载

待编写

#### 直接下载

[mpMath 0.1.5](https://cdn.ciaochaos.com/projects/mpMath/mpMath_0_1_5/mpMath_0_1_5.zip)

安装步骤：

1. 下载文件并解压
2. 在 Chrome 中打开 [chrome://extensions/](chrome://extensions/) 或点击右上角 ⫶ $\rightarrow$ 更多工具 $\rightarrow$ 扩展程序
3. 打开右上角开发者模式
4. 将解压后的文件夹拖入 Chrome 窗口
5. 安装完成

### 使用

待编写

#### 快捷键

| 操作         | 快捷键                                                       |
| ------------ | ------------------------------------------------------------ |
| 新建公式     | <kbd>control</kbd> + <kbd>/</kbd><br /><kbd>command</kbd> + <kbd>/</kbd> |
| 退出公式编辑 | <kbd>esc</kbd>                                               |
| 插入公式     | <kbd>shift</kbd> + <kbd>enter</kbd>                          |

### 目前问题

- 公式右侧的空格会与公式捆绑在一起
- 公式不能被高亮选中、拖动
- 行内与行间公式不支持切换

### 反馈

待编写

### 开发计划

- 公式输入提示
- 如 Typora 等的无模态弹窗公式输入
- 一键转换 $\LaTeX$ 公式

### 许可

[The MIT License](https://opensource.org/licenses/MIT)

### 作者

- ciaochaos - CUC
- CPunisher - BUAA