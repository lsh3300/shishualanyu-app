const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = '课程视频及商品素材/2023-2024(1)非遗创意实践/2023-2024(1)课堂实践作品';
const targetDir = '整理后课堂实践作品';

// 产品类型映射
const productTypeMap = {
  '帆布袋': '帆布袋',
  '方巾': '方巾',
  '文化衫': '文化衫',
  '束口袋': '束口袋',
  '双肩包': '双肩包',
  '扇子': '扇子',
  '纸巾盒': '纸巾盒'
};

// 整理清单
const 整理清单 = [];

// 遍历学生目录
function traverseStudentDirs() {
  const studentDirs = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  studentDirs.forEach(studentDir => {
    const studentPath = path.join(sourceDir, studentDir);
    processStudentDir(studentPath, studentDir);
  });

  // 保存整理清单
  fs.writeFileSync('整理清单.json', JSON.stringify(整理清单, null, 2), 'utf8');
  console.log('整理完成！整理清单已保存到 整理清单.json');
}

// 处理单个学生目录
function processStudentDir(studentPath, studentDir) {
  // 提取作者名（去掉学号）
  let authorName = studentDir;
  // 处理不同格式的学号-姓名
  if (authorName.includes('-')) {
    // 格式：202130100825-蔡金雕
    authorName = authorName.split('-').slice(1).join('-');
  } else if (authorName.includes('+')) {
    // 格式：202136600106+洪铭铭
    authorName = authorName.split('+').slice(1).join('+');
  } else {
    // 其他格式，直接使用目录名
    authorName = authorName;
  }
  // 清理空格
  authorName = authorName.trim();

  // 创建作者目录
  const videoAuthorDir = path.join(targetDir, '视频教程', authorName);
  const effectAuthorDir = path.join(targetDir, '图案效果图', authorName);
  if (!fs.existsSync(videoAuthorDir)) {
    fs.mkdirSync(videoAuthorDir, { recursive: true });
  }
  if (!fs.existsSync(effectAuthorDir)) {
    fs.mkdirSync(effectAuthorDir, { recursive: true });
  }

  // 遍历目录中的所有文件和子目录
  const items = fs.readdirSync(studentPath, { withFileTypes: true });
  items.forEach(item => {
    const itemPath = path.join(studentPath, item.name);
    if (item.isDirectory()) {
      // 处理子目录（如扎染视频、非遗创意实践期末作业等）
      processSubDir(itemPath, authorName);
    } else {
      // 处理文件
      processFile(itemPath, item.name, authorName);
    }
  });
}

// 处理子目录
function processSubDir(subDirPath, authorName) {
  const items = fs.readdirSync(subDirPath, { withFileTypes: true });
  items.forEach(item => {
    const itemPath = path.join(subDirPath, item.name);
    if (item.isFile()) {
      processFile(itemPath, item.name, authorName);
    }
  });
}

// 处理单个文件
function processFile(filePath, fileName, authorName) {
  const ext = path.extname(fileName).toLowerCase();
  
  if (ext === '.mp4' || ext === '.mov') {
    // 处理视频文件
    processVideoFile(filePath, fileName, authorName);
  } else if (ext === '.png') {
    // 处理效果图
    processEffectFile(filePath, fileName, authorName);
  } else if (ext === '.jpg' || ext === '.jpeg') {
    // 处理产品图片
    processProductFile(filePath, fileName, authorName);
  }
  // 忽略其他文件类型（如.doc、.docx等）
}

// 处理视频文件
function processVideoFile(filePath, fileName, authorName) {
  // 提取作品名称
  let workName = fileName;
  
  // 移除文件扩展名
  workName = workName.replace(/\.(mp4|mov)$/i, '');
  
  // 移除作者名和其他前缀
  workName = workName.replace(new RegExp(`${authorName}[-+\s]*`), '');
  
  // 移除括号内容和其他修饰词
  workName = workName.replace(/\s*\([^)]*\)\s*/g, '');
  workName = workName.replace(/\s*（[^）]*）\s*/g, '');
  workName = workName.replace(/\s*制作教学视频\s*/g, '');
  workName = workName.replace(/\s*教程\s*/g, '');
  workName = workName.replace(/\s*有声版?\s*/g, '');
  workName = workName.replace(/\s*配音版\s*/g, '');
  workName = workName.replace(/\s*无音乐\s*/g, '');
  
  // 清理空格
  workName = workName.trim();
  
  // 统一命名格式
  const newFileName = `${workName}-视频${path.extname(fileName)}`;
  const targetPath = path.join(targetDir, '视频教程', authorName, newFileName);
  
  // 复制文件
  fs.copyFileSync(filePath, targetPath);
  
  // 添加到整理清单
 整理清单.push({
    原始路径: filePath,
    原始文件名: fileName,
    文件类型: '视频',
    作者: authorName,
    作品名称: workName,
    目标路径: targetPath,
    新文件名: newFileName
  });
  
  console.log(`已整理视频：${authorName}/${newFileName}`);
}

// 处理效果图文件
function processEffectFile(filePath, fileName, authorName) {
  // 提取作品名称（去掉.png扩展名）
  let workName = fileName.replace(/\.png$/i, '');
  workName = workName.trim();
  
  // 统一命名格式
  const newFileName = `${workName}-效果图.png`;
  const targetPath = path.join(targetDir, '图案效果图', authorName, newFileName);
  
  // 复制文件
  fs.copyFileSync(filePath, targetPath);
  
  // 添加到整理清单
 整理清单.push({
    原始路径: filePath,
    原始文件名: fileName,
    文件类型: '效果图',
    作者: authorName,
    作品名称: workName,
    目标路径: targetPath,
    新文件名: newFileName
  });
  
  console.log(`已整理效果图：${authorName}/${newFileName}`);
}

// 处理产品图片
function processProductFile(filePath, fileName, authorName) {
  // 提取产品名称和序号
  let productName = fileName;
  let serialNumber = '1';
  
  // 移除文件扩展名
  productName = productName.replace(/\.(jpg|jpeg)$/i, '');
  
  // 提取序号
  const serialMatch = productName.match(/(\d+)$/);
  if (serialMatch) {
    serialNumber = serialMatch[1];
    productName = productName.replace(/\d+$/, '').trim();
  }
  
  // 移除连字符和空格
  productName = productName.replace(/-+$/, '').trim();
  
  // 确定产品类型
  let productType = '其他';
  for (const [key, value] of Object.entries(productTypeMap)) {
    if (productName.includes(key)) {
      productType = value;
      break;
    }
  }
  
  // 统一命名格式（不包含作者名）
  const newFileName = `${productName}-${serialNumber}-产品图.jpg`;
  const targetPath = path.join(targetDir, '产品图片', productType, newFileName);
  
  // 复制文件
  fs.copyFileSync(filePath, targetPath);
  
  // 添加到整理清单
 整理清单.push({
    原始路径: filePath,
    原始文件名: fileName,
    文件类型: '产品图',
    作者: authorName,
    作品名称: productName,
    产品类型: productType,
    目标路径: targetPath,
    新文件名: newFileName
  });
  
  console.log(`已整理产品图：${productType}/${newFileName}`);
}

// 开始整理
traverseStudentDirs();
