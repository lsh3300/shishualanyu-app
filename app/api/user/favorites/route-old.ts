import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabaseClient';
import { normalizeCourseId } from '@/lib/course-id';

async function fetchProductsMap(supabase: SupabaseClient, productIds: string[]) {
  const productsMap: Record<string, any> = {};
  if (!productIds.length) {
    return productsMap;
  }

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, image_url, category, description, metadata')
    .in('id', productIds);

  if (productsError) {
    console.error('查询产品失败:', productsError);
    return productsMap;
  }

  const { data: mediaData, error: mediaError } = await supabase
    .from('product_media')
    .select('product_id, type, url, cover, position')
    .in('product_id', productIds)
    .eq('type', 'image')
    .order('position', { ascending: true });

  const coverMap: Record<string, string> = {};
  const imagesMap: Record<string, string[]> = {};
  
  if (mediaError) {
    console.warn('查询产品媒体失败:', mediaError);
  } else if (mediaData) {
    mediaData.forEach((item) => {
      const current = coverMap[item.product_id];
      if (!current || item.cover || item.position === 0) {
        coverMap[item.product_id] = item.url;
      }
      // 构建所有图片的数组
      if (!imagesMap[item.product_id]) {
        imagesMap[item.product_id] = [];
      }
      imagesMap[item.product_id].push(item.url);
    });
  }

  const productRows: any[] = Array.isArray(productsData) ? productsData : [];

  productRows.forEach((product) => {
    const coverImage = coverMap[product.id] || product.image_url || '/placeholder.svg';
    const images = imagesMap[product.id] || (product.image_url ? [product.image_url] : [coverImage]);
    productsMap[product.id] = {
      ...product,
      image_url: coverImage,
      coverImage,
      images, // 添加 images 数组
    };
  });

  return productsMap;
}

