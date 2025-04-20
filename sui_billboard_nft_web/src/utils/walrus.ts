import { WalrusClient } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import type { WriteBlobOptions } from '@mysten/walrus';
import type { Signer } from '@mysten/sui/cryptography';
import { WALRUS_CONFIG, getWalrusAggregatorUrl } from '../config/walrusConfig';

/**
 * 自定义签名器接口，兼容性更强
 */
export interface CustomSigner {
  signTransaction?: (tx: any) => Promise<any>;
  toSuiAddress: () => string;
  address?: string;
}

/**
 * Walrus服务类：负责与Walrus存储交互
 */
export class WalrusService {
  private client!: WalrusClient;
  private suiClient!: SuiClient;
  private readonly MAX_RETRIES = WALRUS_CONFIG.MAX_RETRIES;
  private readonly RETRY_DELAY = WALRUS_CONFIG.RETRY_DELAY;
  private walrusAggregatorUrl: string;
  
  constructor() {
    // 从配置获取网络类型
    const network = WALRUS_CONFIG.ENVIRONMENT;
    console.log('初始化 Walrus 服务，网络环境:', network);
    
    // 从配置获取聚合器URL
    this.walrusAggregatorUrl = getWalrusAggregatorUrl(network);
    console.log('Walrus 聚合器 URL:', this.walrusAggregatorUrl);
    
    // 初始化 SUI 客户端
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network),
    });
    
    try {
      // 初始化 Walrus 客户端
      this.client = new WalrusClient({
        // 网络环境配置
        network: network,
        // 由于类型不兼容问题，使用类型断言
        suiClient: this.suiClient as any,
        // 使用配置的WASM URL
        wasmUrl: WALRUS_CONFIG.WASM_URL,
        storageNodeClientOptions: {
          timeout: WALRUS_CONFIG.REQUEST_TIMEOUT,
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
        signal: AbortSignal.timeout(WALRUS_CONFIG.REQUEST_TIMEOUT)
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
   * @param signer 签名对象
   * @returns Promise<{blobId: string, url: string}>
   */
  async uploadFile(
    file: File, 
    duration: number, 
    address: string,
    signer: Signer | CustomSigner
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
        console.log('开始写入blob数据至Walrus存储网络...');
        
        /**
         * WriteBlobOptions类型定义参照:
         * https://sdk.mystenlabs.com/typedoc/types/_mysten_walrus.WriteBlobOptions.html
         */
        const writeBlobOptions: WriteBlobOptions = {
          blob: uint8Array,
          deletable: true,
          epochs: epochs,
          signer: signer as any, // 使用类型断言解决类型兼容性问题
          attributes: {
            filename: file.name,
            contentType: file.type,
            size: file.size.toString(),
            lastModified: new Date(file.lastModified).toISOString(),
            uploadTime: new Date().toISOString(),
            origin: window.location.origin || 'unknown'
          },
          // 使用signer的地址作为owner
          owner: signer.toSuiAddress()
        };
        
        console.log('正在执行blob上传，参数:', JSON.stringify({
          fileSize: file.size,
          fileType: file.type,
          epochs: epochs,
          owner: signer.toSuiAddress(),
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
        return this.uploadFile(file, duration, address, signer);
      }
      throw error;
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