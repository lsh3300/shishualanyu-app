export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">联系我们</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">联系方式</h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium">电话：</span> 
                <a href="tel:400-123-4567" className="text-primary hover:underline">400-123-4567</a>
              </p>
              <p>
                <span className="font-medium">邮箱：</span> 
                <a href="mailto:info@shishuolanyu.com" className="text-primary hover:underline">info@shishuolanyu.com</a>
              </p>
              <p>
                <span className="font-medium">地址：</span> 
                浙江省杭州市西湖区蓝染文化产业园A区
              </p>
              <p>
                <span className="font-medium">营业时间：</span> 
                周二至周日 9:00-18:00
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">关注我们</h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium">微信公众号：</span> 世说蓝语
              </p>
              <p>
                <span className="font-medium">微博：</span> 
                <a href="https://weibo.com/shishuolanyu" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@世说蓝语</a>
              </p>
              <p>
                <span className="font-medium">小红书：</span> 
                <a href="https://xiaohongshu.com/user/shishuolanyu" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">世说蓝语</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">留言咨询</h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">姓名</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">联系电话</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">电子邮箱</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">咨询主题</label>
              <select 
                id="subject" 
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              >
                <option value="">请选择咨询主题</option>
                <option value="course">课程咨询</option>
                <option value="product">产品咨询</option>
                <option value="custom">定制服务</option>
                <option value="cooperation">合作洽谈</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">留言内容</label>
              <textarea 
                id="message" 
                rows={5} 
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              提交留言
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}