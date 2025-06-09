import React, { useState, useEffect } from 'react';
import {
    Table,
    Input,
    Button,
    InputNumber,
    Form,
    Modal,
    Space,
    Popconfirm,
    message,
    Alert,
} from 'antd';
import Adminlayout from '../layout/Sidebar';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const columnsBase = (onEdit, onDelete) => [
    { title: 'د پرزې نوم', dataIndex: 'name', key: 'name' },
    { title: 'د موټر ډول', dataIndex: 'carModel', key: 'carModel' },
    { title: 'د شرکت نوم', dataIndex: 'brand', key: 'brand' },
    {
        title: 'قیمت (AFN)',
        dataIndex: 'price',
        key: 'price',
        render: (text) => `${text} افغانی`,
    },
    { title: 'مقدار', dataIndex: 'quantity', key: 'quantity' },
    { title: 'توضیحات', dataIndex: 'description', key: 'description', ellipsis: true },
    {
        title: 'عملیات',
        key: 'actions',
        render: (_, record) => (
            <Space size="middle" dir="ltr">
                <Button type="link" onClick={() => onEdit(record)} icon={<EditOutlined />} />
                <Popconfirm
                    title="ایا ډاډه یی چې حذف یې کوې؟"
                    onConfirm={() => onDelete(record.key)}
                    okText="هو"
                    cancelText="نه"
                >
                    <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
            </Space>
        ),
    },
];

function SpareParts() {
    const [spareParts, setSpareParts] = useState([]);
    const [lowStockParts, setLowStockParts] = useState([]);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch spare parts from backend API
    const fetchSpareParts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/spareparts');
            if (!res.ok) throw new Error('Failed to fetch spare parts');
            const data = await res.json();
            // Map _id to key for antd Table
            const mappedData = data.map((item) => ({ ...item, key: item._id }));
            setSpareParts(mappedData);

            // Find low stock parts (quantity <= 3)
            const lowStock = mappedData.filter((part) => part.quantity <= 3);
           console.log(data)
            setLowStockParts(lowStock);
        } catch (error) {
            messageApi.error('د موټر پرزو د راوړلو پر مهال ستونزه پېښه شوه');
        }
    };

    useEffect(() => {
        fetchSpareParts();
    }, []);

    const showModal = () => {
        setEditingPart(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    // Handle form submit (add or update)
    const onFinish = async (values) => {
        try {
            if (editingPart) {
                // Update spare part
                const res = await fetch(`http://localhost:5000/api/spareparts/${editingPart._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw new Error('Update failed');
                messageApi.success('پرزه په بریالیتوب سره سمول شوه');
            } else {
                // Check if part exists by name + carModel
                const existingPart = spareParts.find(
                    (part) => part.name === values.name && part.carModel === values.carModel
                );

                if (existingPart) {
                    // Update existing part's quantity and price
                    const updatedPart = {
                        ...existingPart,
                        quantity: existingPart.quantity + values.quantity,
                        price: values.price,
                        brand: values.brand,
                        description: values.description,
                    };

                    const res = await fetch(`http://localhost:5000/api/spareparts/${existingPart._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedPart),
                    });

                    if (!res.ok) throw new Error('Update failed');
                    messageApi.success('موجوده پرزه په بریالیتوب سره تازه شوه');
                } else {
                    // Add new spare part
                    const res = await fetch('http://localhost:5000/api/spareparts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(values),
                    });
                    if (!res.ok) throw new Error('Create failed');
                    messageApi.success('پرزه په بریالیتوب سره اضافه شوه');
                }
            }

            form.resetFields();
            setIsModalOpen(false);
            fetchSpareParts();
        } catch (error) {
            messageApi.error('په سرور کې تېروتنه پېښه شوه');
        }
    };

    const onEdit = (record) => {
        setEditingPart(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const onDelete = async (key) => {
        try {
            const res = await fetch(`http://localhost:5000/api/spareparts/${key}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Delete failed');
            messageApi.success('پرزه په بریالیتوب سره حذف شوه');
            fetchSpareParts();
        } catch (error) {
            messageApi.error('په سرور کې تېروتنه پېښه شوه');
        }
    };

    return (
        <Adminlayout>
            {contextHolder}
            <div dir="rtl" style={{ maxWidth: 960, margin: 20, padding: 24, backgroundColor: '#fff' }}>
                {/* Low stock alert */}
                {lowStockParts.length > 0 && (
                    <Alert
                        message={`توجه: ${lowStockParts.length} پرزې د مقدار له ۳ څخه کم یا مساوي دي!`}
                        description={`لاندې پرزې مقدار یې ټیټ دی: ${lowStockParts
                            .map(p => `${p.name} (د موټر ډول: ${p.carModel})`)
                            .join(', ')}`}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 'bold', fontSize: 28 }}>
                    د موټر پرزو مدیریت
                </h2>

                <Button type="primary" onClick={showModal} style={{ marginBottom: 24 }}>
                    د پرزې اضافه کول
                </Button>

                <Modal
                    title={editingPart ? 'د پرزې سمول' : 'نوی موټر پرزه اضافه کړئ'}
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    destroyOnClose
                    centered
                >
                    <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                        <Form.Item
                            label="د پرزې نوم"
                            name="name"
                            rules={[{ required: true, message: 'مهرباني وکړئ د پرزې نوم ولیکئ' }]}
                        >
                            <Input placeholder="د پرزې نوم ولیکئ" />
                        </Form.Item>

                        <Form.Item
                            label="د موټر ډول"
                            name="carModel"
                            rules={[{ required: true, message: 'مهرباني وکړئ د موټر ډول ولیکئ' }]}
                        >
                            <Input placeholder="د موټر ډول ولیکئ" />
                        </Form.Item>

                        <Form.Item
                            label="د شرکت نوم"
                            name="brand"
                            rules={[{ required: true, message: 'مهرباني وکړئ د شرکت نوم ولیکئ' }]}
                        >
                            <Input placeholder="د شرکت نوم ولیکئ" />
                        </Form.Item>

                        <Form.Item
                            label="قیمت (AFN)"
                            name="price"
                            rules={[{ required: true, message: 'مهرباني وکړئ قیمت ولیکئ' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="قیمت ولیکئ" />
                        </Form.Item>

                        <Form.Item
                            label="مقدار"
                            name="quantity"
                            rules={[{ required: true, message: 'مهرباني وکړئ مقدار ولیکئ' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="مقدار ولیکئ" />
                        </Form.Item>

                        <Form.Item label="توضیحات" name="description">
                            <Input.TextArea rows={3} placeholder="اختیاري توضیحات ولیکئ" />
                        </Form.Item>

                        <Form.Item>
                            {editingPart ?
                            <Button type="primary" danger htmlType="submit" block>
                                   سمول
                
                            </Button>
                            :
                            <Button type="primary" htmlType="submit" block>
                                اضافه
                                کول
                                   
                
                            </Button>
                            }
                        </Form.Item>
                    </Form>   
                </Modal>

                <Table
                    style={{ width: 1000, margin: 20 }}
                    columns={columnsBase(onEdit, onDelete)}
                    dataSource={spareParts}
                    pagination={{ pageSize: 5 }}
                    bordered
                    scroll={{ x: 'max-content' }}
                    rowKey="key"
                />
            </div>
        </Adminlayout>
    );
}

export default SpareParts;
