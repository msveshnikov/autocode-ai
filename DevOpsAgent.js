import { exec } from "child_process";
import util from "util";
import yaml from "js-yaml";
import FileManager from "./fileManager.js";
import CodeGenerator from "./codeGenerator.js";
import CodeAnalyzer from "./codeAnalyzer.js";

const execAsync = util.promisify(exec);

const DevOpsAgent = {
    async configureCICD() {
        const cicdConfig = {
            name: "AutoCode CI/CD",
            on: ["push", "pull_request"],
            jobs: {
                build: {
                    "runs-on": "ubuntu-latest",
                    steps: [
                        { uses: "actions/checkout@v2" },
                        { uses: "actions/setup-node@v2", with: { "node-version": "20" } },
                        { run: "npm ci" },
                        { run: "npm run build" },
                        { run: "npm test" },
                    ],
                },
            },
        };

        const yamlContent = yaml.dump(cicdConfig);
        await FileManager.write(".github/workflows/ci-cd.yml", yamlContent);
    },

    async setupDockerization() {
        const dockerfileContent = `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
    `.trim();

        await FileManager.write("Dockerfile", dockerfileContent);

        const dockerComposeContent = `
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    `.trim();

        await FileManager.write("docker-compose.yml", dockerComposeContent);
    },

    async configureKubernetes() {
        const k8sDeploymentContent = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: autocode-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: autocode
  template:
    metadata:
      labels:
        app: autocode
    spec:
      containers:
      - name: autocode
        image: autocode:latest
        ports:
        - containerPort: 3000
    `.trim();

        await FileManager.write("k8s-deployment.yaml", k8sDeploymentContent);

        const k8sServiceContent = `
apiVersion: v1
kind: Service
metadata:
  name: autocode-service
spec:
  selector:
    app: autocode
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
    `.trim();

        await FileManager.write("k8s-service.yaml", k8sServiceContent);
    },

    async setupMonitoring() {
        const prometheusConfig = `
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'autocode'
    static_configs:
      - targets: ['localhost:3000']
    `.trim();

        await FileManager.write("prometheus.yml", prometheusConfig);

        const grafanaDashboardConfig = {
            annotations: {
                list: [
                    {
                        builtIn: 1,
                        datasource: "-- Grafana --",
                        enable: true,
                        hide: true,
                        iconColor: "rgba(0, 211, 255, 1)",
                        name: "Annotations & Alerts",
                        type: "dashboard",
                    },
                ],
            },
            editable: true,
            gnetId: null,
            graphTooltip: 0,
            id: null,
            links: [],
            panels: [
                {
                    aliasColors: {},
                    bars: false,
                    dashLength: 10,
                    dashes: false,
                    datasource: null,
                    fill: 1,
                    fillGradient: 0,
                    gridPos: {
                        h: 9,
                        w: 12,
                        x: 0,
                        y: 0,
                    },
                    hiddenSeries: false,
                    id: 2,
                    legend: {
                        avg: false,
                        current: false,
                        max: false,
                        min: false,
                        show: true,
                        total: false,
                        values: false,
                    },
                    lines: true,
                    linewidth: 1,
                    nullPointMode: "null",
                    options: {
                        dataLinks: [],
                    },
                    percentage: false,
                    pointradius: 2,
                    points: false,
                    renderer: "flot",
                    seriesOverrides: [],
                    spaceLength: 10,
                    stack: false,
                    steppedLine: false,
                    targets: [
                        {
                            expr: "rate(http_requests_total[5m])",
                            refId: "A",
                        },
                    ],
                    thresholds: [],
                    timeFrom: null,
                    timeRegions: [],
                    timeShift: null,
                    title: "HTTP Request Rate",
                    tooltip: {
                        shared: true,
                        sort: 0,
                        value_type: "individual",
                    },
                    type: "graph",
                    xaxis: {
                        buckets: null,
                        mode: "time",
                        name: null,
                        show: true,
                        values: [],
                    },
                    yaxes: [
                        {
                            format: "short",
                            label: null,
                            logBase: 1,
                            max: null,
                            min: null,
                            show: true,
                        },
                        {
                            format: "short",
                            label: null,
                            logBase: 1,
                            max: null,
                            min: null,
                            show: true,
                        },
                    ],
                    yaxis: {
                        align: false,
                        alignLevel: null,
                    },
                },
            ],
            schemaVersion: 22,
            style: "dark",
            tags: [],
            templating: {
                list: [],
            },
            time: {
                from: "now-6h",
                to: "now",
            },
            timepicker: {},
            timezone: "",
            title: "AutoCode Dashboard",
            uid: null,
            version: 0,
        };

        await FileManager.write("grafana-dashboard.json", JSON.stringify(grafanaDashboardConfig, null, 2));
    },

    async configureScaling() {
        const autoscalerConfig = `
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: autocode-autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: autocode-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      targetAverageUtilization: 50
    `.trim();

        await FileManager.write("k8s-autoscaler.yaml", autoscalerConfig);
    },

    async setupLogging() {
        const fluentdConfig = `
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<match **>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
  logstash_prefix fluentd
  logstash_dateformat %Y%m%d
  include_tag_key true
  type_name access_log
  tag_key @log_name
  flush_interval 1s
</match>
    `.trim();

        await FileManager.write("fluentd.conf", fluentdConfig);
    },

    async configureSecurity() {
        const securityConfig = {
            policies: [
                {
                    name: "content-security-policy",
                    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
                },
                {
                    name: "x-frame-options",
                    value: "SAMEORIGIN",
                },
                {
                    name: "x-xss-protection",
                    value: "1; mode=block",
                },
                {
                    name: "x-content-type-options",
                    value: "nosniff",
                },
                {
                    name: "referrer-policy",
                    value: "strict-origin-when-cross-origin",
                },
            ],
        };

        await FileManager.write("security-headers.json", JSON.stringify(securityConfig, null, 2));
    },

    async manageDeployment() {
        try {
            await execAsync("docker-compose up -d");
            console.log("Application deployed successfully using Docker Compose");

            await execAsync("kubectl apply -f k8s-deployment.yaml -f k8s-service.yaml -f k8s-autoscaler.yaml");
            console.log("Kubernetes resources created successfully");
        } catch (error) {
            console.error("Error during deployment:", error);
        }
    },

    async optimizePerformance() {
        const files = await FileManager.getFilesToProcess();
        for (const file of files) {
            await CodeGenerator.optimizeAndRefactorFile(file);
        }
    },

    async runSecurityAudit() {
        try {
            const { stdout } = await execAsync("npm audit");
            console.log("Security audit results:", stdout);
            await CodeAnalyzer.checkSecurityVulnerabilities();
        } catch (error) {
            console.error("Security audit failed:", error.stderr);
        }
    },

    async backupProject() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = `backups/backup-${timestamp}.zip`;
        await execAsync(`zip -r ${backupPath} . -x "node_modules/*" "*/.git/*"`);
        console.log(`Project backed up to ${backupPath}`);
    },

    async run() {
        await this.configureCICD();
        await this.setupDockerization();
        await this.configureKubernetes();
        await this.setupMonitoring();
        await this.configureScaling();
        await this.setupLogging();
        await this.configureSecurity();
        await this.manageDeployment();
        await this.optimizePerformance();
        await this.runSecurityAudit();
        await this.backupProject();
    },
};

export default DevOpsAgent;
