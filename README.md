
# Infrastructure Deployment Guide for Readly Bookstore
#

## Project Overview
Readly is a single-page web application that enables users to browse a digital catalog of books. Its core functionality involves retrieving and displaying a list of books, including titles, authors, and prices dynamically fetched from a backend database. The application features a clean, responsive user interface, while the backend is built as a RESTful API, ensuring a clear separation between client-side presentation and server-side logic and data management.




<img width="1501" height="1129" alt="Readly-Booksore Infrastructure" src="https://github.com/user-attachments/assets/abae6af0-9970-429b-bd60-33df301fc52f" />




## Tech Stack

### Frontend Presentation Layer
- **S3 Simple Storage Service** - Static file hosting
- **CloudFront** - Global content delivery network

### Backend Application Layer
- **Runtime & Framework**: Node.js
- **Application Hosting**: Amazon EC2 (Elastic Compute Cloud)
- **Load Balancing**: Application Load Balancer with Auto Scaling

### Database Technology
- **MySQL** - Amazon RDS with Multi-AZ deployment

### Cloud Infrastructure & Security (AWS)
- **Networking**: Amazon VPC (Virtual Private Cloud)
- **Identity & Access Management (IAM)**: AWS Systems Manager Session Manager
- **Security**: Security Groups, Network isolation

## Problem Statement
**Current Challenge**: Undeployed Code Repository

The Readly Bookstore exists solely as source code without a functional production environment. An ad-hoc deployment would introduce critical risks:

### Four Core Problems:
1. **Security Exposure** - Database and backend servers would be directly internet-accessible, creating vulnerable attack surfaces
2. **Fragile Architecture** - Single-server design creates failure points and cannot adapt to traffic fluctuations
3. **Operational Complexity** - Unstructured infrastructure leads to difficult maintenance, monitoring, and updates
4. **Geographic Latency** - Global users experience slow performance with centralized hosting

## Strategic Solution
We engineered a production-ready three-tier infrastructure that transforms the application from concept to enterprise service:

### Architectural Pillars:
- **Defense-in-Depth Security** - Network isolation, least-privilege access controls, and secure secret management
- **Elastic Resilience** - Multi-availability-zone deployment with auto-scaling for continuous availability
- **Global Performance** - CDN-cached static content delivery with geographic optimization
- **Operational Excellence** - Clear separation of presentation (frontend), business logic (backend), and data (database) layers

## Architecture Breakdown

### Network Layer (VPC)
- Custom Virtual Private Cloud with segmented subnet architecture
- Dual public subnets for public-facing components
- Dual private subnets for backend and data layer isolation
- Internet Gateway for outbound public connectivity
- NAT Gateway for controlled private subnet internet access
- Dedicated route tables enforcing strict traffic routing policies

### Security & Access Control
- Application Load Balancer as public entry point
- Security groups implementing micro-segmentation
- IAM roles enforcing principle of least privilege
- Database deployed with no public access

### Application Infrastructure
- EC2 auto-scaling group for backend application hosting
- RDS MySQL instance in private subnets for data persistence
- S3 static hosting for frontend assets
- CloudFront distribution for global content delivery

### Compute & Application Services
- **Application Load Balancer** - Manages HTTP/HTTPS traffic distribution and SSL termination
- **EC2 Instances** - Host the web application tier and business logic processing
- **Auto Scaling Group** - Dynamically adjusts compute capacity based on traffic patterns

### Data & Storage Infrastructure

#### Relational Database
- Amazon RDS MySQL configured for Multi-AZ deployment
- Automated synchronous replication to standby instance
- Automated failover capability for high availability
- Built-in backup and recovery mechanisms

#### Object Storage
- Amazon S3 buckets for static web content
- Durable storage for frontend assets and media files
- Integrated with content delivery network

## Infrastructure Deployment Procedure

### Phase 1: Foundation Setup

#### 1. Network Infrastructure
a. Create VPC with 10.0.0.0/16 CIDR block
b. Provision two public subnets (10.0.1.0/24, 10.0.2.0/24) across separate Availability Zones
c. Provision two private subnets (10.0.3.0/24, 10.0.4.0/24) for backend services
d. Deploy Internet Gateway and configure public route table with 0.0.0.0/0 route
e. Launch NAT Gateway in public subnet and configure private route table

#### 2. Security Configuration
a. Create security group for Application Load Balancer (allow HTTP/80 from any)
b. Configure security group for EC2 instances (allow port 3000 from ALB security group)
c. Establish security group for RDS (allow MySQL port 3306 from EC2 security group)

### Phase 2: Database Deployment

#### 3. RDS Instance Setup
- Launch MySQL RDS instance in private subnets
- Configure with db.t3.micro instance class and 20GB storage
- Set master username to 'admin' and generate strong password
- Create initial database named 'readly'
- Enable Multi-AZ deployment for high availability

#### 4. Database Initialization
a. Install MySQL client on local machine
b. Connect to RDS endpoint using administrator credentials
c. Execute schema creation script:

```sql
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  price DECIMAL(10,2)
);
```

d. Populate with sample data records

### Phase 3: Application Deployment

#### 5. Backend Infrastructure
- Create IAM role with SSM managed instance core policy
- Launch EC2 instance in private subnet with Amazon Linux 2 AMI
- Attach IAM role and associate with EC2 security group
- Establish Session Manager connection to instance

#### 6. Application Configuration
a. Update system packages: `sudo yum update -y`
b. Install Node.js
c. Clone application repository from GitHub
d. Install dependencies: `npm install`
e. Configure environment variables with RDS connection details
f. Initialize PM2 process manager: `pm2 start server.js --name readly-backend`
g. Configure PM2 startup: `pm2 startup && pm2 save`

### Phase 4: Load Balancing

#### 7. Application Load Balancer
- Create ALB with internet-facing scheme
- Associate with both public subnets
- Configure listener on port 80
- Establish target group for port 3000
- Register backend EC2 instances as targets
- Verify health checks pass successfully

### Phase 5: Frontend Deployment

#### 8. Static Content Hosting
- Create S3 bucket with appropriate naming convention
- Upload frontend assets (HTML, CSS, JavaScript files)
- Modify application configuration to reference ALB endpoint
- Set bucket policy for CloudFront access

#### 9. Content Delivery Network
a. Create CloudFront distribution with S3 origin
b. Add second origin for Application Load Balancer
c. Configure behavior rules:
   - Default (*): S3 origin
   - API path (/api/*): ALB origin
d. Deploy distribution and note domain name

## Cost Optimization

### Compute Efficiency
- Implement Auto Scaling with target tracking policies

### Database Optimization
- Implement Multi-AZ only for production workloads

### Storage Management
- Transition infrequently accessed objects to cheaper storage classes

## Future Recommendations

### Strengthen Foundations
- Automate infrastructure with Terraform/AWS CDK
- Set up CI/CD pipelines for backend (ECS Fargate) and frontend (S3/CloudFront)

### Ensure Resilience & Speed
- Expand to a second region with automated failover via Route 53
- Use Redis caching for faster loads
- Explore serverless options for scalability

### Improve Intelligence & Control
- Centralize monitoring in OpenSearch/Kibana
- Tag all resources to track costs, optimize spending, and set budget alerts
