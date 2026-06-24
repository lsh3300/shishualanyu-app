export default function CancelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">支付已取消</h1>
        <p className="text-muted-foreground mb-6">
          您已取消了支付流程。如果您有任何问题或需要帮助，请随时联系我们的客服团队。
        </p>
        <div className="space-y-4">
          <a
            href="/store"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            返回商店
          </a>
          <a
            href="/contact"
            className="inline-block block text-primary hover:underline"
          >
            联系客服
          </a>
        </div>
      </div>
    </div>
  );
}