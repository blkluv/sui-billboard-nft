# 链上广告牌NFT - 前端应用

这是一个基于Sui区块链的广告牌NFT系统的前端应用。它允许用户浏览、购买和管理广告位NFT，以及更新广告内容。

## 功能特点

- 浏览可用广告位
- 购买广告位并获得NFT
- 管理您的NFT集合
- 更新NFT广告内容
- 延长NFT租约时间
- 游戏开发者可创建和管理自己的广告位
- 支持365天固定租期的广告位定价

## 技术栈

- React 18
- TypeScript
- Ant Design UI库
- @mysten/sui.js - Sui区块链交互库
- @mysten/dapp-kit - Sui钱包集成
- React Router - 页面路由

## 项目设置

### 先决条件

- Node.js 16+
- NPM 8+
- Sui钱包 (如Sui Wallet浏览器扩展)

### 安装

```bash
# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm start
```

这将在 [http://localhost:3000](http://localhost:3000) 启动开发服务器。

### 环境变量配置

项目支持通过环境变量配置关键参数，您可以在项目根目录创建 `.env` 文件来设置这些变量：

```
# 合约配置
REACT_APP_CONTRACT_PACKAGE_ID=0x... # 您的合约包ID
REACT_APP_CONTRACT_MODULE_NAME=billboard_nft # 合约模块名
REACT_APP_FACTORY_OBJECT_ID=0x... # 工厂对象ID

# 可选：默认网络配置
REACT_APP_DEFAULT_NETWORK=testnet # 可选值: mainnet, testnet, devnet, localnet
```

### 构建

```bash
# 为生产环境构建应用
npm run build
```

构建完成后，所有文件将被生成到 `build` 目录，可以部署到任意静态网站托管服务。

## 使用方法

1. 连接您的Sui钱包
2. 浏览可用的广告位
3. 选择合适的广告位，填写广告内容并完成购买
4. 在"我的NFT"页面管理您的NFT
5. 根据需要更新广告内容或续租

### 管理员功能

如果您是平台管理员，可以在管理中心：
1. 注册新的游戏开发者
2. 管理现有开发者列表
3. 设置平台分成比例

### 开发者功能

如果您是游戏开发者，可以：
1. 创建新的广告位，指定位置、尺寸和价格
2. 管理自己创建的广告位
3. 编辑或删除未售出的广告位

## 用户界面

应用提供了现代化、直观的用户界面：

### 广告位展示

- 每个广告位以卡片形式展示，包含名称、尺寸、位置和价格信息
- 支持多种尺寸规格：小(128x128)、中(256x256)、大(512x512)和超大(1024x512)
- 价格显示为365天租期的总价
- 广告位详情页显示完整信息，包括广告位描述和当前状态

### 管理中心

- 标签式界面，便于切换不同功能
- 创建广告位表单，支持设置游戏ID、位置、尺寸和价格
- 广告位管理列表，显示已创建的广告位及其状态
- 开发者管理界面，用于注册和移除开发者

### 我的NFT

- 展示用户当前拥有的广告位NFT
- 支持更新广告内容和续租操作
- 显示租约到期时间和NFT状态

## 配置详情

### 网络配置

应用支持连接到多个Sui网络。在 `src/config/config.ts` 中定义了以下网络选项:

- **mainnet**: Sui主网
- **testnet**: Sui测试网
- **devnet**: Sui开发网
- **localnet**: 本地开发网络

每个网络配置包含以下属性：
- `name`: 网络显示名称
- `fullNodeUrl`: 全节点RPC URL
- `faucetUrl`: 水龙头URL（适用于测试网和开发网）
- `explorerUrl`: 区块浏览器URL

默认网络设置为 `testnet`，可通过环境变量 `REACT_APP_DEFAULT_NETWORK` 修改。

### 合约配置

合约配置包含以下关键参数：

- **PACKAGE_ID**: 合约包ID
- **MODULE_NAME**: 合约模块名称
- **FACTORY_OBJECT_ID**: 广告位工厂对象ID
- **CLOCK_ID**: 系统时钟对象ID（用于时间相关操作）

这些参数可以在 `src/config/config.ts` 中直接修改，或通过环境变量进行配置。

## 项目结构

```
src/
  ├── components/        # 通用组件
  │   ├── adSpace/       # 广告位相关组件
  │   ├── nft/           # NFT相关组件
  │   └── layout/        # 布局组件
  ├── config/            # 配置文件
  ├── hooks/             # 自定义Hooks
  ├── pages/             # 页面组件
  ├── types/             # TypeScript类型定义
  ├── utils/             # 工具函数
  │   ├── auth.ts        # 权限验证
  │   ├── contract.ts    # 合约交互
  │   └── format.ts      # 数据格式化
  └── assets/            # 静态资源
```

## 优化和改进

最新版本的前端应用包含以下优化：

1. **用户体验改进**：
   - 使用占位符代替加载失败的图片
   - 添加详细的位置信息显示
   - 统一显示价格为365天租期总价
   - 添加价格描述说明

2. **性能优化**：
   - 改进与区块链交互的数据处理
   - 优化组件渲染和数据加载
   - 增强错误处理和边界情况管理

3. **安全增强**：
   - 改进权限验证逻辑
   - 加强交易参数验证
   - 增加输入验证和安全检查

## 扩展开发

### 添加新的广告位类型

1. 在 `src/types/index.ts` 中扩展 `AdSpace` 接口
2. 更新广告位展示组件
3. 在 `utils/contract.ts` 中更新相关API

### 实现真实合约交互

1. 使用 `@mysten/sui.js` 库中的API替换模拟数据
2. 实现交易签名和发送功能
3. 添加交易状态监控和回调处理

## 许可证

[MIT](LICENSE)