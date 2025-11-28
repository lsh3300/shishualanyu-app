const fs = require('fs');
const path = require('path');

const sourcePath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\2023-2024(1)非遗创意实践\\过程材料\\作品图片';
const targetFolder = 'C:\\Users\\lsh\\Desktop\\sslyapp\\整理后课堂实践作品\\产品图片';

let movedCount = 0;

console.log('📦 开始移动"过程材料/作品图片"文件夹中的产品图...\n');

if (fs.existsSync(sourcePath)) {
    const files = fs.readdirSync(sourcePath);
    
    files.forEach(file => {
        if (/\.(jpg|jpeg|png)$/i.test(file)) {
            try {
                const srcPath = path.join(sourcePath, file);
                let targetPath = path.join(targetFolder, file);
                
                // 处理文件名冲突
                let counter = 1;
                while (fs.existsSync(targetPath)) {
                    const ext = path.extname(file);
                    const name = path.basename(file, ext);
                    targetPath = path.join(targetFolder, `${name}(${counter})${ext}`);
                    counter++;
                }
                
                fs.renameSync(srcPath, targetPath);
                console.log(`✅ ${file}`);
                movedCount++;
            } catch (error) {
                console.error(`❌ 错误 - ${file}: ${error.message}`);
            }
        }
    });
}

console.log('\n' + '='.repeat(50));
console.log(`✅ 产品图移动完成！共移动 ${movedCount} 个文件`);
console.log('='.repeat(50));
