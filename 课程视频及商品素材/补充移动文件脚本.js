const fs = require('fs');
const path = require('path');

// 目标文件夹
const targetBase = 'C:\\Users\\lsh\\Desktop\\sslyapp\\整理后课堂实践作品';
const videoFolder = path.join(targetBase, '视频教程');
const effectFolder = path.join(targetBase, '图案效果图');
const docFolder = path.join(targetBase, '作品文档');

// 创建作品文档文件夹
if (!fs.existsSync(docFolder)) {
    fs.mkdirSync(docFolder, { recursive: true });
}

let movedCount = {
    videos: 0,
    effectImages: 0,
    documents: 0
};

console.log('🔍 开始处理遗漏文件...\n');

// 1. 移动余溪西的.mov视频文件
const yuxixiPath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202136600129-余溪西';

const yuxixiFiles = [
    {
        video: '202136600129-余溪西-多边形（有声）.mov',
        effect: null,
        author: '余溪西',
        workName: '多边形'
    },
    {
        video: '202136600129-余溪西-象棋（有声）.mov',
        effect: '象棋.png',
        author: '余溪西',
        workName: '象棋'
    }
];

console.log('📦 处理余溪西的文件...');
yuxixiFiles.forEach(item => {
    try {
        // 移动视频
        const videoSrc = path.join(yuxixiPath, item.video);
        if (fs.existsSync(videoSrc)) {
            const videoTarget = path.join(videoFolder, `${item.author}-${item.workName}.mov`);
            fs.renameSync(videoSrc, videoTarget);
            console.log(`✅ 视频: ${item.author} - ${item.workName}`);
            movedCount.videos++;
        }
        
        // 移动效果图
        if (item.effect) {
            const effectSrc = path.join(yuxixiPath, item.effect);
            if (fs.existsSync(effectSrc)) {
                const effectTarget = path.join(effectFolder, `${item.author}-${item.workName}.png`);
                fs.renameSync(effectSrc, effectTarget);
                movedCount.effectImages++;
            }
        }
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
    }
});

// 2. 移动朱羽娇的.MOV视频文件
const zhuyujiaoPath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\2023-2024(1)课堂实践作品\\202138500134+朱羽娇';

const zhuyujiaoFiles = [
    {
        video: '202138500134+朱羽娇+井格纹（有声版）.MOV',
        effect: '井格纹.png',
        author: '朱羽娇',
        workName: '井格纹'
    },
    {
        video: '202138500134+朱羽娇+同心太阳纹（有声版）.MOV',
        effect: '同心太阳纹.png',
        author: '朱羽娇',
        workName: '同心太阳纹'
    }
];

console.log('\n📦 处理朱羽娇的文件...');
zhuyujiaoFiles.forEach(item => {
    try {
        // 移动视频
        const videoSrc = path.join(zhuyujiaoPath, item.video);
        if (fs.existsSync(videoSrc)) {
            const videoTarget = path.join(videoFolder, `${item.author}-${item.workName}.mov`);
            fs.renameSync(videoSrc, videoTarget);
            console.log(`✅ 视频: ${item.author} - ${item.workName}`);
            movedCount.videos++;
        }
        
        // 移动效果图
        if (item.effect) {
            const effectSrc = path.join(zhuyujiaoPath, item.effect);
            if (fs.existsSync(effectSrc)) {
                const effectTarget = path.join(effectFolder, `${item.author}-${item.workName}.png`);
                fs.renameSync(effectSrc, effectTarget);
                movedCount.effectImages++;
            }
        }
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
    }
});

// 3. 移动所有.doc/.docx文档文件
console.log('\n📄 处理文档文件...');

const basePath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践';

// 移动学生文件夹中的文档
const studentFolderBase = path.join(basePath, '2023-2024(1)课堂实践作品');
const studentFolders = fs.readdirSync(studentFolderBase);

studentFolders.forEach(folder => {
    const folderPath = path.join(studentFolderBase, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;
    
    // 递归查找所有.doc/.docx文件
    findDocuments(folderPath).forEach(docPath => {
        try {
            const fileName = path.basename(docPath);
            const targetPath = path.join(docFolder, fileName);
            
            // 处理文件名冲突
            let finalTarget = targetPath;
            let counter = 1;
            while (fs.existsSync(finalTarget)) {
                const ext = path.extname(fileName);
                const name = path.basename(fileName, ext);
                finalTarget = path.join(docFolder, `${name}(${counter})${ext}`);
                counter++;
            }
            
            fs.renameSync(docPath, finalTarget);
            console.log(`✅ 文档: ${fileName}`);
            movedCount.documents++;
        } catch (error) {
            console.error(`❌ 错误: ${error.message}`);
        }
    });
});

// 移动"过程材料"文件夹中的文档
const materialPath = path.join(basePath, '过程材料');
if (fs.existsSync(materialPath)) {
    findDocuments(materialPath).forEach(docPath => {
        try {
            const fileName = path.basename(docPath);
            const targetPath = path.join(docFolder, fileName);
            
            // 处理文件名冲突
            let finalTarget = targetPath;
            let counter = 1;
            while (fs.existsSync(finalTarget)) {
                const ext = path.extname(fileName);
                const name = path.basename(fileName, ext);
                finalTarget = path.join(docFolder, `${name}(${counter})${ext}`);
                counter++;
            }
            
            fs.renameSync(docPath, finalTarget);
            console.log(`✅ 文档: ${fileName}`);
            movedCount.documents++;
        } catch (error) {
            console.error(`❌ 错误: ${error.message}`);
        }
    });
}

console.log('\n' + '='.repeat(50));
console.log('✨ 补充移动完成！');
console.log('='.repeat(50));
console.log(`\n📊 移动统计:`);
console.log(`   ✅ 补充视频: ${movedCount.videos} 个`);
console.log(`   ✅ 补充效果图: ${movedCount.effectImages} 个`);
console.log(`   ✅ 文档文件: ${movedCount.documents} 个`);
console.log(`\n📁 文档已保存到: ${docFolder}`);

// 辅助函数：递归查找文档文件
function findDocuments(dirPath) {
    let results = [];
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            results = results.concat(findDocuments(itemPath));
        } else if (/\.(doc|docx)$/i.test(item)) {
            results.push(itemPath);
        }
    });
    
    return results;
}
