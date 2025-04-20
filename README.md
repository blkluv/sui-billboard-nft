# NFT Billboard 链上动态NFT广告牌发布系统

## 项目介绍
链上动态NFT广告牌发布系统是一个基于Sui区块链的创新广告解决方案。该系统将链游和虚拟世界中的广告位转化为可交易的NFT，为品牌方提供高效、透明、可动态更新的链上广告服务。系统采用最新的React + TypeScript技术栈构建前端，Move智能合约实现后端业务逻辑，并集成Walrus去中心化存储网络实现广告内容（图片、视频等）的安全可靠存储。这种多层架构设计确保了系统的可靠性、可扩展性和内容分发的高效性。

### 项目背景
随着Web3技术的快速发展，链游和虚拟世界正在成为品牌营销的新阵地。然而，目前链游和虚拟世界中的广告展示仍存在以下问题：
1. 广告位资源分散，缺乏统一管理
2. 广告内容更新不便，需要重新部署
3. 广告效果难以追踪和验证
4. 缺乏标准化的广告位交易机制

### 项目目标
本项目旨在解决上述问题，通过区块链技术实现：
1. 广告位NFT化，实现资源统一管理
2. 支持广告内容动态更新
3. 提供透明的效果追踪
4. 建立标准化的交易机制

### 项目特色
1. **灵活租赁方案**：
   - 支持1-365天的灵活租期
   - 智能定价算法
   - 支持租约续期和状态验证
   - NFT过期保护机制

2. **动态内容更新**：
   - 实时更新广告内容
   - 基于Walrus的去中心化存储
   - 支持内容URL和哈希更新
   - 所有者权限控制
   - 内容更新事件追踪

3. **透明计费机制**：
   - 基于时长的智能定价
   - 自动退还多余支付
   - 费用明细链上可查
   - 支付验证机制

4. **权限管理系统**：
   - 平台管理员权限
   - 游戏开发者权限
   - 广告位所有者权限
   - 多层级访问控制

## 目录结构

```
sui-billboard-nft/
├── README.md                # 项目说明文档
├── sui_billboard_nft/      # Move智能合约目录
│   ├── sources/            # 合约源码
│   └── ...
├── sui_billboard_nft_web/  # 前端项目目录（React + TypeScript）
│   ├── src/                # 前端源码
│   └── ...
```

- `sui_billboard_nft/`：存放基于Move的Sui区块链智能合约，实现广告位NFT化、动态内容更新、租赁与权限管理等核心逻辑。
- `sui_billboard_nft_web/`：前端项目，提供广告牌展示、NFT租赁、内容更新、区块链交互等功能的用户界面。

## 系统组成

本项目包括三个主要部分：

1. **智能合约（Move合约）**：实现在Sui区块链上的核心业务逻辑，包括广告位NFT化、租赁、内容动态更新、权限与计费等。
2. **前端应用（React + TypeScript）**：提供用户友好的界面，支持广告牌浏览、NFT租赁、内容上传与更新、区块链钱包连接等。
3. **去中心化存储（Walrus）**：用于广告内容（如图片、视频等）的安全存储与分发。

---

## 技术栈与依赖

- 区块链平台：Sui
- 智能合约语言：Move
- 前端框架：React 18.x + TypeScript
- UI组件库：Ant Design/Material UI（如有）
- 状态管理：Redux/Context（如有）
- 钱包集成：Sui Wallet Adapter
- 存储方案：Walrus 去中心化存储

---

## 快速开始

### 1. 前端项目（sui_billboard_nft_web）

```bash
# 安装依赖
cd sui_billboard_nft_web
npm install

# 启动开发环境
npm run dev

# 打包构建
npm run build
```

### 2. 智能合约（sui_billboard_nft）

```bash
# 安装依赖（如需）
cd sui_billboard_nft

# 编译合约
sui move build

# 发布合约到Sui测试网/主网
sui client publish --gas-budget 100000000

# 运行测试
sui move test
```

---

## 核心业务流程

1. **广告位NFT发布**：
   - 管理员/开发者通过前端界面或命令行工具，在链上创建新的广告位NFT。
   - 每个广告位拥有唯一ID、描述、定价策略等元数据。

2. **广告位租赁与续租**：
   - 用户可浏览可用广告位，根据需求选择租赁时长（1-365天），支付SUI后获得对应NFT的使用权。
   - 支持租约续期，合约自动处理到期归还与过期保护。

3. **广告内容动态更新**：
   - 广告位NFT持有者可通过前端界面上传/更新广告内容（图片/视频URL及哈希），内容存储于Walrus。
   - 更新操作会触发链上事件并记录内容哈希，确保内容可追溯和防篡改。

4. **权限与计费管理**：
   - 合约内置多级权限控制（管理员、开发者、NFT持有者）。
   - 所有租赁、续租、内容更新、费用明细均链上透明可查。

