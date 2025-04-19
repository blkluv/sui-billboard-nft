import React, { useState } from 'react';
import { Button, Upload, message, Radio, Spin, Form, Input, Progress, Tooltip } from 'antd';
import { UploadOutlined, CheckCircleOutlined, InfoCircleOutlined, InboxOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/lib/upload';
import { walrusService } from '../../utils/walrus';
import './WalrusUpload.scss';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import type { SignFunction } from '../../utils/walrus';

const { Dragger } = Upload;

interface WalrusUploadProps {
  onSuccess?: (url: string, blobId?: string, storageSource?: string) => void;
  onError?: (error: Error) => void;
  leaseDays?: number;
  onChange?: (data: { url: string; blobId?: string; storageSource: string }) => void;
}

/**
 * Walrus文件上传组件
 * 支持外部URL和Walrus上传两种模式
 */
const WalrusUpload: React.FC<WalrusUploadProps> = ({ onSuccess, onError, leaseDays = 30, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [storageMode, setStorageMode] = useState<'walrus' | 'external'>('walrus');
  const [externalUrl, setExternalUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const signFunction: SignFunction = async (tx) => {
    if (!account?.address) {
      throw new Error('钱包未连接');
    }
    
    try {
      const response = await signAndExecute({
        transaction: tx,
        chain: 'sui:testnet'
      });
      
      return response;
    } catch (e) {
      console.error('签名失败:', e);
      throw e;
    }
  };

  const handleUpload = async (file: RcFile) => {
    if (!account?.address) {
      message.error('请先连接钱包');
      return false;
    }

    setUploading(true);
    try {
      const duration = leaseDays * 24 * 60 * 60; // 转换为秒
      const result = await walrusService.uploadFile(
        file,
        duration,
        account.address,
        signFunction
      );

      message.success('文件上传成功');
      onSuccess?.(result.url, result.blobId, 'walrus');
      
      // 通知父组件内容变更
      onChange?.({
        url: result.url,
        blobId: result.blobId,
        storageSource: 'walrus'
      });
    } catch (error) {
      console.error('文件上传失败:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      message.error('文件上传失败: ' + err.message);
      onError?.(err);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: handleUpload,
    showUploadList: false,
    disabled: uploading || !account?.address,
  };

  const handleExternalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setExternalUrl(url);
    setPreviewError(false);
    
    if (url) {
      onSuccess?.(url, undefined, 'external');
      onChange?.({
        url: url,
        storageSource: 'external'
      });
      // 当URL输入后显示预览
      setPreviewVisible(true);
    } else {
      setPreviewVisible(false);
    }
  };

  const handleImageError = () => {
    setPreviewError(true);
    message.error('无法加载图片，请检查URL是否正确或可访问');
  };

  const handleModeChange = (e: any) => {
    const mode = e.target.value;
    setStorageMode(mode);
    
    // 清空另一种模式的数据
    if (mode === 'external') {
      // 如果有外部URL，通知父组件
      if (externalUrl) {
        onSuccess?.(externalUrl, undefined, 'external');
        onChange?.({
          url: externalUrl,
          storageSource: 'external'
        });
      }
    } else {
      // 切换到Walrus模式时，清空外部URL
      setExternalUrl('');
      setPreviewVisible(false);
      setPreviewError(false);
    }
  };

  return (
    <div className="walrus-upload-container">
      <div className="storage-selector">
        <Radio.Group onChange={handleModeChange} value={storageMode}>
          <Radio value="walrus">上传到Walrus</Radio>
          <Radio value="external">使用外部URL</Radio>
        </Radio.Group>
      </div>
      
      {storageMode === 'walrus' ? (
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {account?.address
              ? '点击或拖拽文件到此区域上传'
              : '请先连接钱包'}
          </p>
          <p className="ant-upload-hint">
            支持单个文件上传，文件将存储在 Walrus 上
          </p>
        </Dragger>
      ) : (
        <div>
          <Form.Item>
            <Input 
              placeholder="请输入完整的外部图片URL，包括http://或https://" 
              value={externalUrl} 
              onChange={handleExternalUrlChange}
            />
            <div className="upload-note">
              请确保您提供的图片URL是公开可访问的，且文件格式为常见图片格式（如JPG、PNG、GIF等）
            </div>
          </Form.Item>
          
          {previewVisible && externalUrl && (
            <div className="external-url-preview">
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <span>预览：</span>
              </div>
              
              {previewError ? (
                <div className="preview-error">
                  <p>无法加载图片，请检查URL是否正确或可公开访问</p>
                  <p>请确保URL指向的是图片文件，而不是网页</p>
                  <Button 
                    type="link" 
                    onClick={() => window.open(externalUrl, '_blank')}
                  >
                    在新标签页检查URL
                  </Button>
                </div>
              ) : (
                <div style={{ border: '1px dashed #d9d9d9', padding: '8px', borderRadius: '4px' }}>
                  <img 
                    src={externalUrl} 
                    alt="预览图片" 
                    style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', margin: '0 auto' }}
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalrusUpload; 