# 通知与公告合并验证

日期：2026-10-09。运行环境：本机后端 `127.0.0.1:8080`、PC 开发页面 `127.0.0.1:3000`、Pixel_10_Pro Android 模拟器 `emulator-5554`。

## 完成行为

- App 消息中心和 PC 用户端系统通知合并接收通知、公告。公告归入系统分类，使用服务端统一排序和分页，显示统一未读数。
- 公告管理移除通知/公告类型筛选、表格列和编辑选择。新建、修改统一使用类型 2；历史类型 1 可正常阅读。
- 同编号的通知、公告通过内部来源区分详情与阅读操作。单条已读共享 PC/App 同账号状态；全部已读事务内处理两个来源，只影响当前用户。
- 本机旧表排序规则不同导致的 UNION 查询异常已修复：合并查询统一文本的字符集和排序规则，无需改动原表或历史数据。

## 自动验证

- 后端 `mvn -pl smartscript-user -am test -q` 通过，用户模块 180 项测试，新增合并服务测试 4 项和管理类型兼容测试 1 项。
- Web `npm run gate` 通过：静态检查、40 项测试和生产构建。
- App `flutter analyze` 无问题；`flutter test test/a5 test/announcement_test.dart test/message_delivery_test.dart test/unified_inbox_test.dart` 90 项通过。
- 本机真实合并联调 6 组通过：接收范围/历史内容、跨来源分页和分类、真实 Flutter Repository 的同编号与阅读隔离、PC 合并列表及详情、管理页面保存、幂等全部已读。浏览器运行错误为 0。
- 消息投递回归 7 组通过：已打开页面自动接收、切换刷新、真实 Flutter 通知阅读、用户沟通进入管理员收件箱、管理员已读与回复、返回列表及运行错误检查。
- 联调使用临时测试账号，结束后清理测试公告、通知、聊天、阅读记录和令牌文件，保留用户原有数据。

## 模拟器构建与运行

- `flutter build apk --debug` 成功，接口地址使用配置默认值 `http://10.0.2.2:8080/api/v1`。
- APK：`D:/build/smart-script-app/build/app/outputs/flutter-apk/app-debug.apk`。
- `adb -s emulator-5554 install -r -t` 成功；保留登录和数据，启动 `com.example.script_app/.MainActivity`，安装更新时间为本地 20:10:59。
- 原有登录账号可打开消息中心。原生 UI 和截图确认只有一个消息列表，全部/系统/审核/交易/福利分类存在，站内消息/平台公告双页签已移除。
- 模拟器截图：`D:/build/.local/announcements-20261009/emulator-unified-messages.png`。
- PC 截图：`D:/build/.local/announcements-20261009/pc-unified-inbox.png`；管理截图：`D:/build/.local/announcements-20261009/admin-unified-announcements.png`。

本机服务已运行最新 JAR，三个仓库改动保留待审核，未提交或推送。