---


### 智能合约

智能合约使用Sui的Move语言实现，提供以下核心功能：
- 广告位的创建和管理
- NFT铸造和交易
- 租约管理和动态内容更新
- 权限控制和安全验证

### Walrus存储集成

Walrus为系统提供去中心化的内容存储解决方案：

1. **数据生命周期**
   - 上传的广告内容由发布者进行编码和安全存储
   - 元数据和可用性证明存储在Sui链上
   - 通过CDN或读取缓存进行内容交付

2. **技术特点**
   - Red Stuff编码算法提供高效存储
   - 激励机制确保数据可用性
   - 存储容量通证化，可与Sui智能合约集成

3. **存储类型**
   - 广告图片
   - 视频内容
   - 其他大型媒体文件

4. **安全保障**
   - 节点失效不影响数据访问
   - 高效的复制因子确保数据安全
   - WAL代币质押的治理和恢复机制

### 前端应用

React + TypeScript应用为用户提供直观的界面：
- 浏览和购买广告位（/ad-spaces）
- 管理NFT和更新内容（/my-nfts）
- 游戏开发者创建和管理广告位（/manage）
- 平台管理员管理权限和开发者
- 集成@mysten/dapp-kit钱包连接
- 使用React Query优化状态管理
- 响应式设计支持多设备访问

## 技术架构

### 核心模块
1. **权限管理模块**
   - 平台管理员权限
   - 游戏开发者权限
   - 地址验证机制

2. **广告位模块**
   - AdSpace：广告位对象
   - 位置、尺寸、价格管理

3. **NFT模块**
   - AdBoardNFT：广告牌NFT
   - 内容管理、租约管理

### 核心数据结构

#### Factory 工厂合约
```move
struct Factory has key {
    id: UID,
    admin: address,           // 平台管理员地址
    game_devs: Table<address, bool>, // 游戏开发者地址映射
    platform_ratio: u8,       // 平台分成比例
}
```

#### 广告位结构
```move
struct AdSpace has key, store {
    id: UID,
    game_id: String,          // 游戏ID
    location: String,         // 位置信息
    size: String,            // 广告尺寸
    is_available: bool,       // 是否可购买
    creator: address,         // 创建者地址
    created_at: u64,          // 创建时间
    fixed_price: u64,         // 基础固定价格
}
```

#### 广告牌NFT结构
```move
struct AdBoardNFT has key, store {
    id: UID,
    ad_space_id: ID,          // 对应的广告位ID
    owner: address,           // 当前所有者
    brand_name: String,       // 品牌名称
    content_hash: vector<u8>, // 内容哈希
    content_url: String,      // 内容URL
    lease_start: u64,         // 租约开始时间
    lease_end: u64,          // 租约结束时间
    is_active: bool,          // 是否激活
}
```

#### NFT Display配置
NFT支持标准化的Display功能，包含以下字段：
- name: 品牌名称 + Billboard Ad
- description: 广告位描述
- image_url: 广告内容URL
- project_url: 项目URL
- creator: 创建者地址
- brand_name: 品牌名称
- lease_start: 租约开始时间
- lease_end: 租约结束时间
- status: NFT状态

## 主要功能

### 1. 初始化系统
```move
fun init(_: BILLBOARD_NFT, ctx: &mut TxContext)
```
- 初始化工厂合约
- 设置平台管理员
- 初始化NFT Display配置
- 设置系统参数

### 2. 注册游戏开发者
```move
public entry fun register_game_dev(
    factory: &mut Factory,
    developer: address,
    ctx: &mut TxContext
)
```
- 验证调用者是平台管理员
- 注册游戏开发者地址
- 授予开发者权限

### 3. 创建广告位
```move
public entry fun create_ad_space(
    factory: &mut Factory,
    game_id: String,
    location: String,
    size: String,
    fixed_price: u64,
    clock: &Clock,
    ctx: &mut TxContext
)
```
- 验证游戏开发者权限
- 创建广告位对象
- 设置初始参数

### 4. 购买广告位
```move
public entry fun purchase_ad_space(
    ad_space: &mut AdSpace,
    payment: Coin<SUI>,
    lease_duration: u64,
    ad_content: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
)
```
- 验证可用性
- 计算租金
- 创建NFT
- 处理支付

### 5. 更新广告内容
```move
public entry fun update_ad_content(
    nft: &mut AdBoardNFT,
    content_url: String,
    clock: &Clock,
    ctx: &mut TxContext
)
```
- 验证所有权
- 检查租约有效性
- 更新内容URL
- 自动更新Display展示

