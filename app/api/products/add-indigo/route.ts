import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // 蓝染文创产品数据
    const indigoProducts = [
      // 服饰类
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        name: '螺旋扎染T恤',
        slug: 'spiral-tie-dye-tshirt',
        description: '采用经典螺旋扎染技法，100%纯棉材质，图案独特永不重复。每一件都是手工艺术品。',
        price: 158.00,
        original_price: 198.00,
        category: '服饰',
        inventory: 50,
        is_new: true,
        discount: 20,
        metadata: {
          colors: ['靛蓝', '深蓝', '浅蓝'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          material: '100%纯棉',
          weight: '200g'
        }
      },
      {
        id: 'a2222222-2222-2222-2222-222222222222',
        name: '手风琴染条纹衬衫',
        slug: 'accordion-dye-shirt',
        description: '运用手风琴折叠技法，呈现规律条纹图案，适合商务休闲场合。',
        price: 228.00,
        original_price: 298.00,
        category: '服饰',
        inventory: 40,
        is_new: true,
        discount: 23,
        metadata: {
          colors: ['靛蓝条纹', '海军蓝条纹'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          material: '棉麻混纺',
          weight: '220g'
        }
      },
      {
        id: 'a3333333-3333-3333-3333-333333333333',
        name: '蜡染真丝丝巾',
        slug: 'wax-dye-silk-scarf',
        description: '传统蜡染工艺，真丝材质，轻盈飘逸。精致的几何图案展现东方美学。',
        price: 268.00,
        original_price: 358.00,
        category: '配饰',
        inventory: 60,
        is_new: true,
        discount: 25,
        metadata: {
          colors: ['靛蓝', '暮紫蓝', '月白蓝'],
          size: '90x90cm',
          material: '100%真丝',
          weight: '50g'
        }
      },
      {
        id: 'a4444444-4444-4444-4444-444444444444',
        name: '扎染帆布包',
        slug: 'tie-dye-canvas-bag',
        description: '环保帆布材质，大容量设计。独特的扎染图案让你在人群中脱颖而出。',
        price: 128.00,
        original_price: 168.00,
        category: '配饰',
        inventory: 80,
        is_new: false,
        discount: 24,
        metadata: {
          colors: ['靛蓝', '混合蓝'],
          size: '40x35x10cm',
          material: '12安帆布',
          capacity: '15L'
        }
      },
      {
        id: 'a5555555-5555-5555-5555-555555555555',
        name: '蓝染渔夫帽',
        slug: 'indigo-bucket-hat',
        description: '夏日必备单品，手工蓝染工艺，每一顶都独一无二。透气舒适，防晒时尚。',
        price: 88.00,
        original_price: 118.00,
        category: '配饰',
        inventory: 100,
        is_new: true,
        discount: 25,
        metadata: {
          colors: ['浅靛蓝', '深靛蓝'],
          sizes: ['均码'],
          material: '纯棉',
          weight: '80g'
        }
      },
      // 家居类
      {
        id: 'b1111111-1111-1111-1111-111111111111',
        name: '蓝染抱枕套',
        slug: 'indigo-pillow-cover',
        description: '为家居增添艺术气息，精美的扎染图案与现代简约风格完美融合。',
        price: 78.00,
        original_price: 98.00,
        category: '家居',
        inventory: 120,
        is_new: false,
        discount: 20,
        metadata: {
          colors: ['靛蓝', '暮蓝'],
          sizes: ['45x45cm', '50x50cm'],
          material: '纯棉',
          includes: '不含枕芯'
        }
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        name: '扎染艺术壁挂',
        slug: 'tie-dye-wall-tapestry',
        description: '大型艺术壁挂，采用传统扎染工艺。适合客厅、卧室或工作室装饰。',
        price: 388.00,
        original_price: 488.00,
        category: '家居',
        inventory: 30,
        is_new: true,
        discount: 20,
        metadata: {
          colors: ['靛蓝渐变'],
          size: '150x100cm',
          material: '纯棉布',
          includes: '含挂杆'
        }
      },
      {
        id: 'b3333333-3333-3333-3333-333333333333',
        name: '蓝染桌旗',
        slug: 'indigo-table-runner',
        description: '为餐桌增添雅致氛围，传统蓝染工艺与现代设计的完美结合。',
        price: 138.00,
        original_price: 178.00,
        category: '家居',
        inventory: 70,
        is_new: false,
        discount: 22,
        metadata: {
          colors: ['靛蓝', '月白蓝'],
          sizes: ['30x180cm', '30x220cm'],
          material: '棉麻混纺',
          weight: '200g'
        }
      },
      {
        id: 'b4444444-4444-4444-4444-444444444444',
        name: '扎染床品四件套',
        slug: 'tie-dye-bedding-set',
        description: '将艺术带入睡眠空间，柔软舒适的纯棉材质，独特的扎染图案。',
        price: 588.00,
        original_price: 788.00,
        category: '家居',
        inventory: 40,
        is_new: true,
        discount: 25,
        metadata: {
          colors: ['靛蓝梦境', '星空蓝'],
          sizes: ['1.5m床', '1.8m床'],
          material: '60支长绒棉',
          includes: '被套、床单、枕套x2'
        }
      },
      {
        id: 'b5555555-5555-5555-5555-555555555555',
        name: '蓝染茶席',
        slug: 'indigo-tea-mat',
        description: '禅意茶席，传统蓝染工艺。为茶道增添一份宁静与雅致。',
        price: 158.00,
        original_price: 198.00,
        category: '家居',
        inventory: 50,
        is_new: false,
        discount: 20,
        metadata: {
          colors: ['深靛蓝', '浅靛蓝'],
          size: '30x40cm',
          material: '亚麻',
          weight: '150g'
        }
      },
      // 文具类
      {
        id: 'c1111111-1111-1111-1111-111111111111',
        name: '蓝染笔记本',
        slug: 'indigo-notebook',
        description: '手工装帧笔记本，蓝染布面封面。记录你的创意与灵感。',
        price: 68.00,
        original_price: 88.00,
        category: '文具',
        inventory: 150,
        is_new: true,
        discount: 23,
        metadata: {
          colors: ['靛蓝', '月白蓝'],
          size: 'A5',
          pages: '192页',
          paper: '道林纸'
        }
      },
      {
        id: 'c2222222-2222-2222-2222-222222222222',
        name: '蓝染书签套装',
        slug: 'indigo-bookmark-set',
        description: '精致书签套装，每一枚都是独特的艺术品。送礼自用两相宜。',
        price: 38.00,
        original_price: 48.00,
        category: '文具',
        inventory: 200,
        is_new: false,
        discount: 21,
        metadata: {
          colors: ['混合蓝色系'],
          quantity: '5枚/套',
          material: '纯棉布',
          size: '5x15cm'
        }
      },
      {
        id: 'c3333333-3333-3333-3333-333333333333',
        name: '蓝染笔袋',
        slug: 'indigo-pencil-case',
        description: '简约实用的笔袋，蓝染工艺赋予其独特个性。学生办公皆宜。',
        price: 48.00,
        original_price: 58.00,
        category: '文具',
        inventory: 180,
        is_new: false,
        discount: 17,
        metadata: {
          colors: ['靛蓝', '深蓝'],
          size: '20x8x5cm',
          material: '帆布',
          closure: '拉链'
        }
      },
      // 艺术品类
      {
        id: 'd1111111-1111-1111-1111-111111111111',
        name: '蓝染装饰画（有框）',
        slug: 'indigo-framed-art',
        description: '专业装裱的蓝染艺术作品，为空间增添艺术气息。限量手工制作。',
        price: 688.00,
        original_price: 888.00,
        category: '艺术品',
        inventory: 20,
        is_new: true,
        discount: 22,
        metadata: {
          colors: ['靛蓝抽象'],
          sizes: ['40x60cm', '50x70cm'],
          material: '纯棉布+实木框',
          includes: '含框+玻璃'
        }
      },
      {
        id: 'd2222222-2222-2222-2222-222222222222',
        name: '蓝染屏风',
        slug: 'indigo-room-divider',
        description: '三折屏风，传统蓝染工艺。既是隔断又是艺术品。',
        price: 1888.00,
        original_price: 2388.00,
        category: '艺术品',
        inventory: 10,
        is_new: true,
        discount: 21,
        metadata: {
          colors: ['靛蓝山水'],
          size: '180x120cm(每扇40cm)',
          material: '纯棉布+实木框',
          folds: '3折'
        }
      },
      // 礼品套装类
      {
        id: 'e1111111-1111-1111-1111-111111111111',
        name: '蓝染茶具礼盒',
        slug: 'indigo-tea-gift-set',
        description: '精致茶具套装，包含茶席、杯垫、茶巾。送礼佳品。',
        price: 298.00,
        original_price: 388.00,
        category: '礼品',
        inventory: 60,
        is_new: true,
        discount: 23,
        metadata: {
          colors: ['靛蓝禅意'],
          includes: '茶席x1+杯垫x6+茶巾x2',
          material: '亚麻+纯棉',
          package: '礼盒包装'
        }
      },
      {
        id: 'e2222222-2222-2222-2222-222222222222',
        name: '蓝染文具礼盒',
        slug: 'indigo-stationery-gift',
        description: '文具爱好者的理想礼物，包含笔记本、书签、笔袋。',
        price: 168.00,
        original_price: 218.00,
        category: '礼品',
        inventory: 80,
        is_new: true,
        discount: 23,
        metadata: {
          colors: ['混合蓝色系'],
          includes: '笔记本x1+书签x5+笔袋x1',
          package: '精美礼盒'
        }
      },
      {
        id: 'e3333333-3333-3333-3333-333333333333',
        name: '蓝染家居礼盒',
        slug: 'indigo-home-gift-set',
        description: '温馨家居套装，为新居添置美好。包含抱枕套、桌旗、茶席。',
        price: 388.00,
        original_price: 488.00,
        category: '礼品',
        inventory: 40,
        is_new: true,
        discount: 20,
        metadata: {
          colors: ['靛蓝雅致'],
          includes: '抱枕套x2+桌旗x1+茶席x1',
          material: '纯棉+棉麻',
          package: '礼盒包装'
        }
      },
      // 配件类
      {
        id: 'f1111111-1111-1111-1111-111111111111',
        name: '蓝染发带',
        slug: 'indigo-headband',
        description: '清新文艺的发带，多种佩戴方式。为造型增添亮点。',
        price: 28.00,
        original_price: 38.00,
        category: '配饰',
        inventory: 200,
        is_new: false,
        discount: 26,
        metadata: {
          colors: ['靛蓝', '浅蓝'],
          size: '长约50cm宽约5cm',
          material: '纯棉',
          elastic: '弹性款'
        }
      },
      {
        id: 'f2222222-2222-2222-2222-222222222222',
        name: '蓝染口罩套',
        slug: 'indigo-mask-cover',
        description: '时尚环保的口罩套，可清洗重复使用。',
        price: 18.00,
        original_price: 28.00,
        category: '配饰',
        inventory: 300,
        is_new: false,
        discount: 36,
        metadata: {
          colors: ['靛蓝', '深蓝'],
          size: '成人通用',
          material: '纯棉双层',
          washable: '可机洗'
        }
      }
    ]
    
    // 插入产品
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .upsert(indigoProducts, { onConflict: 'id' })
      .select()
    
    if (productsError) {
      console.error('插入产品失败:', productsError)
      return NextResponse.json({
        success: false,
        error: '插入产品失败',
        details: productsError
      }, { status: 500 })
    }
    
    // 产品图片数据（使用占位图）
    const productMedia = [
      { product_id: 'a1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/spiral-tshirt-1/800/1000', position: 0, cover: true },
      { product_id: 'a1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/spiral-tshirt-2/800/1000', position: 1, cover: false },
      { product_id: 'a2222222-2222-2222-2222-222222222222', type: 'image', url: 'https://picsum.photos/seed/accordion-shirt/800/1000', position: 0, cover: true },
      { product_id: 'a3333333-3333-3333-3333-333333333333', type: 'image', url: 'https://picsum.photos/seed/silk-scarf/800/800', position: 0, cover: true },
      { product_id: 'a4444444-4444-4444-4444-444444444444', type: 'image', url: 'https://picsum.photos/seed/canvas-bag/800/1000', position: 0, cover: true },
      { product_id: 'a5555555-5555-5555-5555-555555555555', type: 'image', url: 'https://picsum.photos/seed/bucket-hat/800/800', position: 0, cover: true },
      { product_id: 'b1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/pillow-cover/800/800', position: 0, cover: true },
      { product_id: 'b2222222-2222-2222-2222-222222222222', type: 'image', url: 'https://picsum.photos/seed/wall-tapestry/800/1000', position: 0, cover: true },
      { product_id: 'b3333333-3333-3333-3333-333333333333', type: 'image', url: 'https://picsum.photos/seed/table-runner/800/600', position: 0, cover: true },
      { product_id: 'b4444444-4444-4444-4444-444444444444', type: 'image', url: 'https://picsum.photos/seed/bedding-set/800/600', position: 0, cover: true },
      { product_id: 'b5555555-5555-5555-5555-555555555555', type: 'image', url: 'https://picsum.photos/seed/tea-mat/800/600', position: 0, cover: true },
      { product_id: 'c1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/notebook/800/1000', position: 0, cover: true },
      { product_id: 'c2222222-2222-2222-2222-222222222222', type: 'image', url: 'https://picsum.photos/seed/bookmark-set/800/800', position: 0, cover: true },
      { product_id: 'c3333333-3333-3333-3333-333333333333', type: 'image', url: 'https://picsum.photos/seed/pencil-case/800/600', position: 0, cover: true },
      { product_id: 'd1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/framed-art/800/1000', position: 0, cover: true },
      { product_id: 'd2222222-2222-2222-2222-222222222222', type: 'image', url: 'https://picsum.photos/seed/room-divider/800/1000', position: 0, cover: true },
      { product_id: 'e1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/tea-gift/800/800', position: 0, cover: true },
      { product_id: 'e2222222-2222-2222-2222-222222222222', type: 'image', url: 'https://picsum.photos/seed/stationery-gift/800/800', position: 0, cover: true },
      { product_id: 'e3333333-3333-3333-3333-333333333333', type: 'image', url: 'https://picsum.photos/seed/home-gift/800/800', position: 0, cover: true },
      { product_id: 'f1111111-1111-1111-1111-111111111111', type: 'image', url: 'https://picsum.photos/seed/headband/800/600', position: 0, cover: true },
      { product_id: 'f2222222-2222-2222-2222-222222222222', type: 'image', url: 'https://picsum.photos/seed/mask-cover/800/800', position: 0, cover: true },
    ]
    
    // 插入产品图片
    const { data: mediaData, error: mediaError } = await supabase
      .from('product_media')
      .upsert(productMedia, { onConflict: 'id', ignoreDuplicates: true })
      .select()
    
    if (mediaError) {
      console.error('插入图片失败:', mediaError)
      // 图片插入失败不影响整体流程
    }
    
    return NextResponse.json({
      success: true,
      message: '成功添加蓝染文创产品',
      productsAdded: productsData?.length || 0,
      mediaAdded: mediaData?.length || 0,
      categories: {
        '服饰': 5,
        '配饰': 7,
        '家居': 5,
        '文具': 3,
        '艺术品': 2,
        '礼品': 3
      }
    })
    
  } catch (error: any) {
    console.error('添加产品失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
