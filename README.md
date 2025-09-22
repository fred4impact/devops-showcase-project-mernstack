# MERN Stack DevOps Showcase Project

A comprehensive full-stack ticketing platform demonstrating modern DevOps practices with MERN stack, AWS EKS, GitLab CI/CD, ArgoCD, and Kubernetes.

## 🏗️ Architecture Overview

This project showcases a complete DevOps pipeline for a modern web application:

- **Application**: MERN Stack (MongoDB, Express.js, React, Node.js) ticketing platform
- **Infrastructure**: AWS EKS (Elastic Kubernetes Service) with Terraform
- **CI/CD**: GitLab CI/CD with automated testing and security scanning
- **GitOps**: ArgoCD for continuous deployment
- **Orchestration**: Kubernetes for container orchestration
- **Testing**: Comprehensive test suites (unit, integration, e2e)

## 📁 Project Structure

```
├── application/                 # MERN Stack Application
│   ├── backend/                # NestJS Backend API
│   ├── frontend/               # Next.js Frontend
│   ├── docker-compose.yml     # Local development
│   └── docker-compose.prod.yml # Production setup
├── infrastructure/             # Terraform Infrastructure (AWS EKS)
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
├── gitlab-ci/                  # GitLab CI/CD Pipeline
│   ├── .gitlab-ci.yml
│   └── templates/
├── argocd/                     # ArgoCD Configuration
│   ├── applications/
│   └── app-of-apps.yaml
├── kubernetes/                 # Kubernetes Manifests
│   ├── namespaces/
│   ├── deployments/
│   ├── services/
│   └── ingress/
├── tests/                      # Test Suites
│   ├── backend/
│   ├── frontend/
│   └── integration/
└── docs/                       # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose**: For local development
- **Node.js 18+**: For development
- **AWS CLI**: For infrastructure deployment
- **Terraform**: For infrastructure as code
- **kubectl**: For Kubernetes management
- **GitLab Runner**: For CI/CD (or GitLab.com)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://gitlab.com/your-org/mernstack-devops-showcase-project.git
   cd mernstack-devops-showcase-project
   ```

