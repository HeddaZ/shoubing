# 游戏手柄直播显示面板
本软件开发思路来自`gamepadviewer.com`，经过一系列本地化和简化设计，更容易配合国内游戏直播的需求；  
手柄面板与直播软件捕获的游戏画面组合后，使观众更容易理解主播对游戏的操作，大幅提升直播中的交互效率。


## 原理简介
本应用程序利用`Chrome`原始支持游戏手柄指令的特性，构建可视化的虚拟游戏手柄页面来显示实时的操作指令；
直播软件 [OBS Studio] 内置的 [obs-browser] 插件本质上是一个基于 Chrome 相同内核网页浏览器外壳；
因此，只要在 OBS 中添加一个 `浏览器` 组件，就相当于在直播画面中常驻了一个微型的 Chrome 窗口，其中显示的就是本应用程序的画面。


## 主要功能特性
> 1. 统一入口地址: http://sb.shadowin.net
> 1. 支持 XBox 手柄面板和按键显示，地址: http://sb.shadowin.net/xbox/
> 2. 支持 PlayStation 手柄面板和按键显示，地址: http://sb.shadowin.net/ps/
> 3. 本地识别和渲染：纯客户端应用程序，不依赖服务器，低延迟识别手柄操作；
> 4. 使用灵活：支持 Chrome 浏览器本地测试，也支持 `OBS Studio Browser Plugin` 插件整合 `Open Broadcaster Software (OBS)` 使用；
> 5. 高扩展性：跟随 Chrome (内核 Chromium) 升级可原始支持更多手柄类型；
> 6. 强兼容性：支持各大直播平台。


## OBS 直播使用示例
1. aa
2. bb
3. cc


## Chrome 浏览器使用示例
1. aa
2. bb
3. cc

-------------------------------------------------  
使用中有任何问题和建议，欢迎[在此留爪]。  
若此软件对您有积极作用，欢迎 **捐赠** 帮助项目发展！  
> QQ: 9812152  
> [支付宝]: heddaz(at)live.com  
> [PayPal]: heddaz(at)live.com  


[OBS Studio]: https://obsproject.com/
[obs-browser]: https://obsproject.com/forum/resources/browser-plugin.115/
[在此留爪]: https://github.com/HeddaZ/shoubing/issues
[支付宝]: http://www.alipay.com
[PayPal]: http://www.paypal.com