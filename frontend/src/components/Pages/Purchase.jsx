import React, { useState, useEffect } from 'react';
import {
  Table,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  InputNumber,
  Button,
  Space,
  Popconfirm,
  message,
  Spin,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import Adminlayout from '../layout/Sidebar';
import axios from 'axios';
import dayjs from 'dayjs';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Option } = Select;

function PurchaseRegister() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchSpareParts();
  }, [pagination.current]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      const response = await axios.get('http://localhost:5000/api/purchases', {
        params: {
          page: current,
          limit: pageSize,
        },
      });
      
      setPurchases(response.data.purchases);
      setPagination({
        ...pagination,
        total: response.data.totalPurchases,
      });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      message.error('د اخستنو ترلاسه کولو کې ستونزه راغله');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // In a real app, you would fetch this from your API
      setSuppliers([
        { _id: 's1', name: 'عرضه کوونکی ۱' },
        { _id: 's2', name: 'عرضه کوونکی ۲' },
      ]);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('د عرضه کوونکو ترلاسه کولو کې ستونزه راغله');
    }
  };

  const fetchSpareParts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/spareparts');
      setSpareParts(response.data);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      message.error('د پرزو ترلاسه کولو کې ستونزه راغله');
    }
  };

  const showModal = (purchase = null) => {
    setEditingPurchase(purchase);
    if (purchase) {
      form.setFieldsValue({
        supplier: purchase.supplier,
        items: purchase.items.map(item => ({
          sparePart: item.sparePart._id,
          quantity: item.quantity,
          price: item.price,
        })),
        description: purchase.description,
        companyName: purchase.companyName,
        purchaseDate: dayjs(purchase.purchaseDate),
      });
    } else {
      form.resetFields();
    }
    setVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
    setEditingPurchase(null);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const purchaseData = {
        ...values,
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
        items: values.items || [],
      };

      if (editingPurchase) {
        await axios.put(
          `http://localhost:5000/api/purchases/${editingPurchase._id}`,
          purchaseData
        );
        message.success('اخستنه په بریالیتوب سره تازه سول!');
      } else {
        await axios.post('http://localhost:5000/api/purchases', purchaseData);
        message.success('نوې اخستنه په بریالیتوب سره ثبت سول!');
      }

      fetchPurchases();
      handleCancel();
    } catch (error) {
      console.error('Error saving purchase:', error);
      message.error('د خوندي کولو پر وخت ستونزه راغله');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/purchases/${id}`);
      message.success('اخستنه په بریالیتوب سره ړنګه سول!');
      fetchPurchases();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      message.error('د ړنګولو پر وخت ستونزه راغله');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'عرضه کوونکی',
      dataIndex: ['supplier'],
      key: 'supplier',
    },
    {
      title: 'پرزه',
      dataIndex: ['items', '0', 'sparePart', 'name'],
      key: 'sparePart',
    },
    {
      title: 'شرکت',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'مقدار',
      dataIndex: ['items', '0', 'quantity'],
      key: 'quantity',
    },
    {
      title: 'فی قیمت',
      dataIndex: ['items', '0', 'price'],
      key: 'price',
      render: (price) => `${price?.toLocaleString()} AFN`,
    },
    {
      title: 'مجموعه',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (total) => `${total?.toLocaleString()} AFN`,
    },
    {
      title: 'نیټه',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'تفصیل',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>
            سمول
          </Button>
          <Popconfirm
            title="آیا تاسو ډاډه یاست؟"
            onConfirm={() => handleDelete(record._id)}
            okText="هو"
            cancelText="نه"
          >
            <Button type="link" danger>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Adminlayout>
      <div dir="rtl" style={{ padding: 24 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="مجموعه اخستنې"
                value={pagination.total}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Button 
          type="primary" 
          onClick={() => showModal()} 
          style={{ marginBottom: 16 }}
          icon={<PlusOutlined />}
        >
          نویه اخستنه
        </Button>

        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `مجموعه ${total} اخستنې`,
          }}
          onChange={handleTableChange}
        />

        <Modal
          title={editingPurchase ? 'د اخستنې سمول' : 'نوې اخستنې ثبتول'}
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              items: [{}],
              purchaseDate: dayjs(),
            }}
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ marginBottom: 16, border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'sparePart']}
                            label="پرزه"
                            rules={[{ required: true, message: 'لطفاً یوه پرزه وټاکئ' }]}
                          >
                            <Select placeholder="د پرزې نوم وټاکئ" showSearch optionFilterProp="children">
                              {spareParts.map(part => (
                                <Option key={part._id} value={part._id}>
                                  {part.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'quantity']}
                            label="مقدار"
                            rules={[{ required: true, message: 'لطفاً مقدار ولیکئ' }]}
                          >
                            <InputNumber min={1} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            label="فی قیمت"
                            rules={[{ required: true, message: 'لطفاً قیمت ولیکئ' }]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        {fields.length > 1 && (
                          <Col span={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button
                              type="text"
                              danger
                              onClick={() => remove(name)}
                              style={{ marginBottom: 24 }}
                            >
                              حذف
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      د پرزې زیاتول
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              name="supplier"
              label="عرضه کوونکی"
              rules={[{ required: true, message: 'لطفاً د عرضه کوونکي نوم ولیکئ' }]}
            >
              <Input placeholder="د عرضه کوونکي نوم ولیکئ" />
            </Form.Item>

            <Form.Item
              name="companyName"
              label="د شرکت نوم"
              rules={[{ required: true, message: 'لطفاً د شرکت نوم ولیکئ' }]}
            >
              <Input placeholder="د شرکت نوم" />
            </Form.Item>

            <Form.Item
              name="purchaseDate"
              label="نیټه"
              rules={[{ required: true, message: 'لطفاً نیټه وټاکئ' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item name="description" label="تفصیل">
              <Input.TextArea rows={3} placeholder="اضافي تفصیل (اختیاري)" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPurchase ? 'تغیرول' : 'ثبتول'}
              </Button>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                ردول
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Adminlayout>
  );
}

export default PurchaseRegister;
