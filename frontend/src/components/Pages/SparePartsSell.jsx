import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, Table, message, Typography, Row, Col, Statistic, Modal, Spin, Popconfirm } from 'antd';
import { ShoppingCartOutlined, BarcodeOutlined, PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import Adminlayout from '../layout/Sidebar';
import dayjs from 'dayjs';
import 'dayjs/locale/fa';

dayjs.locale('fa');

const { Title } = Typography;
const { Option } = Select;

const SparePartsSell = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [sales, setSales] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [salesSummary, setSalesSummary] = useState({
        totalSales: 0,
        todaySales: 0,
        totalAmount: 0,
        todayAmount: 0
    });

    useEffect(() => {
        fetchSpareParts();
        fetchSales();
        fetchSalesSummary();
    }, []);

    const fetchSpareParts = async () => {
        try {
            const response = await axios.get(' /spareparts');
            setSpareParts(response.data);
        } catch (error) {
            console.error('Error fetching spare parts:', error);
            message.error('د پرزو ترلاسه کولو کې ستونزه راغله');
        } finally {
            setFetching(false);
        }
    };

    const fetchSales = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/sales');
            const formattedSales = response.data.sales.flatMap(sale => 
                sale.items.map(item => ({
                    key: `${sale._id}-${item._id}`,
                    part: item.sparePart.name,
                    brand: item.sparePart.brand,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                    date: dayjs(sale.date || sale.createdAt).format('YYYY/MM/DD HH:mm'),
                    customerName: sale.customerName
                }))
            );
            setSales(formattedSales);
        } catch (error) {
            console.error('Error fetching sales:', error);
            message.error('د پلورنو ترلاسه کولو کې ستونزه راغله');
        }
    };

    const fetchSalesSummary = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/sales/summary');
            setSalesSummary({
                totalSales: response.data.totalSales,
                todaySales: response.data.todaySales,
                totalAmount: response.data.totalAmount,
                todayAmount: response.data.todayAmount
            });
        } catch (error) {
            console.error('Error fetching sales summary:', error);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalVisible(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const part = spareParts.find(p => p._id === values.partId);
            if (!part) {
                throw new Error('Part not found');
            }

            // Create sale on backend
            const response = await axios.post('http://localhost:5000/api/sales', {
                items: [{
                    sparePart: values.partId,
                    quantity: parseInt(values.quantity, 10)
                }],
                customerName: values.customerName || 'ناشناس'
            });

            // Update local state
            const newSale = response.data.sale;
            const formattedSales = newSale.items.map(item => ({
                key: `${newSale._id}-${item._id}`,
                part: item.sparePart.name,
                brand: item.sparePart.brand,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                date: dayjs(newSale.date || new Date()).format('YYYY/MM/DD HH:mm'),
                customerName: newSale.customerName
            }));

            setSales([...formattedSales, ...sales]);
            
            // Update summary
            fetchSalesSummary();
            
            message.success('پلورنه په بریالیتوب سره ثبت سول!');
            form.resetFields();
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error recording sale:', error);
            const errorMessage = error.response?.data?.message || 'د پلورنې ثبت کولو کې ستونزه راغله';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (saleId) => {
        try {
            await axios.delete(`http://localhost:5000/api/sales/${saleId}`);
            
            // Update local state
            setSales(sales.filter(sale => !sale.key.startsWith(saleId)));
            
            // Refresh summary and spare parts
            await fetchSalesSummary();
            await fetchSpareParts();
            
            message.success('پلورنه په بریالیتوب سره ړنګه سول!');
        } catch (error) {
            console.error('Error deleting sale:', error);
            message.error('د پلورنې ړنګولو کې ستونزه راغله');
        }
    };

    const columns = [
         {
            title: 'عمل',
            key: 'action',
            render: (_, record) => {
                // Extract the sale ID from the key (format: saleId-itemId)
                const saleId = record.key.split('-')[0];
                return (
                    <Popconfirm
                        title="ایا تاسو ډاډه یاست چې غواړئ دا پلورنه ړنګه کړئ؟"
                        onConfirm={() => handleDelete(saleId)}
                        okText="هو"
                        cancelText="نه"
                    >
                        <Button 
                            type="link" 
                            danger 
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                );
            },
        },
        {
            title: 'نیټه',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'مجموعه',
            dataIndex: 'total',
            key: 'total',
            render: (total) => `${total.toLocaleString()} AFN`,
        },
        {
            title: 'شمیره',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'فی قیمت',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString()} AFN`,
        },
        {
            title: 'برانډ',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'د پرزې نوم',
            dataIndex: 'part',
            key: 'part',
        },
        {
            title: 'مشتري نوم',
            dataIndex: 'customerName',
            key: 'customerName',
        },
       
    ];

    if (fetching) {
        return (
            <Adminlayout>
                <div className="flex justify-center items-center h-64">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </div>
            </Adminlayout>
        );
    }

    return (
        <Adminlayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <Title level={3} className="flex items-center m-0">
                        <ShoppingCartOutlined className="ml-2" />  پرزو خرڅول مدیریت 
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                    >
                        نوی پلور
                    </Button>
                </div>

                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="نننۍ پلورنې"
                                value={salesSummary.todaySales}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="نننۍ عاید"
                                value={salesSummary.todayAmount}
                                precision={2}
                                valueStyle={{ color: '#3f8600' }}
                                suffix="AFN"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="ټول پلورنې"
                                value={salesSummary.totalSales}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="shadow-md">
                            <Statistic
                                title="ټول عاید"
                                value={salesSummary.totalAmount}
                                precision={2}
                                valueStyle={{ color: '#fa8c16' }}
                                suffix="AFN"
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="وروستنۍ پلورنې" className="shadow-md">
                    <Table
                        columns={columns}
                        dataSource={sales}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: true }}
                        dir="rtl"
                        loading={loading}
                    />
                </Card>

                <Modal
                    title="نوې پلورنه ثبتول"
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                    width={600}
                    centered
                    dir="rtl"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        className="mt-6"
                    >
                        <Form.Item
                            name="partId"
                            label="د پرزې نوم"
                            rules={[{ required: true, message: 'مهرباني وکړئ د پرزې نوم وټاکئ' }]}
                        >
                            <Select
                                showSearch
                                placeholder="د پرزې نوم وټاکئ"
                                optionFilterProp="children"
                                suffixIcon={<BarcodeOutlined />}
                                className="w-full"
                                loading={fetching}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {spareParts.map(part => (
                                    <Option key={part._id} value={part._id}>
                                        {part.name} - {part.brand} (شمیره: {part.quantity} | قیمت: {part.price} AFN)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label="شمیره"
                            rules={[{
                                required: true,
                                message: 'مهرباني وکړئ شمیره ولیکئ',
                                type: 'number',
                                min: 1,
                                transform: value => Number(value)
                            }]}
                        >
                            <Input
                                type="number"
                                min={1}
                                placeholder="شمیره"
                                className="w-full"
                            />
                        </Form.Item>

                        <Form.Item
                            name="customerName"
                            label="د پیرودونکې نوم (اختیاري)"
                        >
                            <Input placeholder="د پیرودونکې نوم ولیکئ" />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <div className="flex justify-end gap-4">
                                <Button onClick={handleCancel}>
                                    بندول
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    ثبتول
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Adminlayout>
    );
};

export default SparePartsSell;
