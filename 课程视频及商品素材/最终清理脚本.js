const fs = require('fs');
const path = require('path');

const targetBase = 'C:\\Users\\lsh\\Desktop\\sslyapp\\整理后课堂实践作品';
const effectFolder = path.join(targetBase, '图案效果图');
const productFolder = path.join(targetBase, '产品图片');

let movedCount = 0;

console.log('🔍 处理剩余图片文件...\n');

// 剩余的图片文件
const remainingFiles = [
    {
        src: 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202136600110黄佳烨\\花朵图案蓝染作品图.png',
        author: '黄佳烨',
        name: '花朵图案蓝染作品图',
        type: 'product' // 作品图，应该是产品图
    },
    {
        src: 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202136600114-雷思娴\\六耀星.png',
        author: '雷思娴',
        name: '六耀星',
        type: 'effect' // 可能是效果图的另一个版本
    },
    {
        src: 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202136600115-李佩蓉\\烟花角.png',
        author: '李佩蓉',
        name: '烟花角',
        type: 'effect' // 可能是效果图的另一个版本
    },
    {
        src: 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202138500103邓斯月\\折叠染封面图.png',
        author: '邓斯月',
        name: '折叠染封面图',
        type: 'product' // 封面图，归为产品图
    },
    {
        src: 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202138500132尹艺晓\\三角形版万花筒.png',
        author: '尹艺晓',
        name: '三角形版万花筒',
        type: 'effect' // 可能是效果图的另一个版本
    }
];

remainingFiles.forEach(file => {
    try {
        if (fs.existsSync(file.src)) {
            let targetFolder, targetName;
            
            if (file.type === 'product') {
                targetFolder = productFolder;
                targetName = `${file.name}.png`;
            } else {
                targetFolder = effectFolder;
                targetName = `${file.author}-${file.name}.png`;
            }
            
            let targetPath = path.join(targetFolder, targetName);
            let counter = 1;
            while (fs.existsSync(targetPath)) {
                if (file.type === 'product') {
                    targetPath = path.join(targetFolder, `${file.name}(${counter}).png`);
                } else {
                    targetPath = path.join(targetFolder, `${file.author}-${file.name}(${counter}).png`);
                }
                counter++;
            }
            
            fs.renameSync(file.src, targetPath);
            console.log(`✅ ${file.type === 'product' ? '产品图' : '效果图'}: ${file.name}`);
            movedCount++;
        }
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
    }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ 最终清理完成！移动了 ${movedCount} 个文件`);
console.log('='.repeat(50));
