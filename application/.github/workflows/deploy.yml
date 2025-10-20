# name: Deploy to Kubernetes

# on:
#     push:
#         branches: [main]
#         tags:
#             - "v*"
#     workflow_dispatch:
#         inputs:
#             environment:
#                 description: "Environment to deploy to"
#                 required: true
#                 default: "staging"
#                 type: choice
#                 options:
#                     - staging
#                     - production

# env:
#     REGISTRY: ghcr.io
#     BACKEND_IMAGE: ${{ github.repository }}/backend
#     FRONTEND_IMAGE: ${{ github.repository }}/frontend

# jobs:
#     deploy:
#         name: Deploy to Kubernetes
#         runs-on: ubuntu-latest
#         environment: ${{ github.event.inputs.environment || 'staging' }}
#         steps:
#             - name: Checkout code
#               uses: actions/checkout@v4

#             - name: Set up kubectl
#               uses: azure/setup-kubectl@v3
#               with:
#                   version: "latest"

#             - name: Configure kubectl
#               run: |
#                   # This would be configured based on your cluster setup
#                   echo "Configuring kubectl for deployment"
#                   # kubectl config set-cluster ...
#                   # kubectl config set-credentials ...
#                   # kubectl config set-context ...

#             - name: Update image tags in Kubernetes manifests
#               run: |
#                   # Update backend image
#                   sed -i "s|image: .*backend.*|image: ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}|g" k8s/backend-deployment.yaml

#                   # Update frontend image
#                   sed -i "s|image: .*frontend.*|image: ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}|g" k8s/frontend-deployment.yaml

#                   echo "Updated image tags:"
#                   echo "Backend: ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}"
#                   echo "Frontend: ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}"

#             - name: Deploy to Kubernetes
#               run: |
#                   echo "🚀 Deploying to Kubernetes..."
#                   kubectl apply -k k8s/

#                   echo "⏳ Waiting for deployments to be ready..."
#                   kubectl rollout status deployment/ticketnow-backend -n ticketnow --timeout=300s
#                   kubectl rollout status deployment/ticketnow-frontend -n ticketnow --timeout=300s

#                   echo "✅ Deployment completed successfully!"

#             - name: Show deployment status
#               run: |
#                   echo "📊 Deployment Status:"
#                   kubectl get pods -n ticketnow
#                   kubectl get services -n ticketnow
#                   kubectl get ingress -n ticketnow
