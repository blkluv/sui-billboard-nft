# sui-billboard-nft 链上动态广告牌NFT系统

## 项目介绍
链上动态广告牌NFT系统是一个基于Sui区块链的创新广告解决方案。该系统将链游和虚拟世界中的广告位转化为可交易的NFT，为品牌方提供高效、透明、可动态更新的链上广告服务。

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
   - 支持租约续期

2. **动态内容更新**：
   - 实时更新广告内容
   - 支持内容URL和哈希更新
   - 所有者权限控制

3. **透明计费机制**：
   - 基于时长的智能定价
   - 自动退还多余支付
   - 费用明细链上可查

4. **权限管理系统**：
   - 平台管理员权限
   - 游戏开发者权限
   - 广告位所有者权限

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

## 价格计算
系统使用智能定价算法，基于以下因素计算广告位价格：
- 基础固定价格
- 租期长度
- 指数衰减模型

价格计算公式：
```move
let yearly_price = ad_space.fixed_price;
let daily_min_price = yearly_price / 100;
let base = 99900; // 0.999
let factor = 100000; // 1.0

// 计算指数衰减
while (i < duration_days) {
    factor = factor * base / 100000;
    i = i + 1;
};

// 最终价格
let price_range = yearly_price - daily_min_price;
price = daily_min_price + price_range * (100000 - factor) / 100000;
```

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
1. 确保安装了Sui CLI
2. 编译项目：
```bash
sui move build
```
3. 部署到测试网：
```bash
sui client publish --gas-budget 100000000
```

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
4. 开发用户友好的管理界面