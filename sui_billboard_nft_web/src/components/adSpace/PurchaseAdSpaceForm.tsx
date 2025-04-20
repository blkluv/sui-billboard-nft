import React, { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, message, Space, Tooltip, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { SuiClient } from '@mysten/sui/client';
import { useCurrentAccount } from '@mysten/dapp-kit';
import WalrusUpload from '../walrus/WalrusUpload';
import { formatSuiCoin } from '../../utils/formatter';
import { AdSpace, PurchaseAdSpaceParams } from '../../types';
import { createPurchaseAdSpaceTx, calculateLeasePrice } from '../../utils/contract';
import { useTransaction } from '../../hooks/useTransaction';

interface PurchaseAdSpaceFormProps {
  adSpace: AdSpace;
  onSuccess?: (txHash: string) => void;
  onCancel?: () => void;
  suiClient: SuiClient;
}

const PurchaseAdSpaceForm: React.FC<PurchaseAdSpaceFormProps> = ({
  adSpace,
  onSuccess,
  onCancel,
  suiClient
}) => {
  const [form] = Form.useForm();
  const [contentParams, setContentParams] = useState<{
    url: string;
    blobId?: string;
    storageSource?: string;
  }>({ url: '' });
  const [leaseDays, setLeaseDays] = useState(365);
  const [contentUploaded, setContentUploaded] = useState(false);
  
  const account = useCurrentAccount();
  const transaction = useTransaction(suiClient, {
    successMessage: '广告位购买成功！',
    loadingMessage: '正在购买广告位...',
    successMessageKey: 'purchase_success',
    loadingMessageKey: 'purchase_loading',
    onSuccess
  });
  
  // 处理内容上传成功
  const handleContentUploadSuccess = (url: string, blobId?: string, storageSource?: string) => {
    setContentParams({ url, blobId, storageSource });
    setContentUploaded(true);
  };
  
  // 处理内容参数变更
  const handleContentParamsChange = (data: { url: string; blobId?: string; storageSource: string }) => {
    setContentParams(data);
    setContentUploaded(!!data.url);
  };
  
  // 处理租期变更
  const handleLeaseDaysChange = (value: number | null) => {
    if (value) {
      setLeaseDays(value);
    }
  };
  
  // 提交表单，购买广告位
  const handleSubmit = async (values: any) => {
    // 检查内容URL
    if (!contentParams.url) {
      message.error('请提供广告内容URL');
      return;
    }
    
    // 准备购买参数
    const purchaseParams: PurchaseAdSpaceParams = {
      adSpaceId: adSpace.id,
      contentUrl: contentParams.url,
      brandName: values.brandName,
      projectUrl: values.projectUrl,
      price: adSpace.price,
      leaseDays: values.leaseDays,
      blobId: contentParams.blobId,
      storageSource: contentParams.storageSource
    };
    
    // 构建交易
    const tx = createPurchaseAdSpaceTx(purchaseParams);
    
    // 执行交易
    await transaction.executeTransaction(tx);
  };
  
  // 当内容上传成功后，更新表单字段的禁用状态
  useEffect(() => {
    if (contentUploaded) {
      form.setFieldValue('leaseDays', leaseDays);
    }
  }, [contentUploaded, leaseDays, form]);
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        leaseDays: 365
      }}
    >
      <Form.Item
        label="品牌名称"
        name="brandName"
        rules={[{ required: true, message: '请输入品牌名称' }]}
      >
        <Input placeholder="请输入品牌名称" maxLength={50} />
      </Form.Item>
      
      <Form.Item
        label="项目链接"
        name="projectUrl"
        rules={[
          { required: true, message: '请输入项目链接' },
          { type: 'url', message: '请输入有效的URL' }
        ]}
      >
        <Input placeholder="请输入项目链接" />
      </Form.Item>
      
      <Form.Item
        label={
          <Space>
            <span>租期（天）</span>
            <Tooltip title="请输入1-365天的租期">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
        name="leaseDays"
        rules={[{ required: true, message: '请输入租期天数' }]}
        extra={
          contentUploaded ? 
          "上传成功后租期不可修改" :
          "请输入1-365天的整数，租期越长折扣越多"
        }
      >
        <InputNumber
          min={1}
          max={365}
          precision={0}
          style={{ width: '100%' }}
          onChange={handleLeaseDaysChange}
          addonAfter="天"
          disabled={contentUploaded}
        />
      </Form.Item>
      
      {contentUploaded && (
        <Alert
          message="自定义开始时间和广告开始时间已根据系统设置自动配置"
          description="为确保广告展示的一致性，上传成功后系统将自动配置广告的开始时间。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <Form.Item
        label="广告内容"
        required
        help="支持图片格式：PNG、JPG、GIF，最大文件大小：10MB"
      >
        <WalrusUpload
          onSuccess={handleContentUploadSuccess}
          onChange={handleContentParamsChange}
          leaseDays={leaseDays}
        />
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={transaction.isPending}
          >
            确认购买
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>
              取消
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PurchaseAdSpaceForm; 