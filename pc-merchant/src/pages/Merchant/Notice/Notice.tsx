import { Empty } from 'antd';


export default function Notice() {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
      description={<span>暂无消息通知</span>}
    />
  )
}
