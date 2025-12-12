📐 Clash 项目架构分析
核心架构层次
1. 入口层 (Inbound)

HTTP/HTTPS/SOCKS5 代理服务器
TUN 设备（Premium版）
Mixed 混合端口
Redir/TProxy 透明代理
2. 核心隧道层 (Tunnel)

连接调度：TCP/UDP 队列处理
NAT 表管理
规则匹配引擎
代理选择逻辑
三种模式：Rule（规则）/Global（全局）/Direct（直连）
3. 出站层 (Outbound)

协议适配器：Shadowsocks(R)、VMess、Trojan、VLESS、Snell、WireGuard
代理组策略：
Selector（手动选择）
URLTest（延迟测试）
Fallback（故障转移）
LoadBalance（负载均衡）
Relay（链式代理）
4. 规则引擎 (Rule)

Domain/DomainSuffix/DomainKeyword
GEOIP/IPCIDR
SrcPort/DstPort/InboundPort
Process/ProcessPath（进程匹配）
IPSet
5. DNS 解析层

FakeIP 模式（提升性能）
DNS over HTTPS (DoH)
DNS 分流策略
Fallback DNS
6. 组件层 (Component)

MMDB（GeoIP 数据库）
FakeIP 池管理
Dialer（连接拨号器）
Profile（配置持久化）
Resolver（DNS 解析器）
Process（进程查找）
7. 管理层 (Hub)

RESTful API
配置热重载
统计信息收集
🔍 功能缺失与改进建议
1️⃣ 核心功能缺失
❌ 缺少现代协议支持

⚠️ Hysteria/Hysteria2：基于 QUIC 的高性能协议，适合高丢包网络
⚠️ Tuic：QUIC-based 协议，性能优秀
⚠️ REALITY：新型 TLS 伪装协议
⚠️ ShadowTLS：TLS 流量伪装
建议：添加 adapter/outbound/hysteria.go、hysteria2.go、tuic.go 等

2️⃣ 规则引擎增强
❌ 缺少高级规则类型

⚠️ User-Agent 匹配：根据请求 UA 分流
⚠️ 网络类型匹配：WiFi/Cellular 区分
⚠️ 时间规则：按时间段选择代理
⚠️ URL 正则匹配：更灵活的 HTTP 分流
⚠️ Rule Provider 懒加载：大规则集性能优化
建议：扩展 rule 目录，添加 user_agent.go、network_type.go 等

3️⃣ 代理组策略改进
❌ 缺少智能策略

⚠️ 地理位置优先：自动选择地理位置最近的节点
⚠️ 历史成功率：基于连接成功率智能选择
⚠️ 带宽测速：不只测延迟，还测带宽
⚠️ 自适应策略：根据网络状况动态调整
当前问题：

LoadBalance 只有简单的一致性哈希
缺少流量统计反馈机制
4️⃣ 监控与可观测性
❌ 严重不足

⚠️ Metrics 导出：无 Prometheus/Grafana 支持
⚠️ TraceID：无法追踪单个请求全链路
⚠️ 慢查询日志：DNS/连接慢的诊断
⚠️ 流量分析：缺少域名级流量统计
⚠️ 健康检查详情：只有简单的延迟测试
建议：

添加 component/metrics/ 目录
实现 /metrics API 端点
增强 statistic 的数据收集
5️⃣ 性能优化空间
❌ 已知性能瓶颈

⚠️ 零拷贝支持：TCP Splice/Sendfile
⚠️ 连接池复用：出站连接缓存
⚠️ DNS 缓存优化：TTL 精细化管理
⚠️ 规则匹配优化：AC 自动机/前缀树
⚠️ 内存池：减少 GC 压力
当前状态：

pool 只有基础 buffer pool
规则匹配是线性扫描（O(n)）
6️⃣ 安全与隐私
❌ 功能缺失

⚠️ 流量混淆：主动防御 DPI 检测
⚠️ DNS 泄漏防护：强制 DNS 劫持
⚠️ WebRTC 泄漏防护
⚠️ 证书 Pinning：防中间人攻击
⚠️ 审计日志：敏感操作记录
7️⃣ 用户体验
❌ 配置复杂

