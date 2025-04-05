import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Form, Input, Button, InputNumber, Select, message, Alert, Card, List, Empty } from 'antd';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { CreateAdSpaceParams, UserRole, RegisterGameDevParams } from '../types';
import { createAdSpaceTx, registerGameDevTx } from '../utils/contract';
import { CONTRACT_CONFIG } from '../config/config';
import './Manage.scss';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ManagePage: React.FC = () => {
  const [adSpaceForm] = Form.useForm();
  const [devRegisterForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
  const [registeredDevs, setRegisteredDevs] = useState<string[]>([]);
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  // 检查用户角色
  useEffect(() => {
    const checkUserRole = async () => {
      if (!account) return;
      
      try {
        // 导入auth.ts中的checkUserRole函数
        const { checkUserRole } = await import('../utils/auth');
        
        // 使用SuiClient和用户地址检查用户角色
        const role = await checkUserRole(suiClient, account.address);
        console.log('当前用户角色:', role);
        setUserRole(role);
        
        // 如果是管理员，获取已注册的开发者列表
        if (role === UserRole.ADMIN) {
          const { getGameDevsFromFactory } = await import('../utils/contract');
          const devs = await getGameDevsFromFactory(CONTRACT_CONFIG.FACTORY_OBJECT_ID);
          setRegisteredDevs(devs);
        }
      } catch (err) {
        console.error('检查用户角色失败:', err);
        message.error('检查用户角色失败');
      }
    };
    
    checkUserRole();
  }, [account, suiClient]);

  // 创建广告位表单提交
  const handleCreateAdSpace = async (values: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // 将价格转换为整数（以MIST为单位，1 SUI = 10^9 MIST）
      const priceInMist = BigInt(Math.floor(Number(values.price) * 1000000000));
      
      const params: CreateAdSpaceParams = {
        factoryId: CONTRACT_CONFIG.FACTORY_OBJECT_ID,
        gameId: values.gameId,
        location: values.location,
        size: values.size,
        price: priceInMist.toString(),
        clockId: CONTRACT_CONFIG.CLOCK_ID
      };
      
      // 创建交易
      const txb = createAdSpaceTx(params);
      
      // 执行交易
      try {
        await signAndExecute({
          transaction: txb.serialize()
        });
        
        console.log('交易执行成功');
        
        // 交易成功后直接执行后续操作
        message.success('广告位创建成功！');
        adSpaceForm.resetFields();
      } catch (txError) {
        console.error('交易执行失败:', txError);
        const errorMsg = txError instanceof Error ? txError.message : String(txError);
        setError(`交易执行失败: ${errorMsg}`);
      }
    } catch (err) {
      console.error('创建广告位失败:', err);
      setError('创建广告位失败，请检查输入并重试。');
    } finally {
      setLoading(false);
    }
  };
  
  // 注册游戏开发者
  const handleRegisterGameDev = async (values: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // 规范化地址格式，确保统一格式用于比较
      const normalizedAddress = values.devAddress.toLowerCase();
      
      // 验证地址格式
      if (!normalizedAddress.startsWith('0x') || normalizedAddress.length !== 66) {
        setError('开发者地址格式无效，请输入有效的Sui钱包地址');
        setLoading(false);
        return;
      }
      
      // 检查开发者是否已经注册
      const isDevAlreadyRegistered = registeredDevs.some(
        dev => dev.toLowerCase() === normalizedAddress
      );
      
      if (isDevAlreadyRegistered) {
        setError('该地址已经注册为游戏开发者');
        setLoading(false);
        return;
      }

      // 创建交易
      const params = {
        factoryId: CONTRACT_CONFIG.FACTORY_OBJECT_ID,
        developer: normalizedAddress
      };

      const txb = registerGameDevTx(params);
      
      // 执行交易
      try {
        const result = await signAndExecute({
          transaction: txb.serialize()
        });
        
        console.log('交易执行成功:', result);
        
        // 交易成功后才执行后续操作
        message.success('游戏开发者注册成功！');
        devRegisterForm.resetFields();
        
        // 重新从合约获取最新的开发者列表
        try {
          const { getGameDevsFromFactory } = await import('../utils/contract');
          const updatedDevs = await getGameDevsFromFactory(CONTRACT_CONFIG.FACTORY_OBJECT_ID);
          setRegisteredDevs(updatedDevs);
        } catch (fetchError) {
          console.error('更新开发者列表失败:', fetchError);
          // 如果获取失败，至少将新注册的开发者添加到列表中
          setRegisteredDevs(prev => [...prev, normalizedAddress]);
        }
      } catch (txError) {
        console.error('交易执行失败:', txError);
        const errorMsg = txError instanceof Error ? txError.message : String(txError);
        setError(`交易执行失败: ${errorMsg}`);
      }
    } catch (err) {
      console.error('注册游戏开发者失败:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`注册游戏开发者失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // 如果用户未连接钱包，显示提示信息
  if (!account) {
    return (
      <div className="manage-page">
        <div className="section-title">
          <Title level={2}>管理中心</Title>
          <Paragraph>创建和管理您的广告位。</Paragraph>
        </div>
        
        <div className="connect-wallet-prompt">
          <Alert
            message="请连接钱包"
            description="您需要连接钱包才能使用管理功能。"
            type="info"
            showIcon
          />
        </div>
      </div>
    );
  }

  return (
    <div className="manage-page">
      <div className="section-title">
        <Title level={2}>管理中心</Title>
        <Paragraph>创建和管理您的广告位。</Paragraph>
      </div>
      
      <Tabs defaultActiveKey="create" className="manage-tabs">
        {userRole === UserRole.ADMIN && (
          <TabPane tab="开发者管理" key="devManage">
            <div className="form-container">
              <Title level={4}>游戏开发者管理</Title>
              <Paragraph>
                作为平台管理员，您可以在此注册新的游戏开发者。
              </Paragraph>
              
              {error && (
                <Alert 
                  message="错误" 
                  description={error} 
                  type="error" 
                  showIcon 
                  className="error-alert"
                  closable
                  onClose={() => setError(null)}
                />
              )}
              
              <Card title="注册新开发者" className="register-dev-card">
                <Form
                  form={devRegisterForm}
                  layout="vertical"
                  onFinish={handleRegisterGameDev}
                  className="register-form"
                >
                  <Form.Item
                    name="devAddress"
                    label="开发者钱包地址"
                    rules={[{ required: true, message: '请输入开发者钱包地址' }]}
                  >
                    <Input placeholder="请输入开发者的SUI钱包地址" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      className="submit-button"
                    >
                      注册开发者
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
              
              <div className="registered-devs-section">
                <Title level={4}>已注册开发者</Title>
                {registeredDevs.length > 0 ? (
                  <List
                    dataSource={registeredDevs}
                    renderItem={(dev) => (
                      <List.Item className="dev-address-item">
                        <div className="address-content">
                          <Text className="address-text">{dev}</Text>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(dev);
                              message.success('地址已复制');
                            }}
                          >
                            复制
                          </Button>
                        </div>
                      </List.Item>
                    )}
                    bordered
                    className="registered-devs-list"
                  />
                ) : (
                  <Empty description="暂无已注册的开发者" />
                )}
              </div>
            </div>
          </TabPane>
        )}
        
        <TabPane tab="创建广告位" key="create">
          <div className="form-container">
            <Title level={4}>新建广告位</Title>
            <Paragraph>
              在此创建新的广告位。创建后，广告位将可供用户购买。
            </Paragraph>
            
            {error && (
              <Alert 
                message="错误" 
                description={error} 
                type="error" 
                showIcon 
                className="error-alert"
                closable
                onClose={() => setError(null)}
              />
            )}
            
            <Form
              form={adSpaceForm}
              layout="vertical"
              onFinish={handleCreateAdSpace}
              className="create-form"
            >
              <Form.Item
                name="gameId"
                label="游戏ID"
                rules={[{ required: true, message: '请输入游戏ID' }]}
              >
                <Input placeholder="请输入游戏ID" />
              </Form.Item>
              
              <Form.Item
                name="location"
                label="位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="请输入位置，如'大厅门口'、'竞技场中心'等" />
              </Form.Item>
              
              <Form.Item
                name="size"
                label="尺寸"
                rules={[{ required: true, message: '请选择尺寸' }]}
              >
                <Select placeholder="请选择尺寸">
                  <Option value="小">小 (128x128)</Option>
                  <Option value="中">中 (256x256)</Option>
                  <Option value="大">大 (512x512)</Option>
                  <Option value="超大">超大 (1024x512)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="price"
                label="价格 (SUI)"
                rules={[
                  { required: true, message: '请输入价格' },
                  { type: 'number', min: 0.000001, message: '价格必须大于0' }
                ]}
              >
                <InputNumber
                  placeholder="请输入价格"
                  step={0.1}
                  precision={6}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="submit-button"
                >
                  创建广告位
                </Button>
              </Form.Item>
            </Form>
          </div>
        </TabPane>
        
        <TabPane tab="我的广告位" key="myAdSpaces">
          <div className="coming-soon">
            <Title level={4}>即将推出</Title>
            <Paragraph>
              该功能正在开发中，敬请期待。
            </Paragraph>
          </div>
        </TabPane>
        
        <TabPane tab="收益统计" key="statistics">
          <div className="coming-soon">
            <Title level={4}>即将推出</Title>
            <Paragraph>
              该功能正在开发中，敬请期待。
            </Paragraph>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ManagePage;