2. **Start the application locally**:
   ```bash
   cd application
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

## 🏢 Application Components

### Backend (NestJS)

**Technology Stack**:
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for seat locking and caching
- **Storage**: AWS S3 for file storage
- **Payments**: Stripe integration
- **Email**: SendGrid for notifications
- **Authentication**: JWT with Passport.js

**Key Features**:
- ✅ User authentication and authorization
- ✅ Event management system
- ✅ Ticket types and pricing
- ✅ Seat selection with Redis locking
- ✅ Stripe payment integration
- ✅ QR code ticket generation
- ✅ PDF ticket generation
- ✅ Email notifications
- ✅ Order management
- ✅ Scanner app for check-in

**API Endpoints**:
- **Public**: `/api/events`, `/api/cart`, `/api/checkout`
- **Authenticated**: `/api/auth/*`, `/api/users/me/*`
- **Organizer**: `/api/organizer/*`
- **Scanner**: `/api/scan`
- **Webhooks**: `/api/webhooks/stripe`

### Frontend (Next.js)

**Technology Stack**:
- **Framework**: Next.js 14 with App Router
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: SWR for data fetching
- **Forms**: React Hook Form with Zod validation
- **Payments**: Stripe Elements
- **Animations**: Framer Motion

**Key Features**:
- ✅ Responsive design with Tailwind CSS
- ✅ Server-side rendering (SSR)
- ✅ Client-side routing
- ✅ Form validation with Zod
- ✅ Payment integration with Stripe
- ✅ Real-time updates with WebSocket
- ✅ QR code generation and scanning
- ✅ PDF ticket download

## 🏗️ Infrastructure (AWS EKS)

### Terraform Configuration

The infrastructure is managed using Terraform with the following components:

**AWS Resources**:
- **EKS Cluster**: Managed Kubernetes cluster
- **VPC**: Custom Virtual Private Cloud
- **Subnets**: Public and private subnets across AZs
- **Security Groups**: Network security rules
- **IAM Roles**: Service accounts and permissions
- **Load Balancer**: Application Load Balancer
- **RDS**: Managed database (PostgreSQL/MySQL)
- **ElastiCache**: Redis cluster
- **S3**: Object storage for assets

**Deployment**:
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Kubernetes Manifests

**Namespaces**:
- `ticketnow-dev`: Development environment
- `ticketnow-staging`: Staging environment
- `ticketnow-prod`: Production environment

**Deployments**:
- Backend API deployment
- Frontend deployment
- Database migrations
- Redis deployment

**Services**:
- ClusterIP services for internal communication
- LoadBalancer services for external access
- Ingress controllers for routing

## 🔄 CI/CD Pipeline (GitLab)

### Pipeline Stages

The GitLab CI/CD pipeline consists of 6 main stages:

1. **Security** (`security`)
   - Static Application Security Testing (SAST)
   - Dependency vulnerability scanning
   - Container security scanning

2. **Build** (`build`)
   - Backend compilation and testing
   - Frontend build and testing
   - Integration tests
   - Code quality checks

3. **Test** (`test`)
   - Unit tests (backend/frontend)
   - Integration tests
   - End-to-end tests
   - Performance tests

4. **Docker Build** (`docker-build`)
   - Build Docker images
   - Push to GitLab Container Registry
   - Multi-architecture builds

5. **Docker Security** (`docker-security`)
   - Container vulnerability scanning
   - Security policy enforcement
   - Image signing

6. **Deploy** (`deploy`)
   - Deploy to staging environment
   - Deploy to production (manual approval)
   - Rollback capabilities

### Pipeline Configuration

**Main Pipeline**: `gitlab-ci/.gitlab-ci.yml`
**Templates**: `gitlab-ci/templates/`

**Key Features**:
- ✅ Parallel job execution
- ✅ Artifact caching
- ✅ Security scanning
- ✅ Multi-environment deployment
- ✅ Manual approval gates
- ✅ Rollback capabilities

## 🚀 GitOps with ArgoCD

### ArgoCD Configuration

**Application of Applications Pattern**:
- `argocd/app-of-apps.yaml`: Main ArgoCD application
- `argocd/applications/`: Individual application definitions

**Applications**:
- **Backend**: API deployment and services
- **Frontend**: Web application deployment
- **Infrastructure**: Database and cache services
- **Monitoring**: Prometheus and Grafana

**Features**:
- ✅ Automated deployment from Git
- ✅ Multi-environment support
- ✅ Rollback capabilities
- ✅ Health monitoring
- ✅ Sync policies

### Deployment Strategy

1. **Development**: Automatic deployment on merge
2. **Staging**: Automatic deployment with tests
3. **Production**: Manual approval required

## 🧪 Testing Strategy

### Test Suites

**Backend Tests** (`tests/backend/`):
- Unit tests for services and controllers
- Integration tests for API endpoints
- Authentication and authorization tests
- Payment processing tests

**Frontend Tests** (`tests/frontend/`):
- Component rendering tests
- User interaction tests
- Form validation tests
- API integration tests

**Integration Tests** (`tests/integration/`):
- End-to-end user flows
- API integration tests
- Database integration tests
- Third-party service tests

### Test Execution

**Local Testing**:
```bash
cd tests
npm install
npm run test:all
```

**CI/CD Testing**:
- Automatic execution on every commit
- Parallel test execution
- Coverage reporting
- Test result artifacts

## 📊 Monitoring and Observability

### Application Monitoring

**Metrics**:
- Application performance metrics
- Business metrics (tickets sold, revenue)
- Error rates and response times
- Database performance

**Logging**:
- Structured logging with correlation IDs
- Centralized log aggregation
- Log analysis and alerting

**Tracing**:
- Distributed tracing across services
- Performance bottleneck identification
- Request flow visualization

### Infrastructure Monitoring

**Kubernetes Monitoring**:
- Cluster health and resource usage
- Pod and node metrics
- Network and storage metrics

**AWS Monitoring**:
- EKS cluster metrics
- RDS and ElastiCache metrics
- S3 usage and costs

## 🔒 Security

### Security Measures

**Application Security**:
- JWT authentication with secure tokens
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

**Infrastructure Security**:
- Network security groups
- IAM roles and policies
- Secrets management
- Container security scanning
- Vulnerability scanning

**Compliance**:
- Security scanning in CI/CD
- Dependency vulnerability checks
- Container image security
- Regular security audits

## 🚀 Deployment

### Environment Strategy

**Development**:
- Local development with Docker Compose
- Feature branch deployments
- Automated testing

**Staging**:
- Production-like environment
- Integration testing
- Performance testing

**Production**:
- High availability setup
- Blue-green deployments
- Automated rollback
- Monitoring and alerting

### Deployment Process

1. **Code Commit**: Developer commits to feature branch
2. **CI Pipeline**: Automated testing and security scanning
3. **Merge Request**: Code review and approval
4. **Staging Deployment**: Automatic deployment to staging
5. **Production Deployment**: Manual approval and deployment
6. **Monitoring**: Continuous monitoring and alerting

## 📚 Documentation

### Additional Documentation

- **API Documentation**: Available at `/api/docs` when running locally
- **GitLab CI Pipeline**: `docs/gitlab_ci_pipeline-flow.md`
- **Commit Guide**: `docs/git-commit-guide.md`
- **Troubleshooting**: `docs/image-upload-troubleshooting.md`
- **Test Documentation**: `tests/README.md`

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests**: `npm run test:all`
6. **Commit changes**: Follow the commit guide
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Create a Merge Request**

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Testing**: Minimum 70% code coverage
- **Documentation**: JSDoc for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the `docs/` directory
- **Issues**: Create an issue in GitLab
- **Discussions**: Use GitLab discussions for questions
- **API Docs**: Available at `/api/docs` when running locally

### Troubleshooting

**Common Issues**:
1. **Docker Issues**: Check Docker daemon and available resources
2. **Database Connection**: Verify MongoDB and Redis are running
3. **Environment Variables**: Check `.env` file configuration
4. **CI/CD Failures**: Review pipeline logs and configuration

**Debug Commands**:
```bash
# Check application status
docker-compose ps

# View application logs
docker-compose logs backend
docker-compose logs frontend

# Check Kubernetes status
kubectl get pods -n ticketnow-dev

# Check ArgoCD applications
argocd app list
```

## 🎯 Roadmap

### Planned Features

- [ ] **Microservices Architecture**: Split monolith into microservices
- [ ] **Event Sourcing**: Implement event-driven architecture
- [ ] **Advanced Analytics**: Business intelligence dashboard
- [ ] **Mobile App**: React Native mobile application
- [ ] **Multi-tenancy**: Support for multiple organizations
- [ ] **Advanced Security**: OAuth2, RBAC, audit logging
- [ ] **Performance Optimization**: Caching, CDN, optimization
- [ ] **Disaster Recovery**: Backup and recovery procedures

### Infrastructure Improvements

- [ ] **Service Mesh**: Istio implementation
- [ ] **Advanced Monitoring**: Prometheus, Grafana, Jaeger
- [ ] **Security Scanning**: Falco, OPA Gatekeeper
- [ ] **Cost Optimization**: Resource optimization and monitoring
- [ ] **Multi-region**: Global deployment strategy

---

**Built with ❤️ by the DevOps Team**

*This project demonstrates modern DevOps practices and serves as a learning resource for full-stack development with cloud-native technologies.*
