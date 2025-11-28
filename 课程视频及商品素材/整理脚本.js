const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品';

const courseWorks = [];
const productImages = [];

// 读取所有学生文件夹
const studentFolders = fs.readdirSync(basePath);

studentFolders.forEach(studentFolder => {
    const studentPath = path.join(basePath, studentFolder);
    
    if (!fs.statSync(studentPath).isDirectory()) return;
    
    // 提取作者姓名（从文件夹名称中去除学号）
    const authorName = studentFolder.replace(/^\d+[-+\s]*/, '');
    
    // 递归读取文件夹中的所有文件
    const files = getAllFiles(studentPath);
    
    // 分类文件
    const videos = files.filter(f => /\.(mp4|MP4)$/i.test(f));
    const effectImages = files.filter(f => /\.png$/i.test(f));
    const productImgs = files.filter(f => /\.(jpg|jpeg|JPG|JPEG)$/i.test(f));
    
    // 处理每个视频及其对应的效果图
    videos.forEach(videoPath => {
        const videoFileName = path.basename(videoPath);
        // 从视频文件名提取作品名称
        // 格式: 学号-姓名-作品名称（有声）.mp4
        let workName = videoFileName.replace(/^\d+[-+\s]*/, '') // 去学号
            .replace(new RegExp(`[-+\\s]*${authorName}[-+\\s]*`), '') // 去姓名
            .replace(/[-+\s]*\（[^）]*\）/g, '') // 去括号内容
            .replace(/[-+\s]*\([^)]*\)/g, '')
            .replace(/\.(mp4|MP4)$/i, ''); // 去扩展名
        
        workName = workName.trim();
        
        // 查找对应的效果图（文件名包含作品名称）
        const effectImage = effectImages.find(img => {
            const imgName = path.basename(img, '.png');
            return imgName === workName || workName.includes(imgName) || imgName.includes(workName);
        });
        
        courseWorks.push({
            author: authorName,
            workName: workName,
            videoPath: videoPath.replace(/\\/g, '/'),
            effectImagePath: effectImage ? effectImage.replace(/\\/g, '/') : null
        });
    });
    
    // 处理产品图
    productImgs.forEach(productPath => {
        const productFileName = path.basename(productPath);
        const productName = path.basename(productPath, path.extname(productPath));
        
        productImages.push({
            productName: productName,
            imagePath: productPath.replace(/\\/g, '/'),
            relatedAuthor: authorName // 记录但不一定在商品页面展示
        });
    });
});

// 生成清单
const inventory = {
    generatedAt: new Date().toISOString(),
    course: "2023-2024(1)非遗创意实践 - 课堂实践作品",
    summary: {
        totalAuthors: studentFolders.length,
        totalCourseWorks: courseWorks.length,
        totalProductImages: productImages.length
    },
    courseWorks: courseWorks,
    productImages: productImages
};

// 写入JSON文件
const outputPath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\课程作品清单.json';
fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf8');

console.log(`✅ 清单已生成: ${outputPath}`);
console.log(`📊 统计信息:`);
console.log(`   - 作者数量: ${inventory.summary.totalAuthors}`);
console.log(`   - 课程作品: ${inventory.summary.totalCourseWorks}`);
console.log(`   - 产品图片: ${inventory.summary.totalProductImages}`);

// 辅助函数：递归获取所有文件
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });
    
    return arrayOfFiles;
}
