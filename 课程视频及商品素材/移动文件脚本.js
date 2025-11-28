const fs = require('fs');
const path = require('path');

// 读取之前生成的清单
const inventoryPath = 'c:\\Users\\lsh\\Desktop\\sslyapp\\课程视频及商品素材\\课程作品清单.json';
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

// 目标文件夹
const targetBase = 'C:\\Users\\lsh\\Desktop\\sslyapp\\整理后课堂实践作品';
const videoFolder = path.join(targetBase, '视频教程');
const effectFolder = path.join(targetBase, '图案效果图');
const productFolder = path.join(targetBase, '产品图片');

let movedCount = {
    videos: 0,
    effectImages: 0,
    productImages: 0
};

let errors = [];

console.log('🚀 开始移动文件...\n');

// 1. 移动视频和效果图
inventory.courseWorks.forEach((work, index) => {
    try {
        // 移动视频文件
        const videoSrc = work.videoPath.replace(/\//g, '\\');
        if (fs.existsSync(videoSrc)) {
            const videoExt = path.extname(videoSrc).toLowerCase();
            // 新文件名：作者-作品名称.mp4
            let videoNewName = `${work.author}-${work.workName}${videoExt}`;
            // 处理文件名冲突
            let counter = 1;
            let videoTarget = path.join(videoFolder, videoNewName);
            while (fs.existsSync(videoTarget)) {
                videoNewName = `${work.author}-${work.workName}(${counter})${videoExt}`;
                videoTarget = path.join(videoFolder, videoNewName);
                counter++;
            }
            
            fs.renameSync(videoSrc, videoTarget);
            work.videoPath = videoTarget.replace(/\\/g, '/');
            movedCount.videos++;
            console.log(`✅ 视频 ${index + 1}/${inventory.courseWorks.length}: ${work.author} - ${work.workName}`);
        } else {
            console.log(`⚠️  视频文件不存在: ${videoSrc}`);
            errors.push(`视频不存在: ${work.author} - ${work.workName}`);
        }
        
        // 移动效果图
        if (work.effectImagePath) {
            const effectSrc = work.effectImagePath.replace(/\//g, '\\');
            if (fs.existsSync(effectSrc)) {
                const effectExt = path.extname(effectSrc);
                // 新文件名：作者-作品名称.png
                let effectNewName = `${work.author}-${work.workName}${effectExt}`;
                let counter = 1;
                let effectTarget = path.join(effectFolder, effectNewName);
                while (fs.existsSync(effectTarget)) {
                    effectNewName = `${work.author}-${work.workName}(${counter})${effectExt}`;
                    effectTarget = path.join(effectFolder, effectNewName);
                    counter++;
                }
                
                fs.renameSync(effectSrc, effectTarget);
                work.effectImagePath = effectTarget.replace(/\\/g, '/');
                movedCount.effectImages++;
            }
        }
    } catch (error) {
        console.error(`❌ 错误 - ${work.author} - ${work.workName}: ${error.message}`);
        errors.push(`${work.author} - ${work.workName}: ${error.message}`);
    }
});

console.log(`\n📦 视频和效果图移动完成！`);
console.log(`   视频: ${movedCount.videos} 个`);
console.log(`   效果图: ${movedCount.effectImages} 个\n`);

// 2. 移动产品图
console.log('📦 开始移动产品图...\n');

inventory.productImages.forEach((product, index) => {
    try {
        const productSrc = product.imagePath.replace(/\//g, '\\');
        if (fs.existsSync(productSrc)) {
            const productExt = path.extname(productSrc);
            // 产品图保持原名称（不显示作者）
            let productNewName = `${product.productName}${productExt}`;
            let counter = 1;
            let productTarget = path.join(productFolder, productNewName);
            while (fs.existsSync(productTarget)) {
                productNewName = `${product.productName}(${counter})${productExt}`;
                productTarget = path.join(productFolder, productNewName);
                counter++;
            }
            
            fs.renameSync(productSrc, productTarget);
            product.imagePath = productTarget.replace(/\\/g, '/');
            movedCount.productImages++;
            console.log(`✅ 产品图 ${index + 1}/${inventory.productImages.length}: ${product.productName}`);
        } else {
            console.log(`⚠️  产品图不存在: ${productSrc}`);
            errors.push(`产品图不存在: ${product.productName}`);
        }
    } catch (error) {
        console.error(`❌ 错误 - ${product.productName}: ${error.message}`);
        errors.push(`${product.productName}: ${error.message}`);
    }
});

// 3. 更新清单文件
const newInventoryPath = path.join(targetBase, '课程作品清单.json');
inventory.summary.movedFiles = {
    videos: movedCount.videos,
    effectImages: movedCount.effectImages,
    productImages: movedCount.productImages
};
inventory.movedAt = new Date().toISOString();

fs.writeFileSync(newInventoryPath, JSON.stringify(inventory, null, 2), 'utf8');

console.log('\n' + '='.repeat(50));
console.log('✨ 文件移动完成！');
console.log('='.repeat(50));
console.log(`\n📊 移动统计:`);
console.log(`   ✅ 视频文件: ${movedCount.videos} 个`);
console.log(`   ✅ 效果图: ${movedCount.effectImages} 个`);
console.log(`   ✅ 产品图: ${movedCount.productImages} 个`);
console.log(`   📁 总计: ${movedCount.videos + movedCount.effectImages + movedCount.productImages} 个文件`);

if (errors.length > 0) {
    console.log(`\n⚠️  警告信息 (${errors.length} 条):`);
    errors.forEach(err => console.log(`   - ${err}`));
}

console.log(`\n📝 更新后的清单已保存到: ${newInventoryPath}`);
console.log('\n✅ 所有文件已准备好上传到Supabase！');
