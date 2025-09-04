# 📊 AI File Reader - Observability Stack

Complete monitoring solution with Prometheus, Grafana, and Loki for the AI File Reader application.

## 🚀 Quick Start

### 1. Start the Observability Stack

```bash
cd observability
docker-compose up -d
```

### 2. Start the AI File Reader Application

```bash
# From the project root
npm run ui
```

### 3. Access the Dashboards

- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin123`
- **Prometheus**: http://localhost:9092
- **Loki**: http://localhost:3100

## 📈 Metrics Available

### Application Metrics

- **HTTP Request Rate**: Requests per second by endpoint
- **HTTP Request Duration**: Response time percentiles
- **File Upload Metrics**: Upload success/failure rates by file type
- **File Processing Duration**: Time to process different file types
- **Query Response Time**: AI query processing time
- **Vector Store Operations**: Pinecone operations tracking
- **LLM Requests**: Groq API request success/failure rates
- **Documents in Vector Store**: Current document count

### System Metrics

- **CPU Usage**: System CPU utilization
- **Memory Usage**: RAM consumption
- **Disk Usage**: Storage utilization
- **Network I/O**: Network traffic metrics

## 🔍 Logs

Logs are collected by Promtail and stored in Loki. Access them through Grafana's Explore section:

1. Go to Grafana → Explore
2. Select "Loki" as data source
3. Use LogQL queries like:
   ```logql
   {job="ai-file-reader"} |= "error"
   {container="ai-file-reader-app"} | json
   ```

## 📊 Pre-built Dashboards

### AI File Reader - Application Metrics
- HTTP request metrics
- File processing performance
- Query response times
- Upload success rates
- Vector store status

## 🛠️ Configuration

### Prometheus Configuration
- **Scrape Interval**: 4 seconds
- **Targets**: AI File Reader app on port 3000
- **Retention**: 200 hours

### Grafana Configuration
- **Admin User**: admin / admin123
- **Auto-provisioned datasources**: Prometheus & Loki
- **Auto-provisioned dashboards**: Application metrics

### Loki Configuration
- **Storage**: Local filesystem
- **Retention**: Default (no limit)
- **Log ingestion**: Via Promtail

## 🔧 Custom Metrics

The application exposes custom metrics at `/metrics` endpoint:

```bash
curl http://localhost:3000/metrics
```

### Adding New Metrics

1. Define metric in `src/metrics.js`:
```javascript
const myCustomMetric = new client.Counter({
  name: 'my_custom_metric_total',
  help: 'Description of my metric',
  labelNames: ['label1', 'label2']
});
```

2. Register the metric:
```javascript
register.registerMetric(myCustomMetric);
```

3. Use in application:
```javascript
metrics.myCustomMetric.labels('value1', 'value2').inc();
```

## 🚨 Alerting (Future Enhancement)

To add alerting:

1. Configure Alertmanager in docker-compose.yml
2. Add alerting rules to Prometheus
3. Set up notification channels (Slack, email, etc.)

## 🐛 Troubleshooting

### Metrics Not Appearing
1. Check if app is running: `curl http://localhost:3000/metrics`
2. Verify Prometheus targets: http://localhost:9092/targets
3. Check Prometheus logs: `docker logs ai-file-reader-prometheus`

### Grafana Dashboard Issues
1. Verify datasource connection in Grafana
2. Check if metrics exist in Prometheus
3. Restart Grafana: `docker restart ai-file-reader-grafana`

### Loki Logs Not Showing
1. Check Promtail logs: `docker logs ai-file-reader-promtail`
2. Verify Loki is running: `docker logs ai-file-reader-loki`
3. Test Loki API: `curl http://localhost:3100/ready`

## 📁 File Structure

```
observability/
├── docker-compose.yml          # Main orchestration file
├── prometheus.yml              # Prometheus configuration
├── loki/
│   └── loki-config.yml        # Loki configuration
├── promtail/
│   └── promtail-config.yml    # Log collection config
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/       # Auto-configured datasources
│   │   └── dashboards/        # Dashboard provisioning
│   └── dashboards/            # Dashboard JSON files
└── README.md                  # This file
```

## 🔄 Maintenance

### Backup Grafana Dashboards
```bash
# Export dashboard JSON from Grafana UI
# Or backup the grafana_data volume
docker run --rm -v ai-file-reader_grafana_data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

### Clean Up Old Data
```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker volume rm ai-file-reader_prometheus_data ai-file-reader_grafana_data ai-file-reader_loki_data

# Restart
docker-compose up -d
```

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Node.js Prometheus Client](https://github.com/siimon/prom-client)
