import React, { useState } from 'react';
import {
    ShopOutlined,
    SyncOutlined,
    FileTextOutlined,
    ImportOutlined,
    UserOutlined,
    TeamOutlined,
    TransactionOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BuildOutlined,
    ToolOutlined,
    CarOutlined,
    MoneyCollectFilled,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { Button, Layout, Menu, theme } from 'antd';

const { Header, Sider, Content } = Layout;

const Adminlayout = ({ children }) => {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const items = [
        {
            key: '/',
            icon: <CarOutlined />,
            label: <Link to='/'>پرزو مدیریت</Link>,
        },
        {
            key: '/Spare Part Sale',
            icon: <MoneyCollectFilled />,
            label: <Link to='/sale'>پرزو خرڅول مدیریت</Link>,
        },
        {
            key: '/report',
            icon: <FileTextOutlined />,
            label: <Link to='/report'>Report</Link>,
        },
        {
            key: '/borrow',
            icon: <ImportOutlined />,
            label: <Link to='/borrow'>Borrowing</Link>,
        },
        {
            key: '/customer',
            icon: <UserOutlined />,
            label: <Link to='/customer'>Customer</Link>,
        },
        {
            key: '/account',
            icon: <TeamOutlined />,
            label: <Link to='/account'>Account</Link>,
        },
        {
            key: '/transaction',
            icon: <TransactionOutlined />,
            label: <Link to='/transaction'>Transaction</Link>,
        },
    ];

    return (
        <Layout className='!min-h-screen'>
            <Layout style={{ flexDirection: 'row-reverse' }}>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <div className="demo-logo-vertical" />
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={[pathname]}
                        items={items}
                    />
                </Sider>
                <Layout>
                    <Header style={{ padding: 0, background: colorBgContainer }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
                            <div></div> {/* Optional left space */}
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />
                        </div>
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 600,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default Adminlayout;
