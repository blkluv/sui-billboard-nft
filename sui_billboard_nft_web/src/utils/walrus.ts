/**
 * 更新环境变量配置，添加Walrus URL相关配置
 * 
 * 需在.env文件中添加如下配置:
 * REACT_APP_WALRUS_ENVIRONMENT=testnet|mainnet
 * REACT_APP_WALRUS_AGGREGATOR_URL_TESTNET=https://aggregator.walrus-testnet.walrus.space/v1/blobs/by-object-id/
 * REACT_APP_WALRUS_AGGREGATOR_URL_MAINNET=https://walrus.globalstake.io/v1/blobs/by-object-id/
 */

import { WalrusClient } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import type { WriteBlobOptions } from '@mysten/walrus';


export type SignFunction = (tx: any) => Promise<any>;

/**
 * Walrus服务类：负责与Walrus存储交互
 */
export class WalrusService {
  private client!: WalrusClient;
  private suiClient!: SuiClient;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1秒
  private walrusAggregatorUrl: string;
  
  constructor() {
    // 使用类型断言确保网络类型正确
    const network = (process.env.REACT_APP_WALRUS_ENVIRONMENT || 'testnet') as 'testnet' | 'mainnet' | 'devnet' | 'localnet';
    console.log('初始化 Walrus 服务，网络环境:', network);
    
    // 根据环境获取正确的Walrus聚合器URL
    if (network === 'mainnet') {
      this.walrusAggregatorUrl = process.env.REACT_APP_WALRUS_AGGREGATOR_URL_MAINNET || 'https://walrus.globalstake.io/v1/blobs/by-object-id/';
    } else {
      // testnet, devnet, localnet 都使用 testnet 聚合器
      this.walrusAggregatorUrl = process.env.REACT_APP_WALRUS_AGGREGATOR_URL_TESTNET || 'https://aggregator.walrus-testnet.walrus.space/v1/blobs/by-object-id/';
    }
    
    console.log('Walrus 聚合器 URL:', this.walrusAggregatorUrl);
    
    // 初始化 SUI 客户端
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network),
    });
    
    try {
      // 初始化 Walrus 客户端
      this.client = new WalrusClient({
        // 只使用 testnet 或 mainnet，将 devnet 和 localnet 都映射到 testnet
        network: (network === 'testnet' || network === 'mainnet') ? network : 'testnet',
        // 由于类型不兼容问题，使用类型断言
        suiClient: this.suiClient as any,
        // 使用 CDN 地址加载 WASM
        wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
        storageNodeClientOptions: {
          timeout: 60_000,
          // 调整fetch参数类型
          fetch: ((url: RequestInfo, options?: RequestInit) => 
            this.fetchWithRetry(url.toString(), options || {}, this.MAX_RETRIES)) as any
        }
      });
      
      console.log('Walrus 客户端初始化完成');
    } catch (err) {
      console.error('Walrus 客户端初始化失败:', err);
    }
  }

  /**
   * 延迟指定时间
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 带重试的fetch请求
   */
  private async fetchWithRetry(url: string, options: any, retries = this.MAX_RETRIES): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(60_000) // 60秒超时
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${response.statusText}\n${errorText}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        console.log(`请求失败，${retries}次重试机会剩余，等待${this.RETRY_DELAY}ms后重试...`);
        await this.delay(this.RETRY_DELAY);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }
  
  /**
   * 上传文件到Walrus
   * @param file 要上传的文件
   * @param duration 存储时长(秒)
   * @param address 钱包地址
   * @param signAndExecute 签名并执行交易的函数
   * @returns Promise<{blobId: string, url: string}>
   */
  async uploadFile(
    file: File, 
    duration: number, 
    address: string,
    signAndExecute: SignFunction
  ): Promise<{ blobId: string, url: string }> {
    try {
      console.log(`正在上传文件到Walrus: ${file.name}, 大小: ${file.size} 字节`);
      
      // 将文件转换为 Uint8Array
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // 计算存储时长（转换为epoch数，1个epoch约24小时）
      const epochs = Math.ceil(duration / (24 * 60 * 60));
      console.log(`文件将存储 ${epochs} 个epochs（约${epochs}天）`);
      
      try {
        // 创建存储对象
        let tx = await this.client.createStorageTransaction({
          size: uint8Array.length,
          epochs: epochs,
          owner: address
        });
        
        // 检查钱包连接并执行存储创建交易
        try {
          // 确保交易对象正确格式化，以便钱包能够识别
          if (!tx) {
            throw new Error('创建存储交易失败：交易对象为空');
          }
          
          // 确保交易对象包含发送者信息
          if (typeof tx === 'object') {
            // 如果是 TransactionBlock 对象，需要设置 sender
            if ('setSender' in tx && typeof tx.setSender === 'function') {
              console.log('设置交易发送者为:', address);
              tx.setSender(address);
            }
            
            // 如果是普通对象，添加 sender 属性
            if (!('sender' in tx)) {
              console.log('添加发送者属性:', address);
              (tx as any).sender = address;
            }
          }
          
          // 打印交易对象的类型和内容，帮助调试
          console.log('准备签名存储创建交易, 交易类型:', typeof tx);
          
          // 等待签名结果
          console.log('调用钱包签名函数...');
          const storageResult = await signAndExecute(tx);
          
          // 验证签名结果
          console.log('签名函数返回结果类型:', typeof storageResult, '内容:', storageResult);
          
          if (!storageResult) {
            throw new Error('存储创建交易失败：钱包未返回交易结果');
          }
          
          console.log('存储创建交易成功:', storageResult);
        } catch (err) {
          console.error('存储创建交易错误:', err);
          const errorMessage = err instanceof Error ? err.message : '未知错误';
          throw new Error('存储创建交易失败: ' + errorMessage);
        }
        
        // 上传文件 - 调整signer接口以匹配最新API
        console.log('准备上传文件内容到Walrus...');
        
        // 创建符合 Walrus 要求的 signer 对象
        const walrusSigner = {
          // 提供签名交易块的方法
          signTransactionBlock: async (txb: any) => {
            console.log('准备签名文件上传交易，交易类型:', typeof txb);
            try {
              // 确保交易对象有效
              if (!txb) {
                throw new Error('文件上传交易对象为空');
              }
              
              // 确保交易对象包含发送者信息
              if (typeof txb === 'object') {
                // 如果是 TransactionBlock 对象，需要设置 sender
                if ('setSender' in txb && typeof txb.setSender === 'function') {
                  console.log('设置文件上传交易发送者为:', address);
                  txb.setSender(address);
                }
                
                // 如果是普通对象，添加 sender 属性
                if (!('sender' in txb)) {
                  console.log('添加文件上传交易发送者属性:', address);
                  (txb as any).sender = address;
                }
              }
              
              // 调用签名函数并等待结果
              const result = await signAndExecute(txb);
              console.log('文件上传交易签名成功:', result);
              return result;
            } catch (error) {
              console.error('文件上传交易签名失败:', error);
              throw error;
            }
          },
          
          // 添加 toSuiAddress 方法，返回钱包地址
          toSuiAddress: () => {
            console.log('调用 toSuiAddress 方法，返回地址:', address);
            return address;
          },
          
          // 添加地址属性
          address: address
        };
        
        try {
          console.log('开始写入blob数据至Walrus存储网络...');
          
          /**
           * WriteBlobOptions类型定义参照:
           * https://sdk.mystenlabs.com/typedoc/types/_mysten_walrus.WriteBlobOptions.html
           */
          const writeBlobOptions: WriteBlobOptions = {
            blob: uint8Array,
            deletable: true,
            epochs: epochs,
            signer: walrusSigner as any,
            attributes: {
              filename: file.name,
              contentType: file.type,
              size: file.size.toString(),
              lastModified: new Date(file.lastModified).toISOString(),
              uploadTime: new Date().toISOString(),
              origin: window.location.origin || 'unknown'
            },
            // 可选参数: 如果需要指定owner，可以在这里设置
            // owner: address
          };
          
          console.log('正在执行blob上传，参数:', JSON.stringify({
            fileSize: file.size,
            fileType: file.type,
            epochs: epochs,
            attributes: writeBlobOptions.attributes
          }));
          
          const result = await this.client.writeBlob(writeBlobOptions);

          if (!result || !result.blobId) {
            throw new Error('文件上传失败：未获取到有效的blob信息');
          }
          
          const { blobId, blobObject } = result;
          
          console.log(`文件上传成功, Blob ID: ${blobId}`, blobObject ? `对象ID: ${blobObject.id?.id}` : '');
          
          // 获取blob URL
          let url = '';
          try {
            const objectId = blobObject?.id?.id;
            // 使用改进的getBlobUrl方法，优先使用objectId
            if (objectId) {
              url = await this.getBlobUrl(objectId);
              console.log(`成功获取Blob URL: ${url}`);
            } else {
              throw new Error('未获取到有效的对象ID');
            }
          } catch (e) {
            console.warn('无法通过对象ID获取blob URL:', e);
            // 备用URL构造方式
            const network = process.env.REACT_APP_WALRUS_ENVIRONMENT || 'testnet';
            url = `https://${network}.walrus.app/blob/${blobId}`;
            console.log(`使用备用URL: ${url}`);
          }
          
          if (!url) {
            throw new Error('无法生成有效的Blob URL');
          }
          
          return { blobId, url };
        } catch (uploadError) {
          console.error('Walrus blob上传错误:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : '未知错误';
          throw new Error(`Blob上传失败: ${errorMessage}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'RetryableWalrusClientError') {
          console.log('遇到可重试错误，重置客户端后重试...');
          (this.client as any).reset();
          // 重新尝试上传
          return this.uploadFile(file, duration, address, signAndExecute);
        }
        throw error;
      }
    } catch (err) {
      console.error('Walrus上传错误:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      throw new Error(`上传到Walrus失败: ${errorMessage}`);
    }
  }
  
  /**
   * 读取Blob内容
   * @param blobId Walrus中的Blob ID
   * @returns Promise<Uint8Array>
   */
  async readBlob(blobId: string): Promise<Uint8Array> {
    try {
      return await this.client.readBlob({ blobId });
    } catch (error) {
      if (error instanceof Error && error.name === 'RetryableWalrusClientError') {
        console.log('遇到可重试错误，重置客户端后重试...');
        (this.client as any).reset();
        return this.readBlob(blobId);
      }
      throw error;
    }
  }
  
  /**
   * 获取Blob的类型信息
   * @param blobId Walrus中的Blob ID
   */
  async getBlobType(blobId: string): Promise<any> {
    try {
      // 传入对象参数或直接传入blobId，根据API需要调整
      return await (this.client as any).getBlobType({ blobId });
    } catch (e) {
      // 如果方法不存在，返回默认值
      console.warn('getBlobType方法可能不存在或已更改:', e);
      return { contentType: 'application/octet-stream' };
    }
  }
  
  /**
   * 获取Blob的URL
   * @param objectId Blob对象的ID
   * @returns Promise<string>
   */
  async getBlobUrl(objectId?: string): Promise<string> {
    try {
      // 使用Object ID方式构建URL (推荐方式)
      if (objectId) {
        console.log(`使用对象ID ${objectId} 构建URL`);
        return `${this.walrusAggregatorUrl}${objectId}`;
      }
      
      // 如果没有objectId，返回错误信息
      console.warn('未提供对象ID，无法构建URL');
      throw new Error('缺少对象ID，无法生成Walrus URL');
    } catch (e) {
      console.error('获取Blob URL时出错:', e);
      throw new Error(`无法获取Blob URL: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

// 创建单例实例
export const walrusService = new WalrusService(); 