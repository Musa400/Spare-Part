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
} from 'antd';
import Adminlayout from '../layout/Sidebar';

const { Option } = Select;

function PurchaseRegister() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setSuppliers([
      { _id: 's1', name: 'عرضه کوونکی ۱' },
      { _id: 's2', name: 'عرضه کوونکی ۲' },
    ]);
    setSpareParts([
      { _id: 'p1', name: 'پرزه ۱' },
      { _id: 'p2', name: 'پرزه ۲' },
    ]);
    setPurchases([]);
  }, []);

  const showModal = (purchase = null) => {
    setEditingPurchase(purchase);
    if (purchase) {
      form.setFieldsValue({
        supplierId: purchase.supplier._id,
        sparePartId: purchase.sparePart._id,
        quantity: purchase.quantity,
        price: purchase.price,
        purchaseDate: purchase.purchaseDate,
        description: purchase.description,
        companyName: purchase.companyName,
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

  const handleFinish = (values) => {
    const newPurchase = {
      _id: editingPurchase ? editingPurchase._id : Date.now().toString(),
      supplier: suppliers.find((s) => s._id === values.supplierId),
      sparePart: spareParts.find((p) => p._id === values.sparePartId),
      quantity: values.quantity,
      price: values.price,
      purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
      description: values.description || '',
      companyName: values.companyName,
    };

    let updatedPurchases;
    if (editingPurchase) {
      updatedPurchases = purchases.map((p) =>
        p._id === editingPurchase._id ? newPurchase : p
      );
      messageApi.success('معلومات تازه شول');
    } else {
      updatedPurchases = [...purchases, newPurchase];
      messageApi.success('اخستنه ثبت شو');
    }
    setPurchases(updatedPurchases);
    handleCancel();
  };

  const handleDelete = (id) => {
    setPurchases(purchases.filter((p) => p._id !== id));
    messageApi.success('حذف شو');
  };

  const columns = [
    {
      title: 'عرضه کوونکی',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
    },
    {
      title: 'پرزه',
      dataIndex: ['sparePart', 'name'],
      key: 'sparePart',
    },
    {
      title: 'شرکت',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'مقدار',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'قیمت',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'نیټه',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
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
            title="ډاډه یی؟"
            onConfirm={() => handleDelete(record._id)}
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
      {contextHolder}
      <div dir="rtl" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>د اخستنه ثبت</h2>

        <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
          نوی اخستنه
        </Button>

        <Table
          columns={columns}
          dataSource={purchases}
          pagination={{ pageSize: 5 }}
          rowKey="_id"
        />

        <Modal
          title={editingPurchase ? 'د اخستنه سمول' : 'نوی اخستنه'}
          open={visible}
          onCancel={handleCancel}
          footer={null}
          destroyOnHidden
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            autoComplete="off"
          >
            <Form.Item
              label="عرضه کوونکی"
              name="supplierId"
              rules={[{ required: true, message: 'عرضه کوونکی انتخاب کړئ' }]}
            >
             <Input/>
            </Form.Item>

            <Form.Item
              label="پرزه"
              name="sparePartId"
              rules={[{ required: true, message: 'پرزه انتخاب کړئ' }]}
            >
              <Input/>
            </Form.Item>

            <Form.Item
              label="شرکت"
              name="companyName"
              rules={[{ required: true, message: 'شرکت نوم ولیکئ' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="مقدار"
              name="quantity"
              rules={[{ required: true, message: 'مقدار ولیکئ' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="قیمت"
              name="price"
              rules={[{ required: true, message: 'قیمت ولیکئ' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="نیټه"
              name="purchaseDate"
              rules={[{ required: true, message: 'نیټه انتخاب کړئ' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="توضیحات" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                ثبت
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Adminlayout>
  );
}

export default PurchaseRegister;