### 6. 续租广告位
```move
public entry fun renew_lease(
    factory: &Factory,
    ad_space: &mut AdSpace,
    nft: &mut AdBoardNFT,
    payment: Coin<SUI>,
    lease_duration: u64,
    clock: &Clock,
    ctx: &mut TxContext
)
```
- 验证NFT已过期
- 计算续租费用
- 处理平台分成
- 延长租期
- 更新Display展示

## 前端应用特性

前端应用提供了直观、美观的用户界面，主要特性包括：

1. **广告位浏览与购买**
   - 卡片式广告位展示
   - 详细的位置、尺寸和价格信息
   - 便捷的购买流程

2. **NFT管理**
   - 我的NFT集合展示
   - 内容更新和租约管理
   - 租约到期提醒

3. **游戏开发者功能**
   - 创建新广告位表单
   - 已创建广告位管理
   - 价格和状态设置

4. **管理员功能**
   - 开发者注册和管理
   - 平台参数设置
   - 系统监控面板

5. **用户体验优化**
   - 响应式设计，适配多种设备
   - 占位图像和加载状态
   - 完善的错误处理和用户提示

6. **价格计算与展示**
   - 显示365天租期的总价
   - 价格描述和说明文字
   - 支持多种尺寸和价格配置

## 价格计算
系统使用智能定价算法，基于以下因素计算广告位价格：
- 基础固定价格
- 租期长度
- 指数衰减模型

价格计算公式：
```move
let daily_price = ad_space.fixed_price;  // 一天的租赁价格
let ratio = 977000; // 比例因子，这里设为0.977
let base = 1000000; // 用于表示小数的基数
let min_daily_factor = 500000; // 最低日因子(1/2)

// 如果只租一天，直接返回每日价格
if (lease_days == 1) {
    return daily_price
};

// 计算租赁总价
let mut total_price = daily_price; // 第一天的价格
let mut factor = base; // 初始因子为1.0
let mut i = 1; // 从第二天开始计算

while (i < lease_days) {
    // 计算当前因子
    factor = factor * ratio / base;
    
    // 如果因子低于最低值(1/2)，则使用最低值
    if (factor < min_daily_factor) {
        // 增加(租赁天数-i)天的最低价格
        total_price = total_price + daily_price * min_daily_factor * (lease_days - i) / base;
        break
    };
    
    // 否则增加当前因子对应的价格
    total_price = total_price + daily_price * factor / base;
    i = i + 1;
};
```

这个定价算法确保:
1. 租期越长，每天的单价越低
2. 价格衰减速度由比例因子(0.977)控制，比例越低衰减越快
3. 每日价格有一个底线保障，不低于基础价格的50%
4. 第一天始终使用全价，第二天开始应用折扣

## 测试
项目包含完整的单元测试，覆盖所有核心功能：
- 创建广告位测试
- 购买广告位测试
- 更新广告内容测试
- 续租测试
- Display功能测试
  - 初始化Display
  - 动态更新Display
  - Display字段验证

运行测试：
```bash
sui move test
```

## 部署

### 智能合约部署
1. 确保安装了Sui CLI
2. 编译项目：
```bash
sui move build
```
3. 部署到测试网：
```bash
sui client publish --gas-budget 100000000
```

### 前端应用部署
1. 更新环境变量配置
```env
REACT_APP_CONTRACT_PACKAGE_ID=0x... # 已部署合约的包ID
REACT_APP_CONTRACT_MODULE_NAME=billboard_nft
REACT_APP_FACTORY_OBJECT_ID=0x... # 工厂对象ID
```

2. 构建应用
```bash
npm run build
```

3. 部署到静态网站托管服务

## 安全性考虑
1. **基于地址的权限验证**
   - 管理员权限：通过验证调用者地址与 Factory 中的 admin 地址匹配
   - 游戏开发者权限：通过验证调用者地址是否在 game_devs 表中注册
   - 广告位所有者权限：通过验证调用者地址与 NFT 所有者地址匹配

2. 资金安全
   - 自动退还多余支付
   - 防止重入攻击

3. 租约管理
   - 租期验证
   - 到期自动失效

## 权限控制系统
1. **基于地址的权限验证**
   - 管理员权限：通过验证调用者地址与 Factory 中的 admin 地址匹配
   - 游戏开发者权限：通过验证调用者地址是否在 game_devs 表中注册
   - 广告位所有者权限：通过验证调用者地址与 NFT 所有者地址匹配

2. **错误处理**
   - ENotAdmin：非管理员操作错误
   - ENotGameDev：非游戏开发者操作错误
   - ENotAdSpaceCreator：非广告位创建者操作错误

3. **权限检查流程**
   - 管理员操作：直接比对调用者地址
   - 开发者操作：查表验证开发者权限
   - NFT 操作：验证所有者权限

## 后续开发计划
1. 添加更多广告类型支持
2. 实现广告效果分析
3. 集成更多支付方式
4. 移动端适配优化
5. 多语言支持
6. 社交功能集成