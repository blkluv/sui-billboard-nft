import React from 'react';
import { Typography, Card, Button, Row, Col, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  GlobalOutlined, 
  BlockOutlined, 
  PictureOutlined, 
  CalendarOutlined,
  WalletOutlined,
  AppstoreOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './Home.scss';

const { Title, Paragraph, Text } = Typography;

// 科技动画组件
const TechAnimation: React.FC = () => (
  <div className="tech-animation">
    <div className="tech-grid"></div>
    <div className="tech-particles"></div>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <TechAnimation />
        <div className="hero-badge">基于 SUI 区块链</div>
        <Title>链上动态NFT广告牌发布系统</Title>
        <Paragraph className="subtitle">
          革命性的去中心化广告解决方案：将您的广告内容永久铸造到区块链上，
          实现透明、安全、可验证的链上广告展示与交易
        </Paragraph>
        
        <Space size="large" className="hero-buttons">
          <Link to="/ad-spaces">
            <Button type="primary" size="large" icon={<ShoppingOutlined />}>
              浏览广告位
            </Button>
          </Link>
          <Link to="/my-nfts">
            <Button size="large" icon={<UserOutlined />}>
              我的 NFT
            </Button>
          </Link>
        </Space>
        
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">100+</div>
            <div className="stat-label">可用广告位</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">50K+</div>
            <div className="stat-label">每日浏览量</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">5K+</div>
            <div className="stat-label">独立用户</div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <Title level={2} className="section-title">平台特色</Title>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8}>
            <Card className="feature-card">
              <div className="feature-icon">
                <BlockOutlined />
              </div>
              <Title level={3}>去中心化广告平台</Title>
              <Paragraph>
                利用区块链技术实现广告位的透明交易和管理，无需中介机构参与，确保交易的公开透明和不可篡改性
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card className="feature-card">
              <div className="feature-icon">
                <PictureOutlined />
              </div>
              <Title level={3}>NFT 形式广告位</Title>
              <Paragraph>
                您购买的广告位以 NFT 形式存储在区块链上，具有唯一性和永久性，可自由交易和管理
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card className="feature-card">
              <div className="feature-icon">
                <CalendarOutlined />
              </div>
              <Title level={3}>灵活的租期管理</Title>
              <Paragraph>
                灵活设置广告位租期，随时续租或更新广告内容，根据您的营销策略进行调整
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
      
      <Divider className="tech-divider">
        <BlockOutlined /> 区块链驱动
      </Divider>
      
      <div className="tech-section">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <div className="tech-content">
              <Title level={2}>基于 Sui 的新一代<br />广告生态系统</Title>
              <Paragraph>
                Sui 是下一代的高性能区块链平台，为我们的广告系统提供了坚实的技术基础。我们利用 Sui 区块链的独特优势，打造真正的去中心化广告生态系统。
              </Paragraph>
              <ul className="tech-list">
                <li><BlockOutlined /> 高吞吐量交易处理</li>
                <li><GlobalOutlined /> 全球性不可篡改记录</li>
                <li><ShoppingOutlined /> 即时结算与自动执行</li>
                <li><SettingOutlined /> 智能合约驱动的广告展示</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="tech-visual">
              <div className="blockchain-visual"></div>
            </div>
          </Col>
        </Row>
      </div>
      
      <div className="how-it-works">
        <Title level={2} className="section-title">使用步骤</Title>
        
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <Title level={4}><WalletOutlined /> 连接 Sui 钱包</Title>
            <Paragraph>
              点击右上角的"连接钱包"按钮，连接您的 Sui 钱包，确保您已安装支持 Sui 区块链的钱包扩展
            </Paragraph>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <Title level={4}><AppstoreOutlined /> 浏览广告位</Title>
            <Paragraph>
              浏览可用的广告位，查看详情、位置、曝光数据和价格，选择最适合您营销策略的位置
            </Paragraph>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <Title level={4}><ShoppingOutlined /> 购买 NFT 广告位</Title>
            <Paragraph>
              选择合适的广告位，支付 Sui 代币购买 NFT，交易将直接记录在区块链上，保证所有权的唯一性与永久性
            </Paragraph>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <Title level={4}><EditOutlined /> 管理您的广告</Title>
            <Paragraph>
              在"我的 NFT"页面管理您的广告内容，上传创意素材，设置链接与说明，并可随时更新或续租
            </Paragraph>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <Title level={2}>准备好开始您的区块链广告之旅了吗？</Title>
        <Paragraph>立即加入 链上动态NFT广告牌发布系统，体验区块链赋能的全新广告方式</Paragraph>
        <Link to="/ad-spaces">
          <Button type="primary" size="large" icon={<ShoppingOutlined />}>
            立即开始浏览
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;