import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToBucket, getBucketForFileType } from '@/lib/s3-upload-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string || 'image';
    const subType = formData.get('subType') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: '没有提供文件' },
        { status: 400 }
      );
    }

    // 将文件转换为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 获取适当的存储桶
    const bucketName = getBucketForFileType(fileType, subType);
    
    // 上传文件
    const result = await uploadFileToBucket(
      buffer,
      file.name,
      file.type,
      bucketName
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        fileName: result.fileName,
        url: result.url,
        bucket: bucketName,
        fileType: fileType,
        subType: subType
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: '上传过程中发生错误' },
      { status: 500 }
    );
  }
}