// GET: 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    console.log('开始处理GET /api/user/favorites请求');
    
    // 从请求头中获取Authorization token
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    let supabase: ReturnType<typeof createClient>;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('从请求头获取到token');
      
      // 使用token创建Supabase客户端
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      // 验证token并获取用户信息
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('用户认证失败:', userError);
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
      
      userId = user.id;
      console.log('获取到真实用户ID:', userId);
    } else {
      console.log('未找到Authorization token');
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: '无法获取用户ID' }, { status: 401 });
    }
    
    // 尝试从Supabase获取数据
    try {
      // 查询所有收藏（包括商品和课程）
      // 先尝试查询包含item_type字段，如果失败则查询不包含该字段
      let allFavoritesData: any[] | null = null;
      let favoritesError: any = null;
      
      // 尝试查询包含item_type字段，同时关联products和courses表
      // 注意：Supabase的关联查询可能因为RLS策略失败，所以我们需要分别查询
      const { data: dataWithType, error: errorWithType } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          product_id,
          course_id,
          item_type,
          created_at
        `)
        .eq('user_id', userId);
      
      // 如果查询成功，分别获取products和courses数据
      const favoritesList: any[] = Array.isArray(dataWithType) ? dataWithType : [];

      if (favoritesList.length && !errorWithType) {
        // 获取所有product_id和course_id
        const productIds = favoritesList.filter(f => f.product_id).map(f => f.product_id as string);
        const courseIds = favoritesList.filter(f => f.course_id).map(f => f.course_id as string);
        
        // 分别查询products和courses
        let productsMap: Record<string, any> = await fetchProductsMap(supabase, productIds);
        let coursesMap: Record<string, any> = {};
        
        if (courseIds.length > 0) {
          const { data: coursesData } = await supabase
            .from('courses')
            .select('id, title, description, instructor, duration, price, image_url, category')
            .in('id', courseIds);
          
          const courseRows: any[] = Array.isArray(coursesData) ? coursesData : [];
          courseRows.forEach(c => {
            coursesMap[c.id] = c;
          });
        }
        
        // 合并数据
        const enrichedData = favoritesList.map((fav: any) => ({
          ...fav,
          products: fav.product_id ? productsMap[fav.product_id] || null : null,
          courses: fav.course_id ? coursesMap[fav.course_id] || null : null
        }));
        
        allFavoritesData = enrichedData;
      } else {
        allFavoritesData = dataWithType;
      }
      
      if (errorWithType) {
        // 如果包含item_type的查询失败（可能是字段不存在），尝试不包含该字段的查询
        console.log('查询item_type字段失败，尝试不包含该字段的查询:', errorWithType.message);
        const { data: dataWithoutType, error: errorWithoutType } = await supabase
          .from('favorites')
          .select(`
            id,
            user_id,
            product_id,
            course_id,
            created_at
          `)
          .eq('user_id', userId);
        
        if (errorWithoutType) {
          favoritesError = errorWithoutType;
        } else if (dataWithoutType) {
          // 同样需要分别查询products和courses
          const fallbackList: any[] = Array.isArray(dataWithoutType) ? dataWithoutType : [];
          const productIds = fallbackList.filter(f => f.product_id).map(f => f.product_id as string);
          const courseIds = fallbackList.filter(f => f.course_id).map(f => f.course_id as string);
          
          let productsMap: Record<string, any> = await fetchProductsMap(supabase, productIds);
          let coursesMap: Record<string, any> = {};
          
          if (courseIds.length > 0) {
            const { data: coursesData } = await supabase
              .from('courses')
              .select('id, title, description, instructor, duration, price, image_url, category')
              .in('id', courseIds);
            
            const courseRows: any[] = Array.isArray(coursesData) ? coursesData : [];
            courseRows.forEach(c => {
              coursesMap[c.id] = c;
            });
          }
          
          // 合并数据
          const enrichedData = fallbackList.map((fav: any) => ({
            ...fav,
            products: fav.product_id ? productsMap[fav.product_id] || null : null,
            courses: fav.course_id ? coursesMap[fav.course_id] || null : null
          }));
          
          allFavoritesData = enrichedData;
        }
      }
      
      if (favoritesError) {
        console.error('Supabase查询错误:', favoritesError);
        // 如果Supabase失败，返回空数组
        return NextResponse.json({
          favorites: [],
          source: 'supabase'
        });
      }
      
      // 处理收藏数据，添加item_type（如果没有的话默认为product）
      const processedFavorites = (allFavoritesData || []).map(fav => {
        const favAny = fav as any;
        // 根据course_id和product_id判断item_type
        let itemType = favAny.item_type;
        if (!itemType) {
          // 如果item_type不存在，根据course_id和product_id判断
          if (favAny.course_id) {
            itemType = 'course';
          } else if (favAny.product_id) {
            itemType = 'product';
          } else {
            itemType = 'product'; // 默认
          }
        }
        
        return {
          ...fav,
          item_type: itemType
        };
      });
      
      console.log('获取收藏列表成功，数量:', processedFavorites?.length || 0);
      const favoritesArray: any[] = Array.isArray(processedFavorites) ? processedFavorites : [];
      const validFavorites: any[] = [];
      const invalidFavoriteIds: string[] = [];

      favoritesArray.forEach((fav) => {
        const isCourse = fav.item_type === 'course';
        if (!isCourse && fav.product_id && !fav.products) {
          invalidFavoriteIds.push(fav.id);
          validFavorites.push({
            ...fav,
            invalid: true,
          });
        } else {
          validFavorites.push({
            ...fav,
            invalid: false,
          });
        }
      });

      console.log('处理后的收藏数据示例:', JSON.stringify(validFavorites.slice(0, 2), null, 2));
      return NextResponse.json({ 
        favorites: validFavorites,
        source: 'supabase',
        statsUpdateRequired: invalidFavoriteIds.length > 0,
        invalidFavorites: invalidFavoriteIds,
      });
    } catch (supabaseError) {
      console.error('Supabase连接错误:', supabaseError);
      // 如果Supabase连接失败，返回模拟数据
      return NextResponse.json({
          favorites: [
            {
              id: '1',
              user_id: userId,
              product_id: 'prod_1',
              created_at: new Date().toISOString(),
              products: {
                id: 'prod_1',
                name: '模拟商品',
                price: 99.99,
                images: ['/mock-image.jpg'],
                category: 'electronics',
                description: '这是一个模拟商品，用于测试收藏功能',
                in_stock: true
              }
            }
          ],
          source: 'mock'
        });
    }
  } catch (error) {
    console.error('GET /api/user/favorites 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}

// POST: 添加收藏
export async function POST(request: NextRequest) {
  try {
    console.log('开始处理POST /api/user/favorites请求');
    
    let body;
    try {
      body = await request.json();
      console.log('收到收藏请求body:', body);
    } catch (e) {
      console.error('解析请求body失败:', e);
      return NextResponse.json({ 
        success: false,
        error: '请求格式错误' 
      }, { status: 400 });
    }
    
    const { productId, courseId, itemType = 'product' } = body;
    const normalizedCourseId = itemType === 'course' ? normalizeCourseId(courseId) : null;
    const itemId = itemType === 'course' ? normalizedCourseId : productId;
    console.log('解析后的收藏请求:', { itemType, itemId, productId, courseId });
    
    if (!itemId) {
      console.error('缺少ID:', { itemType, productId, courseId });
      return NextResponse.json({ 
        success: false,
        error: itemType === 'course' ? '缺少课程ID' : '缺少商品ID' 
      }, { status: 400 });
    }
    
    // 从请求头中获取Authorization token
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    let supabase: ReturnType<typeof createClient>;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('从请求头获取到token');
      
      // 使用token创建Supabase客户端
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      // 验证token并获取用户信息
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('用户认证失败:', userError);
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
      
      userId = user.id;
      console.log('获取到真实用户ID:', userId);
    } else {
      console.log('未找到Authorization token');
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: '无法获取用户ID' }, { status: 401 });
    }
    
    // 验证环境变量
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('缺少Supabase环境变量');
      return NextResponse.json({
        success: false,
        error: '服务器配置错误：缺少Supabase环境变量',
        source: 'config'
      }, { status: 500 });
    }
    
    // 尝试添加到Supabase
    try {
      // 检查是否已经收藏过
      // 对于课程收藏，通过course_id检查；对于商品收藏，通过product_id检查
      let existingFavorite: any = null;
      let checkError: any = null;
      
      try {
        console.log('检查是否已收藏:', { userId, itemId, itemType });
        
        let result;
        if (itemType === 'course') {
          // 课程收藏：通过course_id检查
          result = await supabase
            .from('favorites')
            .select('id, item_type, course_id')
            .eq('user_id', userId)
            .eq('course_id', itemId)
            .maybeSingle();
        } else {
          // 商品收藏：通过product_id检查
          result = await supabase
            .from('favorites')
            .select('id, item_type, product_id')
            .eq('user_id', userId)
            .eq('product_id', itemId)
            .maybeSingle();
        }
        
        existingFavorite = result.data;
        checkError = result.error;
        console.log('检查收藏结果:', { existingFavorite, checkError: checkError?.message });
      } catch (e: any) {
        console.error('查询收藏状态失败:', e?.message || e);
        checkError = e;
      }
      
      // 如果查询出错但不是"未找到"错误，记录日志但继续执行
      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('检查收藏状态时出错（继续执行）:', checkError.message || checkError);
      }
      
      // 如果找到了已存在的收藏
      if (existingFavorite) {
        console.log('该' + (itemType === 'course' ? '课程' : '商品') + '已经收藏过了');
        return NextResponse.json({
          success: true,
          favorite: existingFavorite,
          message: '已在收藏夹中',
          source: 'supabase',
          statsUpdateRequired: false
        });
      }
      
      // 构建插入数据，根据itemType决定字段
      // 对于课程收藏，使用course_id；对于商品收藏，使用product_id
      const insertData: any = {
        user_id: userId,
        item_type: itemType
      };
      
      if (itemType === 'course') {
        // 课程收藏：使用course_id，product_id为NULL
        insertData.course_id = itemId;
        insertData.product_id = null;
      } else {
        // 商品收藏：使用product_id，course_id为NULL
        insertData.product_id = itemId;
        insertData.course_id = null;
      }
      
      console.log('准备插入收藏数据:', insertData);
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置');
      console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置');
      
      // 先尝试插入包含所有字段的数据
      let { data, error } = await supabase
        .from('favorites')
        .insert(insertData)
        .select()
        .single();
      
      console.log('插入操作结果:', { 
        hasData: !!data, 
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message 
      });
      
      // 如果插入失败，检查错误类型
      if (error) {
        console.error('Supabase添加收藏错误:', error);
        console.error('错误代码:', error.code);
        console.error('错误消息:', error.message);
        console.error('错误详情:', error.details);
        console.error('错误提示:', error.hint);
        
        // 如果是重复键错误（23505），说明已经收藏过了
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          console.log('该' + (itemType === 'course' ? '课程' : '商品') + '已经收藏过了（唯一约束）');
          // 重新查询已存在的收藏
          let existing;
          if (itemType === 'course') {
            const result = await supabase
              .from('favorites')
              .select('*')
              .eq('user_id', userId)
              .eq('course_id', itemId)
              .maybeSingle();
            existing = result.data;
          } else {
            const result = await supabase
              .from('favorites')
              .select('*')
              .eq('user_id', userId)
              .eq('product_id', itemId)
              .maybeSingle();
            existing = result.data;
          }
          
        return NextResponse.json({
          success: true,
            favorite: existing,
            message: '已在收藏夹中',
            source: 'supabase',
            statsUpdateRequired: false
          });
        }
        
        // 如果是外键约束错误（23503），说明product_id不存在于products表中
        // 这通常发生在尝试收藏课程时，因为课程ID不在products表中
        if (error.code === '23503' || error.message?.includes('foreign key') || error.message?.includes('violates foreign key constraint')) {
          console.error('外键约束错误: 尝试收藏的ID不存在于products表中');
          console.error('这可能是课程收藏，但favorites表只支持products表的外键');
          
          // 对于课程收藏，我们需要检查课程是否存在
          if (itemType === 'course') {
            try {
              // 检查课程是否存在
              const { data: courseExists, error: courseCheckError } = await supabase
                .from('courses')
                .select('id')
                .eq('id', itemId)
                .maybeSingle();
              
              if (courseCheckError) {
                console.error('检查课程是否存在时出错:', courseCheckError);
                // 即使检查失败，也返回外键约束错误
                return NextResponse.json({
                  success: false,
                  error: '课程收藏功能需要数据库支持。请联系管理员修改favorites表结构以支持课程收藏。',
                  errorCode: error.code,
                  errorType: 'foreign_key_constraint',
                  hint: 'favorites表的product_id字段有外键约束，只能引用products表。需要添加course_id字段或修改外键约束。',
                  source: 'supabase'
                }, { status: 400 });
              }
              
              if (courseExists) {
                // 课程存在，但无法插入到favorites表（因为外键约束）
                // 返回一个友好的错误信息，建议修改数据库结构
                return NextResponse.json({
                  success: false,
                  error: '课程收藏功能需要数据库支持。请联系管理员修改favorites表结构以支持课程收藏。',
                  errorCode: error.code,
                  errorType: 'foreign_key_constraint',
                  hint: 'favorites表的product_id字段有外键约束，只能引用products表。需要添加course_id字段或修改外键约束。',
                  source: 'supabase'
                }, { status: 400 });
              } else {
                return NextResponse.json({
                  success: false,
                  error: '课程不存在',
                  errorCode: error.code,
                  source: 'supabase'
                }, { status: 404 });
              }
            } catch (courseCheckException: any) {
              console.error('检查课程时发生异常:', courseCheckException);
              // 即使检查失败，也返回外键约束错误
              return NextResponse.json({
                success: false,
                error: '课程收藏功能需要数据库支持。请联系管理员修改favorites表结构以支持课程收藏。',
                errorCode: error.code,
                errorType: 'foreign_key_constraint',
                hint: 'favorites表的product_id字段有外键约束，只能引用products表。需要添加course_id字段或修改外键约束。',
                source: 'supabase'
              }, { status: 400 });
            }
          } else {
            // 商品收藏，但商品不存在
            return NextResponse.json({
              success: false,
              error: '商品不存在',
              errorCode: error.code,
              source: 'supabase'
            }, { status: 404 });
          }
        }
        
        // 如果是字段不存在的问题（42703），说明数据库结构可能还没有更新
        if (error.message?.includes('column') || error.code === '42703') {
          console.error('字段不存在错误，可能数据库结构未更新:', error.message);
          return NextResponse.json({
            success: false,
            error: '数据库结构不支持此操作。请确保已执行fix-favorites-for-courses.sql脚本。',
            errorCode: error.code,
            errorType: 'column_not_found',
            errorDetails: error.details,
            errorHint: error.hint,
            source: 'supabase'
          }, { status: 500 });
        } else {
          // 其他错误直接返回，包含完整错误信息
          console.error('未处理的Supabase错误:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            fullError: JSON.stringify(error, null, 2)
          });
          
          return NextResponse.json({
            success: false,
            error: error.message || '添加收藏失败',
            errorCode: error.code,
            errorDetails: error.details,
            errorHint: error.hint,
            fullError: process.env.NODE_ENV === 'development' ? JSON.stringify(error, null, 2) : undefined,
            source: 'supabase'
          }, { status: 500 });
        }
      }
      
      console.log('添加收藏成功:', data);
      return NextResponse.json({ 
        success: true,
        favorite: data,
        source: 'supabase',
        statsUpdateRequired: true
      });
    } catch (supabaseError) {
      console.error('Supabase连接错误:', supabaseError);
      console.error('错误详情:', supabaseError);
      // 如果Supabase连接失败，返回错误响应
      return NextResponse.json({
        success: false,
        error: supabaseError instanceof Error ? supabaseError.message : 'Supabase连接错误',
        source: 'supabase'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('POST /api/user/favorites 未捕获的错误:', error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

// DELETE: 删除收藏
export async function DELETE(request: NextRequest) {
  try {
    const { productId, courseId, itemType = 'product' } = await request.json();
    const normalizedCourseId = itemType === 'course' ? normalizeCourseId(courseId) : null;
    const itemId = itemType === 'course' ? normalizedCourseId : productId;
    
    if (!itemId) {
      return NextResponse.json({ error: itemType === 'course' ? '缺少课程ID' : '缺少商品ID' }, { status: 400 });
    }
    
    // 从请求头中获取Authorization token
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    let supabase: ReturnType<typeof createClient>;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('从请求头获取到token');
      
      // 使用token创建Supabase客户端
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      // 验证token并获取用户信息
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('用户认证失败:', userError);
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
      
      userId = user.id;
      console.log('获取到真实用户ID:', userId);
    } else {
      console.log('未找到Authorization token');
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: '无法获取用户ID' }, { status: 401 });
    }
    
    // 检查环境变量
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('缺少Supabase环境变量')
      return NextResponse.json({
        success: false,
        error: '服务器配置错误：缺少Supabase环境变量',
        source: 'config'
      }, { status: 500 })
    }
    
    // 尝试从Supabase删除
    try {
      const deleteByProductId = async () => {
        return await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', itemId)
      }

      if (itemType === 'course') {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
          .eq('course_id', itemId)
      
      if (error) {
          console.warn('根据course_id删除失败，尝试使用product_id兼容模式:', error.message)

          // 如果是字段不存在或课程字段为空，回退到product_id删除
          if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('course_id')) {
            const { error: fallbackError } = await deleteByProductId()

            if (fallbackError) {
              console.error('使用product_id回退删除失败:', fallbackError)
              return NextResponse.json({
                success: false,
                error: fallbackError.message || '删除收藏失败',
                source: 'supabase'
              }, { status: 500 })
            }
          } else {
            console.error('根据course_id删除收藏错误:', error)
            return NextResponse.json({
              success: false,
              error: error.message || '删除收藏失败',
              source: 'supabase'
            }, { status: 500 })
          }
        }
      } else {
        const { error } = await deleteByProductId()
        if (error) {
          console.error('根据product_id删除收藏错误:', error)
        return NextResponse.json({
            success: false,
            error: error.message || '删除收藏失败',
            source: 'supabase'
          }, { status: 500 })
        }
      }
      
      return NextResponse.json({ 
        success: true,
        source: 'supabase',
        statsUpdateRequired: true 
      });
    } catch (supabaseError) {
      console.error('Supabase连接错误:', supabaseError);
      return NextResponse.json({
        success: false,
        error: '无法连接到数据库',
        source: 'supabase'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('删除收藏失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}