⚠️ 配置校验器：启动前完整校验，给出友好提示
⚠️ 配置迁移工具：版本升级自动迁移
⚠️ 可视化配置生成器：降低门槛
⚠️ 预设模板：常见场景的配置模板
❌ API 不够完善

缺少 WebSocket 实时推送
缺少批量操作接口
文档不够详细
8️⃣ 高级功能
❌ 企业级需求

⚠️ 多用户管理：支持多租户
⚠️ 流量配额：用户级流量限制
⚠️ 黑白名单：IP/域名访问控制
⚠️ 日志审计：合规要求
⚠️ 高可用集群：主备切换
❌ 扩展性

⚠️ 插件系统：Lua/WASM 脚本扩展
⚠️ Webhook 通知：节点变更/故障通知
⚠️ 数据库支持：持久化配置到 DB
🎯 优先级建议
🔥 高优先级
添加 Hysteria2/REALITY 协议（用户需求强）
Prometheus Metrics（可观测性基础）
配置校验器（减少用户错误）
DNS 缓存优化（性能提升明显）
🟡 中优先级
Rule Provider 懒加载（大规则集性能）
连接池复用（性能优化）
WebSocket API（实时通知）
带宽测速（策略增强）
🟢 低优先级
插件系统（架构复杂）
多用户管理（企业需求）

---
```
┌─────────────────────────────────────────────────────────────────┐
│                         1. 入口层 (Inbound)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────┬──────────────────┬──────────────────┐
    │  HTTP Listener   │  SOCKS Listener  │  Mixed Listener  │
    │  (port: 7890)    │  (port: 7891)    │  (port: 7892)    │
    └──────────────────┴──────────────────┴──────────────────┘
                              ↓
              listener.Accept() → HandleConn()
                              ↓
                      解析请求协议
                              ↓
    ┌─────────────────────────────────────────────────┐
    │  构造 Metadata (元数据)                           │
    │  - Host/DstIP: 目标地址                          │
    │  - DstPort: 目标端口                             │
    │  - SrcIP/SrcPort: 源地址                         │
    │  - NetWork: TCP/UDP                             │
    │  - ProcessPath: 进程路径 (可选)                   │
    └─────────────────────────────────────────────────┘
                              ↓
              封装成 ConnContext / PacketAdapter
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  2. 队列转发 (Fan-in Channel)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │   TCP Queue          UDP Queue      │
        │   (chan 200)         (chan 200)     │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │  process() 主调度循环                 │
        │  - TCP: 每个连接 1 goroutine         │
        │  - UDP: 固定 4-N 个 worker           │
        └─────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   3. 隧道处理 (Tunnel)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              handleTCPConn() / handleUDPConn()
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              3.1 预处理 (preHandleMetadata)                       │
│  - 解析 IP 字符串                                                  │
│  - 处理 FakeIP (反向查找域名)                                       │
│  - 检查 Hosts 映射                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              3.2 代理解析 (resolveMetadata)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    检查运行模式 (Mode)
                              ↓
        ┌─────────────┬─────────────┬─────────────┐
        │   Direct    │   Global    │    Rule     │
        │  (直连模式)   │  (全局代理)  │  (规则模式)  │
        └─────────────┴─────────────┴─────────────┘
                              ↓
            【Rule 模式】调用 match() 函数
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  3.3 规则匹配 (match)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │  1. 检查 Hosts 本地映射              │
        │     metadata.Host → IP               │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │  2. 遍历规则列表 (for rule in rules) │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │  3. 条件判断：                        │
        │     - ShouldResolveIP? → DNS 解析   │
        │     - ShouldFindProcess? → 查进程   │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │  4. 调用 rule.Match(metadata)        │
        │     - Domain/IP/Port/Process 匹配   │
        └─────────────────────────────────────┘
                              ↓
                    匹配成功？
                              ↓
        ┌─────────────┬──────────────────────┐
        │     是      │         否            │
        └─────────────┴──────────────────────┘
              ↓                    ↓
      返回 Proxy, Rule      继续下一条规则
                              ↓
                    所有规则都不匹配
                              ↓
                      返回 DIRECT 代理
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                4. 建立出站连接 (Dial)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        proxy.DialContext(ctx, metadata)
                              ↓
        ┌─────────────────────────────────────┐
        │  根据代理类型调用不同适配器：         │
        │  - Direct: 直接连接目标              │
        │  - Shadowsocks: SS 加密握手         │
        │  - VMess: VMess 协议握手            │
        │  - Trojan: Trojan 协议握手          │
        │  - Selector/URLTest: 选择子节点     │
        │  - LoadBalance: 负载均衡选择        │
        └─────────────────────────────────────┘
                              ↓
        dialer.DialContext() → 建立 TCP 连接
                              ↓
        返回 remoteConn (出站连接)
                              ↓
        statistic.NewTCPTracker() → 流量统计包装
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 5. 数据转发 (Relay)                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              handleSocket(connCtx, remoteConn)
                              ↓
              N.Relay(leftConn, rightConn)
                              ↓
        ┌─────────────────────────────────────┐
        │  双向 IO 拷贝 (并发执行)              │
        │  goroutine 1:                        │
        │    客户端 ← 远程服务器                │
        │    io.Copy(leftConn, rightConn)     │
        │                                     │
        │  主 goroutine:                       │
        │    客户端 → 远程服务器                │
        │    io.Copy(rightConn, leftConn)     │
        └─────────────────────────────────────┘
                              ↓
                任一方向传输结束或出错
                              ↓
        ┌─────────────────────────────────────┐
        │  设置读超时触发另一方向退出           │
        │  leftConn.SetReadDeadline(now)      │
        │  等待 goroutine 结束 (<-ch)          │
        └─────────────────────────────────────┘
                              ↓
                    关闭所有连接
                              ↓
                      流程结束
                      ```

