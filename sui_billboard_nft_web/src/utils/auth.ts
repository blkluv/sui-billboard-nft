import { SuiClient as SuiJsClient } from '@mysten/sui.js/client';
import { type SuiClient as DappKitSuiClient } from '@mysten/sui/client';
import { UserRole } from '../types';
import { CONTRACT_CONFIG } from '../config/config';
import { SuiObjectResponse, SuiMoveObject } from '@mysten/sui.js/client';

/**
 * 检查用户是否拥有平台管理员权限
 * @param client SuiClient实例
 * @param address 用户钱包地址（用于发送交易）
 * @returns 是否拥有管理员权限
 */
export async function checkIsAdmin(client: SuiJsClient | DappKitSuiClient, address: string): Promise<boolean> {
  try {
    // 验证合约配置
    if (!CONTRACT_CONFIG.PACKAGE_ID || !CONTRACT_CONFIG.MODULE_NAME || !CONTRACT_CONFIG.FACTORY_OBJECT_ID) {
      console.error('合约配置无效:', {
        packageId: CONTRACT_CONFIG.PACKAGE_ID,
        moduleName: CONTRACT_CONFIG.MODULE_NAME,
        factoryId: CONTRACT_CONFIG.FACTORY_OBJECT_ID
      });
      throw new Error('合约配置无效');
    }

    // 验证地址格式
    if (!address?.startsWith('0x')) {
      console.error('钱包地址格式无效:', address);
      throw new Error('钱包地址格式无效');
    }

    console.log('准备检查管理员权限:', {
      factoryId: CONTRACT_CONFIG.FACTORY_OBJECT_ID,
      address
    });

    // 获取工厂对象的数据
    const factoryObject = await client.getObject({
      id: CONTRACT_CONFIG.FACTORY_OBJECT_ID,
      options: {
        showContent: true
      }
    });

    // 检查对象是否存在
    if (!factoryObject.data) {
      console.error('工厂对象不存在或无法访问');
      return false;
    }

    // 获取对象内容以检查管理员
    const content = factoryObject.data.content;
    if (!content || content.dataType !== 'moveObject') {
      console.error('工厂对象不是Move对象或内容为空');
      return false;
    }

    // 访问对象中的字段
    const fields = (content as { fields: Record<string, any> }).fields;
    
    // 检查管理员字段
    const admin = fields.admin;
    if (!admin) {
      console.warn('对象中找不到管理员字段');
      return false;
    }

    // 规范化地址格式进行比较
    const isAdmin = admin.toLowerCase() === address.toLowerCase();
    
    console.log('管理员权限检查结果:', {
      isAdmin,
      adminAddress: admin
    });
    
    return isAdmin;
  } catch (error) {
    console.error('检查管理员权限失败:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      address
    });
    return false;
  }
}

/**
 * 检查用户是否拥有游戏开发者权限
 * @param client SuiClient实例
 * @param address 用户钱包地址（用于发送交易）
 * @returns 是否拥有游戏开发者权限
 */
export async function checkIsGameDev(client: SuiJsClient | DappKitSuiClient, address: string): Promise<boolean> {
  try {
    // 验证合约配置
    if (!CONTRACT_CONFIG.PACKAGE_ID || !CONTRACT_CONFIG.MODULE_NAME || !CONTRACT_CONFIG.FACTORY_OBJECT_ID) {
      console.error('合约配置无效:', {
        packageId: CONTRACT_CONFIG.PACKAGE_ID,
        moduleName: CONTRACT_CONFIG.MODULE_NAME,
        factoryId: CONTRACT_CONFIG.FACTORY_OBJECT_ID
      });
      throw new Error('合约配置无效');
    }

    // 验证地址格式
    if (!address?.startsWith('0x')) {
      console.error('钱包地址格式无效:', address);
      throw new Error('钱包地址格式无效');
    }

    console.log('准备检查游戏开发者权限:', {
      factoryId: CONTRACT_CONFIG.FACTORY_OBJECT_ID,
      address
    });

    // 获取工厂对象的数据
    const factoryObject = await client.getObject({
      id: CONTRACT_CONFIG.FACTORY_OBJECT_ID,
      options: {
        showContent: true
      }
    });

    // 检查对象是否存在
    if (!factoryObject.data) {
      console.error('工厂对象不存在或无法访问');
      return false;
    }

    // 获取对象内容以检查游戏开发者列表
    const content = factoryObject.data.content;
    if (!content || content.dataType !== 'moveObject') {
      console.error('工厂对象不是Move对象或内容为空');
      return false;
    }

    // 访问对象中的字段
    const fields = (content as { fields: Record<string, any> }).fields;
    
    // 检查游戏开发者列表字段并直接进行判断
    const gameDevs = fields.game_devs;
    if (!gameDevs || !Array.isArray(gameDevs)) {
      console.warn('对象中找不到游戏开发者列表字段或格式不正确');
      return false;
    }

    // 规范化地址格式进行比较
    const normalizedAddress = address.toLowerCase();
    const isGameDev = gameDevs.some((dev: string) => dev.toLowerCase() === normalizedAddress);
    
    console.log('游戏开发者权限检查结果:', {
      isGameDev,
      totalDevs: gameDevs.length
    });
    
    return isGameDev;
  } catch (error) {
    console.error('检查游戏开发者权限失败:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      address
    });
    return false;
  }
}

/**
 * 检查用户角色
 * @param client SuiClient实例
 * @param address 用户钱包地址
 * @returns 用户角色
 */
export async function checkUserRole(client: SuiJsClient | DappKitSuiClient, address: string): Promise<UserRole> {
  console.log('=== 开始检查用户角色 ===');
  console.log('钱包地址:', address);
  console.log('合约配置:', {
    PACKAGE_ID: CONTRACT_CONFIG.PACKAGE_ID,
    MODULE_NAME: CONTRACT_CONFIG.MODULE_NAME,
    FACTORY_OBJECT_ID: CONTRACT_CONFIG.FACTORY_OBJECT_ID
  });

  try {
    // 首先检查是否是管理员
    console.log('正在检查管理员权限...');
    const isAdmin = await checkIsAdmin(client, address);
    console.log('管理员检查结果:', isAdmin);
    
    if (isAdmin) {
      console.log('用户是管理员');
      return UserRole.ADMIN;
    }
    
    // 然后检查是否是游戏开发者
    console.log('正在检查游戏开发者权限...');
    const isGameDev = await checkIsGameDev(client, address);
    console.log('游戏开发者检查结果:', isGameDev);
    
    if (isGameDev) {
      console.log('用户是游戏开发者');
      return UserRole.GAME_DEV;
    }
    
    // 默认为普通用户
    console.log('用户是普通用户');
    return UserRole.USER;
  } catch (error) {
    console.error('检查用户角色时发生错误:', error);
    console.log('默认返回普通用户角色');
    return UserRole.USER;
  } finally {
    console.log('=== 用户角色检查完成 ===');
  }
}