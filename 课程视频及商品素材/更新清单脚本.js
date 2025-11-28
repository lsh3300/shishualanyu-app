const fs = require('fs');
const path = require('path');

// 读取现有清单
const inventoryPath = 'C:\\Users\\lsh\\Desktop\\sslyapp\\整理后课堂实践作品\\课程作品清单.json';
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

const targetBase = 'C:\\Users\\lsh\\Desktop\\sslyapp\\整理后课堂实践作品';

// 添加余溪西的作品
const yuxixiWorks = [
    {
        author: '余溪西',
        workName: '多边形',
        videoPath: path.join(targetBase, '视频教程', '余溪西-多边形.mov').replace(/\\/g, '/'),
        effectImagePath: null
    },
    {
        author: '余溪西',
        workName: '象棋',
        videoPath: path.join(targetBase, '视频教程', '余溪西-象棋.mov').replace(/\\/g, '/'),
        effectImagePath: path.join(targetBase, '图案效果图', '余溪西-象棋.png').replace(/\\/g, '/')
    }
];

// 添加朱羽娇的作品
const zhuyujiaoWorks = [
    {
        author: '朱羽娇',
        workName: '井格纹',
        videoPath: path.join(targetBase, '视频教程', '朱羽娇-井格纹.mov').replace(/\\/g, '/'),
        effectImagePath: path.join(targetBase, '图案效果图', '朱羽娇-井格纹.png').replace(/\\/g, '/')
    },
    {
        author: '朱羽娇',
        workName: '同心太阳纹',
        videoPath: path.join(targetBase, '视频教程', '朱羽娇-同心太阳纹.mov').replace(/\\/g, '/'),
        effectImagePath: path.join(targetBase, '图案效果图', '朱羽娇-同心太阳纹.png').replace(/\\/g, '/')
    }
];

// 合并到清单
inventory.courseWorks.push(...yuxixiWorks, ...zhuyujiaoWorks);

// 更新统计信息
inventory.summary.totalCourseWorks = inventory.courseWorks.length;
inventory.summary.movedFiles.videos += 4;
inventory.summary.movedFiles.effectImages += 3;
inventory.summary.movedFiles.documents = 19;
inventory.lastUpdated = new Date().toISOString();

// 保存更新后的清单
fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2), 'utf8');

console.log('✅ 清单已更新！');
console.log('\n📊 最新统计:');
console.log(`   作者数量: ${inventory.summary.totalAuthors}`);
console.log(`   课程作品: ${inventory.summary.totalCourseWorks}`);
console.log(`   产品图片: ${inventory.summary.totalProductImages}`);
console.log('\n📦 移动文件统计:');
console.log(`   视频: ${inventory.summary.movedFiles.videos} 个`);
console.log(`   效果图: ${inventory.summary.movedFiles.effectImages} 个`);
console.log(`   产品图: ${inventory.summary.movedFiles.productImages} 个`);
console.log(`   文档: ${inventory.summary.movedFiles.documents} 个`);
console.log(`   总计: ${inventory.summary.movedFiles.videos + inventory.summary.movedFiles.effectImages + inventory.summary.movedFiles.productImages + inventory.summary.movedFiles.documents} 个文件`);