🔑 关键数据结构
Metadata (元数据)
```
type Metadata struct {
    NetWork       NetWork    // TCP/UDP
    Type          Type       // HTTP/HTTPS/SOCKS5...
    SrcIP         net.IP     // 源 IP
    DstIP         net.IP     // 目标 IP  
    SrcPort       Port       // 源端口
    DstPort       Port       // 目标端口
    Host          string     // 域名
    ProcessPath   string     // 进程路径
    DNSMode       DNSMode    // Normal/FakeIP/Mapping
    SpecialProxy  string     // 指定代理
}
```
ConnContext (连接上下文)
```
type ConnContext interface {
    Metadata() *Metadata    // 获取元数据
    Conn() net.Conn         // 获取原始连接
}
```
📝 核心流程要点
1. 异步队列设计
TCP: 无缓冲阻塞，每连接一个 goroutine
UDP: 固定 worker 池（4-N 个），避免 goroutine 爆炸
2. 规则匹配优化
懒 DNS 解析：只有规则需要时才解析（ShouldResolveIP()）
进程懒查找：只有规则需要时才查进程（ShouldFindProcess()）
短路逻辑：匹配到第一个规则立即返回
3. FakeIP 处理
请求 FakeIP (198.18.0.1) 
    ↓
反向查找真实域名 (www.google.com)
    ↓
用域名匹配规则
    ↓
规则匹配成功后，再次 DNS 解析获取真实 IP
4. 连接复用
读超时触发：一方结束后通过 SetReadDeadline 优雅关闭另一方
避免 TCPConn.ReadFrom：使用 WriteOnlyWriter 包装防止零拷贝问题
5. 统计与链路追踪
remoteConn → statistic.NewTCPTracker() → 流量统计
                                      → 记录规则匹配
                                      → 记录代理链
⚡ 性能瓶颈点
规则匹配：线性遍历 O(n)，大规则集性能差
DNS 解析：每次匹配可能触发多次解析
进程查找：系统调用开销大
IO 拷贝：未使用 Splice/Sendfile 零拷贝
Goroutine 开销：TCP 每连接一个 goroutine
这就是 Clash 的核心数据流转路径！整体设计简洁高效，但在大规模场景下确实存在上面提到的优化空间。