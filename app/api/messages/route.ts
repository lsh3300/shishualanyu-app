import { NextRequest, NextResponse } from 'next/server';

// 模拟消息数据库
let messages = [
  {
    id: '1',
    type: 'system',
    title: '系统通知',
    content: '欢迎加入世说蓝语平台！您的账号已成功激活，现在可以开始探索蓝染文化的奇妙世界。',
    isRead: false,
    timestamp: '2024-01-20T10:30:00',
  },
  {
    id: '2',
    type: 'course',
    title: '课程更新提醒',
    content: '您关注的「传统扎染基础入门」课程已更新新章节，快来学习吧！',
    isRead: false,
    timestamp: '2024-01-19T15:20:00',
    avatar: '/placeholder-user.jpg',
    userName: '张老师',
    relatedUrl: '/teaching/1',
  },
  {
    id: '3',
    type: 'order',
    title: '订单状态更新',
    content: '您的订单 #20240118001 已发货，预计3-5天送达。',
    isRead: true,
    timestamp: '2024-01-18T09:15:00',
    userName: '物流中心',
    relatedUrl: '/orders/20240118001',
  },
  {
    id: '4',
    type: 'community',
    title: '社区动态',
    content: '李师傅发布了新的蓝染作品，引发了社区热议。',
    isRead: true,
    timestamp: '2024-01-17T14:45:00',
    avatar: '/traditional-indigo-dyeing-master-craftsman.jpg',
    userName: '李师傅',
    relatedUrl: '/community/works/123',
  },
  {
    id: '5',
    type: 'comment',
    title: '新评论通知',
    content: '您的作品「蓝染山水」收到了新的评论："色彩运用非常出色，特别是渐变效果！"',
    isRead: false,
    timestamp: '2024-01-16T11:00:00',
    userName: '艺术爱好者',
    relatedUrl: '/community/works/456',
  },
  {
    id: '6',
    type: 'follow',
    title: '新关注者',
    content: '「蓝染爱好者」关注了您，快去看看他的作品吧！',
    isRead: false,
    timestamp: '2024-01-15T16:30:00',
    userName: '蓝染爱好者',
    relatedUrl: '/profile/789',
  },
];

// GET 请求处理 - 获取消息列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const keyword = searchParams.get('keyword');
    const isRead = searchParams.get('isRead');

    let filteredMessages = [...messages];

    // 按类型筛选
    if (type) {
      filteredMessages = filteredMessages.filter(msg => msg.type === type);
    }

    // 按关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredMessages = filteredMessages.filter(msg => 
        msg.title.toLowerCase().includes(lowerKeyword) || 
        msg.content.toLowerCase().includes(lowerKeyword)
      );
    }

    // 按已读状态筛选
    if (isRead !== null) {
      const readStatus = isRead === 'true';
      filteredMessages = filteredMessages.filter(msg => msg.isRead === readStatus);
    }

    // 按时间倒序排列
    filteredMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: filteredMessages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取消息失败' },
      { status: 500 }
    );
  }
}

// PATCH 请求处理 - 标记消息为已读
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, all } = body;

    if (all) {
      // 标记所有消息为已读
      messages = messages.map(msg => ({ ...msg, isRead: true }));
    } else if (messageId) {
      // 标记指定消息为已读
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex] = { ...messages[messageIndex], isRead: true };
      } else {
        return NextResponse.json(
          { success: false, error: '消息不存在' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '消息已标记为已读',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '标记消息失败' },
      { status: 500 }
    );
  }
}

// DELETE 请求处理 - 删除消息
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: '缺少消息ID' },
        { status: 400 }
      );
    }

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      messages.splice(messageIndex, 1);
      return NextResponse.json({
        success: true,
        message: '消息已删除',
      });
    } else {
      return NextResponse.json(
        { success: false, error: '消息不存在' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除消息失败' },
      { status: 500 }
    );
  }
}

// GET_COUNT 请求处理 - 获取未读消息数量
export async function GET_COUNT() {
  try {
    const unreadCount = messages.filter(msg => !msg.isRead).length;
    return NextResponse.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取未读消息数量失败' },
      { status: 500 }
    );
  }
}