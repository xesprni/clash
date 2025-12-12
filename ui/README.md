# Clash Dashboard (React + shadcn)

现代化的 Clash 外置控制台 UI，基于官方 REST API。使用 shadcn/ui（Radix + Tailwind）本地组件，包含概览、代理/策略组、提供者、规则、连接、DNS 调试和运行配置管理。

## 开发

```bash
cd ui
npm install
npm run dev
```

默认使用 `http://127.0.0.1:9090` 作为 external-controller，Hash 路由前缀为 `#/`，无须额外反向代理。

## 构建

```bash
npm run build
```

产物位于 `ui/dist`，`vite.config.ts` 的 `base` 已设置为 `/ui/`，与 Clash 的 `/ui/*` 静态托管路径一致。

## 与 Clash 集成

1. 确保配置文件开启 external-controller，并设置 secret：
   ```yaml
   external-controller: 127.0.0.1:9090
   secret: your-token
   external-ui: /abs/path/to/ui/dist
   ```
   或在代码中使用 `hub.WithExternalController` 与 `hub.WithExternalUI` 传入。
2. 启动 Clash 后访问 `http://127.0.0.1:9090/ui/#/`。
3. 在“设置”页填写 Controller 地址与 Secret，点击“连通性测试”确保可用。

## 功能映射

- 概览：/version, /configs, /traffic WebSocket 实时展示
- 代理：/proxies、/proxies/:name 切换 selector，/proxies/:name/delay 延迟测试
- 提供者：/providers/proxies 更新与健康检查
- 规则：/rules 列表
- 连接：/connections 轮询，支持单个/全部关闭
- DNS：/dns/query 调试
- 设置：PATCH /configs 更新运行参数；本地存储 external-controller/secret
